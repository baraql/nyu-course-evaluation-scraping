const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { scrapeCourse } = require("./scrapeCourse.js");
const { saveData } = require("./saveData.js");
const fs = require("fs");

async function scrapeSubject(page, term, school, subject, workerId) {
  const frame = page.frameLocator('iframe[name="lbFrameContent"]');

  const path = `data/${term}_${school}_${subject}.json`;

  // we can skip
  if (fs.existsSync(path)) {
    console.log(
      `Scraper #${workerId} is skipping ${term}_${school}_${subject}`
    );
    return;
  }

  const data = {
    name: subject,
    coursesData: [],
  };

  const { coursesData } = data;

  // if this element exists, we are in courses page
  await frame.getByText("Filter Results By:").waitFor();
  const courses = await frame.locator(".ps_grid-row").all();
  // console.log(false, `${courses.length} courses`);
  if (courses.length === 0) {
    try {
      // await frame.getByRole("button", { name: "OK" }).click();
      const exitCoursesResponse = waitForAlbertResponse(page);
      await frame
        .getByRole("link", { name: "Return to Term/School/Subject Selection" })
        .first()
        .click();
      await exitCoursesResponse;
      saveData(path, data);
      return;
    } catch (err) {
      // if (!(err instanceof errors.TimeoutError)) {
      throw err;
      // }
    }
  } else {
    global.sessions[workerId]["courseT"] = courses.length;
    // scrape each course
    for (var i = 0; i < courses.length; i++) {
      const course = courses[i];
      global.sessions[workerId]["courseN"] = i + 1;
      if (global.sessions[workerId].shouldCancel) {
        throw "CANCEL_WORKER";
      }
      // click into evaluations page

      const evaluationsResponse = waitForAlbertResponse(page);
      await course
        .getByRole("button", { name: "Evaluation Results for" })
        .click();
      await evaluationsResponse;

      // if this element exists, we are in evaluations data page
      await frame.getByText("Note: Score range is 1 - 5").waitFor();
      coursesData.push(await scrapeCourse(workerId, page));

      // exit evaluations page
      const exitEvaluationsResponse = waitForAlbertResponse(page);
      await frame
        .getByRole("link", { name: "> Return to Class List" })
        .first()
        .click();
      await exitEvaluationsResponse;
    }
  }

  // exit out of courses page
  const exitCoursesResponse = waitForAlbertResponse(page);
  await frame
    .getByRole("link", { name: "Return to Term/School/Subject Selection" })
    .first()
    .click();
  await exitCoursesResponse;

  // save scraped data
  saveData(path, data);
}

module.exports = { scrapeSubject };
