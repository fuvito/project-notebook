# Security Policy — Project Notebook

## Scope

This document covers the security posture of the Project Notebook Chrome extension and its source code. It defines what to report, what is out of scope, and how to report a vulnerability responsibly.

---

## What this extension does and does not do

Understanding the design is important before deciding whether something is a vulnerability.

### By design — not bugs

| Behaviour | Reason |
|---|---|
| Notebook content is not encrypted at rest | Local-first design; encryption at rest requires a passphrase or keychain integration, which is out of scope for this MVP |
| IndexedDB data can be read by Chrome DevTools | Standard browser behaviour; all local extension storage is accessible to anyone with DevTools access to the profile |
| No authentication or access control | Single-user, local-only design; no server to authenticate against |
| Data can be lost if Chrome clears storage | IndexedDB is a browser-managed store; this is documented behaviour, not a bug |

These are **known limitations**, not vulnerabilities. Please do not report them as security issues.

---

## This extension is NOT suitable for storing

- Passwords or passphrases
- API keys, tokens, or secrets
- Private keys or certificates
- Authentication credentials of any kind
- Any value that would cause harm if read by another person with access to the device

This is documented prominently in the README and PRIVACY policy. The extension provides no encryption, no access control, and makes no confidentiality claims about stored content.

---

## Supported versions

Only the latest release published on the Chrome Web Store and the latest commit on the `main` branch are supported. Older versions are not patched.

---

## Reporting a vulnerability

If you discover a genuine security vulnerability — for example, a way to read another extension's or website's data, bypass Chrome's security boundaries, or inject executable code — please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.** Public disclosure before a fix is available puts users at risk.

### How to report

Open a **private** GitHub Security Advisory:

1. Go to [github.com/fuvito/project-notebook/security/advisories](https://github.com/fuvito/project-notebook/security/advisories)
2. Click **New draft security advisory**
3. Describe the issue, steps to reproduce, and potential impact

Alternatively, email the maintainer directly (address on the GitHub profile). Include "Project Notebook — Security" in the subject line.

### What to include

- A clear description of the vulnerability
- Steps to reproduce (or a proof-of-concept if applicable)
- The version or commit where you found it
- Your assessment of impact and exploitability

### Response expectations

This is an open-source project maintained in spare time. There is no guaranteed SLA, but the aim is to:

- Acknowledge the report within 7 days
- Provide an initial assessment within 14 days
- Release a fix or publish a mitigation within 60 days for confirmed vulnerabilities

You will be credited in the release notes unless you prefer to remain anonymous.

---

## Out of scope

The following are **not** in scope for security reports:

- Storing secrets in notebooks (documented limitation — use a password manager)
- Data loss due to clearing browser data (documented limitation — export regularly)
- Lack of encryption at rest (documented design decision)
- Lack of authentication or access control (documented design decision)
- Vulnerabilities in dependencies that have no credible exploit path in this extension's context
- Issues that require physical access to an already-unlocked device and Chrome profile
- Social engineering attacks outside the extension itself

---

## Unofficial builds

The only official, verified builds of Project Notebook are:

1. The Chrome Web Store listing published by the verified developer account
2. Source code built from [github.com/fuvito/project-notebook](https://github.com/fuvito/project-notebook)

The maintainers accept no responsibility for vulnerabilities introduced in unofficial forks, redistributions, or third-party builds. If you encounter a suspicious version of this extension, do not install it and report it to the [Chrome Web Store](https://support.google.com/chrome_webstore/answer/1050566).

---

© [Fuat Yazar](https://github.com/fuvito)
