# Functional Requirements

This document defines the core functional requirements for the TODO application.

## Core Requirements

1. The user can create a new task by entering a required title.
2. The user can view all tasks in a list that shows, at minimum, the task title, completion status, and due date when one is set.
3. The user can edit an existing task's title, description, and due date.
4. The user can mark a task as complete or incomplete.
5. The user can delete a task.
6. The user can assign an optional due date to a task.
7. The application displays tasks in a consistent default order:
   - Incomplete tasks appear before completed tasks.
   - Within each group, tasks with earlier due dates appear first.
   - Tasks without a due date appear after tasks with a due date.
8. The user can filter tasks by status: all, active, or completed.
9. The user can search tasks by keyword in the title or description.
10. The application persists tasks so they remain available after the user refreshes or reopens the app.
11. The application prevents creating or saving a task with an empty title and provides clear validation feedback.
12. The user can clear all completed tasks in a single action.

## Optional Future Enhancements

- The user can assign a priority level to a task.
- The user can group tasks by project or category.
- The user can drag and drop tasks to manually reorder them.
- The user can receive a visual indicator for overdue tasks.