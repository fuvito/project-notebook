import { chromium, test as base, type BrowserContext, type Page } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXTENSION_PATH = path.resolve(__dirname, '../.output/chrome-mv3');

export async function launchWithExtension(userDataDir: string): Promise<BrowserContext> {
  return chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
}

export async function getExtensionId(ctx: BrowserContext): Promise<string> {
  // Fast path: Playwright already tracked the service worker.
  const [existing] = ctx.serviceWorkers();
  if (existing) return existing.url().split('/')[2];

  // Set up a listener before opening any pages to avoid a race.
  const swPromise = ctx.waitForEvent('serviceworker', { timeout: 5_000 }).catch(() => null);

  // Opening a blank page can trigger extension service-worker initialisation.
  const helperPage = await ctx.newPage();
  await helperPage.goto('about:blank');

  const sw = await swPromise;
  if (sw) {
    await helperPage.close();
    return sw.url().split('/')[2];
  }

  // Fallback: use CDP Target.getTargets which lists ALL browser targets,
  // including extension service workers that Playwright doesn't surface via the SW API.
  await helperPage.waitForTimeout(1500);
  const client = await ctx.newCDPSession(helperPage);
  const { targetInfos } = await client.send('Target.getTargets', {});
  await client.detach();
  await helperPage.close();

  const extTarget = (targetInfos as Array<{ type: string; url: string }>).find(
    t =>
      (t.type === 'service_worker' || t.type === 'background_page') &&
      t.url.startsWith('chrome-extension://'),
  );

  if (!extTarget) {
    throw new Error('Extension not found. Make sure the extension is built (npm run build).');
  }
  return extTarget.url.split('/')[2];
}

interface ExtFixtures {
  userDataDir: string;
  context: BrowserContext;
  extensionId: string;
  popup: Page;
}

export const test = base.extend<ExtFixtures>({
  userDataDir: async ({}, use) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-ext-'));
    await use(dir);
    // Chrome may briefly hold file locks after context.close(); ignore cleanup errors.
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* ok */ }
  },

  context: async ({ userDataDir }, use) => {
    const ctx = await launchWithExtension(userDataDir);
    await use(ctx);
    await ctx.close();
  },

  extensionId: async ({ context }, use) => {
    await use(await getExtensionId(context));
  },

  popup: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    // Extension popups never reach networkidle (background messaging keeps sockets open).
    // Wait for the React app to mount instead.
    await page.locator('nav[aria-label="Notebooks"], nav[aria-label="Search"]').waitFor({ timeout: 10_000 });
    await use(page);
  },
});

export const expect = test.expect;
