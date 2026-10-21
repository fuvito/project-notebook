# CLAUDE.md --- Project Notebook

## Mission

Build a local-first Chrome extension for individual users and developers
to keep project links and working notes together in a lightweight,
searchable, Google Docs-style outline.

## Product principles

-   Document-first, not a traditional bookmark manager.
-   Fast user-triggered capture of the active page.
-   Separate notebooks for separate projects.
-   Search titles, headings, notes, and link descriptions.
-   Local-only data in the MVP; no account or backend.
-   Never present this as a password manager.

## MVP requirements

-   Create, rename, and delete notebooks.
-   Edit headings (H1--H3), paragraphs, bullets, and links.
-   Autosave locally and show save/error status.
-   Capture active-tab title and URL into a selected notebook, with
    optional description.
-   Search all local notebook content and open saved links.
-   Export/import versioned JSON with validation.

## Explicitly out of scope

Google Docs/OAuth, cloud sync, accounts, collaboration, passwords/API
keys/tokens, AI, reminders/tasks, semantic search, and complex tables or
drag-and-drop outline editing.

## Suggested stack

TypeScript, React, Vite + WXT, Manifest V3, TipTap/ProseMirror,
IndexedDB, Zod (or equivalent validation), Vitest, React Testing
Library. Confirm current stable versions and compatibility when
scaffolding.

## Architecture rules

-   Keep Chrome APIs behind small adapter modules.
-   Keep editor/document model independent of Chrome APIs.
-   Use a repository abstraction for persistence.
-   Use stable IDs and a versioned document schema with migrations.
-   Do not store a document as one plain-text string.
-   Derive the outline from heading blocks unless requirements prove
    otherwise.
-   Debounce autosave, surface failures, and avoid silently discarding
    dirty changes.
-   Treat imported JSON as untrusted; validate schema, URLs, and size.
-   Never log note content or full URLs unnecessarily.

## Privacy and permissions

-   Request the minimum permissions required.
-   Prefer user-triggered active-tab access over broad host permissions.
-   Capture only tab title and URL when the user explicitly requests it;
    do not scrape page content.
-   No network transmission or telemetry in the MVP.
-   Do not add secret-specific fields. Warn that the extension is not a
    secrets manager.

## UX standards

-   Minimize clicks for writing, capturing, and finding information.
-   Default capture to the last-used notebook when available.
-   Allow editing title, URL, and optional description before saving.
-   Provide keyboard accessibility, visible focus, and clear feedback.

## Definition of done

A feature must work in Chrome, handle error states, persist across
restart, include relevant tests, pass type/lint/build checks when
configured, and respect the privacy and scope rules above.

## Initial implementation order

1.  Scaffold WXT + React + TypeScript.
2.  Define and test versioned document schema.
3.  Implement IndexedDB repository and migration entry point.
4.  Build notebook list and document editor.
5.  Add autosave and outline.
6.  Add active-tab capture.
7.  Add local search and result navigation.
8.  Add validated JSON import/export.
9.  Test accessibility, privacy, permissions, and release packaging.

## Development workflow

Inspect the repository first. Plan non-trivial work, implement in small
increments, run available checks, and report what was actually tested.
Never claim a test passed unless it ran.
