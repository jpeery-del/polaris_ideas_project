# Dialogue Buddy

Organize your reading and thinking: book notes by section, essays, and ideas—with username/password sign-in.

## Features

- **Welcome & sign-in** — Create an account (username + password) or sign in. Sessions use JWT.
- **Book notes** — Add books with author/translator/publisher, sections (e.g. Book 1, 2, …), and entries (events, questions, arguments, notes, custom types) with subentries.
- **Essays** — Draft essays with title, author, and content.
- **Backend** — Node/Express server with register, login, and JWT auth; users stored in `server/data/users.json` with hashed passwords.

## Run locally

**1. Install and run the backend**

```bash
cd server
npm install
npm run dev
```

Server runs at http://localhost:3001.

**2. Install and run the frontend**

In the project root:

```bash
npm install
npm run dev
```

Frontend runs at http://localhost:5173 and proxies `/api` to the backend.

## Build

```bash
npm run build
npm run preview
```

For production, run the server (e.g. `node server/index.js`) and set `JWT_SECRET` and optionally `PORT`. Point the frontend at your API (same origin or CORS).

## Deploy on Railway (e.g. dialoguebuddy.com)

1. **Connect the repo** and deploy; the app uses `railway.toml` (build frontend, then run `server/index.js`).
2. **Environment:** In Railway → your service → Variables, set `JWT_SECRET` (required for auth).
3. **Custom domain so www works:** Railway treats the root domain and `www` as different. Add **both**:
   - In Railway → your service → **Settings → Domains**, add:
     - `dialoguebuddy.com`
     - `www.dialoguebuddy.com`
   - Railway will show a **CNAME target** (e.g. `xxx.up.railway.app`). In your DNS provider:
     - **www:** create a **CNAME** record: name `www` → value = Railway’s CNAME target.
     - **Root (optional):** if your DNS supports CNAME at root (or “CNAME flattening”), point `@` to the same target; otherwise use the A/AAAA records Railway suggests.
4. Wait for DNS to propagate (up to 48 hours; often minutes). Then both `https://dialoguebuddy.com` and `https://www.dialoguebuddy.com` should open your app.

If only the root works and www doesn’t, add `www.dialoguebuddy.com` as a separate domain in Railway and set the `www` CNAME as above.

### If www.dialoguebuddy.com shows GoDaddy “Under Construction”

Railway is working when the deployment is successful and DNS shows a green check. If you still see GoDaddy’s page:

1. **Turn off GoDaddy forwarding/parked page**
   - In GoDaddy: **My Products** → **DNS** (or **Domain Settings**) for `dialoguebuddy.com`.
   - Remove or disable any **Domain Forwarding** from `www` to another URL.
   - Disable any **Parked Page**, **Coming Soon**, or **Under Construction** page for `www` so DNS (CNAME) is used instead.

2. **Confirm DNS at GoDaddy**
   - In **DNS Management** for `dialoguebuddy.com`, ensure:
     - **CNAME** — Name: `www` → Value: Railway’s target (e.g. `02gwprj3.up.railway.app` — use the value from Railway → Settings → Domains → “Configure DNS Records”).
     - **TXT** — Name: `_railway-verify.www` → Value: the `railway-verify=...` string Railway shows (for verification).
   - Remove any conflicting **A** record for `www` that points to GoDaddy IPs.

3. **Cache and propagation**
   - Try in an **Incognito/Private** window or another device/network.
   - DNS can take up to 48 hours to propagate; if you just changed records, wait and retry.

4. **Confirm both domains in Railway**
   - Railway → your service → **Settings** → **Domains**: add both `dialoguebuddy.com` and `www.dialoguebuddy.com` so both resolve to your app.

### If www.dialoguebuddy.com shows Railway “502 Bad Gateway”

Traffic is reaching Railway but the app isn’t responding. Do this:

1. **Check Deploy Logs** (Railway → your service → **Deployments** → open latest → **Deploy Logs**).
   - You should see: `Starting server...`, `Static dist: ... found` (or `MISSING`), then `Server running on port X`. If you see `MISSING` for dist, the build didn’t produce the frontend; fix the build. If you see a crash or error before “Server running”, fix that (e.g. missing env, module error).
2. **Port must match.** The app uses `process.env.PORT` (Railway sets this). In Railway → your service → **Settings** → **Networking**, the “Port” must match (e.g. if the log says “port 3001”, set Port to **3001**). Don’t set a custom `PORT` in Variables unless you also set that same port in Networking.
3. **Redeploy** after any change (Variables, Settings, or code), then try again in an incognito window.

### If dialoguebuddy.com (no www) still shows GoDaddy “Launching Soon”

You want the **root** domain to send people to your app:

1. **Forward root → www.** In GoDaddy → **Domain** → **Forwarding**, add a forward: **dialoguebuddy.com** → **https://www.dialoguebuddy.com** (permanent). The *source* must be the root (e.g. “dialoguebuddy.com” or “@”), and the *destination* must be `https://www.dialoguebuddy.com`.
2. **Remove the old A record** for `@` that pointed to “WebsiteBuilder Site” (if you haven’t already).
3. **Wait a few minutes** and try `https://dialoguebuddy.com` in incognito. If it still shows GoDaddy, wait up to an hour for propagation and double-check the forwarding target URL.

## Backend API

- `POST /api/register` — Body: `{ "username", "password" }`. Username ≥2 chars, password ≥6. Returns `{ user, token }`.
- `POST /api/login` — Body: `{ "username", "password" }`. Returns `{ user, token }`.
- `GET /api/me` — Header: `Authorization: Bearer <token>`. Returns `{ user }`.
