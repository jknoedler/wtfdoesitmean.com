-- Soundope Database Schema for PostgreSQL
-- Run this on your DigitalOcean PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    artist_name VARCHAR(255),
    profile_image_url TEXT,
    bio TEXT,
    social_links JSONB DEFAULT '{}',
    points INTEGER DEFAULT 0,
    review_tier VARCHAR(50) DEFAULT 'novice',
    badges JSONB DEFAULT '[]',
    total_feedback_given INTEGER DEFAULT 0,
    total_tracks INTEGER DEFAULT 0,
    standard_credits INTEGER DEFAULT 0,
    premium_credits INTEGER DEFAULT 0,
    monthly_votes_remaining INTEGER DEFAULT 10,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    role VARCHAR(50) DEFAULT 'user',
    has_accepted_eula BOOLEAN DEFAULT false,
    eula_accepted_date TIMESTAMP,
    has_accepted_tos BOOLEAN DEFAULT false,
    tos_accepted_date TIMESTAMP,
    has_accepted_privacy BOOLEAN DEFAULT false,
    privacy_accepted_date TIMESTAMP,
    has_accepted_policies BOOLEAN DEFAULT false,
    policies_accepted_date TIMESTAMP,
    is_verified BOOLEAN DEFAULT false,
    disabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
    id VARCHAR(255) PRIMARY KEY,
    artist_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255),
    audio_url TEXT NOT NULL,
    video_url TEXT,
    cover_image_url TEXT,
    duration_seconds DECIMAL(10, 2),
    genres JSONB DEFAULT '[]',
    motifs JSONB DEFAULT '[]',
    description TEXT,
    spotify_link TEXT,
    youtube_link TEXT,
    soundcloud_link TEXT,
    apple_music_link TEXT,
    open_for_collab BOOLEAN DEFAULT false,
    collab_type VARCHAR(50),
    total_listens INTEGER DEFAULT 0,
    completed_listens INTEGER DEFAULT 0,
    praise_count INTEGER DEFAULT 0,
    neutral_count INTEGER DEFAULT 0,
    constructive_count INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    boost_credits INTEGER DEFAULT 0,
    boost_expires TIMESTAMP,
    has_exclusive_content BOOLEAN DEFAULT false,
    unlock_price INTEGER,
    exclusive_content_url TEXT,
    exclusive_content_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    ai_analysis JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(255) PRIMARY KEY,
    track_id VARCHAR(255) NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(255),
    artist_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sentiment VARCHAR(50),
    production_rating DECIMAL(3, 2),
    vocals_rating DECIMAL(3, 2),
    lyrics_rating DECIMAL(3, 2),
    originality_rating DECIMAL(3, 2),
    overall_rating DECIMAL(3, 2),
    listen_percentage DECIMAL(5, 2),
    listen_duration_seconds DECIMAL(10, 2),
    ai_validation_passed BOOLEAN DEFAULT false,
    ai_validation_score INTEGER,
    ai_feedback_notes TEXT,
    word_count INTEGER,
    points_awarded INTEGER DEFAULT 0,
    tier_achieved VARCHAR(50),
    helpful_votes INTEGER DEFAULT 0,
    helpful_voters JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(255) PRIMARY KEY,
    track_id VARCHAR(255) REFERENCES tracks(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_image TEXT,
    content TEXT NOT NULL,
    is_universal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id VARCHAR(255) PRIMARY KEY,
    track_id VARCHAR(255) NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(track_id, user_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(255) PRIMARY KEY,
    recipient_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    message TEXT,
    sender_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(255),
    related_id VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(255) PRIMARY KEY,
    reporter_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reporter_email VARCHAR(255),
    report_type VARCHAR(255),
    description TEXT,
    target_type VARCHAR(50),
    target_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(255) PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Playlist Submissions table
CREATE TABLE IF NOT EXISTS playlist_submissions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    playlist_name VARCHAR(255),
    spotify_track_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Collab Requests table
CREATE TABLE IF NOT EXISTS collab_requests (
    id VARCHAR(255) PRIMARY KEY,
    requester_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id VARCHAR(255) REFERENCES tracks(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Boosts table
CREATE TABLE IF NOT EXISTS boosts (
    id VARCHAR(255) PRIMARY KEY,
    track_id VARCHAR(255) NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credits_used INTEGER,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
    id VARCHAR(255) PRIMARY KEY,
    blocker_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- Track Claims table
CREATE TABLE IF NOT EXISTS track_claims (
    id VARCHAR(255) PRIMARY KEY,
    track_id VARCHAR(255) NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    claimant_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_track_id ON feedback(track_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewer_id ON feedback(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_artist_id ON feedback(artist_id);
CREATE INDEX IF NOT EXISTS idx_comments_track_id ON comments(track_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_track_id ON votes(track_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);

