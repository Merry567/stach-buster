const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // optional but recommended for React
require('dotenv').config();


const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth'); // adjust path
app.use('/api/auth', authRoutes);  // ← all auth endpoints under /api/auth

const stashRoutes = require('./routes/stash');
app.use('/api/stash', stashRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log(app._router.stack.map(r => r.route && r.route.path)); // ugly but shows registered paths