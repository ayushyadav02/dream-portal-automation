import { test, expect } from '@playwright/test';
import { DreamsTotalPage } from '../pages/DreamsTotalPage';
import { DreamsDiaryPage } from '../pages/DreamsDiaryPage';
import { EXPECTED } from '../test-data/expectedData';
import { findRecurringDreams, countDreamsByType } from '../utils/dreamUtils';
import { log } from '../utils/logger';

test.describe('DreamsTotalPage — Dreams Summary & Cross-Page Validation', () => {

  test('TC-09: Summary page shows correct stats', async ({ page }) => {
    const totalPage = new DreamsTotalPage(page);
    await totalPage.open();

    await test.step('Assert Good Dreams = 6', async () => {
      const good = await totalPage.getGoodDreams();
      log(`Good Dreams: ${good} (expected ${EXPECTED.goodDreams})`);
      expect(good).toBe(EXPECTED.goodDreams);
    });

    await test.step('Assert Bad Dreams = 4', async () => {
      const bad = await totalPage.getBadDreams();
      log(`Bad Dreams: ${bad} (expected ${EXPECTED.badDreams})`);
      expect(bad).toBe(EXPECTED.badDreams);
    });

    await test.step('Assert Total Dreams = 10', async () => {
      const total = await totalPage.getTotalDreams();
      log(`Total Dreams: ${total} (expected ${EXPECTED.totalDreams})`);
      expect(total).toBe(EXPECTED.totalDreams);
    });

    await test.step('Assert Recurring Dreams = 2', async () => {
      const recurring = await totalPage.getRecurringDreams();
      log(`Recurring Dreams: ${recurring} (expected ${EXPECTED.recurringDreams})`);
      expect(recurring).toBe(EXPECTED.recurringDreams);
    });

    await test.step('Take screenshot of summary page', async () => {
      await totalPage.takeScreenshot('dreams-total-stats');
    });
  });

  test('TC-10: Cross-page validation — diary data matches summary stats', async ({ page, context }) => {
    // Open the diary page and read all dream data
    const diaryPage = new DreamsDiaryPage(page);
    await diaryPage.open();

    let computedGood: number;
    let computedBad: number;
    let computedTotal: number;
    let recurringNames: string[];

    await test.step('Read all dreams from diary table', async () => {
      const dreams = await diaryPage.getAllDreams();
      log(`Read ${dreams.length} dreams from diary`);

      // Compute stats from the diary data
      const counts = countDreamsByType(dreams);
      computedGood = counts.good;
      computedBad = counts.bad;
      computedTotal = counts.total;

      recurringNames = findRecurringDreams(dreams);

      log(`Computed from diary — Good: ${computedGood}, Bad: ${computedBad}, Total: ${computedTotal}`);
      log(`Recurring dreams: ${JSON.stringify(recurringNames)}`);
    });

    await test.step('Verify recurring dream names match expected list', async () => {
      expect(recurringNames!, 'Recurring dream names should match expected list').toEqual(
        EXPECTED.recurringDreamNames
      );
    });

    // Now open the total page and compare
    const totalPageObj = new DreamsTotalPage(await context.newPage());
    await totalPageObj.open();

    await test.step('Cross-validate: diary-computed Good matches summary page', async () => {
      const summaryGood = await totalPageObj.getGoodDreams();
      log(`Summary Good: ${summaryGood}, Diary-computed Good: ${computedGood!}`);
      expect(computedGood!).toBe(summaryGood);
    });

    await test.step('Cross-validate: diary-computed Bad matches summary page', async () => {
      const summaryBad = await totalPageObj.getBadDreams();
      log(`Summary Bad: ${summaryBad}, Diary-computed Bad: ${computedBad!}`);
      expect(computedBad!).toBe(summaryBad);
    });

    await test.step('Cross-validate: diary-computed Total matches summary page', async () => {
      const summaryTotal = await totalPageObj.getTotalDreams();
      log(`Summary Total: ${summaryTotal}, Diary-computed Total: ${computedTotal!}`);
      expect(computedTotal!).toBe(summaryTotal);
    });

    await test.step('Cross-validate: diary-computed Recurring count matches summary page', async () => {
      const summaryRecurring = await totalPageObj.getRecurringDreams();
      log(`Summary Recurring: ${summaryRecurring}, Diary-computed Recurring: ${recurringNames!.length}`);
      expect(recurringNames!.length).toBe(summaryRecurring);
    });
  });
});
