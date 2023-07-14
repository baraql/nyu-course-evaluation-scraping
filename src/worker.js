const { chromium } = require("playwright");

const { scrapeEvaluation } = require("./scrapeEvaluation.js");
const { logIntoAlbert } = require("./logIntoAlbert.js");
const { openEvaluations } = require("./openEvaluations.js");
const { copyChromeWorkerData } = require("./chromeWorkerData.js");

const debug = true;

async function scraper(workerId) {
  // Setup
  const browser = await chromium.launchPersistentContext(
    "./cache/worker-chrome-data/" + workerId + "/",
    {
      headless: !debug,
      bypassCSP: true,
    }
  );

  // Close the initial about:blank page
  const [aboutBlankPage] = browser.pages();
  await aboutBlankPage.close();

  const page = await browser.newPage();
  page.setDefaultTimeout(2147483647);

  logIntoAlbert(page);
  console.log("INFO: Worker #" + workerId + " logged in.");
  openEvaluations(page);

  do {
    const subjectToScrape = global.subjectsToScrape.pop();

    global.sessions[workerId].term = subjectToScrape.term;
    global.sessions[workerId].school = subjectToScrape.school;
    global.sessions[workerId].subject = subjectToScrape.subject;

    await scrapeEvaluation(page, workerId, subjectToScrape);
  } while (global.subjectsToScrape.length > 0);

  // await page.waitForTimeout(10000);
  console.log(`Scraper #${workerId} is finished.`);
  await browser.close();
}

async function spawnWorker(workerId) {
  global.sessions[workerId] = {};
  copyChromeWorkerData(workerId);
  await scraper(workerId);
}

module.exports = { spawnWorker };
