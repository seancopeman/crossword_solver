interface Props {
  onKey: (letter: string) => void;
  onDelete: () => void;
  onEnter: () => void;
}

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

/** On-screen keyboard for touch devices (and clickable on desktop). */
export default function Keyboard({ onKey, onDelete, onEnter }: Props) {
  return (
    <div className="keyboard" role="group" aria-label="On-screen keyboard">
      {ROWS.map((row, i) => (
        <div className="kb-row" key={i}>
          {i === 2 && (
            <button className="key wide" onClick={onEnter} aria-label="Next clue">
              ⏎
            </button>
          )}
          {[...row].map((ch) => (
            <button key={ch} className="key" onClick={() => onKey(ch)}>
              {ch}
            </button>
          ))}
          {i === 2 && (
            <button className="key wide" onClick={onDelete} aria-label="Delete">
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
