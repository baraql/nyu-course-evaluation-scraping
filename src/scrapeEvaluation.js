const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { scrapeSubject } = require("./scrapeSubject.js");

async function scrapeEvaluation(page, workerId, subjectToScrape) {
  const frame = await page.frameLocator('iframe[name="lbFrameContent"]');
  // console.log("Step 1");

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
  // console.log("Step 2");
  coursesResponse = waitForAlbertResponse(page);
  await schoolsCombobox.selectOption(subjectToScrape.school);
  await coursesResponse;
  // console.log("Step 3");
  coursesResponse = waitForAlbertResponse(page);
  await subjectsCombobox.selectOption(subjectToScrape.subject);
  await coursesResponse;
  // console.log("Step 4");

  await frame
    .getByRole("button", {
      name: "Click to Search Published Course Evaluation Results",
    })
    .click();
  // console.log("Step 5");
  await scrapeSubject(
    page,
    subjectToScrape.term,
    subjectToScrape.school,
    subjectToScrape.subject,
    workerId
  );
  // console.log("Step 6");
  // await waitForAlbertResponse(page);
  // console.log("Step 7");
}

module.exports = { scrapeEvaluation };
