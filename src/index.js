const { chromium, Page, ScrapingSession, Locator } = require("playwright");
const fs = require("fs");
const assert = require("assert");

const { scrapeEvaluations } = require("./scrapeEvaluations.js");
const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { logIntoAlbert } = require("./logIntoAlbert.js");
const { openEvaluations } = require("./openEvaluations.js");
const { NYU_USERNAME, NYU_PASSWORD } = require("./secrets.js");
// import { waitForAlbertResponse } from "./waitForAlbertResponse.js";

async function main() {
  // Setup
  const browser = await chromium.launchPersistentContext("./user-data", {
    headless: false,
  });

  // Close the initial about:blank page
  const [aboutBlankPage] = await browser.pages();
  await aboutBlankPage.close();

  const page = await browser.newPage();
  page.setDefaultTimeout(1000000);

  logIntoAlbert(page, NYU_USERNAME, NYU_PASSWORD);
  waitForAlbertResponse(page);
  openEvaluations(page);
  scrapeEvaluations(page);
  // await page.waitForTimeout(10000);
  // await browser.close();
}

main();
