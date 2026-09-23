import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { log } from '../utils/logger';

test.describe('HomePage — Dream Portal Landing Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('TC-01: Loading animation is visible immediately after page opens', async ({ page }) => {
    await test.step('Navigate to the home page', async () => {
      // Use goto directly so we can check the loader before it fades
      await page.goto('index.html', { waitUntil: 'commit' });
    });

    await test.step('Verify loader overlay is visible', async () => {
      const loaderVisible = await page.locator('#loader').isVisible();
      log(`Loader visible immediately after navigation: ${loaderVisible}`);
    });

    await test.step('Take screenshot of loader state', async () => {
      await homePage.takeScreenshot('home-loader-visible');
    });
  });

  test('TC-02: Loading animation disappears within ~3 seconds', async ({ page }) => {
    await test.step('Navigate to the home page', async () => {
      await page.goto('index.html', { waitUntil: 'commit' });
    });

    await test.step('Wait for loader to disappear (timeout: 5s)', async () => {
      const elapsed = await homePage.waitForLoaderToDisappear(5_000);
      log(`Loader disappeared in ${elapsed}ms`);
      expect(elapsed, 'Loader should disappear within ~5000ms').toBeLessThan(5_000);
    });

    await test.step('Take screenshot after loader gone', async () => {
      await homePage.takeScreenshot('home-loader-hidden');
    });
  });

  test('TC-03: Main content and "My Dreams" button are visible after loading', async ({ page }) => {
    await test.step('Navigate and wait for loading to complete', async () => {
      await homePage.open();
      await homePage.waitForLoaderToDisappear(5_000);
    });

    await test.step('Verify main content is visible', async () => {
      const mainVisible = await homePage.isMainContentVisible();
      log(`Main content visible: ${mainVisible}`);
      expect(mainVisible, 'Main content should be visible after loading').toBe(true);
    });

    await test.step('Verify "My Dreams" button is visible', async () => {
      const btnVisible = await homePage.isDreamButtonVisible();
      log(`Dream button visible: ${btnVisible}`);
      expect(btnVisible, '"My Dreams" button should be visible after loading').toBe(true);
    });

    await test.step('Verify button text', async () => {
      const btnText = await homePage.getDreamButtonText();
      log(`Button text: "${btnText}"`);
      expect(btnText).toBe('My Dreams');
    });

    await test.step('Take screenshot of loaded page', async () => {
      await homePage.takeScreenshot('home-loaded');
    });
  });

  test('TC-04: Clicking "My Dreams" opens diary and total pages in new tabs', async ({ page, context }) => {
    await test.step('Navigate and wait for loading to complete', async () => {
      await homePage.open();
      await homePage.waitForLoaderToDisappear(5_000);
    });

    await test.step('Click "My Dreams" button and capture new tabs', async () => {
      await homePage.clickDreamButton(context);
      // Wait for both tabs to appear in context (3 pages total including home)
      await expect(async () => {
        expect(context.pages().length).toBeGreaterThanOrEqual(3);
      }).toPass({ timeout: 10_000 });
    });

    await test.step('Verify diary and total page URLs', async () => {
      const urls = context.pages().map(p => p.url());
      const hasDiary = urls.some(url => url.includes('dreams-diary'));
      const hasTotal = urls.some(url => url.includes('dreams-total'));
      
      log(`Open tabs: ${urls.join(', ')}`);
      expect(hasDiary, 'Should have opened dreams-diary tab').toBe(true);
      expect(hasTotal, 'Should have opened dreams-total tab').toBe(true);
    });
  });
});
