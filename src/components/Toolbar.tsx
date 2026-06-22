import { useState } from "react";

export type Scope = "square" | "word" | "puzzle";

interface Props {
  elapsed: number;
  paused: boolean;
  showTimer?: boolean;
  showCheck?: boolean;
  showReveal?: boolean;
  onTogglePause: () => void;
  onCheck: (scope: Scope) => void;
  onReveal: (scope: Scope) => void;
  onClearMarks: () => void;
  onReset: () => void;
}

function fmt(elapsed: number): string {
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Toolbar({
  elapsed,
  paused,
  showTimer = true,
  showCheck = true,
  showReveal = true,
  onTogglePause,
  onCheck,
  onReveal,
  onClearMarks,
  onReset,
}: Props) {
  const [menu, setMenu] = useState<null | "check" | "reveal" | "more">(null);

  const close = () => setMenu(null);

  return (
    <div className="toolbar" onMouseLeave={close}>
      {showTimer && (
        <button className="timer" onClick={onTogglePause} title="Tap to pause/resume">
          {paused ? "▶" : "❚❚"} {fmt(elapsed)}
        </button>
      )}

      <div className="spacer" />

      {showCheck && (
        <div className="menu-wrap">
          <button className="tb-btn" onClick={() => setMenu(menu === "check" ? null : "check")}>
            Check ▾
          </button>
          {menu === "check" && (
            <div className="menu">
              <button onClick={() => { onCheck("square"); close(); }}>Square</button>
              <button onClick={() => { onCheck("word"); close(); }}>Word</button>
              <button onClick={() => { onCheck("puzzle"); close(); }}>Puzzle</button>
              <button onClick={() => { onClearMarks(); close(); }}>Clear marks</button>
            </div>
          )}
        </div>
      )}

      {showReveal && (
        <div className="menu-wrap">
          <button className="tb-btn" onClick={() => setMenu(menu === "reveal" ? null : "reveal")}>
            Reveal ▾
          </button>
          {menu === "reveal" && (
            <div className="menu">
              <button onClick={() => { onReveal("square"); close(); }}>Square</button>
              <button onClick={() => { onReveal("word"); close(); }}>Word</button>
              <button onClick={() => { onReveal("puzzle"); close(); }}>Puzzle</button>
            </div>
          )}
        </div>
      )}

      {/* Reset always available, independent of Reveal. */}
      <div className="menu-wrap">
        <button className="tb-btn" onClick={() => setMenu(menu === "more" ? null : "more")} title="More">
          ⋯
        </button>
        {menu === "more" && (
          <div className="menu">
            <button className="danger" onClick={() => { onReset(); close(); }}>
              Reset puzzle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
