# Quick Start: Ghost CMS Setup

## Option 1: Digital Ocean One-Click Install (Easiest)

1. **Go to Digital Ocean Dashboard**
   - Click **Create** → **Droplets**
   - Click **Marketplace** tab
   - Search for **"Ghost"**
   - Select the Ghost one-click app

2. **Configure Droplet**
   - Choose your plan (minimum $12/month recommended)
   - Select your region
   - Add your SSH key
   - Click **Create Droplet**

3. **Wait for Installation** (5-10 minutes)

4. **Access Ghost Admin**
   - Visit: `http://your-droplet-ip/ghost`
   - Or if domain is configured: `https://your-domain.com/ghost`
   - Complete the setup wizard

5. **Get Content API Key**
   - Log into Ghost admin
   - Go to **Settings** → **Integrations**
   - Click **Add custom integration**
   - Name it "Next.js Blog"
   - Copy the **Content API Key**

6. **Update .env.local**
   ```env
   GHOST_URL=https://your-domain.com
   GHOST_CONTENT_API_KEY=paste-your-key-here
   NEXT_PUBLIC_SITE_URL=https://wtfdoesitmean.com
   ```

## Option 2: Manual Installation

### Step 1: Connect to Your Droplet

```bash
ssh root@your-droplet-ip
```

### Step 2: Install Ghost CLI

```bash
npm install -g ghost-cli@latest
```

### Step 3: Install Ghost

```bash
mkdir -p /var/www/ghost
cd /var/www/ghost
ghost install
```

Follow the prompts:
- Blog URL: `https://wtfdoesitmean.com` (or your domain)
- MySQL: Use defaults or create new database
- Nginx: Yes
- SSL: Yes (recommended)
- Systemd: Yes

### Step 4: Complete Setup

Visit `https://your-domain.com/ghost` and create your admin account.

## Option 3: Use Existing Ghost Instance

If you already have Ghost running:

1. Go to your Ghost admin panel
2. **Settings** → **Integrations**
3. Create or use existing Custom Integration
4. Copy **Content API Key**
5. Add to `.env.local`:
   ```env
   GHOST_URL=https://your-existing-ghost-url.com
   GHOST_CONTENT_API_KEY=your-api-key
   NEXT_PUBLIC_SITE_URL=https://wtfdoesitmean.com
   ```

## Testing the Connection

After setting up Ghost and updating `.env.local`:

```bash
cd ~/Desktop/Projects/wtfdoesitmean
npm run dev
```

Visit `http://localhost:3000` - you should see your Ghost posts!

## Troubleshooting

### Ghost not accessible?
- Check firewall: `ufw status`
- Check Nginx: `systemctl status nginx`
- Check Ghost: `ghost status`

### API key not working?
- Verify the key in Ghost admin
- Check `.env.local` file exists
- Restart Next.js dev server

### Domain not working?
- Point your domain's A record to your droplet IP
- Wait for DNS propagation (can take 24-48 hours)
- Check SSL certificate: `ghost config`

