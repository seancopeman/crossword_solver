import { Link } from "react-router-dom";

interface Props {
  title: string;
  elapsed: number;
  usedReveal: boolean;
  onClose: () => void;
}

function fmt(elapsed: number): string {
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Complete({ title, elapsed, usedReveal, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="complete" onClick={(e) => e.stopPropagation()}>
        <div className="confetti">🎉</div>
        <h2>Solved!</h2>
        <p className="ctitle">{title}</p>
        <p className="ctime">
          Your time: <strong>{fmt(elapsed)}</strong>
        </p>
        {usedReveal && <p className="chint">(with a little help from Reveal)</p>}
        <div className="cactions">
          <button className="tb-btn" onClick={onClose}>
            Keep looking
          </button>
          <Link className="tb-btn primary" to="/">
            More puzzles →
          </Link>
        </div>
      </div>
    </div>
  );
}
