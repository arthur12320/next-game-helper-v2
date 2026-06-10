## ADDED Requirements

### Requirement: Unified skills page hosts all game system configurations
The `/skills` route SHALL render a single page that contains skill configuration for all supported game systems, organized by tabs where each tab corresponds to one game system.

#### Scenario: Page loads with system tabs
- **WHEN** a user navigates to `/skills`
- **THEN** the page SHALL display a tab bar with one tab per supported game system (e.g. "Special Circumstances", "Delta Green")

#### Scenario: Default tab selection
- **WHEN** the page first loads
- **THEN** the first tab (Special Circumstances) SHALL be selected by default

#### Scenario: Tab switching
- **WHEN** a user clicks a game system tab
- **THEN** the corresponding skill management UI for that system SHALL be shown without a page reload

### Requirement: DG characters page no longer contains skill configuration
The `/dg-characters` page SHALL display only the list of DG agents, with no "DG Config" tab or MoS management UI.

#### Scenario: DG characters page renders without tabs
- **WHEN** a user navigates to `/dg-characters`
- **THEN** the page SHALL show the agent listing directly, with no tab bar

#### Scenario: DG Config not accessible from DG characters page
- **WHEN** a user is on `/dg-characters`
- **THEN** there SHALL be no tab, link, or section for MoS configuration — that content lives at `/skills`

### Requirement: Navbar reflects unified skills destination
The navbar SHALL provide a single "Skills" navigation item that routes to `/skills`, covering all game system skill configuration.

#### Scenario: Skills nav item is present
- **WHEN** a logged-in user views any page
- **THEN** the navbar SHALL show a "Skills" link pointing to `/skills`
