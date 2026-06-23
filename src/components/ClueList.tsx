import type { Direction, ExportedPuzzle } from "../types";

interface Props {
  puzzle: ExportedPuzzle;
  activeNum: number | null;
  activeDir: Direction | null;
  onPick: (num: number, dir: Direction) => void;
  onClose: () => void;
}

/** Slide-in full Across/Down clue list; tap a clue to jump to its word. */
export default function ClueList({ puzzle, activeNum, activeDir, onPick, onClose }: Props) {
  const section = (dir: Direction) => {
    const nums = Object.keys(dir === "across" ? puzzle.numbering.across : puzzle.numbering.down)
      .map(Number)
      .sort((a, b) => a - b);
    return (
      <div className="cl-section">
        <h3>{dir === "across" ? "Across" : "Down"}</h3>
        <ul>
          {nums.map((n) => {
            const entry = puzzle.clues[dir][n];
            const isActive = activeNum === n && activeDir === dir;
            return (
              <li key={`${dir}-${n}`}>
                <button
                  className={isActive ? "cl-item active" : "cl-item"}
                  onClick={() => {
                    onPick(n, dir);
                    onClose();
                  }}
                >
                  <span className="cl-num">{n}</span>
                  <span className="cl-text">{entry?.clue || "—"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="cl-backdrop" onClick={onClose}>
      <div className="cl-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cl-head">
          <span>Clues</span>
          <button className="tb-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="cl-body">
          {section("across")}
          {section("down")}
        </div>
      </div>
    </div>
  );
}
