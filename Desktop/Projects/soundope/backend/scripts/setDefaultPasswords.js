import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database connection
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

async function setDefaultPasswords() {
  try {
    console.log('🔐 Setting default passwords for users without passwords...\n');
    
    // Get all users without passwords
    const result = await pool.query(
      'SELECT id, email FROM users WHERE password_hash IS NULL OR password_hash = \'\''
    );
    
    if (result.rows.length === 0) {
      console.log('✅ All users already have passwords!');
      return;
    }
    
    console.log(`Found ${result.rows.length} users without passwords\n`);
    
    // Hash the default password "password"
    const defaultPassword = 'password';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    let updated = 0;
    let errors = 0;
    
    // Update each user
    for (const user of result.rows) {
      try {
        await pool.query(
          'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
          [hashedPassword, user.id]
        );
        console.log(`✅ Set default password for: ${user.email || user.id}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating ${user.email || user.id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Updated: ${updated} users`);
    if (errors > 0) {
      console.log(`❌ Errors: ${errors} users`);
    }
    console.log(`\n⚠️  IMPORTANT: All these users now have password "password"`);
    console.log(`   They should be notified to change their password on first login.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setDefaultPasswords();

