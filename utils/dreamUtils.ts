/** Represents a single dream entry from the diary table */
export interface DreamEntry {
  name: string;
  daysAgo: string;
  type: 'Good' | 'Bad';
}

/**
 * Finds recurring dreams — names that appear more than once.
 * Returns a sorted array of unique recurring dream names.
 */
export function findRecurringDreams(dreams: DreamEntry[]): string[] {
  const countMap = new Map<string, number>();
  for (const dream of dreams) {
    countMap.set(dream.name, (countMap.get(dream.name) || 0) + 1);
  }

  const recurring: string[] = [];
  for (const [name, count] of countMap) {
    if (count > 1) {
      recurring.push(name);
    }
  }

  return recurring.sort();
}

/**
 * Counts dreams by type (Good / Bad).
 * Returns { good, bad, total }.
 */
export function countDreamsByType(dreams: DreamEntry[]): {
  good: number;
  bad: number;
  total: number;
} {
  let good = 0;
  let bad = 0;
  for (const dream of dreams) {
    if (dream.type === 'Good') good++;
    else if (dream.type === 'Bad') bad++;
  }
  return { good, bad, total: dreams.length };
}
