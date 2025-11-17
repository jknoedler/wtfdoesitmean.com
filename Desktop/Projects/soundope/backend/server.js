import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './database/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import GhostContentAPI from '@tryghost/content-api';

// Import routes (we'll create these)
// import authRoutes from './routes/auth.js';
// import trackRoutes from './routes/tracks.js';
// import feedbackRoutes from './routes/feedback.js';
// import commentRoutes from './routes/comments.js';
// import userRoutes from './routes/users.js';
// import uploadRoutes from './routes/upload.js';

dotenv.config();

// Initialize Ghost Content API
const ghostApi = new GhostContentAPI({
  url: process.env.GHOST_API_URL || 'http://localhost:2368',
  key: process.env.GHOST_CONTENT_API_KEY,
  version: 'v5.0'
});

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

// Helper function to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Helper function to get user without password
const getUserWithoutPassword = (user) => {
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// API Routes - Basic Auth
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user from database
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = getUserWithoutPassword(result.rows[0]);
    res.json(user);
  } catch (error) {
    console.error('Auth /me error:', error);
    // Return 500 for server errors, 401 for auth errors
    if (error.message && error.message.includes('JWT')) {
      res.status(401).json({ message: 'Not authenticated' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    
    // Check if user has a password (might be imported from Base44 without password)
    // If no password, they should use Google login or set a password
    if (!user.password_hash) {
      return res.status(401).json({ 
        message: 'No password set. Please use Google login or contact support to set a password.' 
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if user is disabled
    if (user.disabled) {
      return res.status(403).json({ message: 'Account is disabled' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    const userWithoutPassword = getUserWithoutPassword(user);
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.status(501).json({ message: 'Register not implemented yet' });
});

// Update user profile (including password change)
app.patch('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { password, ...otherUpdates } = req.body;

    // If password is being updated, hash it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, decoded.userId]
      );
    }

    // Update other fields if provided
    if (Object.keys(otherUpdates).length > 0) {
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      Object.entries(otherUpdates).forEach(([key, value]) => {
        // Map frontend field names to database column names
        const fieldMap = {
          'artist_name': 'artist_name',
          'full_name': 'full_name',
          'bio': 'bio',
          'profile_image_url': 'profile_image_url',
          'monthly_votes_remaining': 'monthly_votes_remaining',
          'votes_reset_date': 'votes_reset_date',
        };

        const dbField = fieldMap[key];
        if (dbField) {
          updateFields.push(`${dbField} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
      });

      if (updateFields.length > 0) {
        updateValues.push(decoded.userId);
        await pool.query(
          `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
          updateValues
        );
      }
    }

    // Return updated user
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userWithoutPassword = getUserWithoutPassword(result.rows[0]);
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Google OAuth routes
app.get('/api/auth/google', async (req, res) => {
  // Redirect to Google OAuth
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }
  
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  const redirectUri = `${backendUrl}/api/auth/google/callback`;
  const scope = 'openid email profile';
  const state = req.query.state || '';
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${encodeURIComponent(state)}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  res.redirect(authUrl);
});

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/Login?error=oauth_failed`);
    }
    
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${backendUrl}/api/auth/google/callback`,
      }),
    });
    
    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/Login?error=oauth_failed`);
    }
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    const googleUser = await userResponse.json();
    
    if (!googleUser.email) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/Login?error=no_email`);
    }
    
    // Find or create user
    let userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [googleUser.email.toLowerCase().trim()]
    );
    
    let user;
    
    if (userResult.rows.length === 0) {
      // Create new user
      const userId = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await pool.query(`
        INSERT INTO users (
          id, email, full_name, artist_name, profile_image_url,
          google_id, is_verified, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, [
        userId,
        googleUser.email.toLowerCase().trim(),
        googleUser.name || '',
        googleUser.name || '',
        googleUser.picture || null,
        googleUser.id,
        true, // Google verified email
      ]);
      
      userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      user = userResult.rows[0];
    } else {
      // Existing user - update Google ID if not set
      user = userResult.rows[0];
      if (!user.google_id) {
        await pool.query(
          'UPDATE users SET google_id = $1, profile_image_url = COALESCE(profile_image_url, $2), updated_at = NOW() WHERE id = $3',
          [googleUser.id, googleUser.picture || user.profile_image_url, user.id]
        );
        user.google_id = googleUser.id;
        if (!user.profile_image_url && googleUser.picture) {
          user.profile_image_url = googleUser.picture;
        }
      }
    }
    
    // Check if user is disabled
    if (user.disabled) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/Login?error=account_disabled`);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    const userWithoutPassword = getUserWithoutPassword(user);
    
    // Redirect to frontend with token
    const redirectUrl = state || '/Discover';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}${redirectUrl}?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/Login?error=oauth_error`);
  }
});

app.use('/api/auth', (req, res) => {
  res.status(404).json({ message: 'Auth route not found' });
});

// Tracks API
app.get('/api/tracks', async (req, res) => {
  try {
    // Test database connection first
    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      console.error('Database connection error:', dbError.message);
      // Return empty array if database is not connected (so frontend doesn't break)
      return res.json([]);
    }

    let query = 'SELECT * FROM tracks WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Handle filters
    if (req.query.is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(req.query.is_active === 'true');
      paramIndex++;
    }

    if (req.query.id) {
      query += ` AND id = $${paramIndex}`;
      params.push(req.query.id);
      paramIndex++;
    }

    if (req.query.artist_id) {
      query += ` AND artist_id = $${paramIndex}`;
      params.push(req.query.artist_id);
      paramIndex++;
    }

    // Handle sorting
    if (req.query.sort) {
      const sortField = req.query.sort.replace(/^-/, ''); // Remove leading minus
      const sortDirection = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
      
      // Map frontend field names to database column names
      const fieldMap = {
        'total_votes': 'total_votes',
        'created_date': 'created_at',
        'created_at': 'created_at',
      };
      
      const dbField = fieldMap[sortField] || sortField;
      query += ` ORDER BY ${dbField} ${sortDirection}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // Handle limit
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      if (limit > 0) {
        query += ` LIMIT $${paramIndex}`;
        params.push(limit);
      }
    }

    const result = await pool.query(query, params);
    
    // Transform tracks to match frontend expectations
    const tracks = result.rows.map(track => ({
      id: track.id,
      artist_id: track.artist_id,
      title: track.title,
      artist_name: track.artist_name,
      audio_url: track.audio_url,
      video_url: track.video_url,
      cover_image_url: track.cover_image_url,
      duration_seconds: track.duration_seconds,
      genres: track.genres || [],
      motifs: track.motifs || [],
      description: track.description,
      streaming_links: {
        spotify: track.spotify_link,
        youtube: track.youtube_link,
        soundcloud: track.soundcloud_link,
        apple_music: track.apple_music_link,
      },
      open_for_collab: track.open_for_collab,
      collab_type: track.collab_type,
      total_listens: track.total_listens || 0,
      completed_listens: track.completed_listens || 0,
      praise_count: track.praise_count || 0,
      neutral_count: track.neutral_count || 0,
      constructive_count: track.constructive_count || 0,
      total_votes: track.total_votes || 0,
      boost_credits: track.boost_credits || 0,
      boost_expires: track.boost_expires,
      has_exclusive_content: track.has_exclusive_content,
      unlock_price: track.unlock_price,
      exclusive_content_url: track.exclusive_content_url,
      exclusive_content_type: track.exclusive_content_type,
      is_active: track.is_active,
      ai_analysis: track.ai_analysis,
      created_date: track.created_at,
      created_at: track.created_at,
      updated_at: track.updated_at,
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Tracks API error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: process.env.NODE_ENV === 'development' ? error.code : undefined
    });
  }
});

// Note: Track routes are handled above. Other methods can be added as needed.

// Feedback API
app.get('/api/feedback', async (req, res) => {
  try {
    // Test database connection first
    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      console.error('Database connection error:', dbError.message);
      return res.json([]);
    }

    let query = 'SELECT * FROM feedback WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Handle filters
    if (req.query.track_id) {
      query += ` AND track_id = $${paramIndex}`;
      params.push(req.query.track_id);
      paramIndex++;
    }

    if (req.query.reviewer_id) {
      query += ` AND reviewer_id = $${paramIndex}`;
      params.push(req.query.reviewer_id);
      paramIndex++;
    }

    if (req.query.artist_id) {
      query += ` AND artist_id = $${paramIndex}`;
      params.push(req.query.artist_id);
      paramIndex++;
    }

    if (req.query.id) {
      query += ` AND id = $${paramIndex}`;
      params.push(req.query.id);
      paramIndex++;
    }

    if (req.query.sentiment) {
      query += ` AND sentiment = $${paramIndex}`;
      params.push(req.query.sentiment);
      paramIndex++;
    }

    // Handle sorting
    if (req.query.sort) {
      const sortField = req.query.sort.replace(/^-/, '');
      const sortDirection = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap = {
        'created_date': 'created_at',
        'created_at': 'created_at',
        'overall_rating': 'overall_rating',
        'points_awarded': 'points_awarded',
      };
      const dbField = fieldMap[sortField] || sortField;
      query += ` ORDER BY ${dbField} ${sortDirection}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // Handle limit
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      if (limit > 0) {
        query += ` LIMIT $${paramIndex}`;
        params.push(limit);
      }
    }

    const result = await pool.query(query, params);
    
    // Transform feedback to match frontend expectations
    const feedback = result.rows.map(fb => ({
      id: fb.id,
      track_id: fb.track_id,
      reviewer_id: fb.reviewer_id,
      reviewer_name: fb.reviewer_name,
      artist_id: fb.artist_id,
      content: fb.content,
      sentiment: fb.sentiment,
      production_rating: fb.production_rating ? parseFloat(fb.production_rating) : null,
      vocals_rating: fb.vocals_rating ? parseFloat(fb.vocals_rating) : null,
      lyrics_rating: fb.lyrics_rating ? parseFloat(fb.lyrics_rating) : null,
      originality_rating: fb.originality_rating ? parseFloat(fb.originality_rating) : null,
      overall_rating: fb.overall_rating ? parseFloat(fb.overall_rating) : null,
      listen_percentage: fb.listen_percentage ? parseFloat(fb.listen_percentage) : null,
      listen_duration_seconds: fb.listen_duration_seconds ? parseFloat(fb.listen_duration_seconds) : null,
      ai_validation_passed: fb.ai_validation_passed,
      ai_validation_score: fb.ai_validation_score,
      ai_feedback_notes: fb.ai_feedback_notes,
      word_count: fb.word_count,
      points_awarded: fb.points_awarded || 0,
      tier_achieved: fb.tier_achieved,
      helpful_votes: fb.helpful_votes || 0,
      helpful_voters: fb.helpful_voters || [],
      is_featured: fb.is_featured || false,
      tags: fb.tags || [],
      created_at: fb.created_at,
      created_date: fb.created_at,
      updated_at: fb.updated_at,
    }));

    res.json(feedback);
  } catch (error) {
    console.error('Feedback API error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const {
      track_id,
      reviewer_id,
      reviewer_name,
      artist_id,
      content,
      sentiment,
      production_rating,
      vocals_rating,
      lyrics_rating,
      originality_rating,
      overall_rating,
      listen_percentage,
      listen_duration_seconds,
      ai_validation_passed,
      ai_validation_score,
      ai_feedback_notes,
      word_count,
      points_awarded,
      tier_achieved,
      tags
    } = req.body;

    if (!track_id || !reviewer_id || !artist_id || !content) {
      return res.status(400).json({ message: 'track_id, reviewer_id, artist_id, and content are required' });
    }

    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await pool.query(`
      INSERT INTO feedback (
        id, track_id, reviewer_id, reviewer_name, artist_id, content,
        sentiment, production_rating, vocals_rating, lyrics_rating,
        originality_rating, overall_rating, listen_percentage,
        listen_duration_seconds, ai_validation_passed, ai_validation_score,
        ai_feedback_notes, word_count, points_awarded, tier_achieved, tags,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW()
      )
      RETURNING *
    `, [
      feedbackId,
      track_id,
      reviewer_id,
      reviewer_name || null,
      artist_id,
      content,
      sentiment || null,
      production_rating || null,
      vocals_rating || null,
      lyrics_rating || null,
      originality_rating || null,
      overall_rating || null,
      listen_percentage || null,
      listen_duration_seconds || null,
      ai_validation_passed || false,
      ai_validation_score || null,
      ai_feedback_notes || null,
      word_count || null,
      points_awarded || 0,
      tier_achieved || null,
      tags ? JSON.stringify(tags) : JSON.stringify([])
    ]);

    const fb = result.rows[0];

    // Create notification for the artist
    try {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const trackResult = await pool.query('SELECT title FROM tracks WHERE id = $1', [track_id]);
      const trackTitle = trackResult.rows[0]?.title || 'your track';
      
      await pool.query(`
        INSERT INTO notifications (
          id, recipient_id, type, title, message, sender_id, sender_name, related_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        notifId,
        artist_id,
        'feedback_received',
        'New Feedback Received',
        `${reviewer_name || 'Someone'} left ${sentiment || 'feedback'} on "${trackTitle}"`,
        reviewer_id,
        reviewer_name || 'Unknown',
        feedbackId
      ]);
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the request if notification creation fails
    }

    // Transform response
    res.json({
      id: fb.id,
      track_id: fb.track_id,
      reviewer_id: fb.reviewer_id,
      reviewer_name: fb.reviewer_name,
      artist_id: fb.artist_id,
      content: fb.content,
      sentiment: fb.sentiment,
      production_rating: fb.production_rating ? parseFloat(fb.production_rating) : null,
      vocals_rating: fb.vocals_rating ? parseFloat(fb.vocals_rating) : null,
      lyrics_rating: fb.lyrics_rating ? parseFloat(fb.lyrics_rating) : null,
      originality_rating: fb.originality_rating ? parseFloat(fb.originality_rating) : null,
      overall_rating: fb.overall_rating ? parseFloat(fb.overall_rating) : null,
      listen_percentage: fb.listen_percentage ? parseFloat(fb.listen_percentage) : null,
      listen_duration_seconds: fb.listen_duration_seconds ? parseFloat(fb.listen_duration_seconds) : null,
      ai_validation_passed: fb.ai_validation_passed,
      ai_validation_score: fb.ai_validation_score,
      ai_feedback_notes: fb.ai_feedback_notes,
      word_count: fb.word_count,
      points_awarded: fb.points_awarded || 0,
      tier_achieved: fb.tier_achieved,
      helpful_votes: fb.helpful_votes || 0,
      helpful_voters: typeof fb.helpful_voters === 'string' ? JSON.parse(fb.helpful_voters) : (fb.helpful_voters || []),
      is_featured: fb.is_featured || false,
      tags: typeof fb.tags === 'string' ? JSON.parse(fb.tags) : (fb.tags || []),
      created_at: fb.created_at,
      created_date: fb.created_at,
      updated_at: fb.updated_at,
    });
  } catch (error) {
    console.error('Feedback creation error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.patch('/api/feedback/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { id } = req.params;
    const updates = req.body;
    
    // Build update query dynamically
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    const allowedFields = [
      'content', 'sentiment', 'production_rating', 'vocals_rating',
      'lyrics_rating', 'originality_rating', 'overall_rating',
      'helpful_votes', 'helpful_voters', 'is_featured', 'tags'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'helpful_voters' || key === 'tags') {
          updateFields.push(`${key} = $${paramIndex}`);
          params.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = $${paramIndex}`);
          params.push(value);
        }
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(`
      UPDATE feedback
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const fb = result.rows[0];
    res.json({
      id: fb.id,
      track_id: fb.track_id,
      reviewer_id: fb.reviewer_id,
      reviewer_name: fb.reviewer_name,
      artist_id: fb.artist_id,
      content: fb.content,
      sentiment: fb.sentiment,
      production_rating: fb.production_rating ? parseFloat(fb.production_rating) : null,
      vocals_rating: fb.vocals_rating ? parseFloat(fb.vocals_rating) : null,
      lyrics_rating: fb.lyrics_rating ? parseFloat(fb.lyrics_rating) : null,
      originality_rating: fb.originality_rating ? parseFloat(fb.originality_rating) : null,
      overall_rating: fb.overall_rating ? parseFloat(fb.overall_rating) : null,
      helpful_votes: fb.helpful_votes || 0,
      helpful_voters: typeof fb.helpful_voters === 'string' ? JSON.parse(fb.helpful_voters) : (fb.helpful_voters || []),
      is_featured: fb.is_featured || false,
      tags: typeof fb.tags === 'string' ? JSON.parse(fb.tags) : (fb.tags || []),
      created_at: fb.created_at,
      created_date: fb.created_at,
      updated_at: fb.updated_at,
    });
  } catch (error) {
    console.error('Feedback update error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.delete('/api/feedback/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM feedback WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Feedback deletion error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Comments API
app.get('/api/comments', async (req, res) => {
  try {
    // Test database connection first
    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      console.error('Database connection error:', dbError.message);
      return res.json([]);
    }

    let query = 'SELECT * FROM comments WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Handle filters
    if (req.query.track_id) {
      query += ` AND track_id = $${paramIndex}`;
      params.push(req.query.track_id);
      paramIndex++;
    }

    if (req.query.user_id) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(req.query.user_id);
      paramIndex++;
    }

    if (req.query.id) {
      query += ` AND id = $${paramIndex}`;
      params.push(req.query.id);
      paramIndex++;
    }

    if (req.query.is_universal !== undefined) {
      query += ` AND is_universal = $${paramIndex}`;
      params.push(req.query.is_universal === 'true');
      paramIndex++;
    }

    // Handle sorting
    if (req.query.sort) {
      const sortField = req.query.sort.replace(/^-/, '');
      const sortDirection = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap = {
        'created_date': 'created_at',
        'created_at': 'created_at',
      };
      const dbField = fieldMap[sortField] || sortField;
      query += ` ORDER BY ${dbField} ${sortDirection}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // Handle limit
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      if (limit > 0) {
        query += ` LIMIT $${paramIndex}`;
        params.push(limit);
      }
    }

    const result = await pool.query(query, params);
    
    // Transform comments to match frontend expectations
    const comments = result.rows.map(comment => ({
      id: comment.id,
      track_id: comment.track_id,
      user_id: comment.user_id,
      user_name: comment.user_name,
      user_image: comment.user_image,
      content: comment.content,
      is_universal: comment.is_universal || false,
      created_at: comment.created_at,
      created_date: comment.created_at,
      updated_at: comment.updated_at,
    }));

    res.json(comments);
  } catch (error) {
    console.error('Comments API error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const {
      track_id,
      user_id,
      user_name,
      user_image,
      content,
      is_universal
    } = req.body;

    if (!user_id || !content) {
      return res.status(400).json({ message: 'user_id and content are required' });
    }

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await pool.query(`
      INSERT INTO comments (
        id, track_id, user_id, user_name, user_image, content, is_universal, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [
      commentId,
      track_id || null,
      user_id,
      user_name || null,
      user_image || null,
      content,
      is_universal || false
    ]);

    const comment = result.rows[0];

    // If track-specific comment, notify the artist
    if (track_id && !is_universal) {
      try {
        const trackResult = await pool.query('SELECT artist_id, title FROM tracks WHERE id = $1', [track_id]);
        if (trackResult.rows.length > 0) {
          const track = trackResult.rows[0];
          // Only notify if commenter is not the artist
          if (track.artist_id !== user_id) {
            const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await pool.query(`
              INSERT INTO notifications (
                id, recipient_id, type, title, message, sender_id, sender_name, related_id, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            `, [
              notifId,
              track.artist_id,
              'comment',
              'New Comment',
              `${user_name || 'Someone'} commented on "${track.title || 'your track'}"`,
              user_id,
              user_name || 'Unknown',
              commentId
            ]);
          }
        }
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Don't fail the request if notification creation fails
      }
    }

    res.json({
      id: comment.id,
      track_id: comment.track_id,
      user_id: comment.user_id,
      user_name: comment.user_name,
      user_image: comment.user_image,
      content: comment.content,
      is_universal: comment.is_universal || false,
      created_at: comment.created_at,
      created_date: comment.created_at,
      updated_at: comment.updated_at,
    });
  } catch (error) {
    console.error('Comment creation error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.patch('/api/comments/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { id } = req.params;
    const updates = req.body;
    
    // Build update query dynamically
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    const allowedFields = ['content', 'user_name', 'user_image'];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(`
      UPDATE comments
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = result.rows[0];
    res.json({
      id: comment.id,
      track_id: comment.track_id,
      user_id: comment.user_id,
      user_name: comment.user_name,
      user_image: comment.user_image,
      content: comment.content,
      is_universal: comment.is_universal || false,
      created_at: comment.created_at,
      created_date: comment.created_at,
      updated_at: comment.updated_at,
    });
  } catch (error) {
    console.error('Comment update error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM comments WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Comment deletion error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Curator Submissions API
app.post('/api/curator-submissions', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const {
      track_id,
      title,
      artist_name,
      audio_url,
      cover_image_url,
      spotify_link,
      youtube_link,
      soundcloud_link,
      apple_music_link,
      genres,
      credits_deducted
    } = req.body;

    if (!genres || !Array.isArray(genres) || genres.length === 0) {
      return res.status(400).json({ message: 'At least one genre is required' });
    }

    // Check if user has enough credits
    const userResult = await pool.query('SELECT standard_credits, premium_credits FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    const totalCredits = (user.standard_credits || 0) + (user.premium_credits || 0);
    const creditCost = credits_deducted || 1;

    if (totalCredits < creditCost) {
      return res.status(400).json({ message: 'Insufficient credits. You need at least 1 credit to submit.' });
    }

    // Get track info if using existing track
    let trackData = {};
    if (track_id) {
      const trackResult = await pool.query('SELECT * FROM tracks WHERE id = $1', [track_id]);
      if (trackResult.rows.length > 0) {
        const track = trackResult.rows[0];
        trackData = {
          title: track.title,
          artist_name: track.artist_name,
          audio_url: track.audio_url,
          cover_image_url: track.cover_image_url,
          spotify_link: track.spotify_link,
          youtube_link: track.youtube_link,
          soundcloud_link: track.soundcloud_link,
          apple_music_link: track.apple_music_link,
        };
      }
    } else {
      trackData = {
        title: title || null,
        artist_name: artist_name || null,
        audio_url: audio_url || null,
        cover_image_url: cover_image_url || null,
        spotify_link: spotify_link || null,
        youtube_link: youtube_link || null,
        soundcloud_link: soundcloud_link || null,
        apple_music_link: apple_music_link || null,
      };
    }

    // Create submission
    const submissionId = `cur_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await pool.query(`
      INSERT INTO curator_submissions (
        id, artist_id, track_id, genres, title, artist_name,
        audio_url, cover_image_url, spotify_link, youtube_link,
        soundcloud_link, apple_music_link, credits_deducted,
        status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', NOW(), NOW()
      )
      RETURNING *
    `, [
      submissionId,
      decoded.userId,
      track_id || null,
      JSON.stringify(genres),
      trackData.title,
      trackData.artist_name || user.artist_name || user.full_name,
      trackData.audio_url,
      trackData.cover_image_url,
      trackData.spotify_link,
      trackData.youtube_link,
      trackData.soundcloud_link,
      trackData.apple_music_link,
      creditCost
    ]);

    // Deduct credits (prefer premium first)
    let premiumUsed = 0;
    let standardUsed = 0;
    let remaining = creditCost;

    if (user.premium_credits >= remaining) {
      premiumUsed = remaining;
      remaining = 0;
    } else {
      premiumUsed = user.premium_credits || 0;
      remaining -= premiumUsed;
    }

    if (remaining > 0) {
      standardUsed = remaining;
    }

    await pool.query(`
      UPDATE users
      SET premium_credits = premium_credits - $1,
          standard_credits = standard_credits - $2,
          updated_at = NOW()
      WHERE id = $3
    `, [premiumUsed, standardUsed, decoded.userId]);

    const submission = result.rows[0];
    res.json({
      id: submission.id,
      artist_id: submission.artist_id,
      track_id: submission.track_id,
      genres: typeof submission.genres === 'string' ? JSON.parse(submission.genres) : submission.genres,
      title: submission.title,
      artist_name: submission.artist_name,
      status: submission.status,
      created_at: submission.created_at,
    });
  } catch (error) {
    console.error('Curator submission error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/curator-submissions', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check user role
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    const userRole = user.role;

    let query = 'SELECT * FROM curator_submissions WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // If curator/admin/founder, show submissions for their genres
    // If regular user, only show their own submissions
    if (userRole === 'curator' || userRole === 'admin' || userRole === 'founder') {
      // Get curator's genres if they're a curator
      if (userRole === 'curator') {
        const curatorGenresResult = await pool.query(
          'SELECT genre FROM curator_genres WHERE curator_id = $1',
          [decoded.userId]
        );
        const curatorGenres = curatorGenresResult.rows.map(r => r.genre);
        
        if (curatorGenres.length > 0) {
          // Filter submissions by curator's genres
          query += ` AND (genres @> $${paramIndex}::jsonb OR genres ?| $${paramIndex + 1})`;
          params.push(JSON.stringify(curatorGenres));
          params.push(`{${curatorGenres.join(',')}}`);
          paramIndex += 2;
        }
      }
      // Admin and founder can see all submissions
    } else {
      // Regular users only see their own submissions
      query += ` AND artist_id = $${paramIndex}`;
      params.push(decoded.userId);
      paramIndex++;
    }

    // Filter by status if provided
    if (req.query.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(req.query.status);
      paramIndex++;
    }

    // Filter by genre if provided
    if (req.query.genre) {
      query += ` AND genres @> $${paramIndex}::jsonb`;
      params.push(JSON.stringify([req.query.genre]));
      paramIndex++;
    }

    // Sort
    query += ' ORDER BY created_at DESC';

    // Limit
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      if (limit > 0) {
        query += ` LIMIT $${paramIndex}`;
        params.push(limit);
      }
    }

    const result = await pool.query(query, params);
    
    const submissions = result.rows.map(sub => ({
      id: sub.id,
      artist_id: sub.artist_id,
      track_id: sub.track_id,
      curator_id: sub.curator_id,
      genres: typeof sub.genres === 'string' ? JSON.parse(sub.genres) : sub.genres,
      title: sub.title,
      artist_name: sub.artist_name,
      audio_url: sub.audio_url,
      cover_image_url: sub.cover_image_url,
      spotify_link: sub.spotify_link,
      youtube_link: sub.youtube_link,
      soundcloud_link: sub.soundcloud_link,
      apple_music_link: sub.apple_music_link,
      status: sub.status,
      reviewed_by: sub.reviewed_by,
      reviewed_at: sub.reviewed_at,
      notes: sub.notes,
      credits_deducted: sub.credits_deducted,
      created_at: sub.created_at,
      updated_at: sub.updated_at,
    }));

    res.json(submissions);
  } catch (error) {
    console.error('Curator submissions fetch error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.patch('/api/curator-submissions/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check user role - only curators, admins, and founders can review
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    if (user.role !== 'curator' && user.role !== 'admin' && user.role !== 'founder') {
      return res.status(403).json({ message: 'Only curators, admins, and founders can review submissions' });
    }

    const { id } = req.params;
    const { status, notes, curator_id } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }

    if (curator_id) {
      updates.push(`curator_id = $${paramIndex}`);
      params.push(curator_id);
      paramIndex++;
    }

    if (status === 'approved' || status === 'rejected') {
      updates.push(`reviewed_by = $${paramIndex}`);
      params.push(decoded.userId);
      paramIndex++;
      updates.push(`reviewed_at = NOW()`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(`
      UPDATE curator_submissions
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const sub = result.rows[0];
    res.json({
      id: sub.id,
      status: sub.status,
      reviewed_by: sub.reviewed_by,
      reviewed_at: sub.reviewed_at,
      notes: sub.notes,
      updated_at: sub.updated_at,
    });
  } catch (error) {
    console.error('Curator submission update error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Curator Genres API
app.get('/api/curator-genres', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check user role
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    let query = 'SELECT * FROM curator_genres WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Curators only see their own genres, admins/founders see all
    if (user.role === 'curator') {
      query += ` AND curator_id = $${paramIndex}`;
      params.push(decoded.userId);
      paramIndex++;
    }

    if (req.query.curator_id) {
      query += ` AND curator_id = $${paramIndex}`;
      params.push(req.query.curator_id);
      paramIndex++;
    }

    query += ' ORDER BY genre ASC';

    const result = await pool.query(query, params);
    
    const genres = result.rows.map(cg => ({
      id: cg.id,
      curator_id: cg.curator_id,
      genre: cg.genre,
      sub_genres: typeof cg.sub_genres === 'string' ? JSON.parse(cg.sub_genres) : (cg.sub_genres || []),
      created_at: cg.created_at,
      updated_at: cg.updated_at,
    }));

    res.json(genres);
  } catch (error) {
    console.error('Curator genres fetch error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/curator-genres', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check user role - only curators can add their own genres
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    if (user.role !== 'curator' && user.role !== 'admin' && user.role !== 'founder') {
      return res.status(403).json({ message: 'Only curators can manage genres' });
    }

    const { genre, sub_genres } = req.body;
    
    if (!genre) {
      return res.status(400).json({ message: 'Genre is required' });
    }

    const genreId = `cg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await pool.query(`
      INSERT INTO curator_genres (
        id, curator_id, genre, sub_genres, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (curator_id, genre) DO UPDATE SET
        sub_genres = EXCLUDED.sub_genres,
        updated_at = NOW()
      RETURNING *
    `, [
      genreId,
      decoded.userId,
      genre,
      JSON.stringify(sub_genres || [])
    ]);

    const cg = result.rows[0];
    res.json({
      id: cg.id,
      curator_id: cg.curator_id,
      genre: cg.genre,
      sub_genres: typeof cg.sub_genres === 'string' ? JSON.parse(cg.sub_genres) : (cg.sub_genres || []),
      created_at: cg.created_at,
      updated_at: cg.updated_at,
    });
  } catch (error) {
    console.error('Curator genre creation error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Role Management API (only for founder)
app.patch('/api/users/:id/role', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check if user is founder
    const founderResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.userId]);
    if (founderResult.rows.length === 0 || founderResult.rows[0].role !== 'founder') {
      return res.status(403).json({ message: 'Only the founder can manage roles' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'curator', 'admin', 'founder'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be: user, curator, admin, or founder' });
    }

    // Prevent changing founder role
    const targetUserResult = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (targetUserResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUserResult.rows[0].role === 'founder' && role !== 'founder') {
      return res.status(403).json({ message: 'Cannot change founder role' });
    }

    const result = await pool.query(`
      UPDATE users
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, role
    `, [role, id]);

    res.json({
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role,
    });
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.use('/api/users', (req, res) => {
  res.status(501).json({ message: 'User routes not implemented yet' });
});

app.use('/api/upload', (req, res) => {
  res.status(501).json({ message: 'Upload routes not implemented yet' });
});

// Votes API
app.post('/api/votes', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { track_id, artist_id, vote_count: requestedVoteCount, vote_type } = req.body;
    let vote_count = requestedVoteCount;

    if (!track_id || !vote_count || vote_count < 1) {
      return res.status(400).json({ message: 'track_id and vote_count (>= 1) are required' });
    }

    // Check if user has enough votes
    const userResult = await pool.query('SELECT monthly_votes_remaining FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    if (user.monthly_votes_remaining < vote_count) {
      return res.status(400).json({ message: 'Not enough votes remaining' });
    }

    // Check if user already voted for this track
    const existingVote = await pool.query(
      'SELECT * FROM votes WHERE track_id = $1 AND user_id = $2',
      [track_id, decoded.userId]
    );

    let voteId;
    let previousVoteCount = 0;
    
    if (existingVote.rows.length > 0) {
      // User already voted - update the vote
      voteId = existingVote.rows[0].id;
      previousVoteCount = existingVote.rows[0].vote_count || 1; // Default to 1 if column doesn't exist
      
      // Check if vote_count column exists by trying to update it
      try {
        await pool.query(
          'UPDATE votes SET vote_count = $1, vote_type = $2 WHERE id = $3',
          [vote_count, vote_type || 'leaderboard', voteId]
        );
      } catch (e) {
        // If vote_count column doesn't exist, we need to add it first
        // For now, just update vote_type and we'll add the column via migration
        await pool.query(
          'UPDATE votes SET vote_type = $1 WHERE id = $2',
          [vote_type || 'leaderboard', voteId]
        );
        // Set previousVoteCount to 1 since we can't read it
        previousVoteCount = 1;
      }
      
      // Adjust track total_votes by the difference
      const voteDifference = vote_count - previousVoteCount;
      if (voteDifference !== 0) {
        await pool.query(
          'UPDATE tracks SET total_votes = total_votes + $1 WHERE id = $2',
          [voteDifference, track_id]
        );
      }
    } else {
      // Create new vote
      voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Try to insert with vote_count if column exists
      try {
        await pool.query(
          'INSERT INTO votes (id, track_id, user_id, vote_count, vote_type) VALUES ($1, $2, $3, $4, $5)',
          [voteId, track_id, decoded.userId, vote_count, vote_type || 'leaderboard']
        );
      } catch (e) {
        // If vote_count column doesn't exist, insert without it and add vote_count = 1
        await pool.query(
          'INSERT INTO votes (id, track_id, user_id, vote_type) VALUES ($1, $2, $3, $4)',
          [voteId, track_id, decoded.userId, vote_type || 'leaderboard']
        );
        // If vote_count doesn't exist, we'll just add 1 vote
        vote_count = 1;
      }
      
      // Update track total_votes
      await pool.query(
        'UPDATE tracks SET total_votes = total_votes + $1 WHERE id = $2',
        [vote_count, track_id]
      );
    }

    // Update user's remaining votes
    await pool.query(
      'UPDATE users SET monthly_votes_remaining = monthly_votes_remaining - $1 WHERE id = $2',
      [vote_count, decoded.userId]
    );

    res.json({ id: voteId, success: true });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/votes', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    let query = 'SELECT * FROM votes WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (req.query.track_id) {
      query += ` AND track_id = $${paramIndex}`;
      params.push(req.query.track_id);
      paramIndex++;
    }

    if (req.query.user_id) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(req.query.user_id);
      paramIndex++;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get votes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Archive Logs API
app.get('/api/archive-logs', async (req, res) => {
  try {
    let query = 'SELECT * FROM archive_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Handle filters
    if (req.query.user_id) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(req.query.user_id);
      paramIndex++;
    }

    if (req.query.action_type) {
      query += ` AND action_type = $${paramIndex}`;
      params.push(req.query.action_type);
      paramIndex++;
    }

    // Handle sorting
    if (req.query.sort) {
      const sortField = req.query.sort.replace(/^-/, '');
      const sortDirection = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap = {
        'created_date': 'created_at',
        'created_at': 'created_at',
      };
      const dbField = fieldMap[sortField] || sortField;
      query += ` ORDER BY ${dbField} ${sortDirection}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // Handle limit
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      if (limit > 0) {
        query += ` LIMIT $${paramIndex}`;
        params.push(limit);
      }
    }

    const result = await pool.query(query, params);
    
    const logs = result.rows.map(log => ({
      id: log.id,
      user_id: log.user_id,
      action_type: log.action_type,
      target_id: log.target_id,
      target_type: log.target_type,
      metadata: log.metadata || {},
      points_earned: log.points_earned || 0,
      created_at: log.created_at,
      created_date: log.created_at,
    }));

    res.json(logs);
  } catch (error) {
    console.error('Archive logs API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/archive-logs', async (req, res) => {
  try {
    const { user_id, action_type, target_id, target_type, metadata, points_earned } = req.body;
    
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await pool.query(`
      INSERT INTO archive_logs (
        id, user_id, action_type, target_id, target_type, metadata, points_earned, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `, [
      logId,
      user_id,
      action_type,
      target_id || null,
      target_type || null,
      JSON.stringify(metadata || {}),
      points_earned || 0,
    ]);

    const log = result.rows[0];
    res.json({
      id: log.id,
      user_id: log.user_id,
      action_type: log.action_type,
      target_id: log.target_id,
      target_type: log.target_type,
      metadata: log.metadata || {},
      points_earned: log.points_earned || 0,
      created_at: log.created_at,
      created_date: log.created_at,
    });
  } catch (error) {
    console.error('Archive log creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dev Password Validation (hidden in backend)
app.post('/api/functions/validateDevPassword', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Password is stored securely in backend, not exposed to frontend
    const correctPassword = 'Badfish11';
    
    if (password === correctPassword) {
      res.json({ data: { success: true } });
    } else {
      res.json({ data: { success: false, error: 'Incorrect password' } });
    }
  } catch (error) {
    console.error('Dev password validation error:', error);
    res.status(500).json({ data: { success: false, error: 'Internal server error' } });
  }
});

// Spotify Playlists API
app.post('/api/functions/spotifyPlaylist', async (req, res) => {
  try {
    const { action } = req.body;
    
    if (action === 'getPlaylists') {
      // Return hardcoded playlists (you can move this to database later)
      const playlists = [
        {
          id: '6REhaX1sFDi2oQ9khup5ts',
          name: 'Soundope Fresh',
          description: 'The freshest independent music from Soundope artists',
        },
        {
          id: '6r1m5BFff2w6LdVLGG4PSV',
          name: 'Soundope Underground',
          description: 'Underground gems and hidden tracks from emerging artists',
        },
      ];
      
      return res.json({ data: { playlists } });
    }
    
    if (action === 'submitTrack') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const { playlistId, trackUrl } = req.body;
      
      if (!playlistId || !trackUrl) {
        return res.status(400).json({ error: 'playlistId and trackUrl are required' });
      }
      
      // Extract track ID from URL
      const trackIdMatch = trackUrl.match(/track\/([a-zA-Z0-9]+)/);
      if (!trackIdMatch) {
        return res.status(400).json({ error: 'Invalid Spotify track URL' });
      }
      
      // Get user info
      const userResult = await pool.query('SELECT id, artist_name, full_name FROM users WHERE id = $1', [decoded.userId]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const user = userResult.rows[0];
      
      // Get playlist name
      const playlists = [
        { id: '6REhaX1sFDi2oQ9khup5ts', name: 'Soundope Fresh' },
        { id: '6r1m5BFff2w6LdVLGG4PSV', name: 'Soundope Underground' },
      ];
      const playlist = playlists.find(p => p.id === playlistId);
      const playlistName = playlist ? playlist.name : 'Unknown Playlist';
      
      // Save submission to database
      const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await pool.query(`
        INSERT INTO playlist_submissions (
          id, user_id, user_name, playlist_name, spotify_track_url, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, [
        submissionId,
        user.id,
        user.artist_name || user.full_name,
        playlistName,
        trackUrl,
      ]);
      
      return res.json({ data: { success: true } });
    }
    
    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Spotify playlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications API
app.get('/api/notifications', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (req.query.recipient_id) {
      query += ` AND recipient_id = $${paramIndex}`;
      params.push(req.query.recipient_id);
      paramIndex++;
    }

    // Handle sorting
    if (req.query.sort) {
      const sortField = req.query.sort.replace(/^-/, '');
      const sortDirection = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap = {
        'created_date': 'created_at',
        'created_at': 'created_at',
      };
      const dbField = fieldMap[sortField] || sortField;
      query += ` ORDER BY ${dbField} ${sortDirection}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // Handle limit
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      if (limit > 0) {
        query += ` LIMIT $${paramIndex}`;
        params.push(limit);
      }
    }

    const result = await pool.query(query, params);
    
    const notifications = result.rows.map(notif => ({
      id: notif.id,
      recipient_id: notif.recipient_id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      content: notif.message || notif.title,
      sender_id: notif.sender_id,
      sender_name: notif.sender_name,
      related_id: notif.related_id,
      is_read: notif.is_read,
      created_at: notif.created_at,
      created_date: notif.created_at,
    }));

    res.json(notifications);
  } catch (error) {
    console.error('Notifications API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { recipient_id, type, title, message, sender_id, sender_name, related_id } = req.body;
    
    if (!recipient_id || !type) {
      return res.status(400).json({ message: 'recipient_id and type are required' });
    }

    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await pool.query(`
      INSERT INTO notifications (
        id, recipient_id, type, title, message, sender_id, sender_name, related_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `, [
      notifId,
      recipient_id,
      type,
      title || null,
      message || null,
      sender_id || null,
      sender_name || null,
      related_id || null,
    ]);

    const notif = result.rows[0];
    res.json({
      id: notif.id,
      recipient_id: notif.recipient_id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      content: notif.message || notif.title,
      sender_id: notif.sender_id,
      sender_name: notif.sender_name,
      related_id: notif.related_id,
      is_read: notif.is_read,
      created_at: notif.created_at,
      created_date: notif.created_at,
    });
  } catch (error) {
    console.error('Notification creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/notifications/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { id } = req.params;
    const updates = req.body;
    
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE notifications 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const notif = result.rows[0];
    res.json({
      id: notif.id,
      recipient_id: notif.recipient_id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      content: notif.message || notif.title,
      sender_id: notif.sender_id,
      sender_name: notif.sender_name,
      related_id: notif.related_id,
      is_read: notif.is_read,
      created_at: notif.created_at,
      created_date: notif.created_at,
    });
  } catch (error) {
    console.error('Notification update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { id } = req.params;
    const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Notification deletion error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Ghost Posts API
app.get('/api/posts', async (req, res) => {
  try {
    // Test if Ghost API is configured
    if (!process.env.GHOST_CONTENT_API_KEY) {
      return res.status(503).json({
        message: 'Blog service not configured',
        error: 'Ghost CMS not set up yet'
      });
    }

    try {
      let options = {
        limit: 6,
        include: ['tags', 'authors'],
        order: 'published_at DESC'
      };

      // Handle limit parameter
      if (req.query.limit) {
        const limit = parseInt(req.query.limit);
        if (limit > 0 && limit <= 20) {
          options.limit = limit;
        }
      }

      const posts = await ghostApi.posts.browse(options);

      // Transform posts to match frontend expectations
      const transformedPosts = posts.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.html,
        published_at: post.published_at,
        created_at: post.created_at,
        updated_at: post.updated_at,
        tags: post.tags ? post.tags.map(tag => ({ name: tag.name, slug: tag.slug })) : [],
        authors: post.authors ? post.authors.map(author => ({ name: author.name, slug: author.slug })) : [],
        feature_image: post.feature_image,
        reading_time: post.reading_time,
        url: post.url
      }));

      res.json(transformedPosts);
    } catch (ghostError) {
      console.error('Ghost API error:', ghostError);
      // Return empty array if Ghost is not available or misconfigured
      res.json([]);
    }
  } catch (error) {
    console.error('Posts API error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/posts/:slug', async (req, res) => {
  try {
    if (!process.env.GHOST_CONTENT_API_KEY) {
      return res.status(503).json({
        message: 'Blog service not configured',
        error: 'Ghost CMS not set up yet'
      });
    }

    const { slug } = req.params;

    try {
      const post = await ghostApi.posts.read({
        slug: slug,
        include: ['tags', 'authors']
      });

      // Transform post to match frontend expectations
      const transformedPost = {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.html,
        published_at: post.published_at,
        created_at: post.created_at,
        updated_at: post.updated_at,
        tags: post.tags ? post.tags.map(tag => ({ name: tag.name, slug: tag.slug })) : [],
        authors: post.authors ? post.authors.map(author => ({ name: author.name, slug: author.slug })) : [],
        feature_image: post.feature_image,
        reading_time: post.reading_time,
        url: post.url
      };

      res.json(transformedPost);
    } catch (ghostError) {
      console.error('Ghost API error:', ghostError);
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Individual post API error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Messages API
app.get('/api/messages', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    let query = 'SELECT * FROM messages WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (req.query.sender_id) {
      query += ` AND sender_id = $${paramIndex}`;
      params.push(req.query.sender_id);
      paramIndex++;
    }

    if (req.query.recipient_id) {
      query += ` AND recipient_id = $${paramIndex}`;
      params.push(req.query.recipient_id);
      paramIndex++;
    }

    // Handle sorting
    if (req.query.sort) {
      const sortField = req.query.sort.replace(/^-/, '');
      const sortDirection = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap = {
        'created_date': 'created_at',
        'created_at': 'created_at',
      };
      const dbField = fieldMap[sortField] || sortField;
      query += ` ORDER BY ${dbField} ${sortDirection}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // Handle limit
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      if (limit > 0) {
        query += ` LIMIT $${paramIndex}`;
        params.push(limit);
      }
    }

    const result = await pool.query(query, params);
    
    // Get sender and recipient names
    const messages = await Promise.all(result.rows.map(async (msg) => {
      const [senderResult, recipientResult] = await Promise.all([
        pool.query('SELECT artist_name, full_name FROM users WHERE id = $1', [msg.sender_id]),
        pool.query('SELECT artist_name, full_name FROM users WHERE id = $1', [msg.recipient_id]),
      ]);

      const sender = senderResult.rows[0];
      const recipient = recipientResult.rows[0];

      return {
        id: msg.id,
        sender_id: msg.sender_id,
        sender_name: sender?.artist_name || sender?.full_name || 'Unknown',
        recipient_id: msg.recipient_id,
        recipient_name: recipient?.artist_name || recipient?.full_name || 'Unknown',
        content: msg.content,
        is_read: msg.is_read,
        created_at: msg.created_at,
        created_date: msg.created_at,
      };
    }));

    res.json(messages);
  } catch (error) {
    console.error('Messages API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { sender_id, recipient_id, content } = req.body;
    
    if (!sender_id || !recipient_id || !content) {
      return res.status(400).json({ message: 'sender_id, recipient_id, and content are required' });
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await pool.query(`
      INSERT INTO messages (
        id, sender_id, recipient_id, content, created_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [messageId, sender_id, recipient_id, content]);

    const msg = result.rows[0];
    
    // Get sender and recipient names
    const [senderResult, recipientResult] = await Promise.all([
      pool.query('SELECT artist_name, full_name FROM users WHERE id = $1', [msg.sender_id]),
      pool.query('SELECT artist_name, full_name FROM users WHERE id = $1', [msg.recipient_id]),
    ]);

    const sender = senderResult.rows[0];
    const recipient = recipientResult.rows[0];

    res.json({
      id: msg.id,
      sender_id: msg.sender_id,
      sender_name: sender?.artist_name || sender?.full_name || 'Unknown',
      recipient_id: msg.recipient_id,
      recipient_name: recipient?.artist_name || recipient?.full_name || 'Unknown',
      content: msg.content,
      is_read: msg.is_read,
      created_at: msg.created_at,
      created_date: msg.created_at,
    });
  } catch (error) {
    console.error('Message creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/messages/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { id } = req.params;
    const updates = req.body;
    
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE messages 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const msg = result.rows[0];
    
    // Get sender and recipient names
    const [senderResult, recipientResult] = await Promise.all([
      pool.query('SELECT artist_name, full_name FROM users WHERE id = $1', [msg.sender_id]),
      pool.query('SELECT artist_name, full_name FROM users WHERE id = $1', [msg.recipient_id]),
    ]);

    const sender = senderResult.rows[0];
    const recipient = recipientResult.rows[0];

    res.json({
      id: msg.id,
      sender_id: msg.sender_id,
      sender_name: sender?.artist_name || sender?.full_name || 'Unknown',
      recipient_id: msg.recipient_id,
      recipient_name: recipient?.artist_name || recipient?.full_name || 'Unknown',
      content: msg.content,
      is_read: msg.is_read,
      created_at: msg.created_at,
      created_date: msg.created_at,
    });
  } catch (error) {
    console.error('Message update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Playlist Submissions API
app.get('/api/playlist-submissions', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    let query = 'SELECT * FROM playlist_submissions WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (req.query.user_id) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(req.query.user_id);
      paramIndex++;
    }

    if (req.query.playlist_name) {
      query += ` AND playlist_name = $${paramIndex}`;
      params.push(req.query.playlist_name);
      paramIndex++;
    }

    if (req.query.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(req.query.status);
      paramIndex++;
    }

    // Handle sorting
    if (req.query.sort) {
      const sortField = req.query.sort.replace(/^-/, '');
      const sortDirection = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap = {
        'created_date': 'created_at',
        'created_at': 'created_at',
      };
      const dbField = fieldMap[sortField] || sortField;
      query += ` ORDER BY ${dbField} ${sortDirection}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const result = await pool.query(query, params);
    
    const submissions = result.rows.map(sub => ({
      id: sub.id,
      user_id: sub.user_id,
      user_name: sub.user_name,
      playlist_name: sub.playlist_name,
      spotify_track_url: sub.spotify_track_url,
      status: sub.status,
      created_at: sub.created_at,
      created_date: sub.created_at,
      updated_at: sub.updated_at,
    }));

    res.json(submissions);
  } catch (error) {
    console.error('Playlist submissions API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/playlist-submissions', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { user_id, user_name, playlist_name, spotify_track_url } = req.body;
    
    if (!user_id || !spotify_track_url) {
      return res.status(400).json({ message: 'user_id and spotify_track_url are required' });
    }

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await pool.query(`
      INSERT INTO playlist_submissions (
        id, user_id, user_name, playlist_name, spotify_track_url, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [
      submissionId,
      user_id,
      user_name || null,
      playlist_name || null,
      spotify_track_url,
    ]);

    const sub = result.rows[0];
    res.json({
      id: sub.id,
      user_id: sub.user_id,
      user_name: sub.user_name,
      playlist_name: sub.playlist_name,
      spotify_track_url: sub.spotify_track_url,
      status: sub.status,
      created_at: sub.created_at,
      created_date: sub.created_at,
      updated_at: sub.updated_at,
    });
  } catch (error) {
    console.error('Playlist submission creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/playlist-submissions/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { id } = req.params;
    const updates = req.body;
    
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE playlist_submissions 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Playlist submission not found' });
    }

    const sub = result.rows[0];
    res.json({
      id: sub.id,
      user_id: sub.user_id,
      user_name: sub.user_name,
      playlist_name: sub.playlist_name,
      spotify_track_url: sub.spotify_track_url,
      status: sub.status,
      created_at: sub.created_at,
      created_date: sub.created_at,
      updated_at: sub.updated_at,
    });
  } catch (error) {
    console.error('Playlist submission update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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
