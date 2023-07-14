const { spawnWorker } = require("./worker.js");

function giveMeANewWorker() {
  const zKey = Object.keys(global.sessions)[0];

  if (!zKey) {
    var largestKey = 0;
  } else {
    var largestKey = parseInt(zKey, 10);
    for (const key of Object.keys(global.sessions)) {
      if (parseInt(key, 10) > largestKey) {
        largestKey = parseInt(key, 10);
      }
    }
  }
  spawnWorker(largestKey + 1);
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

  killWorker(workerIdToKill);
}

function killWorker(id) {
  // global.sessions[id].shouldCancel = true;
  try {
    global.browsers[id].close();

    delete global.browsers[id];
    delete global.sessions[id];

    if (Object.keys(global.sessions).length == 0) {
      giveMeANewWorker();
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = { giveMeANewWorker, killAWorker, killWorker };
