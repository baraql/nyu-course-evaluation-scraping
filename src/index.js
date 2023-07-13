const { chromium, Page, ScrapingSession, Locator } = require("playwright");
const fs = require("fs");
const assert = require("assert");

const { scrapeEvaluations } = require("./scrapeEvaluations.js");
const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { getComboboxOptions } = require("./getComboboxOptions.js");

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

  logIntoAlbert(page);
  waitForAlbertResponse(page);
  openEvaluations(page);

  await page.waitForTimeout(10000);
  await browser.close();
}

async function logIntoAlbert(page) {
  await page.goto("http://albert.nyu.edu/albert_index.html");
  await page.getByRole("link", { name: "Sign in to Albert" }).click();
  await page.getByLabel("NetID (e.g., aqe123)").fill(NYU_USERNAME);
  await page.getByLabel("Password").fill(NYU_PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
}

async function openEvaluations(page) {
  // const { page } = session;

  await page
    .getByRole("link", { name: "Evaluation Published Results" })
    .click();
}

main();
