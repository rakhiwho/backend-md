// src/index.js
const express = require('express');
const app = express();

// Middleware (optional, add as needed)
app.use(express.json());

// Import routes from the routes folder
const userRoutes = require('./routes/user');
app.use('/user', userRoutes);  // All /user routes will be handled in user.js

// Root route
app.get('/', (req, res) => {
  res.send('Hello from Vercel!');
});

// Export the Express app for Vercel
module.exports = app;
