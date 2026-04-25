# Spoorthi Beauty Intelligence Atelier

A premium static frontend plus Vercel serverless API app designed as an emotional beauty-tech gift for Spoorthi.

## Project structure

- `index.html` - landing page and premium introduction
- `analyzer.html` - AI beauty analysis experience
- `recipes.html` - recipe menu experience powered by `api/menu.js`
- `captions.html` - caption generator experience powered by `api/caption.js`
- `styles.css` - shared visual system, layout, and motion
- `js/` - shared browser modules for uploads, API calls, and page behavior
- `api/` - Vercel serverless functions, including Groq-ready integrations

## Groq setup

Add `GROQ_API_KEY` in your local environment or Vercel project settings.

## Deployment

This project is ready for GitHub plus Vercel deployment with:

- static page delivery
- serverless API routes under `api/`
- no build step required

## Notes

- `api/analyze.js` is the beauty analysis endpoint prepared for live Groq vision usage.
- `api/menu.js` and `api/caption.js` integrate and preserve the existing features in production shape.
