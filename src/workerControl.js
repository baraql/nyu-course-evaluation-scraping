const { spawnWorker } = require("./worker.js");

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
  // logMessage(
  //   `worker: ${workerIdToKill}` +
  //     JSON.stringify(global.sessions[workerIdToKill])
  // );
  logMessage(`Killing worker #${workerIdToKill}.`);

  killWorker(workerIdToKill);
}

function killWorker(id) {
  global.sessions[id].shouldCancel = true;
  global.browsers[id].close();

  if (Object.keys(global.sessions).length == 0) {
    giveMeANewWorker();
  }
}

module.exports = { giveMeANewWorker, killAWorker, killWorker };
