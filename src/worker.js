const { chromium } = require("playwright");

const { scrapeEvaluation } = require("./scrapeEvaluation.js");
const { logIntoAlbert } = require("./logIntoAlbert.js");
const { openEvaluations } = require("./openEvaluations.js");
const { copyChromeWorkerData } = require("./chromeWorkerData.js");
// const { killWorker } = require("./workerControl.js");

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

  do {
    try {
      // console.log("Step A");
      const subjectToScrape = global.subjectsToScrape.pop();

      if (!global.sessions[workerId]) {
        break;
      }

      global.sessions[workerId].term = subjectToScrape.term;
      global.sessions[workerId].school = subjectToScrape.school;
      global.sessions[workerId].subject = subjectToScrape.subject;

      global.sessions[workerId].courseN = -1;
      global.sessions[workerId].courseT = -1;

      await scrapeEvaluation(page, workerId, subjectToScrape);
      // console.log("Step B");
    } catch (error) {
      if (error === "CANCEL_WORKER") {
        console.log(`Worker #${workerId} was canceled.`);
      } else if (
        !error.message.includes("Target") &&
        !error.message.includes("Page")
      ) {
        // Handle other types of errors
        console.log("An error occurred: ", error);
        console.trace();
        // throw "WORKER_ERROR";
        await browser.close();
        break;
      }
    }
  } while (global.subjectsToScrape.length > 0);

  killWorker(workerId);
}

// prevent killing browser from ending program
async function workerWrapper(workerId) {
  global.sessions[workerId] = { shouldCancel: false };
  copyChromeWorkerData(workerId);
  try {
    await scraper(workerId);
  } catch (error) {
    console.log(error);
  }
}

function spawnWorker(workerId) {
  try {
    workerWrapper(workerId);
  } catch (error) {
    console.log("FATAL: " + error);
  }
}

function killWorker(id) {
  try {
    if (global.browsers[id]) {
      global.browsers[id].close();
      delete global.browsers[id];
    }
    if (global.sessions[id]) {
      delete global.sessions[id];
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = { spawnWorker };
