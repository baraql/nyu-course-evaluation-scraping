const fs = require("fs");
const os = require("os");

const { startInitialBrowser } = require("./startInitialBrowser.js");
const { getListOfSubjectsToScrape } = require("./getListOfSubjectsToScrape.js");
const { spawnWorker } = require("./worker.js");
const { wipeChromeWorkerData } = require("./chromeWorkerData.js");
const { startDashboard, updateSessionVariables } = require("./dashboard.js");

const INITIAL_LOGIN = false;
const KILL_THRESHOLD = 100 * 1024 * 1024; // 500MB in bytes
const SPAWN_THRESHOLD = 300 * 1024 * 1024; // 750MB in bytes
global.DEBUG = false;

function dashClock() {
  updateSessionVariables(os.freemem(), os.totalmem());
}

var killOnNext = false;
var startOnNext = false;
function memClock() {
  const freeMemory = os.freemem();
  if (freeMemory < KILL_THRESHOLD) {
    // kill a worker
    if (killOnNext) {
      killAWorker();
    } else {
      killOnNext = true;
    }
    killOnNext = false;
  } else if (freeMemory > SPAWN_THRESHOLD && !global.DEBUG) {
    // spawn a worker
    if (startOnNext) {
      giveMeANewWorker();
    } else {
      startOnNext = true;
    }
    startOnNext = false;
  }
}

async function main() {
  startDashboard();
  setInterval(dashClock, 1_000);
  setInterval(memClock, 30_000);

  if (!fs.existsSync("data/")) {
    fs.mkdirSync("data/");
  }

  // sign in and collect the list of subjects

  if (INITIAL_LOGIN) {
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

  if (global.DEBUG) {
    giveMeANewWorker();
  } else {
    for (var i = 0; i < 3; i++) {
      giveMeANewWorker();
    }
  }
}

function giveMeANewWorker() {
  const workerId = Object.keys(global.sessions).length;
  spawnWorker(workerId);
}

function killAWorker() {
  const workerIds = Object.keys(global.sessions);

  var lowestN = 0;
  var workerIdToKill = 0;

  for (const workerId of workerIds) {
    const courseN = global.sessions[workerId].courseN;

    if (courseN < lowestN) {
      lowestN = courseN;
      workerIdToKill = workerId;
    }
  }
  // console.log(
  //   `worker: ${workerIdToKill}` +
  //     JSON.stringify(global.sessions[workerIdToKill])
  // );
  console.log(`Killing worker #${workerIdToKill}.`);

  global.sessions[workerIdToKill].shouldCancel = true;
}

main();
