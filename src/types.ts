// Mirrors the JSON the Crossword Builder exports (see builder's exportFile.ts).

export type Direction = "across" | "down";

export interface ExportCell {
  /** The solution letter (null for black squares). Used as the answer key. */
  letter: string | null;
  isBlack: boolean;
  number?: number;
}

export interface Slot {
  row: number;
  col: number;
  length: number;
}

export interface ClueEntry {
  clue: string;
  answer: string;
  linked?: number[];
}

export interface Gameplay {
  timer: boolean;
  check: boolean;
  reveal: boolean;
  linkedClues: boolean;
}

export interface ExportedPuzzle {
  id: string;
  title: string;
  themeNotes?: string;
  publishDateTime: string;
  status: "draft" | "scheduled" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  rows: number;
  cols: number;
  grid: ExportCell[][];
  numbering: {
    across: Record<number, Slot>;
    down: Record<number, Slot>;
  };
  clues: {
    across: Record<number, ClueEntry>;
    down: Record<number, ClueEntry>;
  };
  /** Optional; absent on older puzzles → treat as all-on. */
  showClueNumbers?: boolean;
  gameplay?: Gameplay;
}

/** Resolve gameplay flags with back-compat defaults (all on except timer-honored). */
export function resolveGameplay(p: ExportedPuzzle): Gameplay {
  return {
    timer: p.gameplay?.timer ?? true,
    check: p.gameplay?.check ?? true,
    reveal: p.gameplay?.reveal ?? true,
    linkedClues: p.gameplay?.linkedClues ?? true,
  };
}

/** One entry in public/puzzles/index.json. */
export interface IndexEntry {
  id: string;
  title: string;
  publishDateTime: string;
  rows: number;
  cols: number;
}

export interface PuzzleIndex {
  puzzles: IndexEntry[];
}
