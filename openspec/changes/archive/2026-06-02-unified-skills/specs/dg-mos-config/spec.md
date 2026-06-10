## ADDED Requirements

### Requirement: DG MoS configuration is accessible within the unified skills page
The Delta Green Method of Specialization (MoS) registry (create, edit, delete MoS templates) SHALL be accessible as a tab within the `/skills` page under the "Delta Green" tab.

#### Scenario: DG tab shows MoS registry
- **WHEN** a user selects the "Delta Green" tab on `/skills`
- **THEN** the DG MoS management UI SHALL be displayed, showing all existing MoS templates

#### Scenario: Create MoS from unified page
- **WHEN** a user submits the create MoS form on the "Delta Green" tab
- **THEN** the new MoS SHALL be saved and appear in the MoS list

#### Scenario: Edit MoS from unified page
- **WHEN** a user edits an existing MoS template
- **THEN** the changes SHALL be saved and the updated template SHALL be reflected in the list

#### Scenario: Delete MoS from unified page
- **WHEN** a user deletes a MoS template
- **THEN** the template SHALL be removed and no longer appear in the list
