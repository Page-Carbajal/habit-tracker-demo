## ADDED Requirements

### Requirement: Dashboard displays today's habits at a glance

The system SHALL display all non-archived habits for the authenticated user that are due today, with completion status (checked/unchecked) per habit.

#### Scenario: Today section shows user's habits with status

- **WHEN** an authenticated user views the dashboard
- **THEN** the system MUST display a "Today" section listing their habits with an indicator (e.g. checkbox) showing whether each habit is completed for today (UTC)

#### Scenario: Unauthenticated user cannot see dashboard

- **WHEN** a user without a valid session navigates to the dashboard
- **THEN** the system MUST redirect to login or show auth prompt and SHALL NOT display habit data

#### Scenario: Archived habits excluded from today view

- **WHEN** an authenticated user views the dashboard
- **THEN** the system MUST exclude habits with `archivedAt` set from the today section

---

### Requirement: User can check/uncheck habits inline on dashboard

The system SHALL allow authenticated users to mark habits complete or undo completion directly from the dashboard today section, with updates reflected immediately (optimistic or real-time sync).

#### Scenario: Check habit from dashboard

- **WHEN** an authenticated user clicks to check a habit in the today section
- **THEN** the system MUST record the completion for today and update the UI to show the habit as checked

#### Scenario: Undo check from dashboard

- **WHEN** an authenticated user undoes a completed habit in the today section
- **THEN** the system MUST remove today's completion and update the UI to show the habit as unchecked

#### Scenario: Data syncs via TanStack Query

- **WHEN** an authenticated user performs check or uncheck
- **THEN** the system MUST invalidate or update the relevant query cache so that data stays consistent across the dashboard
