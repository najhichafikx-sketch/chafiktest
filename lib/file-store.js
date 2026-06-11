import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TMP_DIR = (() => {
  try { return fs.existsSync('/tmp') ? path.join('/tmp', 'data') : path.join(process.cwd(), '.tmp-data'); }
  catch { return path.join(process.cwd(), '.tmp-data'); }
})();

function ensureDataDir() {
  try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  try { if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true }); } catch {}
}

function findFile(filename) {
  const inTmp = path.join(TMP_DIR, path.basename(filename));
  if (fs.existsSync(inTmp)) return inTmp;
  return filename;
}

export function readJsonFile(name) {
  try {
    ensureDataDir();
    const f = findFile(path.join(DATA_DIR, name));
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'));
  } catch {}
  return [];
}

export function writeJsonFile(name, data) {
  ensureDataDir();
  const file = path.join(DATA_DIR, name);
  const json = JSON.stringify(data, null, 2);
  try { fs.writeFileSync(file, json, 'utf-8'); return; } catch {}
  try { fs.writeFileSync(path.join(TMP_DIR, name), json, 'utf-8'); } catch {}
}
