## ADDED Requirements

### Requirement: User can list habits

The system SHALL return all non-archived habits for the authenticated user, ordered by creation date descending.

#### Scenario: List returns user's habits

- **WHEN** an authenticated user requests the list of habits
- **THEN** the system MUST return only habits owned by that user with `archivedAt` null, most recent first

#### Scenario: Unauthenticated user cannot list habits

- **WHEN** a request is made without a valid session
- **THEN** the system MUST return an error and SHALL NOT return any habits

---

### Requirement: User can create habit

The system SHALL allow authenticated users to create a habit with name, frequency (daily | weekly | custom), and optional category.

#### Scenario: Successful creation

- **WHEN** an authenticated user provides valid name and frequency
- **THEN** the system MUST create the habit, assign it to the user, and return the created habit with id

#### Scenario: Creation rejects invalid frequency

- **WHEN** an authenticated user provides a frequency that is not daily, weekly, or custom
- **THEN** the system MUST reject the request and return a validation error

#### Scenario: Category is optional

- **WHEN** an authenticated user creates a habit without a category
- **THEN** the system MUST accept the request and create the habit with category null or empty

---

### Requirement: User can update habit

The system SHALL allow authenticated users to update a habit they own (name, frequency, category). Archived habits SHALL NOT be updatable.

#### Scenario: Successful update

- **WHEN** an authenticated user updates a non-archived habit they own with valid fields
- **THEN** the system MUST persist the changes and return the updated habit

#### Scenario: Update rejects non-owned habit

- **WHEN** an authenticated user attempts to update a habit owned by another user
- **THEN** the system MUST return an error and SHALL NOT modify the habit

#### Scenario: Update rejects archived habit

- **WHEN** an authenticated user attempts to update a habit with `archivedAt` set
- **THEN** the system MUST return an error and SHALL NOT modify the habit

---

### Requirement: User can archive habit

The system SHALL allow authenticated users to archive (soft-delete) habits they own. Archived habits SHALL be excluded from list results.

#### Scenario: Successful archive

- **WHEN** an authenticated user archives a habit they own
- **THEN** the system MUST set `archivedAt` to the current timestamp and SHALL NOT delete the record

#### Scenario: Archive rejects non-owned habit

- **WHEN** an authenticated user attempts to archive a habit owned by another user
- **THEN** the system MUST return an error and SHALL NOT modify the habit

#### Scenario: Archived habits excluded from list

- **WHEN** an authenticated user lists habits
- **THEN** the system MUST exclude any habit with `archivedAt` not null
