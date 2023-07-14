const fs = require("fs");

function saveData(path, data) {
  if (fs.existsSync(path)) {
    console.log(`ERROR: saveData skipping ${term}_${school}_${subject}`);
    return;
  }
  fs.writeFileSync(path, JSON.stringify(data, undefined, 2) + "\n");
  global.totalSaved = global.totalSaved + 1;
  console.log(`Saved data to ${path}`);
}

module.exports = { saveData };
