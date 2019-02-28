# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.2.0 (2019-02-28)


### Bug Fixes

* **html5 history:** going forward ([e5047d2](https://github.com/AoDev/bard-router/commit/e5047d2))


### Features

* **history:** add generic history + html5 support ([d0bb66b](https://github.com/AoDev/bard-router/commit/d0bb66b))
* **Link:** improve links active behaviour ([f91e2d2](https://github.com/AoDev/bard-router/commit/f91e2d2))
* easier history plugin api ([baf940b](https://github.com/AoDev/bard-router/commit/baf940b))


### BREAKING CHANGES

* history plugin now is passed in the options and the history can
be accessed as router.history while the router internal history
is at router.story.
* **history:** 'onNav' hook is now available as:

router.on('nav', (router, navOptions) => {}))
