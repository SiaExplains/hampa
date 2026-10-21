# Changelog

All notable changes to HampaClub.com. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [semver](https://semver.org/).

## [0.1.1] - 2026-10-21

### Fixed

- Pull requests that only change documentation can be merged again: the required check now always reports, and skips the build steps when only docs changed.

## [0.1.0] - 2026-10-20

### Added

- First scaffold of the app: a placeholder home page in Persian (right-to-left, default), English and German.
- Light and dark theme that follows your system setting, with a switch to choose.
- `/api/health` reports the running version.
- Checks that run on every pull request: lint, types, tests, translations and a production build.
