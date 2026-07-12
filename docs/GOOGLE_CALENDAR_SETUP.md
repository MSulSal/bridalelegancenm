# Google Calendar Setup

This site now uses a shared Google Calendar to decide which appointment dates still have room.

## Recommended Setup

Use a Google service account for production instead of a personal Google login.

Why:

- It survives the GoDaddy to Vercel migration cleanly.
- It does not depend on your Google session staying connected.
- The client can remove or update access later without touching the site code.

## What To Create

1. In Google Cloud, create a project for Bridal Elegance NM.
2. Enable the Google Calendar API.
3. Create a service account.
4. Generate a JSON key for that service account.
5. Share the client's Google Calendar with the service-account email.

Recommended calendar permission:

- `Make changes to events` if we may later auto-create bookings there.
- `See all event details` is enough for date-availability only.

## Vercel Environment Variables

Add these in Vercel Project Settings -> Environment Variables:

- `GOOGLE_CALENDAR_ID`
- `GOOGLE_CALENDAR_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_CALENDAR_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_CALENDAR_TIMEZONE`
- `APPOINTMENT_LEAD_DAYS`
- `APPOINTMENT_MAX_DAYS_AHEAD`

## Example Minimal Setup

```env
GOOGLE_CALENDAR_TIMEZONE=America/Denver
APPOINTMENT_LEAD_DAYS=1
APPOINTMENT_MAX_DAYS_AHEAD=120
```

## Important Note

You mentioned having the client share a calendar with your Google account. That can work in a manual/OAuth setup, but this code is wired for the safer Vercel-friendly service-account approach instead. Share the calendar with the service-account email, not your personal Google account.

## How Blocking Works Now

This setup is intentionally date-based, not time-slot based.

- A date stays selectable by default.
- A date becomes unavailable when the shared Google Calendar has a busy event that covers that whole local day.
- Exact appointment time is still confirmed manually by the boutique after form submission.
