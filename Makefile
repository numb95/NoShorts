EXT_NAME := noshorts
DIST_DIR := dist

.PHONY: install test test-unit test-smoke test-firefox firefox-run build build-release build-release-chrome firefox-unsigned firefox-signed clean playwright-install release-version lint-version dev-version package-dir

install:
	npm install

test:
	@echo "===== test-unit ====="
	@$(MAKE) test-unit
	@echo "===== test-smoke ====="
	@$(MAKE) test-smoke
	@echo "===== test-firefox ====="
	@$(MAKE) test-firefox

test-unit:
	npm run test:unit

test-smoke: playwright-install
	npm run test:smoke

playwright-install:
	@if [ "$$CI" = "true" ]; then \
		npx playwright install --with-deps chromium; \
	else \
		npx playwright install chromium; \
	fi

test-firefox: lint-version package-dir
	npx web-ext lint --source-dir $(DIST_DIR)/package

firefox-run:
	npm run firefox:run

build: dev-version package-dir
	@version=$$(node -e "const m=require('./dist/manifest.json'); console.log(m.version_name || m.version)"); \
	cd $(DIST_DIR)/package && zip -r ../$(EXT_NAME)-$$version.zip .

build-release: release-version build-release-chrome firefox-unsigned firefox-signed

build-release-chrome: release-version package-dir
	@version=$$(node -e "const m=require('./dist/manifest.json'); console.log(m.version_name || m.version)"); \
	cd $(DIST_DIR)/package && zip -r ../$(EXT_NAME)-$$version-chrome.zip .

release-version:
	node scripts/version.mjs --release

lint-version:
	node scripts/version.mjs --lint

dev-version:
	node scripts/version.mjs

package-dir:
	rm -rf $(DIST_DIR)/package
	mkdir -p $(DIST_DIR)/package
	cp dist/manifest.json $(DIST_DIR)/package/manifest.json
	cp content.js $(DIST_DIR)/package/content.js
	cp popup.html $(DIST_DIR)/package/popup.html
	cp popup.css $(DIST_DIR)/package/popup.css
	cp popup.js $(DIST_DIR)/package/popup.js
	cp README.md $(DIST_DIR)/package/README.md
	cp -R icons $(DIST_DIR)/package/icons

firefox-unsigned: release-version package-dir
	@version=$$(node -e "const m=require('./dist/manifest.json'); console.log(m.version_name || m.version)"); \
	npx web-ext build --source-dir $(DIST_DIR)/package --artifacts-dir $(DIST_DIR) --overwrite-dest --filename $(EXT_NAME)-$$version-firefox-unsigned.xpi

firefox-signed: release-version package-dir
	@version=$$(node -e "const m=require('./dist/manifest.json'); console.log(m.version_name || m.version)"); \
	npx web-ext sign --source-dir $(DIST_DIR)/package --artifacts-dir $(DIST_DIR) --channel listed --filename $(EXT_NAME)-$$version-firefox-signed.xpi

clean:
	rm -rf $(DIST_DIR)
