const { chromium } = require("playwright");

const { scrapeEvaluation } = require("./scrapeEvaluation.js");
const { logIntoAlbert } = require("./logIntoAlbert.js");
const { openEvaluations } = require("./openEvaluations.js");
const { copyChromeWorkerData } = require("./chromeWorkerData.js");

async function scraper(workerId) {
  // Setup
  const browser = await chromium.launchPersistentContext(
    "./cache/worker-chrome-data/" + workerId + "/",
    {
      headless: !global.DEBUG,
      // headless: false,
      bypassCSP: true,
    }
  );

  // Close the initial about:blank page
  const [aboutBlankPage] = browser.pages();
  await aboutBlankPage.close();

  const page = await browser.newPage();
  page.setDefaultTimeout(2147483647);

  await logIntoAlbert(page);
  console.log("INFO: Worker #" + workerId + " logged in.");
  await openEvaluations(page);

  try {
    do {
      // console.log("Step A");
      const subjectToScrape = global.subjectsToScrape.pop();

      global.sessions[workerId].term = subjectToScrape.term;
      global.sessions[workerId].school = subjectToScrape.school;
      global.sessions[workerId].subject = subjectToScrape.subject;

      await scrapeEvaluation(page, workerId, subjectToScrape);
      // console.log("Step B");
    } while (global.subjectsToScrape.length > 0);
  } catch (error) {
    if (error === "CANCEL_WORKER") {
      console.log(`Worker #${workerId} was canceled.`);
    } else {
      // Handle other types of errors
      console.log("An error occurred:", error);
      // throw "WORKER_ERROR";
    }
  }
  // await page.waitForTimeout(10000);
  await browser.close();
  global.sessions[workerId] = null;
  if (Object.keys(global.sessions).length == 0) {
    console.log("No workers left. Process done.");
    exit(0);
  }
}

async function spawnWorker(workerId) {
  global.sessions[workerId] = { shouldCancel: false };
  copyChromeWorkerData(workerId);

  return scraper(workerId);
}

module.exports = { spawnWorker };
