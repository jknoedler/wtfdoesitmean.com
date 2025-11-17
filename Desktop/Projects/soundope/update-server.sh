#!/bin/bash
# Commands to run on the server to fix the 501 errors

echo "Step 1: Verifying current server.js..."
grep -n "app.get('/api/auth/me'" /var/www/soundope/backend/server.js || echo "Route not found in current file"

echo ""
echo "Step 2: Updating server.js with correct code..."
cat > /var/www/soundope/backend/server.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './database/connection.js';

// Import routes (we'll create these)
// import authRoutes from './routes/auth.js';
// import trackRoutes from './routes/tracks.js';
// import feedbackRoutes from './routes/feedback.js';
// import commentRoutes from './routes/comments.js';
// import userRoutes from './routes/users.js';
// import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// API Routes - Basic Auth
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // TODO: Verify JWT token and get user from database
    // For now, return 401 to indicate not logged in
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
EOF

echo ""
echo "Step 3: Verifying the update..."
grep -n "app.get('/api/auth/me'" /var/www/soundope/backend/server.js && echo "✓ Route found!"

echo ""
echo "Step 4: Hard restarting PM2 (stop, delete, start)..."
cd /var/www/soundope/backend
pm2 stop soundope-api || true
pm2 delete soundope-api || true
pm2 start server.js --name soundope-api
pm2 save

echo ""
echo "Step 5: Testing /api/auth/me endpoint..."
sleep 2
curl -i http://localhost:3000/api/auth/me

echo ""
echo "Done! Check the curl output above - it should return 401, not 501."

