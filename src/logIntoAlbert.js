async function logIntoAlbert(page, username, password) {
  var loop = false;
  await page.goto("http://albert.nyu.edu/albert_index.html");
  do {
    await page.getByRole("link", { name: "Sign in to Albert" }).click();
    await page.getByLabel("NetID (e.g., aqe123)").fill(username);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Login" }).click();

    try {
      await withTimeout(
        page.getByRole("link", { name: "Sign in to Albert" }),
        5000
      );
      loop = true;
    } catch (error) {
      loop = false;
    }
  } while (loop);
}

function withTimeout(promise, timeout) {
  // Create a timeout promise that rejects after the specified time
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("Operation timed out"));
    }, timeout);
  });

  // Use Promise.race() to wait for the first promise to resolve or reject
  return Promise.race([promise, timeoutPromise]);
}

module.exports = { logIntoAlbert };
