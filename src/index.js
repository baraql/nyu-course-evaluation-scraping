const { chromium, Page, ScrapingSession, Locator } = require("playwright");
const fs = require("fs");
const assert = require("assert");

const { scrapeEvaluations } = require("./scrapeEvaluations.js");
const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { logIntoAlbert } = require("./logIntoAlbert.js");
const { openEvaluations } = require("./openEvaluations.js");
const { NYU_USERNAME, NYU_PASSWORD } = require("./secrets.js");
// import { waitForAlbertResponse } from "./waitForAlbertResponse.js";

async function scraper(termNumber) {
  // Setup
  const browser = await chromium.launchPersistentContext(
    "./user-data-many/" + termNumber + "/",
    {
      headless: true,
    }
  );

  // Close the initial about:blank page
  const [aboutBlankPage] = await browser.pages();
  await aboutBlankPage.close();

  const page = await browser.newPage();
  page.setDefaultTimeout(2147483647);

  logIntoAlbert(page, NYU_USERNAME, NYU_PASSWORD);
  waitForAlbertResponse(page);
  openEvaluations(page);
  await scrapeEvaluations(page, termNumber);
  // await page.waitForTimeout(10000);
  // await browser.close();
  console.log("done");
}

async function scraperShell(termNumber) {
  var loop = false;
  do {
    console.log("Starting scraper for termNumber " + termNumber);
    try {
      await scraper(termNumber);
      console.log("Scraper #" + termNumber + " finished");
      loop = false;
    } catch {
      loop = true;
    }
  } while (loop);
}

async function main() {
  var scrapers = [];

  for (let i = 0; i < 19; i++) {
    scrapers.push(scraperShell(i));
  }

  await Promise.all(scrapers);
}

main();
