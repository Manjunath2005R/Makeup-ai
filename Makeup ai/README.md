# Spoorthi Beauty AI

A premium Next.js beauty-analysis gift app dedicated to Spoorthi.

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Groq setup

The app is ready for Groq, but no API key is committed. Add:

```bash
GROQ_API_KEY=your_key_here
```

On Vercel, add `GROQ_API_KEY` under Project Settings > Environment Variables, then redeploy.

## API routes

- `POST /api/beauty` - face beauty and skincare analysis
- `POST /api/menu` - recipe menu integration from `menu.js`
- `POST /api/caption` - caption generator integration from `caption.js`
