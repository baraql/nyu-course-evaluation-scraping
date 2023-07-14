const { getComboboxOptions } = require("./getComboboxOptions.js");
const { openEvaluations } = require("./openEvaluations.js");
const fs = require("fs");
const { promisify } = require("util");

const subjectCachePath = "cache/subjectsCache.json";
async function getListOfSubjectsToScrape(initialPage) {
  const subjects = await readSubjectsCached(initialPage);
  global.totalToScrape = subjects.length;
  return skipFromQueue(subjects);
}

async function readSubjectsCached(initialPage) {
  try {
    const readFileAsync = promisify(fs.readFile);
    const statAsync = promisify(fs.stat);

    const stats = await statAsync(subjectCachePath);

    logMessage("File exists.");
    logMessage("File size:", stats.size);
    logMessage("Last modified:", stats.mtime);

    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    if (stats.mtime > threeMonthsAgo && stats.mtime < currentDate) {
      logMessage("Using subject cache...");
      const fileContents = await readFileAsync(subjectCachePath, "utf-8");
      const subjects = JSON.parse(fileContents);
      return subjects;
    } else {
      logMessage("File was not modified within the last 3 months.");
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      logMessage("File does not exist.");
    } else {
      console.error("An error occurred while checking the file:", err);
    }
  }
  // If we get here there is no cache :(
  return await collectAndCacheData(initialPage);
}

async function collectAndCacheData(page) {
  openEvaluations(page);
  const jsonObject = await collectAvailableSubjects(page);
  const jsonString = JSON.stringify(jsonObject, null, 2);
  const writeFileAsync = promisify(fs.writeFile);

  try {
    await writeFileAsync(subjectCachePath, jsonString);
    logMessage("File has been successfully written.");
  } catch (err) {
    console.error("An error occurred while writing the file:", err);
    exit(1);
  }
  return jsonObject;
}

async function collectAvailableSubjects(page) {
  collectedSubjects = [];
  const frame = await page.frameLocator('iframe[name="lbFrameContent"]');

  // Iterate through terms
  const termsCombobox = frame.getByRole("combobox", {
    name: "*1. Select a Term (required) :",
  });
  const terms = await getComboboxOptions(termsCombobox);
  for (const term of terms) {
    await termsCombobox.selectOption(term);
    const schoolsCombobox = frame.getByRole("combobox", {
      name: "*2. Select a School (required):",
    });
    const schools = await getComboboxOptions(schoolsCombobox);
    for (const school of schools) {
      if (school === "GLOB") {
        continue;
      }
      await schoolsCombobox.selectOption(school);

      const subjectsCombobox = frame.getByRole("combobox", {
        name: "*3. Select a Subject (required):",
      });
      const subjects = await getComboboxOptions(subjectsCombobox);
      for (const subject of subjects) {
        collectedSubjects.push({
          term: term,
          school: school,
          subject: subject,
        });
      }
    }
  }
  return collectedSubjects;
}

function skipFromQueue(subjects) {
  global.totalSaved = 0;
  for (var i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const path = `data/${subject.term}_${subject.school}_${subject.subject}.json`;
    // we can skip
    if (fs.existsSync(path)) {
      // remove it from array
      global.totalSaved = global.totalSaved + 1;

      subjects.splice(i, 1);
      i -= 1;
    }
  }

  return subjects;
}

module.exports = { getListOfSubjectsToScrape };
