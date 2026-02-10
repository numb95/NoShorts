(() => {
  const ANCESTOR_SELECTORS = [
    "ytd-rich-item-renderer",
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
    "ytd-playlist-video-renderer",
    "ytd-reel-shelf-renderer",
    "ytd-reel-item-renderer",
    "ytd-reel-video-renderer",
    "ytd-shorts",
    "ytd-shorts-shelf-renderer",
    "ytd-shorts-row-renderer"
  ];

  const isShortsText = (text) => /shorts/i.test(text || "");

  const removeNode = (node) => {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  };

  const removeShortsShelves = (root) => {
    const shelves = root.querySelectorAll(
      "ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, ytd-shorts-shelf-renderer"
    );
    shelves.forEach((shelf) => {
      const aria = shelf.getAttribute("aria-label") || "";
      const header =
        shelf.querySelector("#title, h2, yt-formatted-string") || shelf;
      const text = `${aria} ${header.textContent || ""}`.trim();
      if (isShortsText(text)) {
        removeNode(shelf);
      }
    });
  };

  const removeShortsLinks = (root) => {
    const links = root.querySelectorAll(
      'a[href^="/shorts/"], a[href^="https://www.youtube.com/shorts/"]'
    );
    links.forEach((link) => {
      const ancestor = link.closest(ANCESTOR_SELECTORS.join(","));
      if (ancestor) {
        removeNode(ancestor);
        return;
      }
      removeNode(link);
    });

    const guideLinks = root.querySelectorAll(
      'a[title="Shorts"], ytd-guide-entry-renderer a[href="/shorts"], ytd-mini-guide-entry-renderer a[href="/shorts"]'
    );
    guideLinks.forEach((link) => removeNode(link.closest("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer") || link));
  };

  const removeShortsTabs = (root) => {
    const tabLinks = root.querySelectorAll('a[href$="/shorts"]');
    tabLinks.forEach((link) => {
      const tab = link.closest("tp-yt-paper-tab, ytd-tabbed-page-header");
      removeNode(tab || link);
    });
  };

  const removeShortsSearchFilters = (root) => {
    if ((window.location.pathname || "") !== "/results") return;

    const searchFilterContainers = [
      "ytd-search-sub-menu-renderer",
      "ytd-search-header-renderer",
      "ytd-search-filter-group-renderer"
    ];
    const chipSelectors = [
      "ytd-search-sub-menu-renderer ytd-search-filter-renderer",
      ...searchFilterContainers.map(
        (container) => `${container} ytd-chip-cloud-chip-renderer`
      ),
      ...searchFilterContainers.map(
        (container) => `${container} yt-chip-cloud-chip-renderer`
      ),
      ...searchFilterContainers.map(
        (container) => `${container} tp-yt-paper-button`
      ),
      ...searchFilterContainers.map(
        (container) => `${container} tp-yt-paper-tab`
      ),
      ...searchFilterContainers.map((container) => `${container} yt-tab-shape`)
    ];
    const chips = root.querySelectorAll(chipSelectors.join(","));
    chips.forEach((chip) => {
      const attrs =
        (chip.getAttribute("aria-label") || "") +
        " " +
        (chip.getAttribute("title") || "") +
        " " +
        (chip.getAttribute("label") || "") +
        " " +
        (chip.getAttribute("tab-title") || "");
      const text = `${attrs} ${chip.textContent || ""}`.trim();
      if (isShortsText(text)) {
        const container = chip.closest(
          "ytd-search-filter-renderer, ytd-chip-cloud-chip-renderer, yt-chip-cloud-chip-renderer, tp-yt-paper-button, yt-tab-shape"
        );
        removeNode(container || chip);
      }
    });
  };

  const removeShortsPlayers = (root) => {
    const shortsContainers = root.querySelectorAll(
      "ytd-shorts, ytd-reel-video-renderer"
    );
    shortsContainers.forEach(removeNode);
  };

  const isChannelPage = () => {
    const path = window.location.pathname || "";
    return /^\/(@|channel\/|c\/|user\/)/.test(path);
  };

  const removeChannelShorts = (root) => {
    if (!isChannelPage()) return;

    const channelTabLinks = root.querySelectorAll(
      "ytd-channel-sub-menu-renderer a[href*=\"/shorts\"], " +
        "ytd-c4-tabbed-header-renderer a[href*=\"/shorts\"], " +
        "ytd-channel-sub-menu-renderer tp-yt-paper-tab a[href*=\"/shorts\"], " +
        "ytd-c4-tabbed-header-renderer tp-yt-paper-tab a[href*=\"/shorts\"], " +
        "ytd-channel-sub-menu-renderer yt-tab-shape a[href*=\"/shorts\"], " +
        "ytd-c4-tabbed-header-renderer yt-tab-shape a[href*=\"/shorts\"]"
    );
    channelTabLinks.forEach((link) => {
      const tab = link.closest(
        "tp-yt-paper-tab, ytd-channel-tab-renderer, yt-tab-shape"
      );
      removeNode(tab || link);
    });

    const channelTabs = root.querySelectorAll("yt-tab-shape");
    channelTabs.forEach((tab) => {
      const title = tab.getAttribute("tab-title") || "";
      const text = (tab.textContent || "").trim();
      if (isShortsText(`${title} ${text}`)) {
        removeNode(tab);
      }
    });

    const channelChips = root.querySelectorAll(
      "ytd-c4-tabbed-header-renderer ytd-chip-cloud-chip-renderer, " +
        "ytd-c4-tabbed-header-renderer yt-chip-cloud-chip-renderer"
    );
    channelChips.forEach((chip) => {
      const text = (chip.textContent || "").trim();
      const aria = chip.getAttribute("aria-label") || "";
      if (isShortsText(`${aria} ${text}`)) {
        removeNode(chip);
      }
    });

    const channelShelves = root.querySelectorAll(
      "ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, ytd-shorts-shelf-renderer"
    );
    channelShelves.forEach((shelf) => {
      const aria = shelf.getAttribute("aria-label") || "";
      const header =
        shelf.querySelector("#title, h2, yt-formatted-string") || shelf;
      const text = `${aria} ${header.textContent || ""}`.trim();
      if (isShortsText(text)) {
        removeNode(shelf);
      }
    });
  };

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

  const readSettings = async () => {
    const storage = getStorage();
    if (!storage) return { ...DEFAULT_SETTINGS };
    return new Promise((resolve) => {
      storage.get(DEFAULT_SETTINGS, (items) => {
        resolve(items || { ...DEFAULT_SETTINGS });
      });
    });
  };

  const sweep = (root = document, settings = DEFAULT_SETTINGS) => {
    if (settings.shelves) removeShortsShelves(root);
    if (settings.links) removeShortsLinks(root);
    if (settings.tabs) removeShortsTabs(root);
    if (settings.searchFilters) removeShortsSearchFilters(root);
    if (settings.players) removeShortsPlayers(root);
    if (settings.channelShorts) removeChannelShorts(root);
  };

  let scheduled = false;
  const pendingNodes = new Set();
  const scheduleSweep = () => {
    if (scheduled) return;
    scheduled = true;
    const run = () => {
      scheduled = false;
      if (!currentSettings) return;
      const nodes = Array.from(pendingNodes);
      pendingNodes.clear();
      if (nodes.length === 0) {
        sweep(document, currentSettings);
        return;
      }
      nodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          sweep(node, currentSettings);
        }
      });
    };
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(run, { timeout: 200 });
    } else {
      setTimeout(run, 100);
    }
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          pendingNodes.add(node);
        }
      }
    }
    scheduleSweep();
  });

  let currentSettings = null;

  const start = async () => {
    currentSettings = await readSettings();
    sweep(document, currentSettings);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    const storage = getStorage();
    if (storage && storage.onChanged) {
      storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== "sync" && areaName !== "local") return;
        const next = { ...currentSettings };
        Object.keys(DEFAULT_SETTINGS).forEach((key) => {
          if (changes[key]) {
            next[key] = changes[key].newValue;
          }
        });
        currentSettings = next;
        sweep(document, currentSettings);
      });
    }
  };

  const createShortsRemover = () => ({
    sweep,
    start,
    observer,
    _private: {
      isShortsText,
      removeNode,
      removeShortsShelves,
      removeShortsLinks,
      removeShortsTabs,
      removeShortsSearchFilters,
      removeShortsPlayers,
      removeChannelShorts
    }
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createShortsRemover };
    return;
  }

  const { start: run } = createShortsRemover();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
