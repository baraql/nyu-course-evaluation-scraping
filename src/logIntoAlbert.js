async function logIntoAlbert(page, username, password) {
  await page.goto("http://albert.nyu.edu/albert_index.html");
  await page.getByRole("link", { name: "Sign in to Albert" }).click();
  await page.getByLabel("NetID (e.g., aqe123)").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
}

module.exports = { logIntoAlbert };
