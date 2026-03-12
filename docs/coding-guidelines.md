# Coding Guidelines

This document summarizes the coding style and quality principles for the TODO application. The goal is to keep the codebase readable, consistent, and easy to extend as the product grows. Every change should favor clarity over cleverness, with code that is straightforward to review, test, and maintain.

## JavaScript Style

Use modern JavaScript best practices throughout the frontend and backend. Prefer clear naming, small focused functions, and modules with a single well-defined responsibility. Favor `const` by default and use `let` only when reassignment is required. Write code that makes intent obvious without forcing future readers to reverse engineer complex control flow or hidden side effects.

When implementing new behavior, keep components, utilities, and route handlers focused on one job at a time. Avoid deeply nested logic when a guard clause, helper function, or small refactor would make the code easier to follow. Handle errors explicitly, validate inputs close to system boundaries, and keep business rules in predictable places rather than scattering them across the codebase.

## Imports And File Structure

All imports must appear at the top of the file. Group imports together whenever possible so dependencies are easy to scan and maintain. In practice, this means keeping external package imports together, followed by internal module imports, instead of mixing imports throughout the file or placing them near usage sites. Avoid duplicate imports and avoid switching between `import` and `require` patterns within the same module unless a technical constraint makes it necessary.

Files should have a clear purpose. If a file starts to mix UI rendering, validation, data transformation, and side effects, split the concerns into smaller modules. Shared logic should live in reusable utilities or services rather than being copied into multiple components or route handlers.

## Reuse And Design Principles

Favor the DRY principle by extracting repeated logic into shared functions, helpers, or components when the duplication represents the same behavior. Do this with judgment: the goal is not aggressive abstraction, but removing repetition that would otherwise create inconsistent behavior or higher maintenance cost.

Apply SOLID principles pragmatically. Keep modules and classes focused on a single responsibility. Design code so behavior can be extended with minimal modification to stable components. Keep interfaces narrow and purposeful, and depend on abstractions at architectural boundaries when that improves testability or separation of concerns. These principles should make the code simpler and more adaptable, not more abstract for its own sake.

## Formatting And Linting

Use a linter to keep the codebase consistent and to catch avoidable errors early. Files should be formatted automatically on save through the editor, with linting rules applied consistently across the project. ESLint is the expected tool for enforcing JavaScript and React conventions, and the project should be configured so developers see and fix issues during normal editing rather than after a large batch of changes.

Linting and formatting rules should support readability, not fight it. If a style rule creates noise or ambiguity, the rule should be reviewed at the project level instead of being ignored ad hoc in individual files. New changes should not introduce lint warnings or formatting drift.

## Quality Expectations

Write code that is easy to test and easy to change. New features should include appropriate tests, and implementation details should not be so tightly coupled that small behavior changes require broad rewrites. Prefer composition over duplication, keep side effects controlled, and isolate framework-specific concerns from core business logic whenever practical.

Comments should be used sparingly and only when they add context that the code itself cannot express clearly. If a block of code is difficult to understand without a long comment, refactor the code before adding explanation. The overall standard is simple: code should be clean, consistent, intentional, and maintainable by someone who did not originally write it.

## TODO App Guidance

For this TODO application, keep task-related business rules such as validation, sorting, filtering, and status updates centralized and consistent across the frontend and backend. UI components should focus on presentation and interaction, while shared rules and transformations should be implemented in reusable logic. This keeps the app easier to reason about and reduces the risk of mismatched behavior between layers.