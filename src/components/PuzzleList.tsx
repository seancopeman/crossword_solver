import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadIndex } from "../lib/data";
import { loadProgress } from "../lib/progress";
import { getInitialTheme, setTheme, type Theme } from "../lib/theme";
import { whiteCountFromLayout, type IndexEntry } from "../types";
import Thumbnail from "./Thumbnail";

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

interface Progress {
  done: boolean;
  /** 0–100, or null when we can't compute it (no layout). */
  percent: number | null;
}

function progressFor(entry: IndexEntry): Progress {
  const p = loadProgress(entry.id);
  if (!p) return { done: false, percent: entry.layout ? 0 : null };
  if (p.completedAt) return { done: true, percent: 100 };
  const white = whiteCountFromLayout(entry.layout);
  const filled = Object.keys(p.entries).length;
  const percent = white > 0 ? Math.min(100, Math.round((filled / white) * 100)) : null;
  return { done: false, percent };
}

export default function PuzzleList() {
  const [entries, setEntries] = useState<IndexEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setThemeState] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    loadIndex()
      .then(setEntries)
      .catch((e) => setError(String(e)));
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  return (
    <div className="list-page">
      <header className="list-header">
        <div className="header-actions">
          <Link className="stats-link" to="/stats" aria-label="Statistics">
            📊
          </Link>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
        <h1>Crosswords</h1>
        <p className="subtitle">A little something, just for you ♥</p>
      </header>

      {error && <div className="notice error">{error}</div>}
      {!entries && !error && <div className="notice">Loading…</div>}
      {entries && entries.length === 0 && (
        <div className="notice">No puzzles published yet — check back soon!</div>
      )}

      <ul className="puzzle-list">
        {entries?.map((p) => {
          const pr = progressFor(p);
          return (
            <li key={p.id}>
              <Link to={`/play/${p.id}`} className="puzzle-item">
                {p.layout ? (
                  <Thumbnail layout={p.layout} rows={p.rows} cols={p.cols} />
                ) : (
                  <div className="thumb-placeholder">
                    {p.rows}×{p.cols}
                  </div>
                )}
                <div className="pi-main">
                  <span className="pi-title">{p.title}</span>
                  <span className="pi-date">{fmtDate(p.publishDateTime)}</span>
                </div>
                <div className="pi-side">
                  {pr.done ? (
                    <span className="badge done">Solved ✓</span>
                  ) : pr.percent !== null && pr.percent > 0 ? (
                    <>
                      <div className="ring" style={{ ["--pct" as string]: pr.percent }}>
                        <span>{pr.percent}%</span>
                      </div>
                    </>
                  ) : (
                    <span className="pi-size">{p.rows}×{p.cols}</span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
