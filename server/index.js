require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const stashRoutes = require("./routes/stash");
const patternRoutes = require("./routes/patterns");   // ← Added this line

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/stash", stashRoutes);
app.use("/api/patterns", patternRoutes);   // ← Added this line (cleaner style)

// Health check route
app.get("/", (req, res) => {
  res.send("Stash Buster API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});