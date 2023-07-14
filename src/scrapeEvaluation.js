const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { scrapeSubject } = require("./scrapeSubject.js");

async function scrapeEvaluation(page, workerId, subjectToScrape) {
  const frame = await page.frameLocator('iframe[name="lbFrameContent"]');

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

  await termsCombobox.selectOption(subjectToScrape.term);
  await schoolsCombobox.selectOption(subjectToScrape.school);
  await subjectsCombobox.selectOption(subjectToScrape.subject);

  await frame
    .getByRole("button", {
      name: "Click to Search Published Course Evaluation Results",
    })
    .click();

  await scrapeSubject(
    page,
    subjectToScrape.term,
    subjectToScrape.school,
    subjectToScrape.subject,
    workerId
  );
  await waitForAlbertResponse(page);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { scrapeEvaluation };
