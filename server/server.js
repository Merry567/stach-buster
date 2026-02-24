require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // optional but recommended for React

const authRoutes = require('./routes/auth'); // adjust path

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);  // ← all auth endpoints under /api/auth

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));