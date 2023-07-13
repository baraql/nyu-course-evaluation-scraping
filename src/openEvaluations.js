const { waitForAlbertResponse } = require("./waitForAlbertResponse.js");

async function openEvaluations(page) {
  const response = waitForAlbertResponse(page);
  await page
    .getByRole("link", { name: "Evaluation Published Results" })
    .click();
  await response;
}

module.exports = { openEvaluations };
