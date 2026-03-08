// Vercel Serverless Function Handler
// This file serves as the entry point for Vercel deployments

const path = require('path');
const express = require('express');

// Import the Express app from backend
const app = require('../backend/index.js');

// Serve frontend static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback to index.html for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Export the app for Vercel
module.exports = app;
