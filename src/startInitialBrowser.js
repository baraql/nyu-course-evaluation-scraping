const { chromium, Page, ScrapingSession, Locator } = require("playwright");
const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { logIntoAlbert } = require("./logIntoAlbert.js");

async function startInitialBrowser() {
  const browser = await chromium.launchPersistentContext(
    "./cache/initial-chrome-data/",
    {
      headless: false,
      bypassCSP: true,
    }
  );

  // Close the initial about:blank page
  const [aboutBlankPage] = browser.pages();
  await aboutBlankPage.close();

  const page = await browser.newPage();
  page.setDefaultTimeout(2147483647);

  await logIntoAlbert(page);
  return { initialPage: page, initialBrowser: browser };
}

module.exports = { startInitialBrowser };
