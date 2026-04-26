# Deployment Plan

## Hosting Model

- App hosting: Vercel
- Domain registrar and DNS: GoDaddy
- Email: preserve existing provider records at GoDaddy

## Launch Strategy

1. Deploy preview branches in Vercel.
2. Validate production build and core conversion pages.
3. Document existing DNS records before any change.
4. Point GoDaddy DNS records for web traffic to Vercel.
5. Re-check that MX/TXT/SPF/DKIM/DMARC are unchanged.

## Non-Negotiables

- Never remove email records during DNS changes.
- Keep a rollback record of previous DNS values.
- Verify contact/appointment delivery after DNS cutover.

## Validation Checklist

- `pnpm lint` passes
- `pnpm build` passes
- Production domain resolves to Vercel
- HTTPS is active
- Appointment/contact path works end-to-end
- Email still sends and receives correctly
