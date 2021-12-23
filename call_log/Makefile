include node_modules/fatigue-scripts/webapp.mk

GAIA_DIR := $(realpath $(CURDIR)/../..)
CACHE_DIR := $(MODULES_DIR)/.cache

ESLINT := $(BIN_DIR)/eslint
JEST := $(BIN_DIR)/jest
STYLELINT := $(BIN_DIR)/stylelint

ANALYZE_CONFIG ?= $(CURDIR)/webpack.analyze.js
WEBPACK_ANALYZE_OPTS := --bail --config $(ANALYZE_CONFIG)

.PHONY: clean
clean::
	@$(RM) $(CACHE_DIR)

.PHONY: lint
lint::
	@$(ESLINT) 'src/**/*.js'
	@$(STYLELINT) 'src/**/*.css'

.PHONY: test
test::
	@node --no-deprecation $(JEST)

.PHONY: install
install:: export DEVICE_DEBUG=1
install:: export NO_BUNDLE=1
install:: export APP=$(APP_NAME)
install::
	@echo $(INFO)
	@echo "Flashing '$(APP_NAME)'..."
	@$(MAKE) -C $(GAIA_DIR) install-gaia
	@echo "'$(APP_NAME)' should be flashed successfully."

.PHONY: analyze
analyze:: export NODE_ENV=production
analyze:: $(ANALYZE_CONFIG) clean
	@echo $(INFO)
	@echo "Analyzing '$(APP_NAME)' bundles..."
	@$(WEBPACK) $(WEBPACK_ANALYZE_OPTS)
