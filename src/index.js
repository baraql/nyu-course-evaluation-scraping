const fs = require("fs");
const os = require("os");

const { startInitialBrowser } = require("./startInitialBrowser.js");
const { getListOfSubjectsToScrape } = require("./getListOfSubjectsToScrape.js");
const { spawnWorker } = require("./worker.js");
const { wipeChromeWorkerData } = require("./chromeWorkerData.js");
const { startDashboard, updateSessionVariables } = require("./dashboard.js");

const INITIAL_LOGIN = false;
const KILL_THRESHOLD = 500 * 1024 * 1024; // 500MB in bytes
const SPAWN_THRESHOLD = 750 * 1024 * 1024; // 750MB in bytes

function dashClock() {
  updateSessionVariables(os.freemem(), os.totalmem());
}

function memClock() {
  const freeMemory = os.freemem();
  if (freeMemory < KILL_THRESHOLD) {
    // kill a worker
    killAWorker();
  } else if (freeMemory > SPAWN_THRESHOLD) {
    // spawn a worker
    giveMeANewWorker();
  }
}

async function main() {
  startDashboard();
  setInterval(dashClock, 1_000);
  setInterval(memClock, 10_000);

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

  for (var i = 0; i < 10; i++) {
    giveMeANewWorker();
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
  console.log(
    `worker: ${workerIdToKill}` +
      JSON.stringify(global.sessions[workerIdToKill])
  );

  global.sessions[workerIdToKill].shouldCancel = true;
}

main();
