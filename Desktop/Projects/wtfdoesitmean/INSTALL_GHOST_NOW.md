# Install Ghost on Your Existing Droplet - RIGHT NOW

## Step 1: Connect to Your Droplet

Open Terminal on your Mac and run:

```bash
ssh root@YOUR-DROPLET-IP
```

**Replace `YOUR-DROPLET-IP` with your actual droplet IP address.**

If you don't know your IP:
- Go to Digital Ocean dashboard
- Click on your droplet
- You'll see the IP address at the top

If it asks for a password, enter the root password for your droplet.

---

## Step 2: Install Ghost CLI

Once you're connected (you'll see `root@your-droplet:~#`), run:

```bash
npm install -g ghost-cli@latest
```

Wait for it to finish (takes 1-2 minutes).

---

## Step 3: Install Ghost

Run these commands one by one:

```bash
mkdir -p /var/www/ghost
cd /var/www/ghost
ghost install
```

**When `ghost install` asks you questions, answer like this:**

1. **Blog URL**: Type `http://YOUR-DROPLET-IP` (use your actual IP)
2. **MySQL**: Press Enter (use defaults)
3. **Set up Nginx?**: Type `y` and press Enter
4. **Set up SSL?**: Type `n` and press Enter (we'll do this later)
5. **Set up systemd?**: Type `y` and press Enter
6. **Start Ghost?**: Type `y` and press Enter

**This will take 5-10 minutes. Don't close the terminal!**

---

## Step 4: Access Ghost Admin

Once installation is done:

1. Open a NEW browser tab
2. Go to: `http://YOUR-DROPLET-IP/ghost`
3. You should see Ghost setup page
4. Create your admin account:
   - Name: Your name
   - Email: Your email
   - Password: Choose a password
   - Site title: "WTF Does It Mean?"

---

## Step 5: Get Your Content API Key

After creating your account:

1. In Ghost admin, click **Settings** (bottom left, gear icon)
2. Click **Integrations**
3. Click **Add custom integration**
4. Name it: `Next.js Blog`
5. Click **Create**
6. **COPY the Content API Key** (long string of letters/numbers)

---

## Step 6: Update Your .env.local

On your **Mac** (not the droplet), open:

```bash
nano ~/Desktop/Projects/wtfdoesitmean/.env.local
```

Or open it in your code editor.

Update it to:

```env
GHOST_URL=http://YOUR-DROPLET-IP
GHOST_CONTENT_API_KEY=paste-the-key-you-copied
NEXT_PUBLIC_SITE_URL=https://wtfdoesitmean.com
```

**Replace:**
- `YOUR-DROPLET-IP` with your actual IP
- `paste-the-key-you-copied` with the API key from Step 5

Save the file.

---

## Step 7: Test It

On your Mac:

```bash
cd ~/Desktop/Projects/wtfdoesitmean
npm run dev
```

Open: http://localhost:3000

**You should see your Ghost posts!**

---

## Troubleshooting

### "Can't find server" when going to /ghost
- Wait 5 more minutes - Ghost might still be installing
- Check: `ghost status` (on the droplet)
- Make sure you're using `http://` not `https://`

### "Permission denied" when installing
- Make sure you're logged in as `root`
- Try: `sudo npm install -g ghost-cli@latest`

### Ghost install fails
- Make sure you have at least 1GB RAM
- Check: `free -h` (on the droplet)
- You might need a bigger droplet

---

## What's Next?

Once Ghost is working:
1. You can post articles in Ghost admin
2. They'll automatically appear on your Next.js site
3. Later, we'll deploy your Next.js site to the same droplet

**Start with Step 1 above - connect to your droplet!**

