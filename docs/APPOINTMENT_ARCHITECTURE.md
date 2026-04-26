# Appointment Architecture

Appointment-setting is the primary conversion flow. This compares practical options before implementation.

## Option Comparison

| Option | Cost | Complexity | Client Control | Maintenance Burden | Reliability |
|---|---|---|---|---|---|
| Basic request form (manual confirmation) | Low | Low | Medium | Low | Medium |
| Embedded scheduler (Calendly, Cal.com, TidyCal, Acuity) | Low to Medium | Low to Medium | High | Low | High |
| Fully custom booking backend | Medium to High | High | Very High | High | Medium to High |

## Option Details

### 1) Basic Appointment Request Form

- Best for: fastest launch, lowest risk, immediate conversion path.
- Brides submit preferred date/time and contact details.
- Boutique confirms manually by phone/email.
- Limits: no live availability visibility for brides.

### 2) Embedded Scheduler

- Best for: strong operational control without custom backend overhead.
- Client can define business hours, blocked dates, duration, buffers, max daily appointments.
- Brides only see valid slots.
- Typical tools:
  - Cal.com: strongest flexibility and future self-hosting path.
  - Calendly: easiest mainstream setup.
  - TidyCal: low-cost simple setup.
  - Acuity: salon/boutique-friendly management.

### 3) Custom Booking System

- Best for: very specific business logic and deep custom workflows.
- Requires backend scheduling rules, conflict prevention, timezone handling, notifications, and admin tooling.
- Highest long-term ownership cost.

## Recommendation for Bridal Elegance NM

1. Phase 1 launch with request form for speed and low complexity.
2. Phase 2 move to embedded scheduler once client confirms operational preferences.
3. Default recommendation: `Cal.com` if client wants stronger control and future flexibility.
4. Use `Calendly` if client prioritizes quickest setup with familiar UX.

## Current Implementation Status

- Phase 1 request flow is now implemented:
  - Dedicated booking page: `/book-appointment`
  - Request API endpoint: `/api/appointment-request`
  - Manual confirmation model remains active (no live slot locking yet)
- Form delivery supports Formspree via environment configuration.

## Decision Inputs Needed From Client

- Exact appointment types and durations
- Business hours and closed dates
- Buffer time between appointments
- Max appointments/day
- Email destination and notification workflow
