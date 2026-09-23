import { test, expect } from '@playwright/test';
import { DreamsDiaryPage } from '../pages/DreamsDiaryPage';
import { classifyDream, isAIConfigured } from '../utils/aiClassifier';
import { log, logTable } from '../utils/logger';
import { DreamEntry } from '../utils/dreamUtils';

/**
 * AI Validation Tests — classify each dream via AI and compare with the table's Dream Type.
 * Uses soft assertions so every dream is checked even if some fail.
 * Skips gracefully if no API key is configured.
 */
test.describe('AI Dream Classification Validation', () => {
  // Skip the entire suite if no AI API key is configured
  test.beforeAll(() => {
    if (!isAIConfigured()) {
      test.skip(true, 'No AI API key configured — set AI_PROVIDER and matching key in .env');
    }
  });

  test('TC-11: AI classification matches diary Dream Type for all entries', async ({ page }, testInfo) => {
    const diaryPage = new DreamsDiaryPage(page);
    await diaryPage.open();

    let dreams: DreamEntry[] = [];
    await test.step('Fetch all dream entries from the diary', async () => {
      dreams = await diaryPage.getAllDreams();
      log(`Fetched ${dreams.length} dreams for AI classification`);
    });

    // Classify each dream and collect results
    const results: { name: string; tableType: string; aiType: string; match: boolean }[] = [];

    await test.step('Classify each dream via AI and compare', async () => {
      for (const dream of dreams) {
        let aiType: string;
        try {
          aiType = await classifyDream(dream.name);
        } catch (error) {
          aiType = `ERROR: ${(error as Error).message}`;
        }

        const match = aiType === dream.type;
        results.push({
          name: dream.name,
          tableType: dream.type,
          aiType,
          match,
        });

        // Soft assertion — doesn't stop the test if one fails
        expect.soft(
          aiType,
          `Dream "${dream.name}": AI classified as "${aiType}" but table says "${dream.type}"`
        ).toBe(dream.type);
      }
    });

    await test.step('Log comparison table', async () => {
      logTable(
        ['Dream Name', 'Table Type', 'AI Type', 'Match'],
        results.map((r) => [r.name, r.tableType, r.aiType, r.match ? '✅' : '❌'])
      );
    });

    await test.step('Report accuracy', async () => {
      const matches = results.filter((r) => r.match).length;
      const accuracy = ((matches / results.length) * 100).toFixed(1);
      log(`AI Classification Accuracy: ${matches}/${results.length} (${accuracy}%)`);

      // Attach results to Allure/HTML report
      const csvContent = [
        'Dream Name,Table Type,AI Type,Match',
        ...results.map((r) => `${r.name},${r.tableType},${r.aiType},${r.match}`),
        '',
        `Accuracy: ${accuracy}%`,
      ].join('\n');

      await testInfo.attach('AI Classification Results', {
        body: csvContent,
        contentType: 'text/csv',
      });
    });

    await test.step('Take screenshot of diary (reference)', async () => {
      await diaryPage.takeScreenshot('ai-validation-diary');
    });
  });
});
