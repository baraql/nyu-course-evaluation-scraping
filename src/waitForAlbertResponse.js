function waitForAlbertResponse(page) {
  // const { page } = session;

  const timeout = 300_000;
  return page.waitForResponse(
    (response) => response.url().includes("NYU_SR.NYU_CEV_PUB_RESULT"),
    { timeout }
  );
}
