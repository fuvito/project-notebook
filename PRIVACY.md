# Privacy Policy — Project Notebook

**Last updated:** 2026-10-20

## Summary

Project Notebook stores all data on your device and makes no external network requests. Nothing you write, save, or capture is ever transmitted to any server.

---

## What this extension is NOT

- **Not a password manager.** Project Notebook does not encrypt data at rest. Do not store passwords, API keys, tokens, private keys, or any value you treat as a secret. Use a dedicated password manager for that purpose.
- **Not a secure notes app.** There is no passphrase, no encryption layer, and no access control. Anyone with access to your Chrome profile can read your notebooks.
- **Not a backup service.** IndexedDB data can be cleared by Chrome under low-disk conditions or when you clear browsing data. Export regularly.
- **Not a collaboration tool.** Notebooks exist only on the device where they were created unless you manually export and import them.

---

## What data is stored

Project Notebook stores the following data **locally on your device** using the browser's IndexedDB API:

- Notebook names and content (headings, notes, bullet points, link cards)
- Link titles, URLs, and descriptions you have saved
- Your last-used notebook preference

This data never leaves your device.

## What data is collected

**None.** Project Notebook collects no analytics, no telemetry, no usage statistics, and no personally identifiable information.

## Network requests

Project Notebook makes no network requests of its own. It does not contact any external server, API, or analytics service.

The only situation in which any tab data is read is when you explicitly click **Capture page** inside the extension popup. At that moment, the extension reads the active tab's title and URL and inserts them into the notebook you have selected. This read happens on your device only — the title and URL are never transmitted anywhere.

## Permissions explained

| Permission | Why it is needed |
|---|---|
| `storage` | Saves and loads your notebooks locally using IndexedDB. Without this, your notes would not survive a browser restart. |
| `activeTab` | Reads the current tab's title and URL when you explicitly click **Capture page**. The permission is never used automatically or in the background. |

## Third-party services

Project Notebook uses no third-party services, SDKs, or embedded scripts that could collect data.

## Export and import

When you use the Export feature, a JSON file is saved to your device — it goes where your browser sends downloads. This file contains your notebook content. You control it entirely; the extension does not retain any copy or log.

When you use Import, the file you select is read locally and validated on your device. It is never uploaded.

## Security limitations

- **No encryption at rest.** Notebook content is stored as plain data in IndexedDB. It is not encrypted by the extension. Chrome's storage sandbox prevents other websites from reading it, but it is not protected against local access or Chrome profile export.
- **Data availability is not guaranteed.** IndexedDB is a browser-managed store. Chrome may evict data when disk space is critically low. Do not treat this extension as your only copy of important information.
- **Import validation.** Imported JSON files are validated against the schema, size limits are enforced, and URL schemes are checked before content is accepted. Validation failures are shown as explicit errors and the import is rejected. Invalid or oversized files are never silently accepted.
- **No remote code.** All extension code is bundled at build time. The extension never fetches or executes code from the network.

## Official builds

The only trustworthy distribution of Project Notebook is:

1. The listing on the **Chrome Web Store** (published by the verified developer account)
2. Source code built from **this repository** at [github.com/fuvito/project-notebook](https://github.com/fuvito/project-notebook)

Do not install the extension from unofficial sources. Third-party redistributions may contain altered code.

## Children

Project Notebook does not knowingly collect data from or target children. The extension collects no data from anyone.

## Changes to this policy

If this policy changes materially, the updated version will be committed to this repository with a revised date above.

## Contact

Open an issue at [github.com/fuvito/project-notebook](https://github.com/fuvito/project-notebook) if you have questions about privacy or data handling.

For security vulnerabilities, see [SECURITY.md](SECURITY.md) — do not open a public issue for security reports.
