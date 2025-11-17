# How to Post Content

## Posting Works Through Ghost CMS Admin

Your Next.js site (wtfdoesitmean.com) is the **frontend** that displays posts. To create and publish posts, you use the **Ghost CMS admin panel** (separate from your site).

### How It Works:

1. **Ghost CMS Admin** = Where you write and publish posts (hidden from public)
2. **Your Next.js Site** = Where posts are displayed (public-facing, SEO-optimized)

### To Post Content:

1. **Access Ghost Admin Panel:**
   - If Ghost is on a subdomain: `https://cms.wtfdoesitmean.com/ghost/`
   - If Ghost is on Ghost Pro: `https://your-site.ghost.io/ghost/`
   - If self-hosted: `https://your-ghost-url.com/ghost/`

2. **Login to Ghost Admin:**
   - Use your Ghost admin credentials
   - This is completely separate from your Next.js site
   - No login UI appears on your public site (clean interface!)

3. **Create a Post:**
   - Click "New Post" in Ghost admin
   - Write your SEO-optimized article
   - Add title, content, tags, excerpt
   - Publish when ready

4. **Posts Automatically Appear:**
   - Once published in Ghost, posts automatically appear on your Next.js site
   - The site fetches posts from Ghost via the Content API
   - No need to manually update the Next.js site

### SEO Benefits:

- ✅ Posts are written in Ghost (easy content management)
- ✅ Displayed on your custom Next.js site (full SEO control)
- ✅ Clean public interface (no admin UI visible)
- ✅ Automatic updates (new posts appear instantly)

### Setting Up Ghost:

If you haven't set up Ghost yet:

1. **Option A: Ghost Pro (Easiest)**
   - Sign up at https://ghost.org
   - Get your Ghost URL (e.g., `your-site.ghost.io`)
   - Add credentials to `.env.local`

2. **Option B: Self-Host on Digital Ocean**
   - Install Ghost on your droplet
   - Set up Ghost admin panel
   - Configure Content API

3. **Get Content API Key:**
   - Go to Ghost Admin → Settings → Integrations
   - Create Custom Integration
   - Copy Content API Key
   - Add to `.env.local`:
     ```
     GHOST_URL=https://your-ghost-url.com
     GHOST_CONTENT_API_KEY=your-api-key-here
     ```

### Background Image:

Place your gothic background image at:
`/public/background.png`

Or update the path in `app/globals.css` if using a different filename/format.

