# Daily Budgeting — by Axel Dilvala

A personal budgeting app: log income and expenses, see them broken down
category by category and month to month, and track investment balances
separately from everyday spending. Installable as a PWA on Android, iOS,
and desktop.

## How data works

All data is stored **only in this browser's local storage** — nothing is
sent to a server. That means:

- Data does **not** sync automatically between your phone, tablet, and PC.
- Clearing your browser's site data / cookies will erase everything.
- Use the **Data** tab in the app to export a backup (`.json`) and import
  it on another device, or just to keep a copy somewhere safe.

## Run it locally

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview   # optional: preview the production build locally
```

The build output goes to `dist/`.

## Deploy to Vercel (free tier)

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com), sign in, click **Add New → Project**.
3. Import the GitHub repo. Vercel auto-detects Vite — no config needed
   (the framework preset should show "Vite").
4. Click **Deploy**. You'll get a free `your-project.vercel.app` URL.
5. Every push to `main` auto-deploys.

## Installing it as an app

- **iPhone/iPad (Safari):** open the site → Share icon → **Add to Home Screen**.
- **Android (Chrome):** open the site → ⋮ menu → **Install app**.
- **Desktop (Chrome/Edge):** open the site → install icon in the address bar.

## Project structure

```
├─ index.html            entry HTML, PWA meta tags
├─ public/
│  ├─ manifest.webmanifest
│  ├─ sw.js              offline caching (service worker)
│  └─ icons/             app icons
├─ src/
│  ├─ main.jsx           React root + service worker registration
│  ├─ App.jsx            the entire app (UI, state, storage)
│  └─ index.css          base styles + font imports
├─ vercel.json           deploy headers config
└─ package.json
```

## Notes

- Seeded with the original Jan–Aug transaction history on first load.
  Clear local storage (or use the Data tab's "Replace everything" import)
  to start fresh.
- Built with React + [Recharts](https://recharts.org) for the charts.
