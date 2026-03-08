// Vercel Serverless Function Handler
// This file serves as the entry point for Vercel deployments

const path = require('path');
const express = require('express');
const fs = require('fs');

// Import the Express app from backend
const app = require('../backend/index.js');

// Ensure frontend static files are served with correct path resolution
const frontendPath = path.join(__dirname, '../frontend');

// Serve static files from frontend directory with proper caching headers
app.use(express.static(frontendPath, {
  dotfiles: 'allow',
  index: ['index.html'],
  setHeaders: (res, pathStr) => {
    // Cache static assets
    if (pathStr.match(/\.(js|css|json|woff|woff2|ttf|eot|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// SPA fallback route - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  // Skip if it's an API route (already handled by backend)
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  const indexPath = path.join(frontendPath, 'index.html');
  
  // Check if file exists and serve it
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend index.html not found');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export the app for Vercel serverless function
module.exports = app;
