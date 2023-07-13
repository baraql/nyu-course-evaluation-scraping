const { getComboboxOptions } = require("./getComboboxOptions.js");
const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { scrapeSubject } = require("./scrapeSubject.js");

async function scrapeSchool(session) {
  const { page } = session;
  const frame = page.frameLocator('iframe[name="lbFrameContent"]');

  // get list of all schools in current term
  const subjectsCombobox = frame.getByRole("combobox", {
    name: "*3. Select a Subject (required):",
  });
  const subjects = await getComboboxOptions(subjectsCombobox);
  // console.log(false, `${subjects.length} subjects: ${subjects}`);
  //   assert(!strictMode || subjects.length > 0);

  // scrape each subject
  for (const subject of subjects) {
    // select term
    const response = waitForAlbertResponse(session.page);
    await subjectsCombobox.selectOption(subject); // TODO: sometimes fails
    await response;
    session.subject = subject;

    // console.log(false, `Scraping subject: ${subject}`);
    await scrapeSubject(session);
  }
}

module.exports = { scrapeSchool };
