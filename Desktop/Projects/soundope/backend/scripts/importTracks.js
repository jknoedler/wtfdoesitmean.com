import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import csv from 'csv-parser';

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

async function importTracksFromCSV() {
  const csvPath = path.join(__dirname, '../../data/tracks.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`);
    process.exit(1);
  }

  const tracks = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        tracks.push(row);
      })
      .on('end', async () => {
        console.log(`🚀 Starting import of ${tracks.length} tracks...\n`);
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i];
          
          try {
            // Parse JSON fields
            let genres = [];
            let motifs = [];
            let ai_analysis = null;
            
            try {
              if (track.genres) {
                genres = JSON.parse(track.genres);
              }
            } catch (e) {
              console.warn(`    ⚠ Could not parse genres for track ${track.id}: ${e.message}`);
            }
            
            try {
              if (track.motifs) {
                motifs = JSON.parse(track.motifs);
              }
            } catch (e) {
              console.warn(`    ⚠ Could not parse motifs for track ${track.id}: ${e.message}`);
            }
            
            try {
              if (track.ai_analysis) {
                ai_analysis = JSON.parse(track.ai_analysis);
              }
            } catch (e) {
              // ai_analysis is optional
            }

            // Check if artist exists, create if not
            let artistCheck = await pool.query(
              'SELECT id FROM users WHERE id = $1',
              [track.artist_id]
            );
            
            if (artistCheck.rows.length === 0) {
              // Create placeholder artist
              console.log(`    ℹ Creating placeholder artist ${track.artist_id} (${track.artist_name})`);
              try {
                await pool.query(`
                  INSERT INTO users (
                    id, email, artist_name, full_name, is_verified, created_at, updated_at
                  ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                  ON CONFLICT (id) DO NOTHING
                `, [
                  track.artist_id,
                  `${track.artist_id}@placeholder.soundope.com`,
                  track.artist_name || 'Unknown Artist',
                  track.artist_name || 'Unknown Artist',
                  false
                ]);
              } catch (artistError) {
                console.error(`    ✗ Error creating artist ${track.artist_id}:`, artistError.message);
                errorCount++;
                errors.push({ type: 'track', id: track.id, error: `Failed to create artist: ${artistError.message}` });
                continue;
              }
            }

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
              ON CONFLICT (id) DO UPDATE SET
                artist_id = EXCLUDED.artist_id,
                title = EXCLUDED.title,
                artist_name = EXCLUDED.artist_name,
                audio_url = EXCLUDED.audio_url,
                cover_image_url = EXCLUDED.cover_image_url,
                video_url = EXCLUDED.video_url,
                duration_seconds = EXCLUDED.duration_seconds,
                genres = EXCLUDED.genres,
                motifs = EXCLUDED.motifs,
                description = EXCLUDED.description,
                spotify_link = EXCLUDED.spotify_link,
                youtube_link = EXCLUDED.youtube_link,
                soundcloud_link = EXCLUDED.soundcloud_link,
                apple_music_link = EXCLUDED.apple_music_link,
                open_for_collab = EXCLUDED.open_for_collab,
                collab_type = EXCLUDED.collab_type,
                total_listens = EXCLUDED.total_listens,
                completed_listens = EXCLUDED.completed_listens,
                praise_count = EXCLUDED.praise_count,
                neutral_count = EXCLUDED.neutral_count,
                constructive_count = EXCLUDED.constructive_count,
                total_votes = EXCLUDED.total_votes,
                boost_credits = EXCLUDED.boost_credits,
                boost_expires = EXCLUDED.boost_expires,
                has_exclusive_content = EXCLUDED.has_exclusive_content,
                unlock_price = EXCLUDED.unlock_price,
                exclusive_content_url = EXCLUDED.exclusive_content_url,
                exclusive_content_type = EXCLUDED.exclusive_content_type,
                is_active = EXCLUDED.is_active,
                ai_analysis = EXCLUDED.ai_analysis,
                updated_at = EXCLUDED.updated_at
            `, [
              track.id,
              track.artist_id,
              track.title,
              track.artist_name,
              track.audio_url,
              track.cover_image_url || null,
              track.video_url || null,
              track.duration_seconds ? parseFloat(track.duration_seconds) : null,
              JSON.stringify(genres),
              JSON.stringify(motifs),
              track.description || null,
              track.spotify_link || null,
              track.youtube_link || null,
              track.soundcloud_link || null,
              track.apple_music_link || null,
              track.open_for_collab === 'true',
              track.collab_type || null,
              parseInt(track.total_listens) || 0,
              parseInt(track.completed_listens) || 0,
              parseInt(track.praise_count) || 0,
              parseInt(track.neutral_count) || 0,
              parseInt(track.constructive_count) || 0,
              parseInt(track.total_votes) || 0,
              parseInt(track.boost_credits) || 0,
              track.boost_expires ? new Date(track.boost_expires) : null,
              track.has_exclusive_content === 'true',
              track.unlock_price ? parseInt(track.unlock_price) : null,
              track.exclusive_content_url || null,
              track.exclusive_content_type || null,
              track.is_active !== 'false',
              ai_analysis ? JSON.stringify(ai_analysis) : null,
              track.created_date ? new Date(track.created_date) : new Date(),
              track.updated_date ? new Date(track.updated_date) : new Date(),
            ]);

            successCount++;
            console.log(`[${i + 1}/${tracks.length}] ✅ Imported track: ${track.title} by ${track.artist_name}`);
          } catch (error) {
            errorCount++;
            console.error(`[${i + 1}/${tracks.length}] ✗ Error importing track ${track.id} (${track.title}):`, error.message);
            errors.push({ type: 'track', id: track.id, title: track.title, error: error.message });
          }
        }

        console.log('\n==================================================');
        console.log('📊 IMPORT SUMMARY');
        console.log('==================================================');
        console.log(`✅ Successfully imported: ${successCount} tracks`);
        console.log(`❌ Errors: ${errorCount} tracks`);
        console.log(`📝 Total errors: ${errors.length}`);

        if (errors.length > 0) {
          console.log('\n⚠️ Errors encountered:');
          errors.slice(0, 10).forEach((err, idx) => {
            console.log(`${idx + 1}. ${err.type} - ${err.id}${err.title ? ` (${err.title})` : ''}: ${err.error}`);
          });
          if (errors.length > 10) {
            console.log(`... and ${errors.length - 10} more errors`);
          }
        }

        // Save errors to file
        if (errors.length > 0) {
          const errorPath = path.join(__dirname, '../../import-track-errors.json');
          fs.writeFileSync(errorPath, JSON.stringify(errors, null, 2));
          console.log(`\n💾 Errors saved to: ${errorPath}`);
        }

        console.log('\n✨ Import complete!');
        await pool.end();
        resolve();
      })
      .on('error', reject);
  });
}

importTracksFromCSV().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

