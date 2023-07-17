function wrappedWaiter(page) {
  // const { page } = session;
  try {
    const timeout = 2147483647;
    return page.waitForResponse(
      (response) => response.url().includes("NYU_SR.NYU_CEV_PUB_RESULT"),
      { timeout }
    );
  } catch (error) {
    console.log("waitForAlbert ERROR: " + error);
  }
}

async function waitForAlbertResponse() {
  try {
    await wrappedWaiter;
  } catch (error) {
    console.log(error);
    console.trace();
  }
}

module.exports = { waitForAlbertResponse };
