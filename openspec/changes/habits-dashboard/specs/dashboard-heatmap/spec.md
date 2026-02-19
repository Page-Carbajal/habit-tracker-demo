## ADDED Requirements

### Requirement: Dashboard displays completion heatmap

The system SHALL display a heatmap grid showing completion history for the user's habits over a configurable date range (week or month).

#### Scenario: Heatmap shows habits and dates

- **WHEN** an authenticated user views the dashboard heatmap section
- **THEN** the system MUST display a grid with rows per habit and columns per date in the selected range, with cells indicating completed vs not completed for each (habit, date) pair

#### Scenario: Heatmap supports week and month range

- **WHEN** an authenticated user selects "week" or "month" for the heatmap range
- **THEN** the system MUST update the grid to show the corresponding date range (e.g. 7 days or ~30 days)

#### Scenario: Heatmap uses TanStack Table for grid layout

- **WHEN** the heatmap is rendered
- **THEN** the system MUST use TanStack Table (or equivalent data grid) for the row/column structure

#### Scenario: Unauthenticated user cannot see heatmap data

- **WHEN** a user without a valid session attempts to view heatmap data
- **THEN** the system MUST NOT return completion history and SHALL redirect or show auth prompt

---

### Requirement: Heatmap cells distinguish completed from missed

The system SHALL visually differentiate completed days from non-completed days (e.g. filled vs empty, or distinct colors).

#### Scenario: Completed cell is visually distinct

- **WHEN** a habit was completed on a given date
- **THEN** the corresponding heatmap cell MUST be visually distinguishable from cells where the habit was not completed

#### Scenario: Date range bounded for performance

- **WHEN** the heatmap requests completion history
- **THEN** the system MAY limit the maximum date range (e.g. 90 days) to avoid excessive payload size
