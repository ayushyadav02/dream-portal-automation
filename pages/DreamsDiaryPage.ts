import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { DreamEntry } from '../utils/dreamUtils';
import { log } from '../utils/logger';

/**
 * DreamsDiaryPage — page object for dreams-diary.html.
 *
 * DOM structure (from live inspection):
 *   <h1>Dreams Diary</h1>
 *   <table id="dreamsDiary">
 *     <thead> <tr> <th>Dream Name</th> <th>Days Ago</th> <th>Dream Type</th> </tr> </thead>
 *     <tbody> (10 data rows) </tbody>
 *   </table>
 */
export class DreamsDiaryPage extends BasePage {
  /* ──────── Locators ──────── */

  /** The dreams diary table */
  private readonly table = this.page.locator('#dreamsDiary');

  /** All data rows in tbody (excludes the header row) */
  private readonly dataRows = this.page.locator('#dreamsDiary tbody tr');

  /** The page heading */
  private readonly heading = this.page.locator('h1');

  constructor(page: Page) {
    super(page);
  }

  /** Navigate directly to the diary page */
  async open(): Promise<void> {
    await this.navigate('dreams-diary.html');
  }

  /** Get the count of data rows (excluding the header) */
  async getRowCount(): Promise<number> {
    const count = await this.dataRows.count();
    log(`Diary table has ${count} data rows`);
    return count;
  }

  /**
   * Extract all dream entries from the diary table.
   * Returns an array of { name, daysAgo, type } objects.
   */
  async getAllDreams(): Promise<DreamEntry[]> {
    const dreams: DreamEntry[] = [];
    const rowCount = await this.dataRows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = this.dataRows.nth(i);
      const cells = row.locator('td');

      const name = (await cells.nth(0).textContent() ?? '').trim();
      const daysAgo = (await cells.nth(1).textContent() ?? '').trim();
      const type = (await cells.nth(2).textContent() ?? '').trim() as 'Good' | 'Bad';

      dreams.push({ name, daysAgo, type });
    }

    log(`Extracted ${dreams.length} dream entries from diary`);
    return dreams;
  }

  /**
   * Get the Dream Type value for a specific row (0-indexed).
   */
  async getDreamType(rowIndex: number): Promise<string> {
    const cell = this.dataRows.nth(rowIndex).locator('td').nth(2);
    return (await cell.textContent() ?? '').trim();
  }

  /** Get the page heading text */
  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent() ?? '').trim();
  }
}
