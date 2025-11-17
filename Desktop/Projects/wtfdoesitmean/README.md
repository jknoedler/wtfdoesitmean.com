# WTF Does It Mean?

A gothic-themed SEO-optimized blog built with Next.js and Ghost CMS, featuring infinite scroll, search functionality, and a minimal dark UI.

## Features

- **Infinite Scroll**: Posts load automatically as you scroll down
- **Search**: Real-time keyword search across all posts
- **Random Post**: Jump to a random post with one click
- **Scroll to Top**: Smooth scroll back to the top
- **SEO Optimized**: Sitemap, structured data, and meta tags
- **Gothic Theme**: Dark background with light grey text
- **Westend Ridge Font**: Custom font for headers and titles

## Setup

### Prerequisites

- Node.js 18+ 
- Digital Ocean Droplet (or existing Ghost CMS instance)

### Quick Setup (5 minutes)

#### 1. Install Ghost CMS on Digital Ocean

**Easiest Method - One-Click Install:**
1. Go to Digital Ocean → Create → Droplets
2. Click **Marketplace** tab
3. Search for **"Ghost"**
4. Select Ghost one-click app
5. Choose plan ($12/month minimum)
6. Create droplet
7. Wait 5-10 minutes for installation

**Or Manual Install:**
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Install Ghost CLI
npm install -g ghost-cli@latest

# Install Ghost
mkdir -p /var/www/ghost
cd /var/www/ghost
ghost install
```

#### 2. Get Your Ghost Content API Key

1. Visit: `https://your-domain.com/ghost` (or `http://your-droplet-ip/ghost`)
2. Create your admin account
3. Go to **Settings** → **Integrations**
4. Click **Add custom integration**
5. Name it "Next.js Blog"
6. Copy the **Content API Key**

#### 3. Configure Next.js Site

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
GHOST_URL=https://your-domain.com
GHOST_CONTENT_API_KEY=your-content-api-key-here
NEXT_PUBLIC_SITE_URL=https://wtfdoesitmean.com
```

3. Add your background image:
   - Place your gothic background image at: `/public/background.png`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Detailed Setup Guides

- **Quick Start Guide**: See `QUICK_START.md`
- **Full Ghost Setup**: See `GHOST_SETUP.md`
- **Posting Guide**: See `POSTING_GUIDE.md`

## Deployment to Digital Ocean

### Build the application:
```bash
npm run build
```

### Production server:
```bash
npm start
```

### Recommended Setup:
- Use PM2 or similar process manager
- Set up Nginx as reverse proxy
- Configure SSL with Let's Encrypt
- Set environment variables on the server

## Project Structure

```
/
├── app/
│   ├── api/posts/     # API route for fetching posts from Ghost
│   ├── layout.tsx     # Root layout with font and metadata
│   ├── page.tsx       # Main page with infinite scroll
│   ├── globals.css    # Dark theme styles
│   ├── sitemap.ts     # Dynamic sitemap generation
│   └── robots.ts      # Robots.txt configuration
├── components/
│   ├── Header.tsx     # Site header with navigation
│   ├── PostCard.tsx   # Individual post component
│   ├── SearchBar.tsx  # Search functionality
│   ├── RandomPost.tsx # Random post navigation
│   └── ScrollToTop.tsx # Scroll to top button
├── lib/
│   ├── ghost.ts       # Ghost CMS client
│   └── posts.ts       # Post utility functions
└── public/
    └── fonts/         # Custom fonts
```

## Environment Variables

- `GHOST_URL`: Your Ghost CMS instance URL
- `GHOST_CONTENT_API_KEY`: Ghost Content API key
- `NEXT_PUBLIC_SITE_URL`: Your site URL (for SEO)

## Customization

### Theme Colors
Edit `app/globals.css` to change the color scheme:
- Background: `#000000` (black)
- Text: `#E5E5E5` (light grey)

### Font
The Westend Ridge font is used for headers and post titles. To change it, update `app/layout.tsx` and replace the font file in `public/fonts/`.

## SEO Features

- Dynamic sitemap generation
- Structured data (JSON-LD) for blog posts
- Open Graph meta tags
- Optimized meta descriptions
- Semantic HTML structure

## License

Freeware, Non-Commercial (as per Westend Ridge font license)
