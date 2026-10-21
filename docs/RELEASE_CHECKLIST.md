# Pre-Release Manual Testing Checklist

Automated Playwright tests cover core CRUD, editor formatting, search navigation, and
persistence. The items below require a real Chrome install and cannot be automated easily.
Work through them top to bottom before tagging a release.

---

## Setup

- [ ] Run `npm run build` and verify no build errors
- [ ] Load the unpacked extension from `.output/chrome-mv3` in `chrome://extensions`
- [ ] Confirm the extension icon appears in the Chrome toolbar
- [ ] Confirm the permissions prompt shows "Read your browsing history" (activeTab)

---

## 1 — Tab capture (🔗 button)

- [ ] Navigate to any real web page (e.g. GitHub)
- [ ] Open the popup, select or create a notebook
- [ ] Click the 🔗 button — the CaptureBar should appear with the page's URL and title pre-filled
- [ ] Click "Save" — a link card is inserted into the editor
- [ ] Verify the link card shows the correct title, URL, and optionally description
- [ ] On a `chrome://` page or `about:blank`, the 🔗 button should either be disabled or show a helpful error message

---

## 2 — Link cards

- [ ] Click a link card's URL → page opens in a **background tab** (popup stays open and focused)
- [ ] Edit the link card title inline and confirm the change persists after reopening the popup
- [ ] Delete a link card (if that UI exists) and verify it's gone after reopening

---

## 3 — Inline links

- [ ] Paste a URL directly into the editor body → it should auto-convert to a clickable `notebook-link`
- [ ] Type a URL ending with a space → it should auto-link
- [ ] Click an inline link → opens in a background tab; popup remains open
- [ ] Reopen the popup and confirm inline links are still clickable (not converted back to plain text)

---

## 4 — Fullscreen window

- [ ] Open the popup and click ⤢ → a fullscreen window opens and the popup closes
- [ ] Type content in the fullscreen window and verify it saves (status bar shows "Saved")
- [ ] Close the fullscreen window; reopen the popup; confirm the content typed in fullscreen is present
- [ ] Verify the fullscreen window has no restore-to-popup button (the OS window controls are sufficient)

---

## 5 — Popup sizing and layout

- [ ] Popup opens at 720 × 540 px (verify with DevTools or by eye)
- [ ] Sidebar + editor split looks correct; no overflow or clipping
- [ ] The "⤢ Full screen" button is visible in the popup editor toolbar but hidden in fullscreen mode

---

## 6 — Search edge cases

- [ ] Search for a term that appears in multiple notebooks → results are grouped by notebook name
- [ ] Click results from different notebooks in rapid succession → the editor switches notebooks each time
- [ ] Click the same result twice → cursor moves to the match both times (not stuck on first click)
- [ ] Search for a term at the end of a long document → the editor scrolls to bring it into view

---

## 7 — Multiple notebooks

- [ ] Create 5+ notebooks; verify the sidebar scrolls correctly
- [ ] Switch between notebooks — each retains its own content and scroll position
- [ ] Delete a selected notebook — the editor clears and the placeholder is shown

---

## 8 — Markdown export (↓ .md button)

- [ ] Open a notebook with headings, paragraphs, bullets, and a link card
- [ ] Click **↓ .md** in the toolbar — browser download prompt appears (or file downloads automatically)
- [ ] Downloaded filename matches the notebook title (e.g. `My Project.md`)
- [ ] Open the file in a text editor — title is the first H1, headings/bullets/links render correctly
- [ ] Link card with a description exports as `[title](url)` followed by `> description`
- [ ] Bold and italic text in paragraphs/bullets is wrapped in `**` / `*`
- [ ] Notebook title containing special characters (e.g. `API / Keys`) — filename uses `-` instead (`API - Keys.md`)
- [ ] Click ↓ .md while the editor has unsaved changes — the downloaded file reflects the current (unsaved) content

---

## 9 — Edge cases and robustness (general)

- [ ] Notebook title with emoji (e.g. "🚀 Launch") — renders correctly, search finds it
- [ ] Very long notebook title (200 chars) — truncates in the sidebar without breaking layout
- [ ] Very long URL in a link card — wraps or truncates without overflowing
- [ ] Large notebook (~50 headings, ~200 paragraphs) — no noticeable typing lag
- [ ] Rapidly clicking different search results — cursor always moves to the correct match

---

## 10 — Browser compatibility

- [ ] All of the above on **Chrome Stable** (current release)
- [ ] Open popup on **Microsoft Edge** — basic functionality works (Edge is Chromium-based)

---

## 11 — Clean install

- [ ] Remove the extension, reinstall from unpacked
- [ ] Confirm all notebooks and content are gone (IndexedDB is cleared with the extension)
- [ ] Recreate a notebook and confirm normal operation after a clean install
