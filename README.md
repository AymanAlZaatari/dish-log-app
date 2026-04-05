# Dish Tracker Web App

A lightweight web app for logging restaurants, dishes, branches, and food experiences in one place.

The app is built for people who repeatedly try dishes across different restaurants and want a structured memory of:

- which dish they ordered
- where they ordered it
- how good it was
- how much it cost
- whether it was worth the price
- which version or branch was better

## Features

- restaurant management
- branch tracking
- dish tracking
- experience logging
- ratings and value-for-money notes
- wishlist vs tried dishes
- dish comparison across restaurants
- JSON export and import
- demo seed data for testing the UI

## Purpose

The goal of the project is to replace scattered food notes with a structured personal dish journal that is fast to update and easy to review later.

## Tech Stack

- React
- Vite
- Tailwind CSS utilities
- local browser storage today, with Firebase planned for cloud sync

## Intended Use

This project is meant for a very small number of users, with simple account handling and low operational overhead. The focus is practicality, not a large-scale consumer product.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Git pre-push build check

This repo can block `git push` when the production build fails.

To enable the tracked hook locally:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-push
```

## Deploy to GitHub Pages

### Option 1: Drag and drop the built site into any static host
After running `npm run build`, upload the contents of `dist/` to a static host.

### Option 2: GitHub Pages with Actions
1. Create a new GitHub repository.
2. Upload all files from this folder.
3. In the repo, go to **Settings > Pages**.
4. Under **Build and deployment**, choose **GitHub Actions**.
5. Add this workflow file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

6. Push to `main`.
7. GitHub will publish the site for free.

## Data storage
- Data is stored in browser localStorage.
- Export JSON regularly for backup.
- Imported JSON replaces current local app data.
