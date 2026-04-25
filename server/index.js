require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const stashRoutes = require("./routes/stash");
const patternRoutes = require("./routes/patterns");
const { initGridFS } = require("./config/gridfs");

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://stash-buster.vercel.app/",
    "https://stash-buster-fslc0whw3-meredith-wonsons-projects.vercel.app/",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stash", stashRoutes);
app.use("/api/patterns", patternRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Stash Buster API running");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Initialize GridFS after MongoDB is ready
    initGridFS();
    console.log("GridFS initialized");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });