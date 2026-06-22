import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { loadPuzzle } from "../lib/data";
import {
  clueLabel,
  isWhite,
  key,
  nextWhiteInLine,
  whiteKeys,
  wordCells,
  wordNumberAt,
} from "../lib/grid";
import { clearProgress, loadProgress, saveProgress } from "../lib/progress";
import type { Direction, ExportedPuzzle } from "../types";
import Complete from "./Complete";
import Grid from "./Grid";
import Keyboard from "./Keyboard";
import Toolbar, { type Scope } from "./Toolbar";

interface ClueRef {
  num: number;
  dir: Direction;
}

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const [puzzle, setPuzzle] = useState<ExportedPuzzle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [entries, setEntries] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [marks, setMarks] = useState<Record<string, "correct" | "wrong">>({});
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<Direction>("across");

  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [usedReveal, setUsedReveal] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  // --- load puzzle + saved progress ---
  useEffect(() => {
    if (!id) return;
    loadPuzzle(id)
      .then((p) => {
        setPuzzle(p);
        const saved = loadProgress(id);
        if (saved) {
          setEntries(saved.entries ?? {});
          setRevealed(new Set(saved.revealed ?? []));
          setElapsed(saved.elapsed ?? 0);
          setCompleted(!!saved.completedAt);
        }
        // Select the first white cell of the first across word.
        const firstAcross = Object.keys(p.numbering.across).map(Number).sort((a, b) => a - b)[0];
        if (firstAcross !== undefined) {
          const c0 = wordCells(p, firstAcross, "across")[0];
          if (c0) setSelected(c0);
        }
      })
      .catch((e) => setError(String(e)));
  }, [id]);

  const sol = useCallback(
    (r: number, c: number) => (puzzle ? puzzle.grid[r][c].letter ?? "" : ""),
    [puzzle]
  );

  // --- active word (auto-switch direction if the cell has no word that way) ---
  const active = useMemo(() => {
    if (!puzzle || !selected) return null;
    let dir = direction;
    let num = wordNumberAt(puzzle, selected.row, selected.col, dir);
    if (num === null) {
      dir = dir === "across" ? "down" : "across";
      num = wordNumberAt(puzzle, selected.row, selected.col, dir);
    }
    if (num === null) return null;
    return { dir, num, cells: wordCells(puzzle, num, dir) };
  }, [puzzle, selected, direction]);

  const wordKeys = useMemo(
    () => new Set(active?.cells.map((c) => key(c.row, c.col)) ?? []),
    [active]
  );

  const clueOrder = useMemo<ClueRef[]>(() => {
    if (!puzzle) return [];
    const a = Object.keys(puzzle.numbering.across).map(Number).sort((x, y) => x - y);
    const d = Object.keys(puzzle.numbering.down).map(Number).sort((x, y) => x - y);
    return [
      ...a.map((n) => ({ num: n, dir: "across" as Direction })),
      ...d.map((n) => ({ num: n, dir: "down" as Direction })),
    ];
  }, [puzzle]);

  // --- timer ---
  useEffect(() => {
    if (paused || completed || !puzzle) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [paused, completed, puzzle]);

  // Pause when the tab is hidden.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // --- persistence (debounced-ish: on every meaningful change) ---
  useEffect(() => {
    if (!id || !puzzle) return;
    saveProgress(id, {
      entries,
      revealed: [...revealed],
      elapsed,
      completedAt: completed ? new Date().toISOString() : undefined,
    });
  }, [id, puzzle, entries, revealed, elapsed, completed]);

  // --- completion detection ---
  const checkCompletion = useCallback(
    (nextEntries: Record<string, string>) => {
      if (!puzzle || completed) return;
      const allRight = whiteKeys(puzzle).every((k) => {
        const [r, c] = k.split(":").map(Number);
        return (nextEntries[k] ?? "") === sol(r, c);
      });
      if (allRight) {
        setCompleted(true);
        setShowComplete(true);
      }
    },
    [puzzle, completed, sol]
  );

  // --- input handlers ---
  const selectCell = useCallback(
    (r: number, c: number) => {
      if (!puzzle || !isWhite(puzzle, r, c)) return;
      if (selected && selected.row === r && selected.col === c) {
        setDirection((d) => (d === "across" ? "down" : "across"));
      } else {
        setSelected({ row: r, col: c });
      }
    },
    [puzzle, selected]
  );

  const typeLetter = useCallback(
    (ch: string) => {
      if (!puzzle || !selected || paused || completed || !active) return;
      const k = key(selected.row, selected.col);
      if (revealed.has(k)) return; // locked
      const next = { ...entries, [k]: ch.toUpperCase() };
      setEntries(next);
      setMarks((m) => {
        if (!(k in m)) return m;
        const { [k]: _, ...rest } = m;
        return rest;
      });
      // Advance: next empty in word, else next cell in word.
      const idx = active.cells.findIndex((x) => x.row === selected.row && x.col === selected.col);
      let target = null as { row: number; col: number } | null;
      for (let j = idx + 1; j < active.cells.length; j++) {
        const c = active.cells[j];
        if (!next[key(c.row, c.col)]) {
          target = c;
          break;
        }
      }
      if (!target && idx + 1 < active.cells.length) target = active.cells[idx + 1];
      if (target) setSelected(target);
      checkCompletion(next);
    },
    [puzzle, selected, paused, completed, active, revealed, entries, checkCompletion]
  );

  const del = useCallback(() => {
    if (!puzzle || !selected || paused || completed || !active) return;
    const k = key(selected.row, selected.col);
    if (revealed.has(k)) return;
    if (entries[k]) {
      const { [k]: _, ...rest } = entries;
      setEntries(rest);
    } else {
      const idx = active.cells.findIndex((x) => x.row === selected.row && x.col === selected.col);
      const prev = active.cells[idx - 1];
      if (prev) {
        const pk = key(prev.row, prev.col);
        if (!revealed.has(pk)) {
          const { [pk]: _, ...rest } = entries;
          setEntries(rest);
        }
        setSelected(prev);
      }
    }
  }, [puzzle, selected, paused, completed, active, revealed, entries]);

  const moveArrow = useCallback(
    (dir: Direction, back: boolean) => {
      if (!puzzle || !selected) return;
      if (direction !== dir) setDirection(dir);
      const t = nextWhiteInLine(puzzle, selected.row, selected.col, dir, back);
      if (t) setSelected(t);
    },
    [puzzle, selected, direction]
  );

  const gotoClue = useCallback(
    (ref: ClueRef) => {
      if (!puzzle) return;
      setDirection(ref.dir);
      const c0 = wordCells(puzzle, ref.num, ref.dir)[0];
      if (c0) setSelected(c0);
    },
    [puzzle]
  );

  const stepClue = useCallback(
    (delta: 1 | -1) => {
      if (!active || clueOrder.length === 0) return;
      const i = clueOrder.findIndex((x) => x.num === active.num && x.dir === active.dir);
      const ni = (i + delta + clueOrder.length) % clueOrder.length;
      gotoClue(clueOrder[ni]);
    },
    [active, clueOrder, gotoClue]
  );

  // --- hardware keyboard ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showComplete) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        typeLetter(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        del();
      } else if (e.key === " ") {
        e.preventDefault();
        setDirection((d) => (d === "across" ? "down" : "across"));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveArrow("across", true);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveArrow("across", false);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveArrow("down", true);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveArrow("down", false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        stepClue(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [typeLetter, del, moveArrow, stepClue, showComplete]);

  // --- check / reveal ---
  const targetCells = useCallback(
    (scope: Scope) => {
      if (!puzzle || !selected) return [] as Array<{ row: number; col: number }>;
      if (scope === "square") return [selected];
      if (scope === "word") return active?.cells ?? [selected];
      // puzzle
      const out: Array<{ row: number; col: number }> = [];
      for (let r = 0; r < puzzle.rows; r++)
        for (let c = 0; c < puzzle.cols; c++) if (isWhite(puzzle, r, c)) out.push({ row: r, col: c });
      return out;
    },
    [puzzle, selected, active]
  );

  const doCheck = useCallback(
    (scope: Scope) => {
      const cells = targetCells(scope);
      setMarks((m) => {
        const next = { ...m };
        for (const { row, col } of cells) {
          const k = key(row, col);
          const val = entries[k];
          if (!val) continue;
          next[k] = val === sol(row, col) ? "correct" : "wrong";
        }
        return next;
      });
    },
    [targetCells, entries, sol]
  );

  const doReveal = useCallback(
    (scope: Scope) => {
      const cells = targetCells(scope);
      setUsedReveal(true);
      const nextEntries = { ...entries };
      const nextRevealed = new Set(revealed);
      for (const { row, col } of cells) {
        const k = key(row, col);
        nextEntries[k] = sol(row, col);
        nextRevealed.add(k);
      }
      setEntries(nextEntries);
      setRevealed(nextRevealed);
      setMarks({});
      checkCompletion(nextEntries);
    },
    [targetCells, entries, revealed, sol, checkCompletion]
  );

  const resetPuzzle = useCallback(() => {
    if (!id) return;
    if (!window.confirm("Clear all your answers and the timer for this puzzle?")) return;
    clearProgress(id);
    setEntries({});
    setRevealed(new Set());
    setMarks({});
    setElapsed(0);
    setCompleted(false);
    setUsedReveal(false);
  }, [id]);

  if (error)
    return (
      <div className="player-error">
        <p className="notice error">{error}</p>
        <Link className="tb-btn" to="/">
          ← Back
        </Link>
      </div>
    );
  if (!puzzle) return <div className="notice">Loading…</div>;

  const clueText = active ? puzzle.clues[active.dir][active.num]?.clue || "—" : "";
  const linked = active ? puzzle.clues[active.dir][active.num]?.linked : undefined;

  return (
    <div className="player">
      <div className="player-top">
        <Link className="back" to="/">
          ‹
        </Link>
        <span className="ptitle">{puzzle.title}</span>
        <Toolbar
          elapsed={elapsed}
          paused={paused}
          onTogglePause={() => setPaused((p) => !p)}
          onCheck={doCheck}
          onReveal={doReveal}
          onClearMarks={() => setMarks({})}
          onReset={resetPuzzle}
        />
      </div>

      {paused && !completed ? (
        <div className="paused-cover" onClick={() => setPaused(false)}>
          <div>
            <div className="big">Paused</div>
            <div className="small">Tap to resume</div>
          </div>
        </div>
      ) : (
        <div className="grid-wrap">
          <Grid
            puzzle={puzzle}
            entries={entries}
            revealed={revealed}
            marks={marks}
            selected={selected}
            wordKeys={wordKeys}
            onSelect={selectCell}
          />
        </div>
      )}

      <div className="clue-strip">
        <button className="arrow" onClick={() => stepClue(-1)} aria-label="Previous clue">
          ‹
        </button>
        <div className="clue-body" onClick={() => setDirection((d) => (d === "across" ? "down" : "across"))}>
          <div className="clue-label">{active ? clueLabel(active.num, active.dir) : ""}</div>
          <div className="clue-text">
            {clueText}
            {linked && linked.length > 0 && (
              <span className="linked"> (with {linked.join(", ")})</span>
            )}
          </div>
        </div>
        <button className="arrow" onClick={() => stepClue(1)} aria-label="Next clue">
          ›
        </button>
      </div>

      <Keyboard onKey={typeLetter} onDelete={del} onEnter={() => stepClue(1)} />

      {showComplete && (
        <Complete
          title={puzzle.title}
          elapsed={elapsed}
          usedReveal={usedReveal}
          onClose={() => setShowComplete(false)}
        />
      )}
    </div>
  );
}
