# Content Updates

This project is designed so content can be updated quickly without rebuilding architecture each time.

## Planned Content Surfaces

- Homepage hero and CTA copy
- Homepage journey/process steps
- Homepage featured image + gallery strip
- Designer spotlight cards
- Collection/category sections
- FAQ entries
- Appointment section copy and expectations
- Dedicated booking page content at `/book-appointment`
- Brand assets (logo variants and favicon)
- Legacy migration dataset and image library
- Hero lead image asset (`public/hero-image.png`)

## Working Pattern

1. Update source content files.
   Current primary sources:
   - `src/content/site-content.ts` for curated active UI copy
   - `src/content/migration/legacy-site/legacy-content.ts` for migrated legacy business data and image references
2. If visual theme values need adjustment, edit token values in `src/app/globals.css` (`html[data-theme="blue" | "blush" | "monochrome"]`).
3. If header spacing/placement needs adjustment, edit `src/components/layout/site-header.module.css` (avoid growing global CSS with header-only layout rules).
4. If homepage hero sizing/position/reveal behavior needs adjustment, edit `src/app/home.module.css` first.
5. Run quality checks:
   - `pnpm lint`
   - `pnpm build`
6. Preview locally with `pnpm dev`.
7. Commit only approved copy and metadata changes.

## Branding Assets

- Place reusable logos in `public/` when used in page components.
- Keep favicon/app icon files in `src/app/` when driven by App Router metadata conventions.
- Current theme-wordmark mapping in header:
  - `public/logo-text-v5.png` -> Sage Atelier (`blue` id)
  - `public/logo-text-v4.png` -> Blush
  - `public/logo-text-v3.png` -> Monochrome
- Mobile wordmark fit tuning currently lives in `src/components/layout/site-header.tsx` (`mobileLogoStyle`) to keep theme logos clear of badge borders.
- Preferred naming pattern:
  - `logo-text.*`
  - `logo-notext.*`
  - `favicon.*` or a clearly versioned equivalent.

## Copy Quality Rules

- Keep brand voice warm, editorial, and bridal-specific.
- Avoid generic local-business wording.
- Keep CTA language action-oriented: "Book Appointment", "Find Your Style", "View Collections".
- Do not copy competitor/reference wording.
- Avoid hard promises that require operational capabilities not yet confirmed.
- Do not publish outdated showroom address details while relocation is pending.
- Keep hero image crop flattering across common mobile widths (iPhone 11 baseline) before publishing copy/image updates.
