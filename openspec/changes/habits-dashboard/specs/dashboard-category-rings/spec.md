## ADDED Requirements

### Requirement: Dashboard displays progress rings per habit category

The system SHALL display a visual progress ring (or equivalent) for each habit category, showing the aggregate completion rate for habits in that category.

#### Scenario: Category rings section shows one ring per category

- **WHEN** an authenticated user views the dashboard
- **THEN** the system MUST display a section with one progress ring per distinct category (including "Uncategorized" or equivalent for habits with null category)

#### Scenario: Ring represents aggregate completion rate

- **WHEN** a category has one or more habits
- **THEN** the system MUST compute the aggregate completion rate (completions / expected days across all habits in that category) and render the ring to reflect that rate (e.g. 0–100% or 0–1)

#### Scenario: Empty category or no habits

- **WHEN** a user has no habits, or a category has no habits
- **THEN** the system MUST display a ring at 0% or handle the empty state gracefully (e.g. show "No habits" or skip the rings section)

#### Scenario: Unauthenticated user cannot see category rings

- **WHEN** a user without a valid session views the dashboard
- **THEN** the system MUST NOT display category progress data and SHALL redirect or show auth prompt

---

### Requirement: Progress rings use circular visual format

The system SHALL render each category's progress as a circular ring (or arc) where the filled portion represents the completion rate.

#### Scenario: Ring is visually circular

- **WHEN** a progress ring is displayed
- **THEN** the system MUST use a circular or arc-shaped visual (e.g. SVG circle with stroke-dasharray, CSS conic-gradient) to represent progress

#### Scenario: Ring shows category label

- **WHEN** a progress ring is displayed
- **THEN** the system MUST show the category name (or "Uncategorized") associated with that ring
