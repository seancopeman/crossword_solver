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
