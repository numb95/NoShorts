const { createShortsRemover } = require("../../content.js");

const setupDom = (html) => {
  document.body.innerHTML = html;
};

const runSweep = (settings) => {
  const remover = createShortsRemover();
  remover.sweep(document, settings);
  return remover;
};

describe("NoShorts content script", () => {
  test("removes Shorts shelf by label", () => {
    setupDom(`
      <ytd-rich-shelf-renderer aria-label="Shorts">
        <div id="title">Shorts</div>
      </ytd-rich-shelf-renderer>
      <div id="keep">Keep</div>
    `);

    runSweep();

    expect(document.querySelector("ytd-rich-shelf-renderer")).toBeNull();
    expect(document.querySelector("#keep")).not.toBeNull();
  });

  test("removes items that link to /shorts", () => {
    setupDom(`
      <ytd-video-renderer id="a">
        <a href="/shorts/abc">Shorts Link</a>
      </ytd-video-renderer>
      <ytd-video-renderer id="b">
        <a href="/watch?v=123">Watch</a>
      </ytd-video-renderer>
    `);

    runSweep();

    expect(document.querySelector("#a")).toBeNull();
    expect(document.querySelector("#b")).not.toBeNull();
  });

  test("removes Shorts guide entry", () => {
    setupDom(`
      <ytd-guide-entry-renderer id="guide">
        <a href="/shorts" title="Shorts">Shorts</a>
      </ytd-guide-entry-renderer>
      <ytd-guide-entry-renderer id="guide-keep">
        <a href="/feed/subscriptions" title="Subscriptions">Subs</a>
      </ytd-guide-entry-renderer>
    `);

    runSweep();

    expect(document.querySelector("#guide")).toBeNull();
    expect(document.querySelector("#guide-keep")).not.toBeNull();
  });

  test("removes Shorts tab links", () => {
    setupDom(`
      <tp-yt-paper-tab id="tab">
        <a href="/shorts">Shorts</a>
      </tp-yt-paper-tab>
      <tp-yt-paper-tab id="tab-keep">
        <a href="/videos">Videos</a>
      </tp-yt-paper-tab>
    `);

    runSweep();

    expect(document.querySelector("#tab")).toBeNull();
    expect(document.querySelector("#tab-keep")).not.toBeNull();
  });

  test("removes Shorts search filter chip", () => {
    history.pushState({}, "", "/results");
    setupDom(`
      <ytd-search-sub-menu-renderer>
        <ytd-chip-cloud-chip-renderer id="chip-shorts" aria-label="Shorts">Shorts</ytd-chip-cloud-chip-renderer>
        <ytd-chip-cloud-chip-renderer id="chip-keep">All</ytd-chip-cloud-chip-renderer>
        <yt-tab-shape id="tab-shorts" tab-title="Shorts">
          <div>Shorts</div>
        </yt-tab-shape>
      </ytd-search-sub-menu-renderer>
    `);

    runSweep();

    expect(document.querySelector("#chip-shorts")).toBeNull();
    expect(document.querySelector("#chip-keep")).not.toBeNull();
    expect(document.querySelector("#tab-shorts")).toBeNull();
  });

  test("removes Shorts search filter chips in header containers", () => {
    history.pushState({}, "", "/results");
    setupDom(`
      <ytd-search-header-renderer>
        <yt-chip-cloud-chip-renderer id="chip-shorts-header" title="Shorts">Shorts</yt-chip-cloud-chip-renderer>
      </ytd-search-header-renderer>
      <ytd-search-filter-group-renderer>
        <tp-yt-paper-tab id="tab-shorts-header">Shorts</tp-yt-paper-tab>
      </ytd-search-filter-group-renderer>
      <ytd-search-filter-group-renderer>
        <yt-chip-cloud-chip-renderer id="chip-keep-header">All</yt-chip-cloud-chip-renderer>
      </ytd-search-filter-group-renderer>
    `);

    runSweep();

    expect(document.querySelector("#chip-shorts-header")).toBeNull();
    expect(document.querySelector("#tab-shorts-header")).toBeNull();
    expect(document.querySelector("#chip-keep-header")).not.toBeNull();
  });

  test("does not remove search filter chips outside results page", () => {
    history.pushState({}, "", "/watch");
    setupDom(`
      <ytd-search-sub-menu-renderer>
        <ytd-chip-cloud-chip-renderer id="chip-shorts" aria-label="Shorts">Shorts</ytd-chip-cloud-chip-renderer>
      </ytd-search-sub-menu-renderer>
    `);

    runSweep();

    expect(document.querySelector("#chip-shorts")).not.toBeNull();
  });

  test("removes Shorts player containers", () => {
    setupDom(`
      <ytd-shorts id="shorts-player"></ytd-shorts>
      <div id="keep"></div>
    `);

    runSweep();

    expect(document.querySelector("#shorts-player")).toBeNull();
    expect(document.querySelector("#keep")).not.toBeNull();
  });

  test("removes Shorts tab on channel pages when enabled", () => {
    history.pushState({}, "", "/@tester");
    setupDom(`
      <ytd-channel-sub-menu-renderer>
        <tp-yt-paper-tab id="tab-shorts">
          <a href="/@tester/shorts">Shorts</a>
        </tp-yt-paper-tab>
        <tp-yt-paper-tab id="tab-videos">
          <a href="/@tester/videos">Videos</a>
        </tp-yt-paper-tab>
      </ytd-channel-sub-menu-renderer>
      <ytd-c4-tabbed-header-renderer>
        <ytd-chip-cloud-chip-renderer id="chip-shorts" aria-label="Shorts">Shorts</ytd-chip-cloud-chip-renderer>
        <yt-tab-shape id="yt-tab-shorts" tab-title="Shorts">
          <div>Shorts</div>
        </yt-tab-shape>
      </ytd-c4-tabbed-header-renderer>
    `);

    runSweep({
      shelves: false,
      links: false,
      tabs: false,
      searchFilters: false,
      players: false,
      channelShorts: true
    });

    expect(document.querySelector("#tab-shorts")).toBeNull();
    expect(document.querySelector("#tab-videos")).not.toBeNull();
    expect(document.querySelector("#chip-shorts")).toBeNull();
    expect(document.querySelector("#yt-tab-shorts")).toBeNull();
  });

});
