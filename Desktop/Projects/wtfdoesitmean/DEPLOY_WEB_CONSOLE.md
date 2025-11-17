# Deploy Using Digital Ocean Web Console

## Step 1: Open Web Console

1. Go to: https://cloud.digitalocean.com/droplets
2. Click your droplet (137.184.116.32)
3. Click **"Console"** or **"Access"** → **"Launch Droplet Console"**
4. A browser terminal will open - use this!

---

## Step 2: Create Directory and Upload Files

**In the web console, run:**

```bash
# Create directory
mkdir -p /var/www/wtfdoesitmean
cd /var/www/wtfdoesitmean
```

**Now you need to get your files there. Option A or B:**

### Option A: Use wget/curl to download from a temporary location

On your Mac, upload the tarball to a temporary location (like Dropbox, Google Drive, or a pastebin), then:

```bash
# In the web console:
cd /var/www/wtfdoesitmean
wget https://your-temporary-url.com/wtfdoesitmean-deploy.tar.gz
tar -xzf wtfdoesitmean-deploy.tar.gz
```

### Option B: Copy files manually (if web console supports file upload)

Some Digital Ocean consoles have a file upload feature. Check the console interface.

### Option C: Clone from Git (if you have a repo)

```bash
cd /var/www
git clone https://your-repo-url.git wtfdoesitmean
cd wtfdoesitmean
```

---

## Step 3: Install Dependencies

```bash
cd /var/www/wtfdoesitmean
npm install --production
```

---

## Step 4: Create Environment File

```bash
nano .env.production
```

**Paste this** (replace with your actual Ghost API key):
```
GHOST_URL=http://137.184.116.32:2368
GHOST_CONTENT_API_KEY=your-actual-ghost-api-key-here
NEXT_PUBLIC_SITE_URL=https://wtfdoesitmean.com
NODE_ENV=production
```

**To get your Ghost API key:**
1. In the web console, check if Ghost is running: `ghost status`
2. Visit: `http://137.184.116.32:2368/ghost` in your browser
3. Go to Settings → Integrations → Add custom integration
4. Copy the Content API Key

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## Step 5: Build the App

```bash
cd /var/www/wtfdoesitmean
npm run build
```

---

## Step 6: Configure Nginx

```bash
nano /etc/nginx/sites-available/wtfdoesitmean
```

**Replace everything with:**
```nginx
server {
    listen 80;
    server_name wtfdoesitmean.com www.wtfdoesitmean.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /ghost {
        proxy_pass http://localhost:2368;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

**Test and reload:**
```bash
nginx -t
systemctl reload nginx
```

---

## Step 7: Start with PM2

```bash
npm install -g pm2
cd /var/www/wtfdoesitmean
pm2 start npm --name "wtfdoesitmean" -- start
pm2 save
pm2 startup
```

**Run the command it gives you** (looks like `sudo env PATH=...`)

---

## Step 8: Test

- Visit: `http://wtfdoesitmean.com` → Your Next.js site
- Visit: `http://wtfdoesitmean.com/ghost` → Ghost admin

---

## Alternative: Set Up SSH Keys (For Future)

If you want to use SSH from your Mac later:

1. Generate SSH key on your Mac:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. Copy the public key:
```bash
cat ~/.ssh/id_ed25519.pub
```

3. In Digital Ocean web console, add it:
```bash
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Paste your public key
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

