import { Navigate, Route, Routes } from "react-router-dom";
import PuzzleList from "./components/PuzzleList";
import Player from "./components/Player";
import Stats from "./components/Stats";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PuzzleList />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/play/:id" element={<Player />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
