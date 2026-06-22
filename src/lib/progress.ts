export interface SavedProgress {
  entries: Record<string, string>;
  revealed: string[];
  elapsed: number;
  completedAt?: string;
}

const keyFor = (id: string) => `xw-progress-${id}`;

export function loadProgress(id: string): SavedProgress | null {
  try {
    const raw = localStorage.getItem(keyFor(id));
    return raw ? (JSON.parse(raw) as SavedProgress) : null;
  } catch {
    return null;
  }
}

export function saveProgress(id: string, p: SavedProgress): void {
  try {
    localStorage.setItem(keyFor(id), JSON.stringify(p));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export function clearProgress(id: string): void {
  try {
    localStorage.removeItem(keyFor(id));
  } catch {
    /* ignore */
  }
}
