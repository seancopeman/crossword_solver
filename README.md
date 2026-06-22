# Crossword Solver

A mobile-first, NYT-style crossword **player** — the website your solver opens on
a phone or laptop. It loads puzzles published by the **Crossword Builder** desktop
app and lets them fill the grid, check/reveal, and finish with a celebration.

This repo is meant to be deployed to **Vercel**. The builder publishes puzzles by
committing JSON into `public/puzzles/`, which triggers an automatic redeploy.

## How it works

```
public/puzzles/
  index.json          ← list of published puzzles (id, title, publishDateTime, size)
  <puzzle-id>.json    ← one file per puzzle (grid + numbering + clues), the builder's export
```

- The home page reads `index.json`, shows puzzles whose `publishDateTime` has passed,
  newest first.
- The player loads `<id>.json`, renders the grid, and uses the embedded solution
  letters as the answer key for checking.
- Progress (entries, revealed cells, timer) is saved per-puzzle in the browser's
  `localStorage`, so refreshing or coming back later resumes where you left off.

## Features

- Mobile-first layout with an on-screen keyboard; also works with a hardware keyboard.
- Tap a cell to select; tap again to switch Across/Down. Arrow keys + `Space` work too.
- Clue strip with ‹ › to move between clues; `Enter` jumps to the next clue.
- **Check** square / word / puzzle, and **Reveal** square / word / puzzle.
- Timer with pause (auto-pauses when the tab is hidden).
- Completion celebration with your time.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

The bundled **Welcome Mini** puzzle is published with a past date, so it shows up
immediately for testing.

## Deployment

See **[DEPLOY.md](DEPLOY.md)** for the full one-time GitHub + Vercel setup and how
the builder's Publish button feeds this site.
