# Architecture — Crovex Commerce Framework v0.0.2

## Design objective

The framework treats Shopify as a server-rendered commerce platform and adds JavaScript only for progressive enhancements. The implementation is intentionally componentized so future modules—3D viewers, richer merchandising, analytics hooks, loyalty, bundles, or application blocks—can be added without replacing the core theme.

## Layers

1. **Platform layer:** Shopify Liquid objects, forms, routes, JSON templates, section groups, localization, and public cart/recommendation endpoints.
2. **Presentation layer:** CSS design tokens and independent section styles.
3. **Interaction layer:** browser custom elements for product forms, variants, recommendations, sticky navigation, and the cart drawer.
4. **Composition layer:** reusable theme blocks in `/blocks` and a generic composition section accepting theme and app blocks.
5. **Extension layer:** product-page app blocks, Custom Liquid, generated-block wrapper support, and event-driven cart updates.

## Event contract

The JavaScript layer uses an internal event bus:

- `cart:changed` — emitted after cart mutation; consumers refresh cart state.
- `cart:open` — requests the cart drawer to open.

Future modules should subscribe to events instead of importing or modifying unrelated components.

## Originality and source boundaries

This project was implemented as a new codebase against Shopify's documented public interfaces. Third-party branding, media, app code, and merchant content must be licensed separately. The proprietary license covers the original framework implementation, not Shopify's platform or public APIs.


## Color architecture

Version 0.0.2 uses Shopify native `color_palette`, `color_scheme_group`, and `color_scheme` settings. Each selected scheme is converted into inherited `--cx-*` design tokens. Sections can therefore switch palettes without duplicating component CSS, while solid and gradient backgrounds remain editable in the Shopify theme editor.

## Announcement architecture

The announcement bar is a custom element with CSS-first marquee behavior and JavaScript-enhanced rotating slides. It pauses when appropriate, responds to theme-editor block selection, and disables motion for reduced-motion users.
