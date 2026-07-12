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
- `APPOINTMENT_HOURS_SUNDAY`
- `APPOINTMENT_HOURS_MONDAY`
- `APPOINTMENT_HOURS_TUESDAY`
- `APPOINTMENT_HOURS_WEDNESDAY`
- `APPOINTMENT_HOURS_THURSDAY`
- `APPOINTMENT_HOURS_FRIDAY`
- `APPOINTMENT_HOURS_SATURDAY`
- `APPOINTMENT_DURATION_MINUTES`
- `APPOINTMENT_LEAD_DAYS`
- `APPOINTMENT_MAX_DAYS_AHEAD`

## Example Availability

```env
GOOGLE_CALENDAR_TIMEZONE=America/Denver
APPOINTMENT_HOURS_TUESDAY=11:00-17:00
APPOINTMENT_HOURS_WEDNESDAY=11:00-17:00
APPOINTMENT_HOURS_THURSDAY=11:00-17:00
APPOINTMENT_HOURS_FRIDAY=11:00-17:00
APPOINTMENT_HOURS_SATURDAY=10:00-16:00
APPOINTMENT_DURATION_MINUTES=90
APPOINTMENT_LEAD_DAYS=1
APPOINTMENT_MAX_DAYS_AHEAD=120
```

## Important Note

You mentioned having the client share a calendar with your Google account. That can work in a manual/OAuth setup, but this code is wired for the safer Vercel-friendly service-account approach instead. Share the calendar with the service-account email, not your personal Google account.
