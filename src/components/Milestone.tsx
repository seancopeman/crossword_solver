interface Props {
  percent: number;
}

/** Small celebratory toast shown as solving passes 25/50/75%. */
export default function Milestone({ percent }: Props) {
  const blurb =
    percent >= 75 ? "Almost there!" : percent >= 50 ? "Halfway home!" : "Off to a great start!";
  return (
    <div className="milestone" role="status">
      <span className="m-pct">{percent}%</span>
      <span className="m-text">{blurb}</span>
    </div>
  );
}
