# Project Notebook — Links & Notes for Developers

**Keep project links and working notes in one place — right in your browser.**

Project Notebook is a local-first Chrome extension that lets you create separate notebooks per project, write structured notes, capture pages with a single click, and find anything later with instant search.

No accounts. No backend. No cloud sync. Your data stays on your device.

> **Official source notice** — The only official, secure, and verified distribution of Project Notebook is the listing on the [Chrome Web Store](#chrome-web-store-listing). Installing this extension from any other source, repository, or third-party store is unauthorized, unverified, and entirely at your own risk. Unofficial builds may contain modified or malicious code. Always verify the publisher before installing.

---

## Important notices

> ⚠ **Not a password manager** — Project Notebook does not encrypt data at rest. IndexedDB content is accessible to Chrome and to anyone with physical or OS-level access to your device. **Do not store passwords, API keys, tokens, private keys, credentials, or any information you would treat as a secret.** Use a dedicated password manager (such as Bitwarden, 1Password, or your OS keychain) for that purpose. This extension makes no security or confidentiality claims about its stored content.

> ⚠ **Data availability** — Notebook data is stored in the browser's IndexedDB. Chrome can clear this storage if disk space is critically low, if you clear site data, or if you reset the browser profile. **Export your notebooks regularly** using the built-in JSON export to avoid data loss. The authors accept no liability for lost content.

> ⚠ **Sensitive content you paste** — The extension saves whatever text you type or paste into a notebook. It does not detect, warn about, or redact sensitive values. You are responsible for what you write into your notebooks. See the notice above about secrets.

---

## Features

- **Project notebooks** — create a separate notebook for each project, client, or topic
- **Structured editor** — write headings (H1–H3), paragraphs, bullets, and link cards
- **Page capture** — save the active tab's title and URL into a notebook in two clicks
- **Link cards** — store a link with its title, URL, and an optional description; open it in one click
- **Autosave** — changes are saved automatically; save status is always visible
- **Instant local search** — search across all notebook titles, headings, notes, and link text
- **Export / import** — back up all notebooks as versioned JSON; restore on any device
- **Fully offline** — no network requests; all data stored locally via IndexedDB
- **No account or subscription** — install and use immediately

---

## Browser support

| Browser | Status |
|---|---|
| Chrome | v1 — initial release |
| Edge | Planned (Chromium-based, likely works) |
| Firefox | Planned |
| Safari | Not planned for MVP |

---

## Installation

### From the Chrome Web Store _(coming soon)_

Search for **Project Notebook** in the [Chrome Web Store](https://chrome.google.com/webstore) and click **Add to Chrome**.

### From source (manual install)

1. Clone and build:
   ```bash
   git clone https://github.com/fuvito/project-notebook.git
   cd project-notebook
   npm install
   npm run build
   ```
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the `.output/chrome-mv3/` folder
5. The Project Notebook icon appears in your toolbar — click it to open

To update after pulling new changes, run `npm run build` again and click the refresh icon on the extension card.

---

## Development

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- Google Chrome (for loading the extension in dev mode)

### Getting started

```bash
git clone https://github.com/fuvito/project-notebook.git
cd project-notebook
npm install          # installs deps and runs wxt prepare
npm run icons        # generate icon PNGs in public/
npm run dev          # start WXT dev mode — opens Chrome with the extension loaded
```

For quick UI work without installing the extension, use the Vite dev server:

```bash
npm run serve
# opens http://localhost:5173 in your default browser
```

> Chrome APIs (`chrome.storage`, `chrome.tabs`) are not available in this mode. As Chrome API calls are added in later phases, mock adapters will be introduced so the serve mode stays usable.

For full extension testing (Chrome APIs included), use WXT dev mode:

`npm run dev` uses WXT's development server, which:
- Builds the extension and opens Chrome automatically with it installed
- Watches for file changes and hot-reloads the extension
- Shows build errors in the terminal

You can also load the extension manually in Chrome at any time:

```bash
npm run build
# then load .output/chrome-mv3/ as an unpacked extension in chrome://extensions
```

### Running checks

```bash
npm run typecheck    # TypeScript type check
npm run lint         # Biome lint
npm test             # Vitest unit tests (run once)
npm run test:watch   # Vitest in watch mode
```

Run all three before opening a pull request:

```bash
npm run typecheck && npm run lint && npm test
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run serve` | Vite dev server at `http://localhost:5173` — test the popup UI in a browser tab without installing the extension |
| `npm run dev` | WXT dev mode — builds, opens Chrome with the extension, and hot-reloads on changes |
| `npm run build` | Production build to `.output/chrome-mv3/` |
| `npm run zip` | Production build + zip archive ready for Chrome Web Store upload |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm test` | Vitest unit tests (single run) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | Biome lint check |
| `npm run icons` | Regenerate `public/icon16/48/128.png` from `scripts/generate-icons.mjs` |

### Packaging for the Chrome Web Store

```bash
npm run zip
```

WXT builds and packages the extension automatically. The zip file is written to `.output/`. Upload it at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## Project structure

```
project-notebook/
  public/
    icon16.png            toolbar and store icon (16 px)
    icon48.png            toolbar and store icon (48 px)
    icon128.png           toolbar and store icon (128 px)
  scripts/
    generate-icons.mjs    Node.js icon generator — no extra deps
  src/
    entrypoints/
      popup/
        index.html        extension popup shell
        main.tsx          React root
        App.tsx           top-level component
      background.ts       MV3 service worker (capture logic, install events)
    types/
      schema.ts           Zod schemas + TypeScript types for notebooks and blocks
    db/
      repository.ts       IndexedDB CRUD via idb
      migrations.ts       versioned schema migrations
    services/
      search.ts           local case-insensitive substring search
      backup.ts           versioned JSON export / validated import
    components/           React UI components
    hooks/                custom React hooks (autosave, notebook state)
  docs/
    BRD.md                business requirements
    CLAUDE.md             AI coding guide for this project
    TECH_DESIGN.md        technical design document
    TASKLIST.md           phased task list
  wxt.config.ts           WXT + manifest config
  vitest.config.ts        Vitest config (jsdom environment)
  tsconfig.json           TypeScript config
  biome.json              Biome lint config
  package.json
```

> **Note:** `src/types/`, `src/db/`, `src/services/`, `src/components/`, and `src/hooks/` are populated in later phases. See [TASKLIST.md](docs/TASKLIST.md) for the implementation roadmap.

---

## Tech stack

| Layer | Library | Notes |
|---|---|---|
| Framework | WXT 0.21 | Browser extension framework, MV3, HMR dev mode |
| UI | React 19 + TypeScript 7 | |
| Editor | TipTap 3 | ProseMirror-based rich text, headings + bullets + links |
| Persistence | IndexedDB via idb 8 | Local-only; no chrome.storage.sync |
| Validation | Zod 4 | Schema validation for stored and imported data |
| Bundler | Vite 8 | Via WXT |
| Testing | Vitest 5 + React Testing Library 16 | jsdom environment |
| Lint | Biome 2 | Lint only; formatting is out of scope |
| Font | Inter Variable | Via @fontsource-variable/inter |

---

## Data model

Notebooks are stored in IndexedDB. Each notebook contains an ordered list of typed blocks:

```typescript
type NotebookBlock =
  | { id: string; type: 'heading';   level: 1 | 2 | 3; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'bullet';    text: string }
  | { id: string; type: 'link';      url: string; title: string; description?: string; savedAt: number }
```

The export format is versioned JSON. Schema version is checked on import; unknown versions are rejected with a clear error. See `src/types/schema.ts` for the full Zod schema.

---

## Chrome Web Store listing

The following copy is ready for the CWS submission form.

### Single purpose statement
```
Project Notebook lets users create local notebooks to write notes, save links with context, capture active tab pages, and search their content — all stored privately on the device.
```

### Permission justification

| Permission | Justification |
|---|---|
| `storage` | Persists all notebook content (notes, links, headings) in IndexedDB on the user's device. No data leaves the device. |
| `activeTab` | Reads the active tab's title and URL only when the user explicitly clicks **Capture page**. The extension never reads tab content, never runs on page load, and never accesses tabs the user has not explicitly chosen to capture. |

### Remote code

**No.** All JavaScript is bundled at build time by Vite/WXT. Nothing is fetched and executed at runtime. The extension contains no `eval()`, `new Function()`, or dynamically injected `<script>` tags.

### Name (45 chars max)
```
Project Notebook — Dev Links & Notes
```

### Short description (132 chars max)
```
Write notes, save links with context, and capture pages — all in local project notebooks. No account. No sync. Fully private.
```

### Detailed description
```
Project Notebook is a local-first browser notebook for developers and technical users who need to keep project links, references, and working notes in one organised place.

WHY PROJECT NOTEBOOK
Most project resources end up scattered across bookmarks, spreadsheets, Slack messages, and browser tabs. A bare URL tells you nothing about why it matters or where it fits. Project Notebook keeps the link and the context together, organised by project.

HOW IT WORKS
1. Create a notebook for each project or topic
2. Write headings, paragraphs, and bullet points — or just capture the active tab
3. Each captured page becomes a link card with title, URL, and an optional description
4. Use search to find anything across all notebooks instantly

KEY FEATURES
✓ Separate notebooks per project — keep work, side projects, and research apart
✓ Structured editor — H1–H3 headings, paragraphs, bullets, and link cards
✓ One-click page capture — saves the active tab's title and URL into a chosen notebook
✓ Autosave — your notes are never lost; save status is always visible
✓ Instant local search — searches titles, headings, notes, and link text
✓ Export / import — versioned JSON backup; restore on any machine
✓ Fully offline — no internet connection required after install
✓ No account, no subscription, no cloud sync
✓ Open source — MIT licence, code on GitHub

PRIVACY
All data is stored only on your device using IndexedDB. The extension makes no network requests. The only external resource accessed is the active tab's URL and title, and only when you explicitly click Capture — never automatically.
```

### Category
`Productivity`

---

## Contributing

Contributions are welcome. Please open an issue before starting significant work so the approach can be discussed.

### Guidelines

- Follow the phased implementation order in [TASKLIST.md](docs/TASKLIST.md)
- Keep Chrome APIs behind adapter modules in `src/db/` and `src/services/` — never call them directly from components
- New features need tests; existing tests must not regress
- Run `npm run typecheck && npm run lint && npm test` before opening a PR

### Hard rules — PRs that violate these will not be merged

- **No network requests.** The extension must never contact any external server, API, analytics service, or telemetry endpoint. This is a core privacy guarantee, not a preference.
- **No credential or secret fields.** Do not add any field, label, placeholder, or affordance that implies the extension is suitable for storing passwords, tokens, API keys, or secrets.
- **No weakening of import validation.** Imported JSON must always be fully validated against the Zod schema. URL schemes must always be checked. Do not relax these guards.
- **No logging of content.** Never log, report, or transmit notebook text, link URLs, or any user-entered content — not even to the browser console in production builds.
- **No broad host permissions.** Do not request `<all_urls>`, `tabs`, `history`, `cookies`, or any permission not listed in the current manifest.

### Architecture constraints (from CLAUDE.md)

- Editor/document model must stay independent of Chrome APIs
- Use the repository abstraction for all persistence; do not call `indexedDB` directly
- Treat imported JSON as untrusted — validate schema, URL schemes, and size limits
- Debounce autosave; surface save failures; never silently discard dirty changes

---

## Privacy & security

Project Notebook stores all data locally on your device using IndexedDB. It makes no network requests, collects no analytics, and transmits nothing. The only external data it reads is the active tab title and URL — and only when you explicitly click **Capture page**.

**Data is not encrypted at rest.** Do not store passwords, API keys, tokens, or secrets. See the [Important notices](#important-notices) section above.

- [PRIVACY.md](PRIVACY.md) — full privacy policy
- [SECURITY.md](SECURITY.md) — security posture, limitations, and vulnerability reporting

---

## License

The source code is released under the **MIT License** — see [LICENSE](LICENSE) for the full text.

**Trademark notice** — The name **Project Notebook**, the extension icon, and all associated branding are reserved and are **not** covered by the MIT License. You may use, modify, and redistribute the source code under MIT terms, but you may not use the Project Notebook name, logo, or branding in derivative works or redistributions without explicit written permission from the author.

© [Fuat Yazar](https://github.com/fuvito)
