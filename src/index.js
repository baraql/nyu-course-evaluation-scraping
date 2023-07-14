const fs = require("fs");
const { startInitialBrowser } = require("./startInitialBrowser.js");
const { getListOfSubjectsToScrape } = require("./getListOfSubjectsToScrape.js");
const { spawnWorker } = require("./worker.js");
const { wipeChromeWorkerData } = require("./chromeWorkerData.js");
const { startDashboard } = require("./dashboard.js");

const initialLogin = false;

async function main() {
  startDashboard();

  if (!fs.existsSync("data/")) {
    fs.mkdirSync("data/");
  }

  // sign in and collect the list of subjects

  if (initialLogin) {
    const { initialPage, initialBrowser } = await startInitialBrowser();
    console.log("logged in");
    global.subjectsToScrape = await getListOfSubjectsToScrape(initialPage);
    initialBrowser.close();
  } else {
    global.subjectsToScrape = await getListOfSubjectsToScrape();
  }
  // spawn new workers
  await wipeChromeWorkerData();
  global.sessions = {};
  spawnWorker(0);
}

/*
async function scraper(termNumber) {
  // Setup
  const browser = await chromium.launchPersistentContext(
    "./cache/worker-chrome-data/" + termNumber + "/",
    {
      headless: debugNum >= 0 ? false : true,
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
  // if (debugNum >= 0) {
  //   await scraperShell(debugNum);
  // } else {
  //   var scrapers = [];
  //   for (let i = 0; i < 19; i++) {
  //     scrapers.push(scraperShell(i));
  //   }
  //   await Promise.all(scrapers);
  // }
  begin();
}
*/
main();
