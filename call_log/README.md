# Call Log v2

## File Directory

```
  |-- communications
      |-- LICENSE
      |-- Makefile
      |-- README.md
      |-- index.html // app entry
      |-- jest.config.js
      |-- jest.setup.js
      |-- manifest.webmanifest
      |-- system_message.js // service worker
      |-- template.html
      |-- yarn.lock
      |-- js
      |-- locales
      |-- resources // image
      |-- src
          |-- index.js // js entry
          |-- components // public components
          |-- router // app router
          |-- test  // jest
          |-- utils // public methods
          |-- view // app views
```

Calllog app with React ^16 and Webpack ^4.

This guide *[Build Call Log v2 with Webpack 4]* describes more details about
Webpack 4.

Below you will find some information on how to perform common tasks.

- [Build Options](#build-options)
  - [`make lint`](#make-lint)
  - [`make test`](#make-test)
  - [`make watch`](#make-watch)
  - [`make build`](#make-build)
  - [`make analyze`](#make-analyze)
  - [`make install`](#make-install)
  - [`make clean`](#make-clean)
  - [`make distclean`](#make-distclean)
- [Available Scripts](#available-scripts)
  - [`yarn lint`](#yarn-lint)
  - [`yarn test`](#yarn-test)
  - [`yarn dev`](#yarn-dev)
  - [`yarn build`](#yarn-build)
  - [`yarn build:analyze`](#yarn-buildanalyze)
  - [`yarn flash`](#yarn-flash)
  - [`yarn clean`](#yarn-clean)

[Build Call Log v2 with Webpack 4]: docs/webpack4.md

## Build Options

In the project directory, you can run:

### `make lint`

Runs ESLint and stylelint to detect and highlight potential issues.

### `make test`

Runs Jest for JavaScript unit testing and snapshot testing.

### `make watch`

Runs the app in the development mode.

You can flash the app to check if it works by running `make install`.

### `make build`

Builds the app for production.

The build is minified and your app is ready to be deployed.

You can flash the app to check if it works by running `make install`.

### `make analyze`

Analyzes the app bundles and opens a report to see what modules take space.

### `make install`

Deploys the app and pushes it into the device you attached.

It is identical to `DEVICE_DEBUG=1 NO_BUNDLE=1 APP=calllog make install-gaia`.

### `make clean`

Removes all outputs and build caches throughly.

### `make distclean`

Runs `make clean` and removes `mode_modules` folder.

## Available Scripts

We provides a set of NPM scripts which runs `make` under the hood:

### `yarn lint`

An alias of `make lint`.

### `yarn test`

An alias of `make test`.

### `yarn dev`

An alias of `make watch`.

### `yarn build`

An alias of `make build`.

### `yarn build:analyze`

An alias of `make analyze`.

### `yarn flash`

An alias of `make install`.

### `yarn clean`

An alias of `make clean`.
