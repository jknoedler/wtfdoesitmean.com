# Ghost CMS Setup Guide for Digital Ocean

## Quick Setup Steps

### 1. Connect to Your Digital Ocean Droplet

```bash
ssh root@your-droplet-ip
```

### 2. Install Ghost CLI

```bash
npm install -g ghost-cli@latest
```

### 3. Create Ghost Installation Directory

```bash
mkdir -p /var/www/ghost
cd /var/www/ghost
```

### 4. Install Ghost

```bash
ghost install
```

During installation, Ghost will ask:
- **Blog URL**: `https://wtfdoesitmean.com` (or your domain)
- **MySQL hostname**: `localhost` (default)
- **MySQL username/password**: Create or use existing
- **Ghost database name**: `ghost_prod` (default)
- **Set up Nginx?**: `Yes`
- **Set up SSL?**: `Yes` (recommended)
- **Set up systemd?**: `Yes`
- **Start Ghost?**: `Yes`

### 5. Complete Ghost Setup

After installation, visit:
```
https://your-domain.com/ghost
```

Create your admin account.

### 6. Get Content API Key

1. Log into Ghost admin: `https://your-domain.com/ghost`
2. Go to **Settings** → **Integrations**
3. Click **Add custom integration**
4. Name it: "Next.js Blog"
5. Copy the **Content API Key**

### 7. Update Your Next.js .env.local

```env
GHOST_URL=https://your-domain.com
GHOST_CONTENT_API_KEY=your-content-api-key-here
NEXT_PUBLIC_SITE_URL=https://wtfdoesitmean.com
```

## Alternative: One-Click Ghost on Digital Ocean

Digital Ocean offers a one-click Ghost app:

1. Go to Digital Ocean dashboard
2. Click **Create** → **Droplets**
3. Choose **Marketplace** tab
4. Select **Ghost**
5. Choose your plan and region
6. Create droplet
7. Follow setup wizard

## Manual Installation Script

If you prefer a manual setup, use the script below.

