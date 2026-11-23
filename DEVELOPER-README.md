# Work-In logo usage handoff

## Source of truth
WORKIN-LOGO-original.png is the user-selected logo. Preserve its W geometry, central notch, separated right stroke, and two lime bars on EACH side. The source contains both a symbol and a separate wordmark treatment on one 3375 x 2250 transparent PNG canvas. It is not a set of individual production assets. The wordmark includes a white rectangular backing.

logo-usage-examples.png is an AI-generated usage illustration, NOT an asset sheet to slice or trace. Some geometry, lettering, spacing and colors may differ. In particular, the desktop header illustration omits the right-hand bars: do NOT implement that omission. The website address in the illustration is a placeholder, not a confirmed domain. These examples are proposed placements, not an implemented product UI.

## Usage
- Light backgrounds: charcoal W with lime bars from the approved source.
- Dark backgrounds: prepare a matching white W with lime bars; do not place the charcoal W directly on charcoal.
- Desktop navigation: compact wordmark with all four bars. Omit the tagline when too small to read.
- Mobile navigation and app icon: symbol with all four bars, without tagline or wordmark. Center within generous safe margins and test platform masks.
- Large marketing placements: wordmark with exact tagline SAME GOALS, BETTER COMPANY.
- One-color printing: identical mark entirely black or entirely white, including bars.
- Busy photography: put the mark on a solid light or dark panel.

## Implementation starting points (proposed, not validated brand standards)
Keep clear space of at least one tall-bar width around the artwork. Preserve aspect ratio; never stretch. Use tightly bounded individual exports, not the full source canvas with both treatments. Test the symbol at 32 and 48 CSS pixels high, and wordmark at 160 and 240 CSS pixels wide. If tagline is not comfortably legible, omit it. Test favicon at actual 16 and 32 pixel sizes before approval; do not silently remove bars to make it fit. Use charcoal text on lime buttons rather than the white button text shown in the mockup, and verify UI text contrast independently. Avoid lime small text on white.

## Production assets still needed
Export or faithfully vectorize separate symbol and wordmark assets from the original Canva artwork. SVG preferred for web; transparent PNG fallback at 1x, 2x and 3x. Prepare light, dark, black-only and white-only versions. Preserve original artwork rather than substituting a typed W or an approximate font. Confirm exact solid color values and font family in the original Canva design; this raster handoff does not establish official font or color specifications. Include standalone wordmark variants with and without tagline. A generated usage board is not an approved vector master.

## Accessibility
Home-link logo accessible name: Work-In home. Decorative duplicates: empty alt text. Do not rely on the logo tagline as the only accessible product description.
