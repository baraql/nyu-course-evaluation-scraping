const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");

async function scrapeCourse(session) {
  const { page } = session;
  const frame = page.frameLocator('iframe[name="lbFrameContent"]');

  const data = {
    metadata: {},
    questionSections: [],
  };

  const { metadata, questionSections } = data;

  // scrape metadata
  const metadataFields = await frame.locator(".psc_has_value").all();
  for (const field of metadataFields) {
    const label = await field.locator(".ps_box-label").innerText();
    const value = await field.locator(".ps_box-value").innerText();
    metadata[label.slice(0, -1)] = value;
  }

  // console.log(false, `Scraping course: ${metadata["Class Description"]}`);
  //   assert(!strictMode || metadata["Class Description"] !== undefined);
  const sections = await frame.locator(".ps_box-scrollarea-row").all();
  console.log(
    "Scraper #" +
      session.termNumber +
      " is scraping " +
      session.term +
      "____" +
      session.school +
      `(${session.schoolN + 1}/${session.schoolT})____` +
      session.subject +
      `(${session.subjectN + 1}/${session.subjectT})____` +
      `(${session.courseN + 1}/${session.courseT})____ (` +
      sections.length +
      " sections)"
  );
  // console.log(true, `${sections.length} sections of questions`);
  for (const section of sections) {
    // some sections can be empty! e.g. Fall 2022, ENGR-UH 1000 LAB4
    if ((await section.innerHTML()) === "") continue;

    const sectionLink = section.getByRole("link");
    const title = (await sectionLink.innerText()).slice(2); // chop off leading "+"

    const questionResponse = waitForAlbertResponse(session.page);
    await sectionLink.click();
    await questionResponse;

    // wait for questions to pop up
    await section.getByRole("table").waitFor();

    // const questionSection = {
    //   title,
    //   questions,
    // };
    // const { questions: questionData } = questionSection;
    var questionSection = [];

    const questions = await section.getByRole("row").all();
    // console.log(true, `${questions.length} questions`);
    // assert(!strictMode || questions.length > 0);

    for (const questionLocator of questions) {
      const question = await questionLocator
        .locator(".psc_has_value > .ps_box-value")
        .first()
        .innerText();
      const average = parseFloat(
        await questionLocator
          .locator(".psc_has_value > .ps_box-value")
          .nth(1)
          .innerText()
      );
      // console.log(true, question, average);
      //   assert(!strictMode || !Number.isNaN(average));
      questionSection.push({ question, average });
    }

    questionSections.push(questionSection);
  }

  return data;
}

module.exports = { scrapeCourse };
