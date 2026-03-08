// Vercel Serverless Function Handler
// This file serves as the entry point for Vercel deployments

const path = require('path');
const express = require('express');
const fs = require('fs');

// Import the Express app from backend
const app = require('../backend/index.js');

// Ensure frontend static files are served with correct path resolution
const frontendPath = path.join(__dirname, '../frontend');

// Serve static files from frontend directory
app.use(express.static(frontendPath, {
  dotfiles: 'allow',
  index: true
}));

// SPA fallback route - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  // Skip if it's an API route (already handled by backend)
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  const indexPath = path.join(frontendPath, 'index.html');
  
  // Check if file exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not found');
  }
});

// Export the app for Vercel
module.exports = app;
