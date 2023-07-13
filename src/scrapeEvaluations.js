const { getComboboxOptions } = require("./getComboboxOptions.js");
const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");
const { scrapeTerm } = require("./scrapeTerm.js");

async function scrapeEvaluations(page, termNumber) {
  const frame = await page.frameLocator('iframe[name="lbFrameContent"]');

  // get list of all terms
  const termsCombobox = frame.getByRole("combobox", {
    name: "*1. Select a Term (required) :",
  });
  const terms = await getComboboxOptions(termsCombobox);
  console.log(false, `${terms.length} terms: ${terms}`);
  // assert(!strictMode || terms.length > 0);

  // scrape each term
  // for (const term of terms) {
  // select term
  const term = terms[termNumber];

  const response = waitForAlbertResponse(page);
  await termsCombobox.selectOption(term);
  await response;
  const session = { page: page };
  session.term = term;

  console.log(false, `Scraping term: ${term}`);
  await scrapeTerm(session);
  // }
}

module.exports = { scrapeEvaluations };
