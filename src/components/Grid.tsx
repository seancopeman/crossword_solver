import { useMemo } from "react";
import { key } from "../lib/grid";
import type { ExportedPuzzle } from "../types";

interface Props {
  puzzle: ExportedPuzzle;
  entries: Record<string, string>;
  revealed: Set<string>;
  marks: Record<string, "correct" | "wrong">;
  selected: { row: number; col: number } | null;
  wordKeys: Set<string>;
  onSelect: (row: number, col: number) => void;
}

export default function Grid({
  puzzle,
  entries,
  revealed,
  marks,
  selected,
  wordKeys,
  onSelect,
}: Props) {
  // Square cells sized to fit the viewport width; capped for big screens.
  const cellPct = useMemo(() => 100 / puzzle.cols, [puzzle.cols]);

  return (
    <div
      className="xw-grid"
      style={{ gridTemplateColumns: `repeat(${puzzle.cols}, ${cellPct}%)` }}
      role="grid"
    >
      {puzzle.grid.map((row, r) =>
        row.map((cell, c) => {
          const k = key(r, c);
          if (cell.isBlack) return <div key={k} className="xw-cell black" role="gridcell" />;
          const sel = selected?.row === r && selected?.col === c;
          const cls = [
            "xw-cell",
            wordKeys.has(k) ? "in-word" : "",
            sel ? "selected" : "",
            revealed.has(k) ? "revealed" : "",
            marks[k] === "wrong" ? "wrong" : "",
            marks[k] === "correct" ? "correct" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <div
              key={k}
              className={cls}
              role="gridcell"
              onClick={() => onSelect(r, c)}
            >
              {cell.number !== undefined && <span className="num">{cell.number}</span>}
              <span className="entry">{entries[k] ?? ""}</span>
            </div>
          );
        })
      )}
    </div>
  );
}
