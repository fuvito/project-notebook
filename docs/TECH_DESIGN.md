# Technical Design --- Project Notebook

**Status:** Proposed MVP\
**Platform:** Chrome extension, Manifest V3\
**Architecture:** React + TypeScript, local-first, no backend

## 1. Goals

Keep implementation manageable for one developer; separate editor from
browser APIs; persist data reliably; support fast capture and local
search; keep data private and portable.

## 2. Architecture

``` text
Chrome toolbar action
        |
        v
Capture UI -----> Chrome tabs API (active tab title + URL)
        |
        v
Notebook UI (list, editor, outline, search)
        |
        v
Notebook repository
        |
        v
IndexedDB

Import/export service <----> Versioned JSON
Search service -----------> Local notebook content
```

### Components

-   **Notebook UI:** notebook list, editor, outline, search.
-   **Capture flow:** explicit user-triggered read of active-tab
    title/URL.
-   **Document model:** versioned ordered blocks.
-   **Repository:** notebook CRUD and persistence.
-   **Search:** local text matching.
-   **Import/export:** versioned JSON serialization and validation.

## 3. Suggested stack

-   WXT + Vite
-   React + TypeScript
-   Manifest V3
-   TipTap / ProseMirror
-   IndexedDB, optionally via a small wrapper such as `idb`
-   Zod or equivalent schema validation
-   Vitest + React Testing Library

Verify current stable versions and Chrome compatibility during setup. Do
not add a backend or global state library without a concrete need.

## 4. Data model

``` typescript
type Notebook = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  content: {
    version: 1;
    blocks: NotebookBlock[];
  };
};

type NotebookBlock =
  | { id: string; type: "heading"; level: 1 | 2 | 3; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "bullet"; text: string }
  | {
      id: string;
      type: "link";
      url: string;
      title: string;
      description?: string;
      savedAt: number;
    };
```

This is the portable conceptual schema. If TipTap JSON is used
internally, create a conversion and validation boundary rather than
coupling exports to undocumented editor internals.

### IndexedDB stores

-   `notebooks`: key path `id`; stores title, timestamps, and versioned
    content.
-   `settings`: key/value settings such as `lastUsedNotebookId`.

Start with a simple store. Add a separate block store or search index
only after measuring a performance problem.

## 5. Persistence

-   Load notebook when selected.
-   Keep current editor state in memory.
-   Debounce saves (initial target 300--600 ms).
-   Update `updatedAt` only after successful persistence.
-   Show saving/saved/error state.
-   Do not silently discard dirty changes when switching notebooks.
-   Use transactions where related writes must remain consistent.

## 6. Capture flow

1.  User invokes the extension.
2.  Read active tab using least-privilege APIs/permissions.
3.  Populate title and URL.
4.  Let user choose notebook and edit title/URL/add description.
5.  Validate URL and protocol.
6.  Insert link block at a predictable location.
7.  Persist and show confirmation.

Do not scrape page contents. Capture only title and URL on explicit user
action.

## 7. Search

For MVP, use case-insensitive substring matching over notebook title,
heading text, paragraphs, bullets, link title, URL, and description.
Return notebook ID, matching block ID/type, and a useful snippet.
Selecting a result opens the notebook and focuses or scrolls to the
block. Start with in-memory/local search; optimize only after measuring
scale.

## 8. Import/export

-   Export all notebooks as versioned JSON.
-   Validate schema, IDs, timestamps, block types, text sizes, URL
    schemes, and schema version.
-   Reject unsupported versions with a clear message.
-   Never render imported text as raw HTML or execute it.
-   Offer explicit conflict choices such as import as copies with new
    IDs or replace all; never silently overwrite.
-   Test malformed and oversized files.

## 9. Permissions and security

-   Use Manifest V3.
-   Request only permissions needed for storage and user-triggered
    active-tab capture.
-   Prefer `activeTab` where compatible with the chosen UI.
-   Avoid broad host permissions.
-   Allow `http:` and `https:` links by default; reject
    executable/unsupported schemes in imported data.
-   No password/API-key fields; clearly state this is not a password
    manager.
-   No remote API calls or telemetry.
-   Do not log notebook content or full URLs.

## 10. UI proposal

-   **Notebook list:** list, create action, search.
-   **Editor:** title, document editor, outline, save status.
-   **Capture popup:** page title/URL, notebook selector, optional
    description, save action.
-   **Settings:** import/export, privacy explanation, app version.

The editor is the main experience; the popup is a quick capture entry
point. Consider Chrome side panel only after validating the core
workflow.

## 11. Testing

-   Unit: schema, URL validation, repository, search, import/export.
-   Component: notebook list, editor state, capture form, save/error
    indicators.
-   Manual integration: install extension, capture tab, restart browser,
    export/import.
-   Quality: type-check, lint, production build, keyboard navigation,
    permission review.

## 12. Risks

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Editor scope grows                  Limit blocks and use mature editor

  Data loss                           Autosave, repository tests,
                                      export/import

  Permission concerns                 Least privilege and explanations

  Search performance                  Start simple and measure

  Bad import data                     Schema validation, URL checks, size
                                      limits

  Users paste secrets                 Warning; no credential feature or
                                      security claims
  -----------------------------------------------------------------------

## 13. Implementation order

1.  Scaffold extension.
2.  Implement schema, validation, repository.
3.  Build notebook list and editor.
4.  Add autosave and outline.
5.  Add capture.
6.  Add search and result navigation.
7.  Add import/export.
8.  Test privacy, accessibility, permissions, and packaging.

## 14. Deferred decisions

Final name; popup vs side panel as primary editor; Markdown
import/export; sync; any Google integration; shared notebooks.
