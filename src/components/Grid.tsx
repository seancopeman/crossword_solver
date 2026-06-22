import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { key } from "../lib/grid";
import type { ExportedPuzzle } from "../types";

interface Props {
  puzzle: ExportedPuzzle;
  entries: Record<string, string>;
  revealed: Set<string>;
  marks: Record<string, "correct" | "wrong">;
  selected: { row: number; col: number } | null;
  wordKeys: Set<string>;
  showNumbers?: boolean;
  onSelect: (row: number, col: number) => void;
}

export default function Grid({
  puzzle,
  entries,
  revealed,
  marks,
  selected,
  wordKeys,
  showNumbers = true,
  onSelect,
}: Props) {
  const fitRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Measure the available area so the grid fits within both width and height.
  useEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect;
      setBox({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cell = useMemo(() => {
    const fit = Math.floor(Math.min(box.w / puzzle.cols, box.h / puzzle.rows));
    return fit > 0 ? fit : 0;
  }, [box, puzzle.cols, puzzle.rows]);

  const gridW = cell * puzzle.cols;

  return (
    <div className="grid-fit" ref={fitRef}>
      <div
        className="xw-grid"
        role="grid"
        style={
          {
            width: gridW || "100%",
            gridTemplateColumns: `repeat(${puzzle.cols}, 1fr)`,
            ["--cell"]: `${cell}px`,
          } as CSSProperties
        }
      >
        {puzzle.grid.map((row, r) =>
          row.map((c, ci) => {
            const k = key(r, ci);
            if (c.isBlack) return <div key={k} className="xw-cell black" role="gridcell" />;
            const sel = selected?.row === r && selected?.col === ci;
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
              <div key={k} className={cls} role="gridcell" onClick={() => onSelect(r, ci)}>
                {showNumbers && c.number !== undefined && <span className="num">{c.number}</span>}
                <span className="entry">{entries[k] ?? ""}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
