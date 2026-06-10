## ADDED Requirements

### Requirement: SC skill registry is accessible within the unified skills page
The Special Circumstances skill registry (create, edit, delete named skills) SHALL be accessible as a tab within the `/skills` page under the "Special Circumstances" tab.

#### Scenario: SC skills tab shows skill registry
- **WHEN** a user selects the "Special Circumstances" tab on `/skills`
- **THEN** the SC skill management UI SHALL be displayed, showing all skills organized by category

#### Scenario: Create skill from unified page
- **WHEN** a user is on the "Special Circumstances" tab and submits the create skill form
- **THEN** the new skill SHALL be saved and appear in the skill list without a full page reload

#### Scenario: Edit skill from unified page
- **WHEN** a user clicks edit on an existing SC skill
- **THEN** the edit form SHALL be pre-populated and the skill SHALL be updatable

#### Scenario: Delete skill from unified page
- **WHEN** a user deletes an SC skill
- **THEN** the skill SHALL be removed from the list and the change SHALL be reflected immediately
