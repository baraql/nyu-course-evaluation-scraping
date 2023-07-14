const fs = require("fs");
const os = require("os");

const { startInitialBrowser } = require("./startInitialBrowser.js");
const { getListOfSubjectsToScrape } = require("./getListOfSubjectsToScrape.js");
const { wipeChromeWorkerData } = require("./chromeWorkerData.js");
const {
  giveMeANewWorker,
  killAWorker,
  killWorker,
} = require("./workerControl.js");

global.DEBUG = false;
const DASH = true;

const INITIAL_LOGIN = false;
const START_WORKERS = 5;

const KILL_THRESHOLD = 100 * 1024 * 1024; // 500MB in bytes
const SPAWN_THRESHOLD = 300 * 1024 * 1024; // 750MB in bytes

const { updateSessionVariables, startDashboard } = require("./dashboard.js");

function dashClock() {
  updateSessionVariables(os.freemem(), os.totalmem());
}

var killOnNext = false;
var startOnNext = false;
var sessionsCopy = global.sessions;

function memClock() {
  const freeMemory = os.freemem();
  if (freeMemory < KILL_THRESHOLD) {
    // kill a worker
    logMessage("killAWorker: " + killOnNext);
    if (killOnNext) {
      killAWorker();
      killOnNext = false;
    } else {
      killOnNext = true;
    }

    startOnNext = false;
  } else if (freeMemory > SPAWN_THRESHOLD && !global.DEBUG) {
    // spawn a worker
    logMessage("startOnNext: " + startOnNext);
    if (startOnNext) {
      giveMeANewWorker();
      startOnNext = false;
    } else {
      startOnNext = true;
    }

    killOnNext = false;
  } else {
    startOnNext = false;
    killOnNext = false;
  }

  for (const key of Object.keys(global.sessions)) {
    try {
      if (
        JSON.stringify(sessionsCopy[key]) ===
        JSON.stringify(global.sessions[key])
      ) {
        logMessage("Killing stagnant worker #" + key + ".");
        killWorker(key);
      }
    } catch {}
  }
  sessionsCopy = JSON.parse(JSON.stringify(global.sessions));
}

async function main() {
  if (DASH) {
    startDashboard();
    setInterval(dashClock, 1_000);
  }
  setInterval(memClock, 10_000);

  if (!fs.existsSync("data/")) {
    fs.mkdirSync("data/");
  }

  // sign in and collect the list of subjects

  if (INITIAL_LOGIN) {
    const { initialPage, initialBrowser } = await startInitialBrowser();
    logMessage("logged in");
    global.subjectsToScrape = await getListOfSubjectsToScrape(initialPage);
    initialBrowser.close();
  } else {
    global.subjectsToScrape = await getListOfSubjectsToScrape();
  }
  // spawn new workers
  await wipeChromeWorkerData();
  global.sessions = {};
  global.browsers = {};

  if (global.DEBUG) {
    giveMeANewWorker();
  } else {
    for (var i = 0; i < START_WORKERS; i++) {
      giveMeANewWorker();
    }
  }
}

main();
