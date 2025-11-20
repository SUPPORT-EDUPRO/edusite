# Partner Logos

This directory contains logos of our partners displayed in the website footer.

## Current Partners

### H.A.S.C (Hope Academic and Skill Centre)

- **File:** `hasc-logo.png`
- **Website:** https://www.hasc.co.za/
- **Recommended dimensions:** 400x160px (or similar 5:2 ratio)
- **Format:** PNG with transparent background (preferred)

### S.O.A (Soil of Africa)

- **File:** `soa-logo.png`
- **Website:** https://example.org/soa
- **Recommended dimensions:** ~260x100px (or similar 5:2 ratio)
- **Format:** PNG with transparent background (preferred)

## Adding the H.A.S.C Logo

Please save the H.A.S.C logo image as `hasc-logo.png` in this directory.

The logo should be:

- High resolution (at least 400px wide)
- PNG format with transparent background
- Clearly visible with the blue, red, and yellow brand colors

## Adding More Partners

To add additional partners:

1. Save partner logo here (e.g., `soa-logo.png`).
2. In `src/components/site/Footer.tsx`, add an entry in the partners array with href/src/alt/title.
3. Hard refresh the site to see changes.
