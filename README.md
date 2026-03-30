# 🌱 Plant Journal

A personal plant tracking app with AI-powered plant identification and care analysis.

## Features

- Track watering schedules for all your plants
- AI photo analysis — upload a photo to get care recommendations
- Botanical Garden — scan any plant to identify it
- Air quality dashboard (CO₂, VOC, humidity, PM2.5, wellbeing)
- Liquid glass UI with polaroid-style plant photos
- PWA — installable on your phone

## Stack

- React 18 + Vite
- Claude API (claude-sonnet-4-6) for plant identification and care analysis
- localStorage for persistence
- PWA via vite-plugin-pwa

## Setup

```bash
npm install
npm run dev
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set `VITE_ANTHROPIC_API_KEY` as an environment variable in Vercel — but note the API key should be handled server-side in production. For personal use, the Claude.ai artifact proxy handles authentication automatically.

## Environment

For local development, create `.env.local`:
```
VITE_ANTHROPIC_API_KEY=your_key_here
```
