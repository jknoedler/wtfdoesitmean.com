-- Curator and Admin Schema Additions
-- Run this after the main schema.sql

-- Curator genres table (genres that curators accept)
CREATE TABLE IF NOT EXISTS curator_genres (
    id VARCHAR(255) PRIMARY KEY,
    curator_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    genre VARCHAR(255) NOT NULL,
    sub_genres JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(curator_id, genre)
);

-- Curator submissions table
CREATE TABLE IF NOT EXISTS curator_submissions (
    id VARCHAR(255) PRIMARY KEY,
    artist_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id VARCHAR(255) REFERENCES tracks(id) ON DELETE SET NULL,
    curator_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    -- If no specific curator, submission goes to all curators of selected genres
    genres JSONB NOT NULL DEFAULT '[]',
    title VARCHAR(255),
    artist_name VARCHAR(255),
    audio_url TEXT,
    cover_image_url TEXT,
    spotify_link TEXT,
    youtube_link TEXT,
    soundcloud_link TEXT,
    apple_music_link TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    notes TEXT,
    credits_deducted INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_curator_submissions_artist ON curator_submissions(artist_id);
CREATE INDEX IF NOT EXISTS idx_curator_submissions_curator ON curator_submissions(curator_id);
CREATE INDEX IF NOT EXISTS idx_curator_submissions_status ON curator_submissions(status);
CREATE INDEX IF NOT EXISTS idx_curator_submissions_genres ON curator_submissions USING GIN(genres);
CREATE INDEX IF NOT EXISTS idx_curator_genres_curator ON curator_genres(curator_id);

-- Update users table to ensure role field exists (if not already there)
-- The role field should already exist, but we'll make sure it supports: 'user', 'curator', 'admin', 'founder'
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Set founder role for specific email
UPDATE users SET role = 'founder' WHERE email = 'youngdeathbiz@gmail.com';



