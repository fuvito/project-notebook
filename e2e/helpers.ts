import type { Page } from '@playwright/test';

/** Creates a notebook via the sidebar + form and waits for it to appear in the list. */
export async function createNotebook(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'New notebook' }).click();
  await page.getByLabel('New notebook name').fill(name);
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name, exact: true }).waitFor();
}

/** Clicks a notebook in the sidebar and waits for the editor to load. */
export async function openNotebook(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name, exact: true }).click();
  await page.locator('[data-testid="notebook-editor"]').waitFor();
}

/** Types text into the TipTap editor (requires it to already be focused or clicks it first). */
export async function typeInEditor(page: Page, text: string): Promise<void> {
  await page.locator('.notebook-editor').click();
  await page.keyboard.type(text);
}

/** Creates a notebook, opens it, types content, and waits for autosave to complete. */
export async function createWithContent(page: Page, name: string, content: string): Promise<void> {
  await createNotebook(page, name);
  await openNotebook(page, name);
  await typeInEditor(page, content);
  // Autosave fires 800ms after last keystroke; wait for the status text as confirmation.
  await page.getByText('Saving…').waitFor({ timeout: 2000 }).catch(() => {/* might be too fast */});
  await page.getByText('Saved').waitFor({ timeout: 3000 });
}
