import { Page, BrowserContext } from '@playwright/test';
import { BasePage } from './BasePage';
import { log } from '../utils/logger';

/**
 * HomePage — page object for index.html (Dream Portal landing page).
 *
 * DOM structure (from live inspection):
 *   #loader.loader-overlay       — the loading animation overlay
 *   #main-content.main-container — main content (hidden until loader finishes)
 *   #dreamButton                 — "My Dreams" button that opens 2 new tabs
 */
export class HomePage extends BasePage {
  /* ──────── Locators ──────── */

  /** The full-screen loading overlay */
  private readonly loader = this.page.locator('#loader');

  /** The main content area revealed after loading */
  private readonly mainContent = this.page.locator('#main-content');

  /** The "My Dreams" button that opens the diary & total pages */
  private readonly dreamButton = this.page.locator('#dreamButton');

  constructor(page: Page) {
    super(page);
  }

  /** Navigate to the home / landing page */
  async open(): Promise<void> {
    await this.navigate('index.html');
  }

  /** Check whether the loading overlay is currently visible */
  async isLoaderVisible(): Promise<boolean> {
    return this.loader.isVisible();
  }

  /**
   * Wait for the loader to disappear.
   * Returns the elapsed time in milliseconds for logging purposes.
   */
  async waitForLoaderToDisappear(timeoutMs = 5_000): Promise<number> {
    const start = Date.now();
    await this.loader.waitFor({ state: 'hidden', timeout: timeoutMs });
    const elapsed = Date.now() - start;
    log(`Loader disappeared after ${elapsed}ms`);
    return elapsed;
  }

  /** Check whether the main content section is visible */
  async isMainContentVisible(): Promise<boolean> {
    return this.mainContent.isVisible();
  }

  /** Check whether the "My Dreams" button is visible */
  async isDreamButtonVisible(): Promise<boolean> {
    return this.dreamButton.isVisible();
  }

  /** Get the visible text of the dream button */
  async getDreamButtonText(): Promise<string> {
    return (await this.dreamButton.textContent() ?? '').trim();
  }

  /**
   * Click the "My Dreams" button which opens new tabs.
   */
  async clickDreamButton(context: BrowserContext): Promise<void> {
    log('Clicking "My Dreams" button — expecting 2 new tabs');
    await this.dreamButton.click();
  }
}
