# Quick Deploy - Use Digital Ocean Web Console

## Easiest Method: Web Console + File Transfer

### Step 1: Open Digital Ocean Web Console

1. Go to: https://cloud.digitalocean.com/droplets
2. Click your droplet (137.184.116.32)
3. Click **"Console"** button (top right)
4. A browser terminal opens - this is your server!

---

### Step 2: Transfer Files - Method 1 (Recommended)

**On your Mac, start a simple web server:**

```bash
cd /tmp
python3 -m http.server 8000
```

**Then in the Digital Ocean web console, run:**

```bash
cd /var/www
mkdir -p wtfdoesitmean
cd wtfdoesitmean
wget http://YOUR_MAC_IP:8000/wtfdoesitmean-deploy.tar.gz
```

**To find your Mac's IP:**
- On your Mac, run: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Look for something like `192.168.x.x` or `10.x.x.x`
- Make sure your Mac and droplet can reach each other (same network or use ngrok)

**OR use this simpler method:**

---

### Step 2: Transfer Files - Method 2 (Easier)

**In the Digital Ocean web console, run these commands one by one:**

```bash
# Create directory
mkdir -p /var/www/wtfdoesitmean
cd /var/www/wtfdoesitmean

# Create the project structure manually
mkdir -p app components lib public types
mkdir -p app/api/posts
```

**Then I'll give you commands to create each file. OR:**

**Use this Python script to create files from base64 (I'll provide the base64):**

```bash
# In web console, create a script
cat > /tmp/create_files.sh << 'EOF'
#!/bin/bash
cd /var/www/wtfdoesitmean
# Files will be created here
EOF
chmod +x /tmp/create_files.sh
```

---

### Step 3: Quick Setup (All in Web Console)

**Run these commands in the Digital Ocean web console:**

```bash
# 1. Create directory
mkdir -p /var/www/wtfdoesitmean
cd /var/www/wtfdoesitmean

# 2. Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# 3. Clone or create project
# (We'll get files there next)

# 4. Install dependencies
npm install --production

# 5. Create .env.production
cat > .env.production << 'ENVEOF'
GHOST_URL=http://137.184.116.32:2368
GHOST_CONTENT_API_KEY=your-key-here
NEXT_PUBLIC_SITE_URL=https://wtfdoesitmean.com
NODE_ENV=production
ENVEOF

# Edit it with your actual key
nano .env.production
```

---

## Alternative: Fix SSH First

If you want to use SSH from your Mac:

### Generate SSH Key on Your Mac:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/do_key -N ""
cat ~/.ssh/do_key.pub
```

**Copy the output** (starts with `ssh-ed25519`)

### Add Key to Droplet (in Web Console):

```bash
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Paste your public key (the ssh-ed25519 line)
# Save: Ctrl+X, Y, Enter

chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Then SSH from Mac:

```bash
ssh -i ~/.ssh/do_key root@137.184.116.32
```

---

## Recommended: Use Web Console for Now

**Just use the Digital Ocean web console** - it's the easiest way right now. Once you're in:

1. Create the directory
2. I'll help you get the files there (we can create them manually or use a file transfer method)
3. Follow the rest of the setup steps

**Tell me when you have the web console open and I'll guide you through the file transfer!**

