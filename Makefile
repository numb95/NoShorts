EXT_NAME := noshorts
DIST_DIR := dist

.PHONY: install test test-unit test-smoke test-firefox firefox-run build build-release build-release-chrome firefox-unsigned firefox-signed clean playwright-install release-version package-dir

install:
	npm install

test: test-unit

test-unit:
	npm run test:unit

test-smoke: playwright-install
	npm run test:smoke

playwright-install:
	npm run playwright:install

test-firefox:
	npm run test:firefox

firefox-run:
	npm run firefox:run

build:
	node scripts/version.mjs
	@version=$$(node -e "console.log(require('./dist/manifest.json').version)") ; \
	mkdir -p $(DIST_DIR)
	zip -r $(DIST_DIR)/$(EXT_NAME)-$$version.zip \
		dist/manifest.json \
		content.js \
		icons \
		popup.html \
		popup.css \
		popup.js \
		README.md

build-release: release-version build-release-chrome firefox-unsigned firefox-signed

build-release-chrome: release-version
	@version=$$(node -e "console.log(require('./dist/manifest.json').version)") ; \
	mkdir -p $(DIST_DIR)
	zip -r $(DIST_DIR)/$(EXT_NAME)-$$version-chrome.zip \
		dist/manifest.json \
		content.js \
		icons \
		popup.html \
		popup.css \
		popup.js \
		README.md

release-version:
	node scripts/version.mjs --release

package-dir: release-version
	rm -rf $(DIST_DIR)/package
	mkdir -p $(DIST_DIR)/package
	cp dist/manifest.json $(DIST_DIR)/package/manifest.json
	cp content.js $(DIST_DIR)/package/content.js
	cp popup.html $(DIST_DIR)/package/popup.html
	cp popup.css $(DIST_DIR)/package/popup.css
	cp popup.js $(DIST_DIR)/package/popup.js
	cp README.md $(DIST_DIR)/package/README.md
	cp -R icons $(DIST_DIR)/package/icons

firefox-unsigned: package-dir
	@version=$$(node -e "console.log(require('./dist/manifest.json').version)") ; \
	npx web-ext build --source-dir $(DIST_DIR)/package --artifacts-dir $(DIST_DIR) --overwrite-dest --filename $(EXT_NAME)-$$version-firefox-unsigned.xpi

firefox-signed: package-dir
	@version=$$(node -e "console.log(require('./dist/manifest.json').version)") ; \
	npx web-ext sign --source-dir $(DIST_DIR)/package --artifacts-dir $(DIST_DIR) --channel listed --filename $(EXT_NAME)-$$version-firefox-signed.xpi

clean:
	rm -rf $(DIST_DIR)
