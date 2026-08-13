# Deskline

Deskline is a small internal request desk app. Requesters can create and track IT or facilities requests. Technicians and admins can work through the shared queue.

This project was built with Vite, React, TypeScript, TanStack Query, and MSW.

## Run The App

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

## Demo Accounts

All demo users use the same password:

```txt
password
```

Use these emails:

| Role | Email |
| --- | --- |
| Requester | requester@deskline.test |
| Technician | technician@deskline.test |
| Admin | admin@deskline.test |

## What Works

- Login and logout
- Protected routes for requester, technician, and admin
- Requester flow: create request, view own requests, comment, cancel open requests
- Staff flow: view queue, comment, assign to me, set pending, reopen
- Admin flow: reassign requests and close requests
- Loading, error, retry, empty, and no-match states
- Light and dark theme toggle
- Reduce motion toggle

## Routes

The app uses five routes:

| Route | Purpose |
| --- | --- |
| `/login` | Sign in |
| `/my-requests` | Requester request list |
| `/queue` | Staff queue |
| `/requests/new` | Create request |
| `/requests/:id` | Request detail |

## Data And API

The app uses MSW as a mock REST API.

I chose MSW because the frontend can use normal `fetch` calls, but the app still runs without a real backend. This makes the app feel closer to a real client/server app while staying simple for the assessment.

The API client code lives in `src/api`. The mock server code lives in `src/mocks`.

UI types and API types are separate. API responses use DTO types, then mapper functions convert them into the cleaner UI types used by React components.

## Styling And Theme

The app uses plain CSS and CSS custom properties for theme colors.

The theme toggle writes the chosen theme to `localStorage`, so the setting survives a reload. If there is no saved choice, the app uses the operating system color preference.

## Motion

The app has a few small micro-interactions:

- Buttons give press feedback.
- Confirm dialogs animate in.
- Status changes have a small visual update.

The Reduce motion toggle also saves to `localStorage`. If the user has not chosen a setting, the app respects the operating system `prefers-reduced-motion` setting.

## Queue Strategy

The Queue page uses shared filtering logic for search, status, priority, category, and assignee.

Filtering is done in memory on the request list returned by the mock API. For this assessment size, this keeps the code easy to understand and is fast enough for the current mock data. If the queue grows much larger, the next step would be server-side filtering or list virtualization.

## Notes

The app is intentionally small. I avoided features outside the spec, like file uploads, rich text, realtime updates, and a full UI component library.
