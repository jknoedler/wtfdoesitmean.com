# Super Simple Setup - Step by Step

Let's start from the beginning. Follow these steps in order.

## Step 1: Do You Have Ghost Installed?

**Check if Ghost is installed on your droplet:**

```bash
ssh root@your-droplet-ip
ghost --version
```

**If you see a version number:** Ghost is installed, go to Step 2.

**If you get "command not found":** Ghost is NOT installed, go to Step 1A.

---

## Step 1A: Install Ghost (If Not Installed)

### Easiest Way - Digital Ocean One-Click:

1. Go to https://cloud.digitalocean.com
2. Click **Create** → **Droplets**
3. Click **Marketplace** tab (at the top)
4. Type **"Ghost"** in the search box
5. Click on the **Ghost** app
6. Choose:
   - **Plan**: $12/month (Basic) or higher
   - **Region**: Choose closest to you
   - **Authentication**: Add your SSH key or create password
7. Click **Create Droplet**
8. **Wait 5-10 minutes** for it to install

### After Droplet is Created:

1. Digital Ocean will show you the IP address
2. Open a new browser tab
3. Go to: `http://YOUR-DROPLET-IP/ghost`
4. You should see Ghost setup page
5. Create your admin account

**If you see an error:** The droplet might still be installing. Wait 5 more minutes and try again.

---

## Step 2: Get Your Ghost URL

**What URL did you use when setting up Ghost?**

- If you used a domain: `https://your-domain.com`
- If you used IP: `http://YOUR-DROPLET-IP`

**Write this down - you'll need it!**

---

## Step 3: Get Your Content API Key

1. Go to your Ghost admin: `http://YOUR-DROPLET-IP/ghost` (or your domain)
2. Log in with the account you created
3. On the left sidebar, click **Settings** (gear icon at bottom)
4. Click **Integrations** (in the Settings menu)
5. Click **Add custom integration** button
6. Name it: `Next.js Blog`
7. Click **Create**
8. You'll see a **Content API Key** - **COPY THIS KEY**
9. It looks like: `abc123def456ghi789...` (long string)

---

## Step 4: Update Your .env.local File

On your **local computer** (not the droplet):

1. Open the file: `/Users/josiahknoedler/Desktop/Projects/wtfdoesitmean/.env.local`

2. Update it with your actual values:

```env
GHOST_URL=http://YOUR-DROPLET-IP
GHOST_CONTENT_API_KEY=paste-the-key-you-copied-here
NEXT_PUBLIC_SITE_URL=https://wtfdoesitmean.com
```

**Replace:**
- `YOUR-DROPLET-IP` with your actual droplet IP (like `123.45.67.89`)
- `paste-the-key-you-copied-here` with the Content API Key from Step 3

3. Save the file

---

## Step 5: Test It Locally

On your **local computer**:

```bash
cd ~/Desktop/Projects/wtfdoesitmean
npm run dev
```

Then open: http://localhost:3000

**If you see posts:** ✅ It's working!

**If you see "No posts found":** 
- Make sure you published at least one post in Ghost admin
- Check that your `.env.local` file has the correct values

---

## Common Problems

### "Ghost not found" error
→ Ghost isn't installed. Go back to Step 1A.

### "Can't connect to Ghost"
→ Check your `.env.local` file has the correct `GHOST_URL`

### "No posts found"
→ Go to Ghost admin and publish a test post

---

## What's Your Current Situation?

Tell me:
1. Do you have a Digital Ocean droplet? (Yes/No)
2. Is Ghost installed on it? (Yes/No/Not sure)
3. What happens when you go to `http://YOUR-DROPLET-IP/ghost`?

Then I can give you exact next steps!

