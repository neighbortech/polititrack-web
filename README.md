# PolitiTrack Website

Frontend for PolitiTrack — the AI-powered political donation tracker.

## Local Development

```bash
npm install
cp .env.example .env    # Set your API URL
npm run dev             # Opens at http://localhost:3000
```

## Deploy to Vercel

### Option A: CLI

```bash
npm i -g vercel
vercel
```

### Option B: GitHub (recommended)

1. Push this repo to GitHub:
```bash
git init
git add .
git commit -m "PolitiTrack frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/polititrack-web.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → "New Project" → import your repo

3. Set environment variable:
   - `VITE_API_URL` = your backend URL (e.g. `https://polititrack-api.up.railway.app`)

4. Click Deploy — done.

Every `git push` auto-deploys.

## Architecture

```
polititrack-web (this repo)     →  Vercel  →  polititrack.com
polititrack (backend repo)      →  Railway →  api.polititrack.com
```

The frontend calls the backend API for all data.
