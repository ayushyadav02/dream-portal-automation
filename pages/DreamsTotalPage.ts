import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { log } from '../utils/logger';

/**
 * Represents a single stat row from the dreams-total summary table.
 */
export interface DreamStat {
  label: string;
  value: number;
}

/**
 * DreamsTotalPage — page object for dreams-total.html.
 *
 * DOM structure (from live inspection):
 *   <h1>Dreams Summary</h1>
 *   <table id="dreamsTotal">
 *     <thead> <tr> <th>Dream Type</th> <th>Total Count</th> </tr> </thead>
 *     <tbody>
 *       <tr> <td>Good Dreams</td>      <td>6</td>  </tr>
 *       <tr> <td>Bad Dreams</td>       <td>4</td>  </tr>
 *       <tr> <td>Total Dreams</td>     <td>10</td> </tr>
 *       <tr> <td>Dreams This Week</td> <td>7</td>  </tr>
 *       <tr> <td>Recurring Dreams</td> <td>2</td>  </tr>
 *     </tbody>
 *   </table>
 */
export class DreamsTotalPage extends BasePage {
  /* ──────── Locators ──────── */

  /** The summary table */
  private readonly table = this.page.locator('#dreamsTotal');

  /** All data rows in tbody */
  private readonly dataRows = this.page.locator('#dreamsTotal tbody tr');

  /** The page heading */
  private readonly heading = this.page.locator('h1');

  constructor(page: Page) {
    super(page);
  }

  /** Navigate directly to the total page */
  async open(): Promise<void> {
    await this.navigate('dreams-total.html');
  }

  /**
   * Read all stats from the summary table.
   * Returns a Map of label → numeric value for easy lookups.
   */
  async getAllStats(): Promise<Map<string, number>> {
    const stats = new Map<string, number>();
    const rowCount = await this.dataRows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = this.dataRows.nth(i);
      const cells = row.locator('td');

      const label = (await cells.nth(0).textContent() ?? '').trim();
      const valueText = (await cells.nth(1).textContent() ?? '').trim();
      const value = parseInt(valueText, 10);

      stats.set(label, value);
      log(`Stat: ${label} = ${value}`);
    }

    return stats;
  }

  /** Get a single stat value by its label. Returns NaN if not found. */
  async getStatValue(label: string): Promise<number> {
    const stats = await this.getAllStats();
    return stats.get(label) ?? NaN;
  }

  /** Convenience getters for expected stats */
  async getGoodDreams(): Promise<number> {
    return this.getStatValue('Good Dreams');
  }

  async getBadDreams(): Promise<number> {
    return this.getStatValue('Bad Dreams');
  }

  async getTotalDreams(): Promise<number> {
    return this.getStatValue('Total Dreams');
  }

  async getRecurringDreams(): Promise<number> {
    return this.getStatValue('Recurring Dreams');
  }

  /** Get the page heading text */
  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent() ?? '').trim();
  }
}
