import { Page } from '@playwright/test';
import { log } from '../utils/logger';
import fs from 'fs';
import path from 'path';

/**
 * BasePage — shared helpers for all page objects.
 * All page objects extend this class for consistent navigation,
 * visibility checks, screenshots, and logging.
 */
export class BasePage {
  /** The Playwright Page instance */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to a path relative to the baseURL set in playwright.config.ts */
  async navigate(urlPath: string): Promise<void> {
    log(`Navigating to: ${urlPath}`);
    await this.page.goto(urlPath, { waitUntil: 'domcontentloaded' });
    log(`Navigation complete: ${this.page.url()}`);
  }

  /** Wait for an element to be visible with a configurable timeout */
  async waitForVisible(selector: string, timeoutMs = 10_000): Promise<void> {
    log(`Waiting for element to be visible: ${selector}`);
    await this.page.locator(selector).waitFor({ state: 'visible', timeout: timeoutMs });
    log(`Element visible: ${selector}`);
  }

  /** Wait for an element to be hidden / detached */
  async waitForHidden(selector: string, timeoutMs = 10_000): Promise<void> {
    log(`Waiting for element to be hidden: ${selector}`);
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout: timeoutMs });
    log(`Element hidden: ${selector}`);
  }

  /**
   * Take a screenshot and save it to the screenshots/ directory.
   * Returns the absolute path to the saved file.
   */
  async takeScreenshot(name: string): Promise<string> {
    const dir = path.resolve(__dirname, '..', 'screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, `${name}.png`);
    await this.page.screenshot({ path: filePath, fullPage: true });
    log(`Screenshot saved: ${filePath}`);
    return filePath;
  }

  /** Shorthand logger attached to the page context */
  log(message: string): void {
    log(message);
  }
}
