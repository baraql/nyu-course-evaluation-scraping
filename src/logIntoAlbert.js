const { NYU_USERNAME, NYU_PASSWORD } = require("./secrets.js");

async function logIntoAlbert(page) {
  await page.goto("http://albert.nyu.edu/albert_index.html");

  // return if logged in
  var loggedIn = await waitForLogin(page);
  if (loggedIn) {
    return;
  }

  var retries = 3;
  do {
    await page.getByRole("link", { name: "Sign in to Albert" }).click();

    // return if logged in
    loggedIn = await waitForLogin(page);
    if (loggedIn) {
      return;
    }

    await page.getByLabel("NetID (e.g., aqe123)").fill(NYU_USERNAME);
    await page.getByLabel("Password").fill(NYU_PASSWORD);
    await page.getByRole("button", { name: "Login" }).click();

    // return if logged in
    loggedIn = await waitForLogin(page);
    if (loggedIn) {
      return;
    }

    retries -= 1;
  } while (retries > 0);
  exit(1);
}

async function waitForLogin(page) {
  let loggedIn = false;

  const waitForURL1 = page
    .waitForFunction(() =>
      window.location.href.includes("IS_SSS_TAB&jsconfig=IS_ED_SSS_SUMMARYLnk")
    )
    .then(() => {
      loggedIn = true;
    });

  const waitForURL2 = page
    .waitForFunction(
      () =>
        window.location.href.includes(
          "shibboleth.nyu.edu/idp/profile/SAML2/Redirect/SSO"
        ) ||
        window.location.href.includes(
          "https://albert.nyu.edu/albert_index.html"
        )
    )
    .then(() => {
      loggedIn = false;
    });
  try {
    await Promise.race([waitForURL1, waitForURL2]);
  } catch (error) {
    console.log(error);
    console.trace();
  }
  return loggedIn;
}

module.exports = { logIntoAlbert };
