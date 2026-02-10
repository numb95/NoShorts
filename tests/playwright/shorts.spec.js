const { test, expect, chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const os = require("os");

const fixturePath = path.join(__dirname, "fixtures", "yt.html");
const html = fs.readFileSync(fixturePath, "utf8");

const extensionPath = path.resolve(__dirname, "..", "..");

async function launchWithExtension() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "noshorts-"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  const page = await context.newPage();

  await context.route("https://www.youtube.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: html
    });
  });

  return { context, page };
}

test("removes Shorts elements on YouTube", async () => {
  const { context, page } = await launchWithExtension();
  try {
  await page.goto("https://www.youtube.com/results");

  await page.waitForFunction(() => {
    const removed = [
      "ytd-rich-shelf-renderer",
      "#shorts-item",
      "#guide-shorts",
      "#tab-shorts",
      "#shorts-player",
      "#chip-shorts",
      "#channel-shorts"
    ].every((selector) => !document.querySelector(selector));

    const kept = [
      "#keep-item",
      "#chip-keep",
      "#channel-videos",
      "#keep-nonshorts"
    ].every((selector) => !!document.querySelector(selector));
    return removed && kept;
  });

  expect(await page.$("#keep-item")).not.toBeNull();
  expect(await page.$("#shorts-item")).toBeNull();
  expect(await page.$("#chip-shorts")).toBeNull();
  expect(await page.$("#channel-shorts")).toBeNull();
  expect(await page.$("#chip-keep")).not.toBeNull();
  expect(await page.$("#channel-videos")).not.toBeNull();
  expect(await page.$("#keep-nonshorts")).not.toBeNull();
  } finally {
    await context.close();
  }
});
