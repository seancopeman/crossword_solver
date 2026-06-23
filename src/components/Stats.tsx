import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadIndex } from "../lib/data";
import { loadProgress } from "../lib/progress";
import type { IndexEntry } from "../types";

interface Stats {
  total: number;
  solved: number;
  started: number;
  completionRate: number;
  bestTime: number | null;
  avgTime: number | null;
  totalTime: number;
  revealsUsed: number;
  streak: number;
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function localDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function computeStreak(days: Set<string>): number {
  if (days.size === 0) return 0;
  const has = (d: Date) => days.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  const cursor = new Date();
  if (!has(cursor)) cursor.setDate(cursor.getDate() - 1); // today not done yet is OK
  let streak = 0;
  while (has(cursor)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function compute(entries: IndexEntry[]): Stats {
  let solved = 0;
  let started = 0;
  let totalTime = 0;
  let revealsUsed = 0;
  const solveTimes: number[] = [];
  const completionDays = new Set<string>();

  for (const e of entries) {
    const p = loadProgress(e.id);
    if (!p) continue;
    totalTime += p.elapsed ?? 0;
    if ((p.revealed?.length ?? 0) > 0) revealsUsed++;
    if (p.completedAt) {
      solved++;
      if (p.elapsed > 0) solveTimes.push(p.elapsed);
      completionDays.add(localDay(p.completedAt));
    } else if (Object.keys(p.entries ?? {}).length > 0) {
      started++;
    }
  }

  return {
    total: entries.length,
    solved,
    started,
    completionRate: entries.length ? Math.round((solved / entries.length) * 100) : 0,
    bestTime: solveTimes.length ? Math.min(...solveTimes) : null,
    avgTime: solveTimes.length
      ? Math.round(solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length)
      : null,
    totalTime,
    revealsUsed,
    streak: computeStreak(completionDays),
  };
}

export default function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIndex()
      .then((entries) => setStats(compute(entries)))
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="list-page">
      <header className="list-header">
        <div className="header-actions">
          <Link className="stats-link" to="/" aria-label="Back to puzzles">
            ←
          </Link>
        </div>
        <h1>Your stats</h1>
        <p className="subtitle">How the solving is going ♥</p>
      </header>

      {error && <div className="notice error">{error}</div>}
      {!stats && !error && <div className="notice">Loading…</div>}

      {stats && (
        <div className="stat-cards">
          <Stat label="Solved" value={`${stats.solved} / ${stats.total}`} />
          <Stat label="Completion" value={`${stats.completionRate}%`} />
          <Stat label="Current streak" value={`${stats.streak} day${stats.streak === 1 ? "" : "s"}`} />
          <Stat label="In progress" value={String(stats.started)} />
          <Stat label="Best time" value={stats.bestTime !== null ? fmtTime(stats.bestTime) : "—"} />
          <Stat label="Average time" value={stats.avgTime !== null ? fmtTime(stats.avgTime) : "—"} />
          <Stat label="Total time" value={fmtTime(stats.totalTime)} />
          <Stat label="Used Reveal on" value={`${stats.revealsUsed} puzzle${stats.revealsUsed === 1 ? "" : "s"}`} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="sc-value">{value}</div>
      <div className="sc-label">{label}</div>
    </div>
  );
}
