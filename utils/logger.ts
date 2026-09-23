import fs from 'fs';
import path from 'path';

const LOG_DIR = path.resolve(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'test-run.log');

/** Ensure the logs directory exists */
function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Logs a timestamped message to both the console and logs/test-run.log.
 * Useful for step-by-step traceability in CI environments.
 */
export function log(message: string): void {
  ensureLogDir();
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}`;
  console.log(entry);
  fs.appendFileSync(LOG_FILE, entry + '\n', 'utf-8');
}

/**
 * Logs a table of data (array of objects) to console and file.
 * Used for AI classification results, dream summaries, etc.
 */
export function logTable(headers: string[], rows: string[][]): void {
  ensureLogDir();

  // Calculate column widths
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] || '').length))
  );

  const separator = colWidths.map(w => '-'.repeat(w + 2)).join('+');
  const formatRow = (cells: string[]) =>
    cells.map((c, i) => ` ${(c || '').padEnd(colWidths[i])} `).join('|');

  const lines = [
    separator,
    formatRow(headers),
    separator,
    ...rows.map(r => formatRow(r)),
    separator,
  ];

  const table = lines.join('\n');
  console.log(table);
  fs.appendFileSync(LOG_FILE, table + '\n', 'utf-8');
}
