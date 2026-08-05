# Changelog

## 0.0.5

- Fixed Shopify color-scheme initialization by storing all ten schemes directly in `settings_data.json.current`.
- Rebuilt the scheme definition to match Shopify’s supported color-scheme structure exactly.
- Moved the default color-scheme selector outside the scheme-group category.
- Preserved ten editable presets and gradient backgrounds.
- Made announcement-bar palette inheritance the default; custom overrides remain available.


## 0.0.2 — 2026-08-03

- Added ten editable native Shopify color schemes.
- Added solid and gradient controls for palette backgrounds and surfaces.
- Added a reusable 20-color swatch palette.
- Connected color-scheme selectors to all primary storefront sections, the header, the footer, and password pages.
- Replaced hardcoded header and footer colors with palette tokens.
- Upgraded the announcement bar with static, marquee, fade, slide-up, and slide-left modes.
- Added multiple announcement messages, gradient animation, shimmer, direction, timing, spacing, and mobile controls.
- Added reduced-motion handling for announcement animations.
- Updated theme metadata to version 0.0.2.
- Removed macOS metadata and corrected the distributable ZIP root structure.
