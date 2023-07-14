const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

// Source folder (A)
const sourceFolder = "./cache/initial-chrome-data/";

// Destination folder (B)
const destinationParentFolder = "./cache/worker-chrome-data/";

function copyChromeWorkerData(workerId) {
  const destinationFolder = destinationParentFolder + workerId;

  try {
    fse.copySync(sourceFolder, destinationFolder, {
      overwrite: true | false,
    });
  } catch (err) {
    console.error(err);
  }
}

async function wipeChromeWorkerData() {
  try {
    await fse.emptyDir("./cache/worker-chrome-data");
    logMessage("Directory contents successfully wiped.");
  } catch (err) {
    console.error("An error occurred while wiping directory contents:", err);
  }
}

module.exports = { copyChromeWorkerData, wipeChromeWorkerData };
