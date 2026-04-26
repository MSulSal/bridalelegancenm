# Content Updates

This project is designed so content can be updated quickly without rebuilding architecture each time.

## Planned Content Surfaces

- Homepage hero and CTA copy
- Homepage journey/process steps
- Showroom lookbook thumbnail row (currently placeholder frames)
- Designer spotlight cards
- Collection/category sections
- FAQ entries
- Appointment section copy and expectations
- Dedicated booking page content at `/book-appointment`
- Brand assets (logo variants and favicon)

## Working Pattern

1. Update source content files.
   Current primary source: `src/content/site-content.ts` for homepage and booking page copy.
2. If visual theme values need adjustment, edit token values in `src/app/globals.css` (`html[data-theme="blue" | "blush" | "monochrome"]`).
3. If header spacing/placement needs adjustment, edit `src/components/layout/site-header.module.css` (avoid growing global CSS with header-only layout rules).
4. Run quality checks:
   - `pnpm lint`
   - `pnpm build`
5. Preview locally with `pnpm dev`.
6. Commit only approved copy and metadata changes.

## Branding Assets

- Place reusable logos in `public/` when used in page components.
- Keep favicon/app icon files in `src/app/` when driven by App Router metadata conventions.
- Preferred naming pattern:
  - `logo-text.*`
  - `logo-notext.*`
  - `favicon.*` or a clearly versioned equivalent.

## Copy Quality Rules

- Keep brand voice warm, editorial, and bridal-specific.
- Avoid generic local-business wording.
- Keep CTA language action-oriented: "Book Appointment", "Find Your Style", "View Collections".
- Do not copy competitor/reference wording.
