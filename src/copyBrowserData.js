const fse = require("fs-extra");
const path = require("path");

// Source folder (A)
const sourceFolder = "./user-data/";

// Destination folder (B)
const destinationParentFolder = "./user-data-many/";

for (let i = 0; i < 19; i++) {
  const destinationFolder = destinationParentFolder + i;

  try {
    fse.copySync(sourceFolder, destinationFolder, {
      overwrite: true | false,
    });
    console.log("success!");
  } catch (err) {
    console.error(err);
  }
}
