const express = require("express");
const { Readable } = require("stream");
const { ObjectId } = require("mongodb");

const router = express.Router();

const Pattern = require("../models/Pattern");
const YarnStash = require("../models/YarnStash");
const auth = require("../middleware/auth");
const pdfUpload = require("../middleware/pdfUpload");
const { getGridFSBucket } = require("../config/gridfs");

/*
  -----------------------------
  Helper functions
  -----------------------------
*/

function normalizeText(value = "") {
  return value.toString().trim().toLowerCase();
}

function normalizeFiberList(fiberContent = "") {
  return normalizeText(fiberContent)
    .split(/[\/,&+]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function fiberOverlapScore(stashFiber, patternFiber) {
  const stashList = normalizeFiberList(stashFiber);
  const patternList = normalizeFiberList(patternFiber);

  if (stashList.length === 0 || patternList.length === 0) {
    return 0;
  }

  const overlap = patternList.filter((fiber) => stashList.includes(fiber));
  return overlap.length / patternList.length;
}

function scoreStashAgainstMaterial(stashItem, material) {
  let score = 0;
  const reasons = [];

  const stashWeight = normalizeText(stashItem.weight);
  const materialWeight = normalizeText(material.yarnWeight);

  if (stashWeight && materialWeight && stashWeight === materialWeight) {
    score += 50;
    reasons.push("weight match");
  }

  const fiberScore = fiberOverlapScore(
    stashItem.fiberContent,
    material.fiberContent
  );

  if (fiberScore > 0) {
    score += Math.round(fiberScore * 25);
    reasons.push("fiber overlap");
  }

  const stashYardageTotal =
    (Number(stashItem.yardage) || 0) * (Number(stashItem.quantity) || 1);

  const requiredYardage =
    (Number(material.yardage) || 0) * (Number(material.quantity) || 1);

  if (requiredYardage > 0) {
    if (stashYardageTotal >= requiredYardage) {
      score += 25;
      reasons.push("enough yardage");
    } else if (stashYardageTotal > 0) {
      score += 10;
      reasons.push("some yardage available");
    }
  }

  return {
    stashId: stashItem._id,
    brand: stashItem.brand,
    color: stashItem.color,
    weight: stashItem.weight,
    fiberContent: stashItem.fiberContent,
    quantity: stashItem.quantity,
    yardage: stashItem.yardage,
    grams: stashItem.grams,
    score,
    reasons,
    stashYardageTotal,
    requiredYardage,
  };
}

function getMatchLabel(score) {
  if (score >= 80) return "full match";
  if (score >= 45) return "partial match";
  return "weak match";
}

function buildPatternMatches(pattern, stashItems) {
  const materials = Array.isArray(pattern.materials) ? pattern.materials : [];

  const materialMatches = materials.map((material, index) => {
    const rankedMatches = stashItems
      .map((stashItem) => scoreStashAgainstMaterial(stashItem, material))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      materialIndex: index,
      material,
      status: rankedMatches.length
        ? getMatchLabel(rankedMatches[0].score)
        : "no match",
      matches: rankedMatches.slice(0, 5),
    };
  });

  const statuses = materialMatches.map((entry) => entry.status);

  let overallStatus = "no match";

  if (statuses.length > 0 && statuses.every((status) => status === "full match")) {
    overallStatus = "full match";
  } else if (
    statuses.some(
      (status) => status === "full match" || status === "partial match"
    )
  ) {
    overallStatus = "partial match";
  }

  return {
    patternId: pattern._id,
    patternName: pattern.name,
    overallStatus,
    materialMatches,
  };
}

function parseIncomingPatternFields(req) {
  if (req.body.materials && typeof req.body.materials === "string") {
    req.body.materials = JSON.parse(req.body.materials);
  }

  if (req.body.tags && typeof req.body.tags === "string") {
    req.body.tags = JSON.parse(req.body.tags);
  }

  if (req.body.isPublic !== undefined) {
    req.body.isPublic =
      req.body.isPublic === "true" || req.body.isPublic === true;
  }

  if (req.body.estTime !== undefined && req.body.estTime !== "") {
    req.body.estTime = Number(req.body.estTime);
  }
}

async function uploadPdfToGridFS(file, userId) {
  const bucket = getGridFSBucket();

  const uploadStream = bucket.openUploadStream(file.originalname, {
    contentType: file.mimetype,
    metadata: {
      uploadedBy: userId,
      uploadedAt: new Date(),
      fieldName: "patternFile",
    },
  });

  await new Promise((resolve, reject) => {
    Readable.from(file.buffer)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", resolve);
  });

  return {
    fileId: uploadStream.id.toString(),
    fileName: file.originalname,
  };
}

async function deletePdfFromGridFS(fileId) {
  if (!fileId) return;

  const bucket = getGridFSBucket();
  await bucket.delete(new ObjectId(fileId));
}

/*
  -----------------------------
  Pattern Routes
  -----------------------------
*/

// Create pattern
router.post("/", auth, pdfUpload.single("patternFile"), async (req, res) => {
  try {
    parseIncomingPatternFields(req);

    let uploadedFile = {
      fileId: null,
      fileName: null,
    };

    if (req.file) {
      uploadedFile = await uploadPdfToGridFS(req.file, req.user.id);
    }

    const pattern = new Pattern({
      ...req.body,
      userId: req.user.id,
      patternFileId: uploadedFile.fileId,
      patternFileName: uploadedFile.fileName,
    });

    await pattern.save();
    res.status(201).json(pattern);
  } catch (err) {
    console.error("Error creating pattern:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all patterns for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const patterns = await Pattern.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(patterns);
  } catch (error) {
    console.error("Error fetching patterns:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Stream PDF file from GridFS
router.get("/file/:fileId", auth, async (req, res) => {
  try {
    const bucket = getGridFSBucket();
    const fileId = new ObjectId(req.params.fileId);

    const files = await bucket.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    res.set("Content-Type", files[0].contentType || "application/pdf");
    res.set(
      "Content-Disposition",
      `inline; filename="${files[0].filename}"`
    );

    bucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.error("Error streaming file:", err);
    res.status(500).json({ message: "Could not stream file" });
  }
});

// Get matches for one pattern
router.get("/:id/matches", auth, async (req, res) => {
  try {
    const pattern = await Pattern.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!pattern) {
      return res.status(404).json({
        message: "Pattern not found or access denied",
      });
    }

    const stashItems = await YarnStash.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    const results = buildPatternMatches(pattern, stashItems);
    res.json(results);
  } catch (error) {
    console.error("Error generating matches:", error);
    res.status(500).json({
      message: "Server error while generating matches",
      error: error.message,
    });
  }
});

// Get one pattern
router.get("/:id", auth, async (req, res) => {
  try {
    const pattern = await Pattern.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!pattern) {
      return res.status(404).json({
        message: "Pattern not found or access denied",
      });
    }

    res.json(pattern);
  } catch (error) {
    console.error("Error fetching pattern:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Update pattern
router.put("/:id", auth, pdfUpload.single("patternFile"), async (req, res) => {
  try {
    parseIncomingPatternFields(req);

    const existingPattern = await Pattern.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!existingPattern) {
      return res.status(404).json({
        message: "Pattern not found or access denied",
      });
    }

    let updateData = {
      ...req.body,
    };

    if (req.file) {
      if (existingPattern.patternFileId) {
        try {
          await deletePdfFromGridFS(existingPattern.patternFileId);
        } catch (deleteErr) {
          console.error("Error deleting old PDF from GridFS:", deleteErr);
        }
      }

      const uploadedFile = await uploadPdfToGridFS(req.file, req.user.id);
      updateData.patternFileId = uploadedFile.fileId;
      updateData.patternFileName = uploadedFile.fileName;
    }

    const updatedPattern = await Pattern.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedPattern);
  } catch (error) {
    console.error("Error updating pattern:", error);
    res.status(400).json({
      message: "Error updating pattern",
      error: error.message,
    });
  }
});

// Delete pattern
router.delete("/:id", auth, async (req, res) => {
  try {
    const pattern = await Pattern.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!pattern) {
      return res.status(404).json({
        message: "Pattern not found or access denied",
      });
    }

    if (pattern.patternFileId) {
      try {
        await deletePdfFromGridFS(pattern.patternFileId);
      } catch (deleteErr) {
        console.error("Error deleting PDF from GridFS:", deleteErr);
      }
    }

    res.json({ message: "Pattern deleted successfully" });
  } catch (error) {
    console.error("Error deleting pattern:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;