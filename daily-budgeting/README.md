# Daily Budgeting — by Axel Dilvala

A personal budgeting app: log income and expenses, see them broken down
category by category and month to month, track investment balances
separately from everyday spending, and keep an eye on credit card limits.
Bilingual (English/Indonesian) with an in-app Help tab. Installable as a
PWA on Android, iOS, and desktop.

Ships with **zero transactions** — every person who opens this starts
from a clean slate, not with anyone else's spending history.

## Features

- **Overview** — net cash flow, income vs. expense chart, spending by
  group, investment balances, all filterable by month or year
- **Add** — log income or expenses; credit card purchases are logged
  once at purchase, never again at bill payment
- **Categories** — month-by-month breakdown, year-scoped
- **Manage** — add, rename, or delete categories and groups; renaming
  updates history, deleting only affects future entries
- **Cards** — track credit limits, log payments, and record untracked
  spending (like a forgotten subscription) as a balance adjustment
- **Data** — export/import a JSON backup to move data between devices
- **Help** — an in-app reference for how the app's rules work
- **EN/ID toggle** in the header

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

- Starts completely empty — the Data tab's "Replace everything" import
  is how you'd load a backup exported from another instance.
- Default category structure, income categories, and card limits are
  editable from the **Manage** and **Cards** tabs — nothing is locked in.
- Built with React + [Recharts](https://recharts.org) for the charts.
