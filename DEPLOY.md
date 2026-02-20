# Push to production (Railway) — step-by-step

**Your stack:** Frontend = **React + Vite**; Backend = **Node.js + Express** (with login/register and JWT). One repo, one app on Railway.

**Domain:** You already have a domain from GoDaddy. For now we only cover getting the app live on Railway. Connecting your GoDaddy domain comes after that.

---

## 1. Put your code on GitHub (if it isn’t already)

1. Open a browser and go to **https://github.com**
2. Log in (or create an account).
3. Click the **+** (top right) → **New repository**.
4. Name it (e.g. `platonic-study`), leave it **Public**, don’t add a README (you already have one). Click **Create repository**.
5. In your project folder, open a terminal (e.g. in Cursor: **Terminal → New Terminal**).
6. Run these one at a time (replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name):

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

   If `origin` already exists, use:  
   `git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git`  
   then:  
   `git push -u origin main`

Your code is now on GitHub.

---

## 2. Create a Railway account and a new project

1. Go to **https://railway.app**
2. Click **Login** and sign in with **GitHub** (e.g. “Login with GitHub”).
3. After login, click **New Project**.
4. Choose **Deploy from GitHub repo**.
5. Pick the repo you just pushed (e.g. `platonic-study`). If you don’t see it, click **Configure GitHub App** and allow Railway to see the repo, then try again.
6. Click the repo to connect it. Railway will create a new project and start a first deploy.

---

## 3. Use the right build and start (already set in this repo)

This repo is already set up so that:

- **Build:** installs frontend deps, builds the React app, then installs server deps.
- **Start:** runs the Node server, which serves both the API and the built React app.

You don’t need to change any code. If the first deploy fails, check the next section.

---

## 4. Set one variable (required for production)

1. In Railway, open your **project** → click your **service** (the one that’s deploying).
2. Go to the **Variables** tab.
3. Click **+ New Variable**.
4. Name: `JWT_SECRET`  
   Value: pick a long random string (e.g. 20+ random letters/numbers), or use a password generator. Example: `mySuperSecretKey123ChangeThis456`.
5. Click **Add** (or Save).
6. Railway will **redeploy** automatically. Wait until the deploy shows **Success** (green).

---

## 5. Get your live URL

1. In the same service, go to the **Settings** tab.
2. Under **Networking** / **Public Networking**, click **Generate Domain** (or **Add domain** if you see it).
3. Railway will give you a URL like:  
   `https://your-app-name.up.railway.app`
4. Open that URL in your browser. You should see your app (welcome/sign-in, etc.).

---

## 6. You’re live

- **Production URL:** the `https://....railway.app` link from step 5.
- **Updates:** whenever you push to the `main` branch on GitHub, Railway will redeploy automatically.

---

## If something goes wrong

- **You see a generic “under development” or placeholder page:** The server wasn’t serving your React app. The repo is now set up so the app is served whenever the built files exist. **Redeploy:** push the latest code to GitHub (the `server` and `railway.toml` changes), and in Railway add a variable **`NODE_ENV`** = **`production`**. Trigger a redeploy (e.g. **Deployments** → **Redeploy**), then open your URL again.
- **Build failed:** In Railway, open the latest **Deploy** and read the **Build logs**. Often it’s a missing dependency or typo; fix in your code, commit, and push again.
- **App won’t load / 502:** Check **Deploy logs** (runtime logs). Make sure `JWT_SECRET` is set and that the service shows **Success**.
- **“Cannot find module” or similar:** The build script installs and builds from the repo root and then runs the server from `server/`. If you added new files or dependencies, make sure they’re committed and pushed.

---

**Summary:** Push code to GitHub → Connect repo in Railway → Set `JWT_SECRET` → Generate domain → Use the `.railway.app` URL. After that we can add your GoDaddy domain to this same project.
