import type { Direction, ExportedPuzzle } from "../types";

export const key = (r: number, c: number) => `${r}:${c}`;

export function isWhite(p: ExportedPuzzle, r: number, c: number): boolean {
  return (
    r >= 0 && c >= 0 && r < p.rows && c < p.cols && !p.grid[r][c].isBlack
  );
}

/** Ordered cells of a word, from the exported numbering map. */
export function wordCells(
  p: ExportedPuzzle,
  num: number,
  dir: Direction
): Array<{ row: number; col: number }> {
  const slot = dir === "across" ? p.numbering.across[num] : p.numbering.down[num];
  if (!slot) return [];
  const out: Array<{ row: number; col: number }> = [];
  for (let i = 0; i < slot.length; i++) {
    out.push(
      dir === "across"
        ? { row: slot.row, col: slot.col + i }
        : { row: slot.row + i, col: slot.col }
    );
  }
  return out;
}

/** Which word number contains (r,c) in a direction. */
export function wordNumberAt(
  p: ExportedPuzzle,
  r: number,
  c: number,
  dir: Direction
): number | null {
  const map = dir === "across" ? p.numbering.across : p.numbering.down;
  for (const numStr of Object.keys(map)) {
    const num = Number(numStr);
    if (wordCells(p, num, dir).some((x) => x.row === r && x.col === c)) return num;
  }
  return null;
}

/** Next white cell in a line direction, skipping black squares. */
export function nextWhiteInLine(
  p: ExportedPuzzle,
  r: number,
  c: number,
  dir: Direction,
  back = false
): { row: number; col: number } | null {
  const dr = dir === "down" ? 1 : 0;
  const dc = dir === "across" ? 1 : 0;
  const s = back ? -1 : 1;
  let nr = r + dr * s;
  let nc = c + dc * s;
  while (nr >= 0 && nc >= 0 && nr < p.rows && nc < p.cols) {
    if (!p.grid[nr][nc].isBlack) return { row: nr, col: nc };
    nr += dr * s;
    nc += dc * s;
  }
  return null;
}

/** All white cell keys, for completion checks. */
export function whiteKeys(p: ExportedPuzzle): string[] {
  const keys: string[] = [];
  for (let r = 0; r < p.rows; r++)
    for (let c = 0; c < p.cols; c++) if (!p.grid[r][c].isBlack) keys.push(key(r, c));
  return keys;
}

export function clueLabel(num: number, dir: Direction): string {
  return `${num}-${dir === "across" ? "Across" : "Down"}`;
}
