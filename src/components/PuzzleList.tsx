import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadIndex } from "../lib/data";
import { loadProgress } from "../lib/progress";
import type { IndexEntry } from "../types";

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

function statusFor(id: string): "done" | "started" | "new" {
  const p = loadProgress(id);
  if (!p) return "new";
  if (p.completedAt) return "done";
  return Object.keys(p.entries).length > 0 ? "started" : "new";
}

export default function PuzzleList() {
  const [entries, setEntries] = useState<IndexEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIndex()
      .then(setEntries)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="list-page">
      <header className="list-header">
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
          const st = statusFor(p.id);
          return (
            <li key={p.id}>
              <Link to={`/play/${p.id}`} className="puzzle-item">
                <div className="pi-main">
                  <span className="pi-title">{p.title}</span>
                  <span className="pi-date">{fmtDate(p.publishDateTime)}</span>
                </div>
                <div className="pi-side">
                  <span className="pi-size">
                    {p.rows}×{p.cols}
                  </span>
                  {st === "done" && <span className="badge done">Solved ✓</span>}
                  {st === "started" && <span className="badge started">In progress</span>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
