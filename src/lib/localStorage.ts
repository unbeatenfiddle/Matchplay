const LS_KEY = 'matchplay_uploaded_files';

interface StoredFile {
  filename: string;
  content: string;
  date: string;
}

export function saveUploadedFiles(files: { filename: string; content: string; date: string }[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(files));
  } catch {
    // localStorage unavailable
  }
}

export function loadStoredFiles(): StoredFile[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredFile[];
  } catch {
    return [];
  }
}

export function addStoredFile(file: StoredFile): void {
  const existing = loadStoredFiles();
  const map = new Map(existing.map(f => [f.date, f]));
  map.set(file.date, file);
  saveUploadedFiles(Array.from(map.values()));
}
