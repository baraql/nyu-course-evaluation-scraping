const fs = require("fs");

function saveData(path, data) {
  if (!fs.existsSync("data/")) {
    fs.mkdirSync("data/");
  }
  fs.writeFileSync(path, JSON.stringify(data, undefined, 2) + "\n");
  console.log(true, `Saved data to ${path}`);
}

module.exports = { saveData };
