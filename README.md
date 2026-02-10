# NoShorts

NoShorts removes YouTube Shorts elements across YouTube, including shelves, tiles, tabs, search filters, and Shorts player pages. Customize what gets removed from the extension popup.

## Store Description (Short)
Hide YouTube Shorts across YouTube. Remove Shorts shelves, tiles, tabs, search filters, and Shorts player pages. Fully configurable with simple toggles.

## Store Description (Long)
NoShorts is a lightweight extension that removes YouTube Shorts elements so you can focus on regular videos. It deletes Shorts content from:
- Home shelves and carousels
- Shorts tiles and links
- Shorts tabs and sidebar entry
- Search filter chips
- Shorts player pages

Everything is configurable from the extension popup, and changes apply immediately.

## Privacy
NoShorts does not collect, store, or transmit any personal data. All settings are stored locally in your browser.

## How It Works
The extension runs a content script on `www.youtube.com` and `m.youtube.com` and removes Shorts-related DOM nodes. It updates automatically as YouTube loads more content.

## Install (Local)
### Chrome
1. Open `chrome://extensions/`.
2. Enable `Developer mode`.
3. Click `Load unpacked` and select this folder.

### Firefox
1. Open `about:debugging#/runtime/this-firefox`.
2. Click `Load Temporary Add-on...`.
3. Select `manifest.json` from this folder.

## Build
- `make build` produces `dist/noshorts-1.0.0.zip`.

## Notes
- If YouTube changes markup, selectors may need updates in `content.js`.
