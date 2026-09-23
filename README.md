# Dream Portal Automation

This repository contains a complete, production-quality test automation project for the Dream Portal website. It covers both UI verifications and an advanced AI-based validation for categorising dream entries.

## Tech Stack
- **Framework**: [Playwright](https://playwright.dev/) with TypeScript
- **Pattern**: Page Object Model (POM)
- **Assertions**: Playwright `expect`
- **Reports**: Playwright HTML Report & [Allure Report](https://allurereport.org/)
- **AI Integration**: Custom AI classifier supporting Gemini, OpenAI, and Groq
- **Environment**: Node.js 18+

## Folder Structure
```
dream-portal-automation/
├── pages/                  # Page Object Models for each web page
│   ├── BasePage.ts         # Shared helpers (navigation, logging, screenshots)
│   ├── HomePage.ts         # Locators & actions for index.html
│   ├── DreamsDiaryPage.ts  # Locators & actions for dreams-diary.html
│   └── DreamsTotalPage.ts  # Locators & actions for dreams-total.html
├── tests/                  # Test suites
│   ├── home.spec.ts        # Landing page tests
│   ├── dreamsDiary.spec.ts # Diary table validation
│   ├── dreamsTotal.spec.ts # Summary stats & cross-page validation
│   └── aiValidation.spec.ts# Bonus: AI-based classification validation
├── utils/                  # Helper utilities
│   ├── logger.ts           # Timestamped console and file logging
│   ├── aiClassifier.ts     # Wrapper for AI API providers
│   └── dreamUtils.ts       # Logic for recurring dreams & counts
├── test-data/
│   └── expectedData.ts     # Single source of truth for expected counts
├── playwright.config.ts    # Global Playwright configuration
├── .env.example            # Template for environment variables
└── package.json            # Project dependencies and NPM scripts
```

## Prerequisites
- Node.js (v18 or higher)
- NPM (Node Package Manager)

## Setup Steps
1. **Clone the repository** or download the project files.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```
   *(Note: This project is configured to use your system-installed Chrome browser if chromium download fails).*
4. **Environment Variables**:
   Copy the example file and add your AI API key if you wish to run the AI validation tests:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `AI_PROVIDER` (e.g., `gemini`) and the corresponding API key.

## How to Run Tests

- **Run all core UI tests (headless Chromium)**:
  ```bash
  npm run test:core
  ```
- **Run tests in headed mode** (watch them execute):
  ```bash
  npm run test:headed
  ```
- **Run the AI Validation test**:
  ```bash
  npm run test:ai
  ```
- **Run everything on all configured browsers**:
  ```bash
  npm run test:all-browsers
  ```

## Reports

Screenshots are taken for every test automatically.

### Playwright HTML Report
```bash
npm run report
```

### Allure Report
1. Generate the report:
   ```bash
   npm run allure:generate
   ```
2. Open the report:
   ```bash
   npm run allure:open
   ```

## Test Cases Covered

### Part 1: Core UI Tests
1. **TC-01**: Loading animation is visible immediately after page opens.
2. **TC-02**: Loading animation disappears within ~5 seconds.
3. **TC-03**: Main content and the "My Dreams" button are visible after loading.
4. **TC-04**: Clicking "My Dreams" opens dreams-diary.html AND dreams-total.html in new tabs.
5. **TC-05**: Diary table has exactly 10 dream entries.
6. **TC-06**: Every Dream Type is only "Good" or "Bad".
7. **TC-07**: Every row has all 3 columns non-empty (Name, Days Ago, Type).
8. **TC-08**: Data extraction (`getAllDreams()`) returns correct data structure.
9. **TC-09**: Summary page shows correct static stats (Good=6, Bad=4, Total=10, Recurring=2).
10. **TC-10**: Cross-page validation — calculates good/bad/total/recurring from diary data and asserts they match the total summary page.

### Part 2: AI-Based Validation
11. **TC-11**: Fetches all dream names from the diary table, asks the configured AI to classify them, and compares the AI's answer to the table's "Dream Type".

## AI Validation Configuration
The project includes a bonus test (`aiValidation.spec.ts`) that uses AI to verify data accuracy.
- **Providers supported**: Gemini, OpenAI, Groq.
- **Config**: Set `AI_PROVIDER` and the matching `_API_KEY` in your `.env` file.
- **Behavior**: Uses temperature 0 for strict formatting. Uses soft assertions so the test continues even if some dreams are misclassified, reporting an overall accuracy percentage at the end. The test skips gracefully if no API key is provided.

## Design Decisions
- **Page Object Model (POM)**: Separates test logic from UI locators, making the code highly maintainable and readable. No raw selectors exist in the `tests/` folder.
- **Cross-Page Validation**: Instead of hardcoding expected values for the Total page, the framework reads the data from the Diary page, computes the expected stats dynamically, and compares them.
- **Soft Assertions for AI**: Since AI can sometimes be non-deterministic (even at temperature 0), soft assertions allow the test to run through all 10 dreams and generate an accuracy report, rather than failing on the first mismatch.
- **Robust Locators**: Uses precise CSS identifiers and strict Playwright waits (`waitForVisible`, `waitForHidden`) to eliminate flakiness, especially around the initial loading overlay.
