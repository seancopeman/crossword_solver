# Deploying the solver (GitHub + Vercel)

One-time setup so your puzzles go live automatically when you click **Publish** in
the builder. Takes ~15 minutes. You only do steps 1–5 once.

```
[Builder .exe on your PC] --Publish--> [GitHub repo] --auto--> [Vercel] --> phone/laptop URL
```

---

## 1. Create the GitHub repo

1. Sign in at <https://github.com> (free account is fine).
2. Click **New repository**.
   - Name: **`crossword-solver`** (any name works — remember it).
   - Visibility: **Private** is fine. (The deployed website is still public; only the
     source is private.)
   - Do **not** add a README/.gitignore (this folder already has them).
3. Create it. Leave the page open — GitHub shows the repo URL, e.g.
   `https://github.com/your-username/crossword-solver`.

## 2. Push this `crossword_solver` folder to the repo

**Easiest (no command line): GitHub Desktop**
1. Install <https://desktop.github.com>, sign in.
2. **File → Add local repository →** choose `C:\Dev\crossword_solver`.
3. When it says it isn't a repo yet, click **create a repository**, then **Publish
   repository** (uncheck "keep private" only if you want it public).

**Or with git (if installed):**
```bash
cd C:\Dev\crossword_solver
git init
git add .
git commit -m "Initial solver"
git branch -M main
git remote add origin https://github.com/your-username/crossword-solver.git
git push -u origin main
```

## 3. Deploy on Vercel

1. Sign in at <https://vercel.com> with your GitHub account (free **Hobby** plan).
2. **Add New… → Project →** import the `crossword-solver` repo.
3. Vercel auto-detects **Vite** — no settings to change. Click **Deploy**.
4. After ~1 minute you get a URL like **`https://crossword-solver.vercel.app`**.
   Open it — you should see the **Welcome Mini** puzzle. This is the link you give
   your girlfriend (bookmark it on her phone).

> Every future push to the repo redeploys automatically. That's what makes Publish
> "just work."

## 4. Create a GitHub access token (so the builder can publish)

1. GitHub → click your avatar → **Settings → Developer settings → Personal access
   tokens → Fine-grained tokens → Generate new token**.
2. Set:
   - **Token name:** `crossword-builder`
   - **Expiration:** your choice (e.g. 1 year — you'll regenerate when it lapses).
   - **Repository access:** *Only select repositories* → pick **crossword-solver**.
   - **Permissions → Repository permissions → Contents:** **Read and write**.
3. **Generate token** and **copy it** (starts with `github_pat_…`). You won't see it
   again — if you lose it, just make a new one.

## 5. Configure the builder

1. Open the **Crossword Builder** desktop app → **Settings**.
2. Under *Publishing to the solver site*, fill in:
   - **Owner:** your GitHub username
   - **Repository:** `crossword-solver`
   - **Branch:** `main`
   - **Puzzles folder in repo:** `public/puzzles`  *(leave as-is)*
   - **Personal access token:** paste the `github_pat_…` token
3. Click **Save settings**. (The token is stored only on your PC.)

## 6. Publish a puzzle 🎉

1. Open a puzzle in the builder, finish it, set its **Publish date & time**.
2. Click **Publish → Publish now**.
3. The builder pushes it to GitHub; Vercel redeploys; in ~1 minute it appears on the
   solver site. If the publish date is in the future, it stays hidden until then.

That's it. From now on, building a puzzle and clicking **Publish** is the whole flow.

---

## Notes & troubleshooting

- **"GitHub isn't configured"** when publishing → finish step 5 (something's blank).
- **403 / "Resource not accessible"** → the token is missing **Contents: Read and
  write**, or wasn't granted access to this repo. Regenerate per step 4.
- **404 on publish** → owner/repo/branch is misspelled in Settings.
- **Puzzle doesn't show on the site** → check its **publish date** isn't in the
  future, and that the Vercel deploy finished (Vercel dashboard → Deployments).
- **Answers are visible** in the puzzle JSON (needed for checking). Fine for a
  personal site; don't use this for a public competition.
- **Custom domain** (optional): Vercel → Project → Settings → Domains.
- **Token expired** → make a new one (step 4) and update it in builder Settings.
