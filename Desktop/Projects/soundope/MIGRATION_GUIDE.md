# Migration Guide: Base44 to DigitalOcean

This guide will help you migrate Soundope from Base44 to DigitalOcean.

## ✅ Completed

1. ✅ Created new API client (`src/api/apiClient.js`) to replace Base44
2. ✅ Updated all imports across the codebase (39 files)
3. ✅ Created database schema for PostgreSQL
4. ✅ Created import script for user data
5. ✅ Created backend structure

## 📋 What You Need to Do

### 1. Set Up DigitalOcean Infrastructure

#### A. Create PostgreSQL Database
1. Go to DigitalOcean → Databases → Create Database
2. Choose PostgreSQL
3. Select the $15/mo plan (1 GB RAM, 1 vCPU) - minimum recommended
4. Note down:
   - Host
   - Port (usually 25060)
   - Database name
   - Username
   - Password

#### B. Create DigitalOcean Spaces (for file storage)
1. Go to DigitalOcean → Spaces → Create Space
2. Choose a region (e.g., NYC3)
3. Note down:
   - Endpoint URL
   - Access Key
   - Secret Key
   - Bucket name

#### C. Create Droplet (Optional - if not using App Platform)
1. Go to DigitalOcean → Droplets → Create
2. Choose the $6/mo plan (1 GB RAM, 1 CPU) - **Note: This is minimal**
3. Recommended: $12/mo plan (2 GB RAM, 1 CPU) for better performance
4. Choose Ubuntu 22.04
5. Add your SSH key

### 2. Set Up Backend

1. **SSH into your droplet** (if using droplet):
   ```bash
   ssh root@your-droplet-ip
   ```

2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone your repo or upload files:**
   ```bash
   cd /var/www
   git clone your-repo-url soundope
   cd soundope/backend
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Set up environment:**
   ```bash
   cp env.example .env
   nano .env  # Edit with your credentials
   ```

6. **Run database schema:**
   ```bash
   # From your local machine or droplet
   psql -h your-db-host -U your-user -d soundope -f database/schema.sql
   ```

7. **Import user data:**
   ```bash
   npm run import
   ```

8. **Start server:**
   ```bash
   npm start
   ```

   Or use PM2 for production:
   ```bash
   npm install -g pm2
   pm2 start server.js --name soundope-api
   pm2 save
   pm2 startup
   ```

### 3. Set Up Frontend

1. **Update environment variables:**
   Create `.env` in the root directory:
   ```env
   VITE_API_URL=http://your-droplet-ip:3000/api
   # Or if using a domain:
   VITE_API_URL=https://api.yourdomain.com/api
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   # Upload dist/ folder to your web server
   ```

### 4. Implement Backend Routes

The backend currently has placeholder routes. You need to implement:

1. **Authentication** (`backend/routes/auth.js`):
   - POST `/api/auth/login`
   - POST `/api/auth/register`
   - GET `/api/auth/me`
   - PATCH `/api/auth/me`

2. **Tracks** (`backend/routes/tracks.js`):
   - GET `/api/tracks`
   - GET `/api/tracks/:id`
   - POST `/api/tracks`
   - PATCH `/api/tracks/:id`
   - DELETE `/api/tracks/:id`

3. **Feedback** (`backend/routes/feedback.js`):
   - GET `/api/feedback`
   - POST `/api/feedback`
   - PATCH `/api/feedback/:id`

4. **Comments** (`backend/routes/comments.js`):
   - GET `/api/comments`
   - POST `/api/comments`

5. **Users** (`backend/routes/users.js`):
   - GET `/api/users`
   - GET `/api/users/:id`

6. **Upload** (`backend/routes/upload.js`):
   - POST `/api/upload` (for file uploads to DigitalOcean Spaces)

### 5. Set Up Nginx (if using droplet)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/soundope/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### 6. Set Up SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## ⚠️ Important Notes

1. **1 GB RAM is minimal** - Consider upgrading to 2 GB if you experience performance issues
2. **Separate database recommended** - Use DigitalOcean managed PostgreSQL instead of running it on the droplet
3. **File storage** - All uploaded files need to be migrated to DigitalOcean Spaces
4. **Environment variables** - Never commit `.env` files to git
5. **Backup** - Set up regular database backups

## 🔄 Migration Checklist

- [ ] Create DigitalOcean PostgreSQL database
- [ ] Create DigitalOcean Spaces bucket
- [ ] Create droplet (or use App Platform)
- [ ] Set up backend environment variables
- [ ] Run database schema
- [ ] Import user data
- [ ] Implement backend routes
- [ ] Set up file upload to Spaces
- [ ] Update frontend API URL
- [ ] Test all functionality
- [ ] Set up monitoring/logging
- [ ] Set up backups
- [ ] Deploy to production

## 📞 Need Help?

If you need help implementing the backend routes, let me know and I can create them for you!

