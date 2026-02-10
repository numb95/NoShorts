const DEFAULT_SETTINGS = {
  shelves: true,
  links: true,
  tabs: true,
  searchFilters: true,
  players: true,
  channelShorts: true
};

const getStorage = () => {
  if (typeof chrome !== "undefined" && chrome.storage) {
    return chrome.storage.sync || chrome.storage.local;
  }
  if (typeof browser !== "undefined" && browser.storage) {
    return browser.storage.sync || browser.storage.local;
  }
  return null;
};

const storage = getStorage();

const setToggle = (id, value) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.checked = Boolean(value);
};

const readSettings = () =>
  new Promise((resolve) => {
    if (!storage) return resolve({ ...DEFAULT_SETTINGS });
    storage.get(DEFAULT_SETTINGS, (items) => {
      resolve(items || { ...DEFAULT_SETTINGS });
    });
  });

const writeSetting = (key, value) =>
  new Promise((resolve) => {
    if (!storage) return resolve();
    storage.set({ [key]: value }, () => resolve());
  });

document.addEventListener("DOMContentLoaded", async () => {
  const settings = await readSettings();
  Object.keys(DEFAULT_SETTINGS).forEach((key) => setToggle(key, settings[key]));

  Object.keys(DEFAULT_SETTINGS).forEach((key) => {
    const el = document.getElementById(key);
    if (!el) return;
    el.addEventListener("change", () => {
      writeSetting(key, el.checked);
    });
  });

  const versionEl = document.getElementById("version");
  if (versionEl) {
    const runtime = typeof chrome !== "undefined" ? chrome.runtime : browser?.runtime;
    const manifest = runtime?.getManifest?.();
    const version = manifest?.version_name || manifest?.version || "unknown";
    versionEl.textContent = version;
  }
});
