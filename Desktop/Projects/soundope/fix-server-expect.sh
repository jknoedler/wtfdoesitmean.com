#!/usr/bin/expect -f
# Expect script to automate SSH with passphrase

set SSH_KEY "/Users/josiahknoedler/Desktop/Projects/id_ed25519"
set SERVER "root@129.212.186.215"
set timeout 30

# Prompt for passphrase
puts "Enter passphrase for SSH key:"
stty -echo
expect_user -re "(.*)\n"
set passphrase $expect_out(1,string)
stty echo
puts ""

# Spawn SSH connection
spawn ssh -i $SSH_KEY $SERVER

expect {
    "passphrase:" {
        send "$passphrase\r"
        exp_continue
    }
    "password:" {
        send "$passphrase\r"
        exp_continue
    }
    "Permission denied" {
        puts "❌ Authentication failed"
        exit 1
    }
    "$ " {
        puts "✅ Connected to server"
    }
    "# " {
        puts "✅ Connected to server"
    }
    timeout {
        puts "❌ Connection timeout"
        exit 1
    }
}

# Send commands
send "cd /var/www/soundope/backend\r"
expect "# "

send "cat > server.js << 'EOFMARKER'\r"
expect "> "

send "import express from 'express';\r"
send "import cors from 'cors';\r"
send "import dotenv from 'dotenv';\r"
send "import pool from './database/connection.js';\r"
send "\r"
send "dotenv.config();\r"
send "\r"
send "const app = express();\r"
send "const PORT = process.env.PORT || 3000;\r"
send "\r"
send "app.use(cors({\r"
send "  origin: process.env.FRONTEND_URL || 'http://localhost:5173',\r"
send "  credentials: true,\r"
send "}));\r"
send "app.use(express.json());\r"
send "app.use(express.urlencoded({ extended: true }));\r"
send "\r"
send "app.get('/health', async (req, res) => {\r"
send "  try {\r"
send "    await pool.query('SELECT 1');\r"
send "    res.json({ status: 'ok', database: 'connected' });\r"
send "  } catch (error) {\r"
send "    res.status(500).json({ status: 'error', database: 'disconnected' });\r"
send "  }\r"
send "});\r"
send "\r"
send "app.get('/api/auth/me', async (req, res) => {\r"
send "  try {\r"
send "    const token = req.headers.authorization?.replace('Bearer ', '');\r"
send "    if (!token) {\r"
send "      return res.status(401).json({ message: 'Not authenticated' });\r"
send "    }\r"
send "    res.status(401).json({ message: 'Not authenticated' });\r"
send "  } catch (error) {\r"
send "    console.error('Auth error:', error);\r"
send "    res.status(401).json({ message: 'Not authenticated' });\r"
send "  }\r"
send "});\r"
send "\r"
send "app.post('/api/auth/login', (req, res) => {\r"
send "  res.status(501).json({ message: 'Login not implemented yet' });\r"
send "});\r"
send "\r"
send "app.post('/api/auth/register', (req, res) => {\r"
send "  res.status(501).json({ message: 'Register not implemented yet' });\r"
send "});\r"
send "\r"
send "app.use('/api/auth', (req, res) => {\r"
send "  res.status(404).json({ message: 'Auth route not found' });\r"
send "});\r"
send "\r"
send "app.use('/api/tracks', (req, res) => {\r"
send "  res.status(501).json({ message: 'Track routes not implemented yet' });\r"
send "});\r"
send "\r"
send "app.use('/api/feedback', (req, res) => {\r"
send "  res.status(501).json({ message: 'Feedback routes not implemented yet' });\r"
send "});\r"
send "\r"
send "app.use('/api/comments', (req, res) => {\r"
send "  res.status(501).json({ message: 'Comment routes not implemented yet' });\r"
send "});\r"
send "\r"
send "app.use('/api/users', (req, res) => {\r"
send "  res.status(501).json({ message: 'User routes not implemented yet' });\r"
send "});\r"
send "\r"
send "app.use('/api/upload', (req, res) => {\r"
send "  res.status(501).json({ message: 'Upload routes not implemented yet' });\r"
send "});\r"
send "\r"
send "app.use((req, res) => {\r"
send "  res.status(404).json({ message: 'Route not found' });\r"
send "});\r"
send "\r"
send "app.use((err, req, res, next) => {\r"
send "  console.error('Error:', err);\r"
send "  res.status(500).json({ message: 'Internal server error' });\r"
send "});\r"
send "\r"
send "app.listen(PORT, () => {\r"
send "  console.log(\`🚀 Server running on port \${PORT}\`);\r"
send "  console.log(\`📡 API available at http://localhost:\${PORT}/api\`);\r"
send "});\r"
send "EOFMARKER\r"
expect "# "

send "pm2 stop soundope-api || true\r"
expect "# "

send "pm2 delete soundope-api || true\r"
expect "# "

send "pm2 start server.js --name soundope-api\r"
expect "# "

send "pm2 save\r"
expect "# "

send "sleep 2\r"
expect "# "

send "curl -i http://localhost:3000/api/auth/me\r"
expect "# "

send "exit\r"
expect eof

