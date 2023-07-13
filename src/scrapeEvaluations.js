export async function scrapeEvaluations(session) {
  const { page } = session;
  const frame = await page.frameLocator('iframe[name="lbFrameContent"]');

  // get list of all terms
  const termsCombobox = frame.getByRole("combobox", {
    name: "*1. Select a Term (required) :",
  });
  const terms = await getComboboxOptions(termsCombobox);
  console.log(false, `${terms.length} terms: ${terms}`);
  // assert(!strictMode || terms.length > 0);

  // scrape each term
  for (const term of terms) {
    // select term
    const response = waitForAlbertResponse(session);
    await termsCombobox.selectOption(term);
    await response;
    session.term = term;

    console.log(false, `Scraping term: ${term}`);
    await scrapeTerm(session);
  }
}
