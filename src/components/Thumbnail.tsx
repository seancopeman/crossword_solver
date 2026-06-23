import { type CSSProperties } from "react";

interface Props {
  layout: string;
  rows: number;
  cols: number;
}

/** Tiny static preview of a puzzle's black/white grid from its layout string. */
export default function Thumbnail({ layout, rows, cols }: Props) {
  return (
    <div
      className="thumb"
      style={
        { gridTemplateColumns: `repeat(${cols}, 1fr)`, aspectRatio: `${cols} / ${rows}` } as CSSProperties
      }
      aria-hidden
    >
      {Array.from({ length: rows * cols }, (_, i) => (
        <span key={i} className={layout[i] === "#" ? "tc black" : "tc"} />
      ))}
    </div>
  );
}
