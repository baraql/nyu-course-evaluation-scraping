const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { scrapeSubject } = require("./scrapeSubject.js");

async function scrapeEvaluation(page, workerId, subjectToScrape) {
  const frame = await page.frameLocator('iframe[name="lbFrameContent"]');
  // logMessage("Step 1");

  // get list of all terms
  const termsCombobox = frame.getByRole("combobox", {
    name: "*1. Select a Term (required) :",
  });
  const schoolsCombobox = frame.getByRole("combobox", {
    name: "*2. Select a School (required):",
  });
  const subjectsCombobox = frame.getByRole("combobox", {
    name: "*3. Select a Subject (required):",
  });

  var coursesResponse = waitForAlbertResponse(page);
  await termsCombobox.selectOption(subjectToScrape.term);
  await coursesResponse;
  // logMessage("Step 2");
  coursesResponse = waitForAlbertResponse(page);
  await schoolsCombobox.selectOption(subjectToScrape.school);
  await coursesResponse;
  // logMessage("Step 3");
  coursesResponse = waitForAlbertResponse(page);
  await subjectsCombobox.selectOption(subjectToScrape.subject);
  await coursesResponse;
  // logMessage("Step 4");

  await frame
    .getByRole("button", {
      name: "Click to Search Published Course Evaluation Results",
    })
    .click();
  // logMessage("Step 5");
  await scrapeSubject(
    page,
    subjectToScrape.term,
    subjectToScrape.school,
    subjectToScrape.subject,
    workerId
  );
  // logMessage("Step 6");
  // await waitForAlbertResponse(page);
  // logMessage("Step 7");
}

module.exports = { scrapeEvaluation };
