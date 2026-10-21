import { expect, test } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getExtensionId, launchWithExtension } from './fixtures.ts';

// Persistence tests manage their own contexts so they can open the same
// user-data dir twice — once to write, once to verify.
test.describe('Persistence', () => {
  test('notebook list survives popup close and reopen', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-persist-'));
    try {
      // ── Session 1: create two notebooks ─────────────────────────────────────
      const ctx1 = await launchWithExtension(dir);
      const id = await getExtensionId(ctx1);
      const popupUrl = `chrome-extension://${id}/popup.html`;

      const p1 = await ctx1.newPage();
      await p1.goto(popupUrl);
      await p1.waitForLoadState('networkidle');

      for (const name of ['Alpha', 'Beta']) {
        await p1.getByRole('button', { name: 'New notebook' }).click();
        await p1.getByLabel('New notebook name').fill(name);
        await p1.keyboard.press('Enter');
        await p1.getByRole('button', { name, exact: true }).waitFor();
      }

      await ctx1.close();

      // ── Session 2: verify notebooks are still there ──────────────────────────
      const ctx2 = await launchWithExtension(dir);
      const p2 = await ctx2.newPage();
      await p2.goto(popupUrl);
      await p2.waitForLoadState('networkidle');

      await expect(p2.getByRole('button', { name: 'Alpha', exact: true })).toBeVisible({ timeout: 5000 });
      await expect(p2.getByRole('button', { name: 'Beta', exact: true })).toBeVisible();

      await ctx2.close();
    } finally {
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* ok on Windows */ }
    }
  });

  test('editor content survives popup close and reopen', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-persist-'));
    try {
      // ── Session 1: type content and wait for autosave ────────────────────────
      const ctx1 = await launchWithExtension(dir);
      const id = await getExtensionId(ctx1);
      const popupUrl = `chrome-extension://${id}/popup.html`;

      const p1 = await ctx1.newPage();
      await p1.goto(popupUrl);
      await p1.waitForLoadState('networkidle');

      await p1.getByRole('button', { name: 'New notebook' }).click();
      await p1.getByLabel('New notebook name').fill('Persist Me');
      await p1.keyboard.press('Enter');
      await p1.getByRole('button', { name: 'Persist Me', exact: true }).click();
      await p1.locator('[data-testid="notebook-editor"]').waitFor();
      await p1.locator('.notebook-editor').click();
      await p1.keyboard.type('persistent content xyz');

      // Wait for autosave (800ms debounce + margin)
      await p1.getByText('Saving…').waitFor({ timeout: 2000 }).catch(() => {});
      await p1.getByText('Saved').waitFor({ timeout: 3000 });

      await ctx1.close();

      // ── Session 2: verify editor content survived ────────────────────────────
      const ctx2 = await launchWithExtension(dir);
      const p2 = await ctx2.newPage();
      await p2.goto(popupUrl);
      await p2.waitForLoadState('networkidle');

      await p2.getByRole('button', { name: 'Persist Me', exact: true }).click();
      await expect(p2.locator('[data-testid="notebook-editor"]')).toContainText(
        'persistent content xyz',
        { timeout: 5000 },
      );

      await ctx2.close();
    } finally {
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* ok on Windows */ }
    }
  });

  // Scroll position restoration is verified manually (see RELEASE_CHECKLIST.md).
  // It requires a programmatic scroll + 300ms debounce + content re-load in a second
  // session, which is too timing-sensitive to automate reliably.
});
