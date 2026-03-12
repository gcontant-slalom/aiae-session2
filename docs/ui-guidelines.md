# UI Guidelines

This document defines the core user interface guidelines for the TODO application.

## Design Goals

The UI should feel calm, clear, and lightweight. It should help users capture tasks quickly, understand status at a glance, and manage their work without visual clutter.

## Component Requirements

1. The application must use Material Design components for all primary UI patterns.
2. In the React frontend, use Material UI (MUI) components instead of building custom equivalents for common controls.
3. The following controls should use Material components:
   - task creation and edit forms
   - buttons and icon buttons
   - checkboxes for completion state
   - text fields for title, description, and search
   - date picker or Material-styled date input for due dates
   - dialogs for destructive confirmations when needed
   - snackbars or alerts for success and error feedback
   - list, card, chip, or table patterns used to display tasks and filters
4. Custom components are acceptable only when Material components do not meet a specific product need. Custom components must still follow Material spacing, elevation, and interaction patterns.

## Visual Style

1. Use a pastel color palette across the app.
2. Favor soft background and surface colors such as muted blue, sage, peach, cream, and blush tones.
3. Keep accent colors gentle rather than highly saturated.
4. Use color consistently to communicate meaning:
   - active and interactive elements should use the primary pastel accent
   - completed tasks should appear visually subdued but still readable
   - overdue tasks may use a warmer pastel alert color
   - destructive actions should use a restrained error color, not a harsh neon red
5. Avoid heavy shadows, overly sharp borders, and high-contrast visual noise.
6. Use whitespace and clear grouping to separate task entry, filters, and the task list.

## Layout Guidelines

1. The primary screen should prioritize the task input area, task filters, and task list.
2. The layout must work well on both mobile and desktop screen sizes.
3. Important actions such as add, edit, complete, delete, search, and filter should be visible without forcing the user through deep navigation.
4. Task rows or cards should present the most important information first:
   - title
   - completion state
   - due date
   - secondary actions
5. Empty states should clearly explain that no tasks match the current view and should guide the user toward the next useful action.

## Typography And Content

1. Use a clean, readable type scale with clear hierarchy for page titles, section headings, task titles, and supporting text.
2. Keep task-related labels and actions short and plain.
3. Validation and status messages should be specific and easy to understand.

## Accessibility Requirements

1. All interactive elements must be fully keyboard accessible.
2. Visible focus indicators are required for buttons, fields, checkboxes, chips, dialogs, and any custom interactive element.
3. Form controls must have accessible labels, not placeholder-only labels.
4. Icons used as actions must include accessible names.
5. Color must not be the only way status is communicated. Completed, overdue, and active states must also use text, iconography, or both.
6. Text and interactive components must meet WCAG-compliant contrast requirements, including pastel-themed surfaces.
7. Error messages must be programmatically associated with the relevant form fields.
8. Dialogs must manage focus correctly, trap focus while open, and return focus to the triggering control when closed.
9. The app should support screen readers through semantic structure and appropriate ARIA usage only where native HTML semantics are insufficient.
10. Touch targets should be large enough for mobile use.
11. Motion and transitions should be subtle and should respect reduced-motion preferences.

## Interaction Guidelines

1. Common actions should provide immediate visual feedback.
2. Creating, editing, completing, and deleting tasks should feel responsive and predictable.
3. Destructive actions should be easy to understand and difficult to trigger by accident.
4. Loading, empty, and error states should be explicitly designed rather than left implicit.

## TODO App Specific Guidance

1. The task creation flow should be fast enough to support quick entry.
2. Filters for all, active, and completed tasks should be prominent and easy to switch.
3. Search should remain visible when the task list grows.
4. Due dates should be easy to scan and easy to edit.
5. Completed tasks should remain legible while clearly differentiated from active tasks.