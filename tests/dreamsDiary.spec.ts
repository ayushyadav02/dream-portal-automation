import { test, expect } from '@playwright/test';
import { DreamsDiaryPage } from '../pages/DreamsDiaryPage';
import { EXPECTED } from '../test-data/expectedData';
import { log } from '../utils/logger';

test.describe('DreamsDiaryPage — Dreams Diary Table', () => {
  let diaryPage: DreamsDiaryPage;

  test.beforeEach(async ({ page }) => {
    diaryPage = new DreamsDiaryPage(page);
    await diaryPage.open();
  });

  test('TC-05: Diary table has exactly 10 dream entries', async () => {
    await test.step('Count data rows (excluding header)', async () => {
      const rowCount = await diaryPage.getRowCount();
      log(`Row count: ${rowCount}, expected: ${EXPECTED.totalDreams}`);
      expect(rowCount, `Table should have exactly ${EXPECTED.totalDreams} data rows`).toBe(EXPECTED.totalDreams);
    });

    await test.step('Take screenshot of diary table', async () => {
      await diaryPage.takeScreenshot('diary-table');
    });
  });

  test('TC-06: Every Dream Type is only "Good" or "Bad"', async () => {
    await test.step('Validate all dream types', async () => {
      const dreams = await diaryPage.getAllDreams();

      for (let i = 0; i < dreams.length; i++) {
        const dream = dreams[i];
        log(`Row ${i + 1}: "${dream.name}" — Type: "${dream.type}"`);
        expect(
          EXPECTED.validDreamTypes.includes(dream.type),
          `Row ${i + 1} ("${dream.name}"): type "${dream.type}" should be "Good" or "Bad"`
        ).toBe(true);
      }
    });
  });

  test('TC-07: Every row has all 3 columns non-empty', async () => {
    await test.step('Validate no empty cells', async () => {
      const dreams = await diaryPage.getAllDreams();

      for (let i = 0; i < dreams.length; i++) {
        const dream = dreams[i];
        log(`Row ${i + 1}: name="${dream.name}", daysAgo="${dream.daysAgo}", type="${dream.type}"`);

        expect(dream.name, `Row ${i + 1}: Dream Name should not be empty`).toBeTruthy();
        expect(dream.daysAgo, `Row ${i + 1}: Days Ago should not be empty`).toBeTruthy();
        expect(dream.type, `Row ${i + 1}: Dream Type should not be empty`).toBeTruthy();
      }
    });
  });

  test('TC-08: getAllDreams() returns correct data structure', async () => {
    await test.step('Verify getAllDreams() returns array of { name, daysAgo, type }', async () => {
      const dreams = await diaryPage.getAllDreams();

      expect(dreams.length).toBe(EXPECTED.totalDreams);

      // Verify the structure of each entry
      for (const dream of dreams) {
        expect(dream).toHaveProperty('name');
        expect(dream).toHaveProperty('daysAgo');
        expect(dream).toHaveProperty('type');
        expect(typeof dream.name).toBe('string');
        expect(typeof dream.daysAgo).toBe('string');
        expect(typeof dream.type).toBe('string');
      }

      log(`getAllDreams() returned ${dreams.length} properly structured entries`);
    });
  });
});
