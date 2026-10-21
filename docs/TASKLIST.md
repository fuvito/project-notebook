# Project Notebook --- MVP Task List

Use `[ ]` for incomplete tasks and `[x]` for completed tasks.

## Phase 0 --- Setup

-   [ ] Confirm product/extension name.
-   [ ] Create repository and README.
-   [ ] Scaffold WXT + React + TypeScript, Manifest V3.
-   [ ] Add format, lint, type-check, test, and build scripts.

## Phase 1 --- Model and persistence

-   [ ] Define versioned Notebook and NotebookDocument types.
-   [ ] Define heading, paragraph, bullet, and link blocks.
-   [ ] Add schema validation for stored/imported data.
-   [ ] Implement IndexedDB repository and CRUD operations.
-   [ ] Add stable IDs and created/updated timestamps.
-   [ ] Add migration entry point.
-   [ ] Test repository, validation, and migrations.

## Phase 2 --- Notebook management

-   [ ] Build notebook list and create/rename/delete flows.
-   [ ] Add empty states and destructive-action confirmation.
-   [ ] Store last-used notebook preference.
-   [ ] Test persistence after reload and browser restart.

## Phase 3 --- Editor

-   [ ] Integrate TipTap/ProseMirror with minimal extensions.
-   [ ] Support H1--H3, paragraphs, bullets, and links.
-   [ ] Render link title, URL, and optional description.
-   [ ] Derive outline from headings.
-   [ ] Implement debounced autosave and save/error states.
-   [ ] Handle notebook switching without losing dirty changes.
-   [ ] Test serialization and keyboard/accessibility behavior.

## Phase 4 --- Capture

-   [ ] Implement user-triggered active-tab capture.
-   [ ] Read active tab title and URL with minimum permissions.
-   [ ] Build capture UI with notebook selector.
-   [ ] Default to last-used notebook when available.
-   [ ] Allow editing title/URL and adding a description.
-   [ ] Insert link block at a predictable location.
-   [ ] Show success/error feedback; handle unsupported tabs.
-   [ ] Manually test in Chrome.

## Phase 5 --- Search

-   [ ] Search notebook title, headings, paragraphs, bullets, link
    title, URL, description.
-   [ ] Show useful snippets and notebook name.
-   [ ] Open notebook and focus/scroll to matching block.
-   [ ] Add no-results state and tests.

## Phase 6 --- Backup/restore

-   [ ] Export notebooks as versioned JSON.
-   [ ] Import with schema/version validation.
-   [ ] Define duplicate/conflict behavior; never silently overwrite.
-   [ ] Validate URL schemes and file size.
-   [ ] Test malformed files and round-trip export/import.

## Phase 7 --- Release readiness

-   [ ] Run tests, type check, lint, and production build.
-   [ ] Review permissions and verify no network transmission of
    notebook data.
-   [ ] Test browser restart, save failures, and data recovery.
-   [ ] Test keyboard navigation and focus visibility.
-   [ ] Write README and privacy explanation.
-   [ ] Prepare listing screenshots and manually test release package.
-   [ ] Pilot with individual developers and collect feedback.

## Deferred

-   [ ] Google Docs integration/OAuth
-   [ ] Cloud sync/accounts/collaboration
-   [ ] Passwords, API keys, tokens, or secrets vault
-   [ ] AI, embeddings, semantic search
-   [ ] Tasks, reminders, calendar
-   [ ] Rich media, tables, complex drag-and-drop editing

## Release gate

A user can create/edit a notebook, retain changes after browser restart,
capture a page, find it later via search, and successfully export/import
data.
