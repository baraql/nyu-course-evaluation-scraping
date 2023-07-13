const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { scrapeCourse } = require("./scrapeCourse.js");
const { saveData } = require("./saveData.js");
const fs = require("fs");

async function scrapeSubject(session) {
  const { term, school, subject } = session;
  const { page } = session;
  const frame = page.frameLocator('iframe[name="lbFrameContent"]');

  const path = `data/${term}_${school}_${subject}.json`;

  // we can skip
  if (fs.existsSync(path)) {
    console.log(
      `Scraper #${session.termNumber} is skipping ${term}_${school}_${subject}`
    );
    return;
  }

  const data = {
    name: subject,
    coursesData: [],
  };

  const { coursesData } = data;

  // click into courses page
  const coursesResponse = waitForAlbertResponse(session.page);
  await frame
    .getByRole("button", {
      name: "Click to Search Published Course Evaluation Results",
    })
    .click();
  await coursesResponse;

  // if this element exists, we are in courses page
  await frame.getByText("Filter Results By:").waitFor();
  const courses = await frame.locator(".ps_grid-row").all();
  // console.log(false, `${courses.length} courses`);
  if (courses.length === 0) {
    try {
      await frame.getByRole("button", { name: "OK" }).click();
    } catch (err) {
      if (!(err instanceof errors.TimeoutError)) {
        throw err;
      }
    }
  } else {
    session.courseT = courses.length;
    // scrape each course
    for (var i = 0; i < courses.length; i++) {
      const course = courses[i];
      session.courseN = courses.length;
      // click into evaluations page
      const evaluationsResponse = waitForAlbertResponse(session.page);
      await course
        .getByRole("button", { name: "Evaluation Results for" })
        .click();
      await evaluationsResponse;

      // if this element exists, we are in evaluations data page
      await frame.getByText("Note: Score range is 1 - 5").waitFor();
      coursesData.push(await scrapeCourse(session));

      // exit evaluations page
      const exitEvaluationsResponse = waitForAlbertResponse(session.page);
      await frame
        .getByRole("link", { name: "> Return to Class List" })
        .first()
        .click();
      await exitEvaluationsResponse;
    }
  }

  // exit out of courses page
  const exitCoursesResponse = waitForAlbertResponse(session.page);
  await frame
    .getByRole("link", { name: "Return to Term/School/Subject Selection" })
    .first()
    .click();
  await exitCoursesResponse;

  // save scraped data
  await saveData(path, data);
}

module.exports = { scrapeSubject };
