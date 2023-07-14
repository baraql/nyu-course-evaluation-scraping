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

  global.browsers[workerId] = browser;

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

      global.sessions[workerId].courseN = -1;
      global.sessions[workerId].courseT = -1;

      await scrapeEvaluation(page, workerId, subjectToScrape);
      // console.log("Step B");
    } while (global.subjectsToScrape.length > 0);
  } catch (error) {
    if (error === "CANCEL_WORKER") {
      console.log(`Worker #${workerId} was canceled.`);
    } else if (
      !error.message.includes("Target") &&
      !error.message.includes("Page")
    ) {
      // Handle other types of errors
      console.log("An error occurred: ", error);
      // throw "WORKER_ERROR";
      await browser.close();
    }
  }

  delete global.browsers[workerId];
  delete global.sessions[workerId];
}

// prevent killing browser from ending program
async function workerWrapper(workerId) {
  global.sessions[workerId] = { shouldCancel: false };
  copyChromeWorkerData(workerId);

  return scraper(workerId);
}

function spawnWorker(workerId) {
  try {
    workerWrapper(workerId);
  } catch (error) {
    console.log("FATAL: " + error);
  }
}

module.exports = { spawnWorker };
