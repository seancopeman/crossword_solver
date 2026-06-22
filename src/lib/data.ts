import type { ExportedPuzzle, IndexEntry, PuzzleIndex } from "../types";

const base = import.meta.env.BASE_URL; // "/" by default

/** Published puzzles whose publish time has arrived, newest first. */
export async function loadIndex(): Promise<IndexEntry[]> {
  const res = await fetch(`${base}puzzles/index.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load puzzle index (${res.status})`);
  const data = (await res.json()) as PuzzleIndex;
  const now = Date.now();
  return (data.puzzles ?? [])
    .filter((p) => new Date(p.publishDateTime).getTime() <= now)
    .sort((a, b) => b.publishDateTime.localeCompare(a.publishDateTime));
}

export async function loadPuzzle(id: string): Promise<ExportedPuzzle> {
  const res = await fetch(`${base}puzzles/${id}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load puzzle (${res.status})`);
  return (await res.json()) as ExportedPuzzle;
}
