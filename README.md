# Developer Toolbox

> Small tools. Big productivity.

A collection of 46 fast, everyday developer utilities — JSON tools, encoders, generators, formatters, converters, and cheat sheets — all in one app. **100% frontend**: no backend, no database, no accounts, no tracking. Everything runs and stays in your browser.

## Why this exists

Instead of bouncing between a dozen random single-purpose websites (and wondering what happens to the data you paste into them), Developer Toolbox bundles the tools you reach for daily into one fast, private, ad-free app. Every tool works offline once loaded and never sends your input anywhere.

## Tools

46 tools across 10 categories:

**JSON & Data** — JSON Formatter & Validator, JSON to CSV, CSV to JSON, JSON Diff, YAML ↔ JSON

**Encoding** — Base64 Encoder/Decoder, URL Encoder/Decoder, HTML Entity Encoder/Decoder, URL Parser

**Generators** — UUID Generator, Random Data Generator, Lorem Ipsum Generator, QR Code Generator, ASCII Art Generator, Gitignore Generator, .env Generator

**Security** — Password Generator, JWT Decoder, Hash Generator (SHA-1/256/384/512)

**Text** — Text Case Converter, Word & Character Counter, Remove Duplicate Lines, Sort Lines, Find & Replace, Regex Tester, Text Diff Checker, Slug Generator

**Formatting** — SQL, XML, HTML & CSS Formatters, Markdown Previewer, Log Formatter, Stack Trace Formatter

**Conversion** — Number Base Converter, Color Converter, Unit Converter, Percentage Calculator

**Date & Time** — Timestamp Converter, Date Difference Calculator, Cron Expression Helper

**Networking** — HTTP Status Code Reference, MIME Type Reference

**Reference** — Regex Cheatsheet, Git Cheat Sheet, ASCII/Unicode Reference

Use in-app search to jump straight to any tool by name or keyword, or browse by category from the homepage.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # preview the production build
npm test         # run the unit tests
npm run lint     # lint the codebase
```

## Stack

React 19, JavaScript (no TypeScript), Vite, Tailwind CSS v4, React Router, Radix UI primitives, Lucide icons, Framer Motion. Vitest for tests, oxlint for linting.

## Project structure

```
src/
├── data/tools.js     # central tool registry (drives homepage, search, categories, routes)
├── tools/<id>/        # one folder per tool: component + <id>.utils.js (pure logic) + tests
├── pages/             # Home, Tools listing, NotFound
├── components/        # shared layout and common UI (common/, layout/)
├── hooks/             # shared React hooks
├── utils/             # cross-tool helpers (clipboard, localStorage, classnames)
└── App.jsx            # routes and app shell
```

## Adding a new tool

The app is built around a central tool registry ([src/data/tools.js](src/data/tools.js)) so new tools don't require touching the core app shell:

1. Create the tool's component under `src/tools/<id>/`, plus a `<id>.utils.js` module for its pure logic (and a matching `.test.js`).
2. Add an entry to the `tools` array in `src/data/tools.js` — this drives the homepage, search, categories, and SEO metadata automatically.
3. Add a `<Route>` for it in `src/App.jsx`.

## Privacy

No user input is ever sent to a server. Tools process everything locally using standard browser APIs. Preferences (theme, favorites, recently used tools) are stored in `localStorage` only.
