## ADDED Requirements

### Requirement: User can mark habit complete for today

The system SHALL allow authenticated users to record a completion for a habit on the current date (UTC). At most one completion per habit per date SHALL be stored.

#### Scenario: Successful check

- **WHEN** an authenticated user marks a habit they own as complete for today
- **THEN** the system MUST create a HabitCheck record for that habit and today's date (YYYY-MM-DD, UTC) if one does not exist

#### Scenario: Duplicate check is idempotent

- **WHEN** an authenticated user marks a habit complete for today and a check already exists for that habit and date
- **THEN** the system MUST NOT create a duplicate; it MAY return success or the existing check

#### Scenario: Check rejects non-owned habit

- **WHEN** an authenticated user attempts to check a habit owned by another user
- **THEN** the system MUST return an error and SHALL NOT create a HabitCheck

#### Scenario: Check rejects archived habit

- **WHEN** an authenticated user attempts to check an archived habit
- **THEN** the system MUST return an error and SHALL NOT create a HabitCheck

---

### Requirement: User can undo today's completion

The system SHALL allow authenticated users to remove the completion record for a habit on the current date (UTC).

#### Scenario: Successful undo

- **WHEN** an authenticated user undoes today's completion for a habit they own
- **THEN** the system MUST delete the HabitCheck record for that habit and today's date, if it exists

#### Scenario: Undo when no check exists

- **WHEN** an authenticated user undoes a habit that has no completion for today
- **THEN** the system MUST return success or a no-op; it SHALL NOT error

#### Scenario: Undo rejects non-owned habit

- **WHEN** an authenticated user attempts to undo a check for a habit owned by another user
- **THEN** the system MUST return an error and SHALL NOT delete any record

---

### Requirement: System computes streak for habit

The system SHALL compute and return the current streak for a habit. Streak is the number of consecutive days (UTC) ending today or the most recent check date, where each day has at least one completion.

#### Scenario: Streak with consecutive completions

- **WHEN** a habit has completions for the last N consecutive days including today
- **THEN** the system MUST return streak equal to N

#### Scenario: Streak is zero when today not completed

- **WHEN** a habit has no completion for today but had completions on previous days
- **THEN** the system MUST return streak 0 (streak is broken)

#### Scenario: Streak for new habit

- **WHEN** a habit has no HabitCheck records
- **THEN** the system MUST return streak 0

---

### Requirement: System provides completion stats

The system SHALL return completion statistics for a habit: total completions, current streak, and completion rate (completions / expected days based on frequency).

#### Scenario: Stats returned for habit

- **WHEN** an authenticated user requests stats for a habit they own
- **THEN** the system MUST return an object with `streak`, `totalCompletions`, and `completionRate` (number between 0 and 1)

#### Scenario: Stats rejects non-owned habit

- **WHEN** an authenticated user requests stats for a habit owned by another user
- **THEN** the system MUST return an error and SHALL NOT return stats
