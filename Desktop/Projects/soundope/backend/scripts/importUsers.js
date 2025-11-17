import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DigitalOcean PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 25060,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_PORT === '25060' ? {
    rejectUnauthorized: false,
  } : false,
});

async function importAllData() {
  const filePath = path.join(__dirname, '../../soundope-users-export-2025-11-14.json');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`🚀 Starting import of ${data.length} users...\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const user = item.user;
    
    try {
      console.log(`[${i + 1}/${data.length}] Processing user: ${user.email || user.full_name || user.id}`);
      
      // Insert user
      await pool.query(`
        INSERT INTO users (
          id, email, full_name, artist_name, profile_image_url, bio,
          social_links, points, review_tier, badges, role,
          has_accepted_eula, eula_accepted_date,
          has_accepted_tos, tos_accepted_date,
          has_accepted_privacy, privacy_accepted_date,
          has_accepted_policies, policies_accepted_date,
          is_verified, disabled,
          standard_credits, premium_credits, monthly_votes_remaining,
          current_streak, best_streak,
          total_feedback_given, total_tracks,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          artist_name = EXCLUDED.artist_name,
          updated_at = EXCLUDED.updated_at
      `, [
        user.id, user.email, user.full_name, user.artist_name,
        user.profile_image_url, user.bio,
        JSON.stringify(user.social_links || {}), user.points || 0,
        user.review_tier || 'novice', JSON.stringify(user.badges || []),
        user.role || 'user',
        user.has_accepted_eula || false, user.eula_accepted_date ? new Date(user.eula_accepted_date) : null,
        user.has_accepted_tos || false, user.tos_accepted_date ? new Date(user.tos_accepted_date) : null,
        user.has_accepted_privacy || false, user.privacy_accepted_date ? new Date(user.privacy_accepted_date) : null,
        user.has_accepted_policies || false, user.policies_accepted_date ? new Date(user.policies_accepted_date) : null,
        user.is_verified || false, user.disabled || false,
        user.standard_credits || 0, user.premium_credits || 0, user.monthly_votes_remaining || 10,
        user.current_streak || 0, user.best_streak || 0,
        user.total_feedback_given || 0, user.total_tracks || 0,
        new Date(user.created_date), new Date(user.updated_date)
      ]);

      // Insert tracks
      if (item.tracks && item.tracks.length > 0) {
        for (const track of item.tracks) {
          try {
            await pool.query(`
              INSERT INTO tracks (
                id, artist_id, title, artist_name, audio_url, cover_image_url,
                video_url, duration_seconds, genres, motifs, description,
                spotify_link, youtube_link, soundcloud_link, apple_music_link,
                open_for_collab, collab_type,
                total_listens, completed_listens, praise_count, neutral_count,
                constructive_count, total_votes, boost_credits, boost_expires,
                has_exclusive_content, unlock_price, exclusive_content_url,
                exclusive_content_type, is_active, ai_analysis,
                created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
              ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at
            `, [
              track.id, user.id, track.title, track.artist_name,
              track.audio_url, track.cover_image_url,
              track.video_url || null, track.duration_seconds || null,
              JSON.stringify(track.genres || []), JSON.stringify(track.motifs || []),
              track.description || null,
              track.spotify_link || null, track.youtube_link || null,
              track.soundcloud_link || null, track.apple_music_link || null,
              track.open_for_collab || false, track.collab_type || null,
              track.total_listens || 0, track.completed_listens || 0,
              track.praise_count || 0, track.neutral_count || 0,
              track.constructive_count || 0, track.total_votes || 0,
              track.boost_credits || 0, track.boost_expires ? new Date(track.boost_expires) : null,
              track.has_exclusive_content || false, track.unlock_price || null,
              track.exclusive_content_url || null, track.exclusive_content_type || null,
              track.is_active !== false, track.ai_analysis ? JSON.stringify(track.ai_analysis) : null,
              new Date(track.created_date), new Date(track.updated_date)
            ]);
          } catch (error) {
            console.error(`    ✗ Error inserting track ${track.id}:`, error.message);
            errors.push({ type: 'track', id: track.id, error: error.message });
          }
        }
      }

      // Insert comments
      if (item.comments && item.comments.length > 0) {
        for (const comment of item.comments) {
          try {
            await pool.query(`
              INSERT INTO comments (
                id, track_id, user_id, user_name, user_image, content, is_universal, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ON CONFLICT (id) DO NOTHING
            `, [
              comment.id, comment.track_id || null, user.id,
              comment.user_name, comment.user_image || null,
              comment.content, comment.is_universal || false,
              new Date(comment.created_date), new Date(comment.updated_date || comment.created_date)
            ]);
          } catch (error) {
            console.error(`    ✗ Error inserting comment ${comment.id}:`, error.message);
            errors.push({ type: 'comment', id: comment.id, error: error.message });
          }
        }
      }

      // Insert feedback given
      if (item.feedbackGiven && item.feedbackGiven.length > 0) {
        for (const feedback of item.feedbackGiven) {
          try {
            await pool.query(`
              INSERT INTO feedback (
                id, track_id, reviewer_id, reviewer_name, artist_id, content,
                sentiment, production_rating, vocals_rating, lyrics_rating,
                originality_rating, overall_rating, listen_percentage,
                listen_duration_seconds, ai_validation_passed, ai_validation_score,
                ai_feedback_notes, word_count, points_awarded, tier_achieved,
                helpful_votes, helpful_voters, is_featured, tags,
                created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
              ON CONFLICT (id) DO NOTHING
            `, [
              feedback.id, feedback.track_id, user.id, feedback.reviewer_name,
              feedback.artist_id, feedback.content,
              feedback.sentiment || null, feedback.production_rating || null,
              feedback.vocals_rating || null, feedback.lyrics_rating || null,
              feedback.originality_rating || null, feedback.overall_rating || null,
              feedback.listen_percentage || null, feedback.listen_duration_seconds || null,
              feedback.ai_validation_passed || false, feedback.ai_validation_score || null,
              feedback.ai_feedback_notes || null, feedback.word_count || null,
              feedback.points_awarded || 0, feedback.tier_achieved || null,
              feedback.helpful_votes || 0, JSON.stringify(feedback.helpful_voters || []),
              feedback.is_featured || false, JSON.stringify(feedback.tags || []),
              new Date(feedback.created_date), new Date(feedback.updated_date || feedback.created_date)
            ]);
          } catch (error) {
            console.error(`    ✗ Error inserting feedback ${feedback.id}:`, error.message);
            errors.push({ type: 'feedback_given', id: feedback.id, error: error.message });
          }
        }
      }

      // Insert feedback received
      if (item.feedbackReceived && item.feedbackReceived.length > 0) {
        for (const feedback of item.feedbackReceived) {
          try {
            await pool.query(`
              INSERT INTO feedback (
                id, track_id, reviewer_id, reviewer_name, artist_id, content,
                sentiment, production_rating, vocals_rating, lyrics_rating,
                originality_rating, overall_rating, listen_percentage,
                listen_duration_seconds, ai_validation_passed, ai_validation_score,
                ai_feedback_notes, word_count, points_awarded, tier_achieved,
                helpful_votes, helpful_voters, is_featured, tags,
                created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
              ON CONFLICT (id) DO NOTHING
            `, [
              feedback.id, feedback.track_id, feedback.reviewer_id, feedback.reviewer_name,
              user.id, feedback.content,
              feedback.sentiment || null, feedback.production_rating || null,
              feedback.vocals_rating || null, feedback.lyrics_rating || null,
              feedback.originality_rating || null, feedback.overall_rating || null,
              feedback.listen_percentage || null, feedback.listen_duration_seconds || null,
              feedback.ai_validation_passed || false, feedback.ai_validation_score || null,
              feedback.ai_feedback_notes || null, feedback.word_count || null,
              feedback.points_awarded || 0, feedback.tier_achieved || null,
              feedback.helpful_votes || 0, JSON.stringify(feedback.helpful_voters || []),
              feedback.is_featured || false, JSON.stringify(feedback.tags || []),
              new Date(feedback.created_date), new Date(feedback.updated_date || feedback.created_date)
            ]);
          } catch (error) {
            console.error(`    ✗ Error inserting feedback ${feedback.id}:`, error.message);
            errors.push({ type: 'feedback_received', id: feedback.id, error: error.message });
          }
        }
      }
      
      successCount++;
      console.log(`  ✅ User ${i + 1} completed successfully\n`);
      
    } catch (error) {
      errorCount++;
      console.error(`  ✗ Error processing user ${user.email || user.id}:`, error.message);
      errors.push({ type: 'user', id: user.id, email: user.email, error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully imported: ${successCount} users`);
  console.log(`❌ Errors: ${errorCount} users`);
  console.log(`📝 Total errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    errors.slice(0, 10).forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.type} - ${err.id || err.email}: ${err.error}`);
    });
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`);
    }
    
    // Save errors to file
    const errorPath = path.join(__dirname, '../../import-errors.json');
    fs.writeFileSync(errorPath, JSON.stringify(errors, null, 2));
    console.log(`\n💾 Errors saved to: ${errorPath}`);
  }
  
  console.log('\n✨ Import complete!');
  await pool.end();
}

importAllData().catch(console.error);

