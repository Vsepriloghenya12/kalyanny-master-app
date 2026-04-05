import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, 'data', 'seed.json');
const defaultDataFile = path.join(__dirname, 'runtime-data', 'content.json');

function resolveDataFile() {
  const configured = process.env.DATA_FILE;
  if (!configured) return defaultDataFile;
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
}

export async function readContent() {
  const dataFile = resolveDataFile();
  await fs.mkdir(path.dirname(dataFile), { recursive: true });

  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    const seedRaw = await fs.readFile(seedPath, 'utf8');
    await fs.writeFile(dataFile, seedRaw, 'utf8');
    return JSON.parse(seedRaw);
  }
}

export async function writeContent(content) {
  const dataFile = resolveDataFile();
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  const normalized = JSON.stringify(content, null, 2);
  await fs.writeFile(dataFile, normalized, 'utf8');
  return content;
}
