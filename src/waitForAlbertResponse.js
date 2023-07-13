function waitForAlbertResponse(page) {
  // const { page } = session;

  const timeout = 2147483647;
  return page.waitForResponse(
    (response) => response.url().includes("NYU_SR.NYU_CEV_PUB_RESULT"),
    { timeout }
  );
}

module.exports = { waitForAlbertResponse };
