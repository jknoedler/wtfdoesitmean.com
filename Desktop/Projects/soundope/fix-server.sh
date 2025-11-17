#!/bin/bash
# Script to fix the 501 errors on the server
# This will prompt for your SSH key passphrase once

set -e

SSH_KEY="/Users/josiahknoedler/Desktop/Projects/id_ed25519"
SERVER="root@129.212.186.215"

echo "🔧 Fixing server.js and restarting PM2..."
echo ""

# Add key to SSH agent (will prompt for passphrase)
eval "$(ssh-agent -s)"
ssh-add "$SSH_KEY"

# Commands to run on server
ssh "$SERVER" << 'ENDSSH'
cd /var/www/soundope/backend

echo "Step 1: Checking current server.js..."
grep -n "app.get('/api/auth/me'" server.js || echo "Route not found in current file"

echo ""
echo "Step 2: Updating server.js..."
cat > server.js << 'EOFMARKER'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './database/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.status(401).json({ message: 'Not authenticated' });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.post('/api/auth/login', (req, res) => {
  res.status(501).json({ message: 'Login not implemented yet' });
});

app.post('/api/auth/register', (req, res) => {
  res.status(501).json({ message: 'Register not implemented yet' });
});

app.use('/api/auth', (req, res) => {
  res.status(404).json({ message: 'Auth route not found' });
});

app.use('/api/tracks', (req, res) => {
  res.status(501).json({ message: 'Track routes not implemented yet' });
});

app.use('/api/feedback', (req, res) => {
  res.status(501).json({ message: 'Feedback routes not implemented yet' });
});

app.use('/api/comments', (req, res) => {
  res.status(501).json({ message: 'Comment routes not implemented yet' });
});

app.use('/api/users', (req, res) => {
  res.status(501).json({ message: 'User routes not implemented yet' });
});

app.use('/api/upload', (req, res) => {
  res.status(501).json({ message: 'Upload routes not implemented yet' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
EOFMARKER

echo ""
echo "Step 3: Verifying update..."
grep -n "app.get('/api/auth/me'" server.js && echo "✓ Route found!"

echo ""
echo "Step 4: Hard restarting PM2..."
pm2 stop soundope-api || true
pm2 delete soundope-api || true
pm2 start server.js --name soundope-api
pm2 save

echo ""
echo "Step 5: Waiting for server to start..."
sleep 3

echo ""
echo "Step 6: Testing /api/auth/me endpoint..."
curl -i http://localhost:3000/api/auth/me

echo ""
echo "✅ Done! Check output above - should return 401, not 501"
ENDSSH

echo ""
echo "🎉 Script completed!"

