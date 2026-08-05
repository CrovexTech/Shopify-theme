# Crovex Commerce Framework v0.0.2

An original Shopify Online Store 2.0 theme framework authored for scalable, highly customizable storefronts.

**Author:** James Boyden  
**Copyright:** © 2026 James Boyden. All rights reserved.

## v0.0.2 additions

### Native 10-palette color system

The theme now includes ten editable Shopify color schemes. Every scheme supports solid and gradient backgrounds, secondary surfaces, text, muted text, accents, buttons, borders, shadows, success states, and error/sale states.

1. Tropical Heritage
2. Luxury Noir
3. Warm Editorial
4. Beauty Blush
5. Modern Minimal
6. Ocean Coastal
7. Earth & Botanical
8. Digital Neon
9. Bold Streetwear
10. Soft Pastel

A 20-color saved swatch palette is also included for faster editing inside compatible Shopify color controls.

All primary storefront sections now include a **Color palette** selector. The default site palette is controlled under **Theme settings → Color system**.

### Advanced announcement bar

The announcement bar now supports:

- Static text
- Continuous marquee animation
- Fade rotation
- Slide-up rotation
- Slide-left rotation
- Up to four additional announcement messages
- Solid or gradient backgrounds
- Optional animated gradients
- Text shimmer
- Desktop and mobile speed controls
- Direction, spacing, typography, uppercase, separator, pause-on-hover, and mobile-animation settings
- Reduced-motion accessibility behavior

## Core architecture

- Server-rendered Liquid and JSON templates
- Independent custom elements for announcements, cart, variants, recommendations, and sticky navigation
- Centralized CSS design tokens
- Header and footer section groups
- Modular homepage sections
- Native collection filtering and sorting
- AJAX cart drawer with progressive fallback to the cart page
- Product media, variant selection, quick add, and dynamic checkout support
- English and Spanish storefront locales
- App-block support on product pages
- Reusable theme blocks and a composition layer
- Wrapper support for generated theme blocks
- Password-page template
- Predictive search
- Language and country selectors

## Installation

Upload `CrovexShopify-v0.0.2.zip` through:

**Shopify Admin → Online Store → Themes → Add theme → Upload ZIP file**

The ZIP is packaged with Shopify theme folders at its root and contains no macOS metadata files. Preview and test it as an unpublished theme before publishing.

## Initial setup

1. Open **Theme settings → Color system**.
2. Edit any of the ten schemes or select a different **Default site palette**.
3. Open each section to choose its **Color palette**.
4. Open **Announcement bar** to select an animation and add extra message blocks.
5. Test desktop and mobile layouts before publishing.

## Development

Use Shopify CLI and run:

```bash
shopify theme check
shopify theme dev --store your-store
```

## Ownership

This codebase was created as a new implementation using Shopify's public Liquid objects, theme APIs, and Online Store 2.0 architecture. It is not a transfer of copyright or ownership to a merchant unless James Boyden signs a separate written assignment.

See `LICENSE.md` for the commercial-use terms.

## Validation status

The package has passed local JSON parsing, embedded section schema parsing, JavaScript syntax checking, setting-ID checks, theme file-size checks, and internal color-system checks. A Shopify development-store preview remains required before production publication.
