# Platonic Study

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

## Backend API

- `POST /api/register` — Body: `{ "username", "password" }`. Username ≥2 chars, password ≥6. Returns `{ user, token }`.
- `POST /api/login` — Body: `{ "username", "password" }`. Returns `{ user, token }`.
- `GET /api/me` — Header: `Authorization: Bearer <token>`. Returns `{ user }`.
