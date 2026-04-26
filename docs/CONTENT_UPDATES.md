# Content Updates

This project is designed so content can be updated quickly without rebuilding architecture each time.

## Planned Content Surfaces

- Homepage hero and CTA copy
- Designer spotlight cards
- Collection/category sections
- FAQ entries
- Appointment section copy and expectations (dedicated page can be added later if approved)
- Brand assets (logo variants and favicon)

## Working Pattern

1. Update source content files (JSON/MDX when introduced in later commits).
2. Run quality checks:
   - `pnpm lint`
   - `pnpm build`
3. Preview locally with `pnpm dev`.
4. Commit only approved copy and metadata changes.

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
