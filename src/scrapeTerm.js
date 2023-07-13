const { getComboboxOptions } = require("./getComboboxOptions.js");
const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { scrapeSchool } = require("./scrapeSchool.js");
const assert = require("assert");

const strictMode = true;

async function scrapeTerm(session) {
  const { page } = session;
  const frame = page.frameLocator('iframe[name="lbFrameContent"]');

  // get list of all schools in current term
  const schoolsCombobox = frame.getByRole("combobox", {
    name: "*2. Select a School (required):",
  });
  const schools = await getComboboxOptions(schoolsCombobox);
  // console.log(false, `${schools.length} schools: ${schools}`);
  assert(!strictMode || schools.length > 0);
  session.schoolT = schools.length;
  // scrape each school

  for (var i = 0; i < schools.length; i++) {
    const school = schools[i];
    if (school === "GLOB") continue;
    session.schoolN = i;
    // select term
    const response = waitForAlbertResponse(session.page);
    await schoolsCombobox.selectOption(school);
    await response;
    session.school = school;

    // console.log(false, `Scraping school: ${school}`);
    await scrapeSchool(session);
  }
}

module.exports = { scrapeTerm };
