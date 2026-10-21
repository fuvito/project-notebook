import { expect, test } from './fixtures.ts';
import { createWithContent } from './helpers.ts';

test.describe('Search', () => {
  test('opens search panel via the search button', async ({ popup }) => {
    await popup.getByRole('button', { name: 'Search notebooks' }).click();
    await expect(popup.getByRole('navigation', { name: 'Search' })).toBeVisible();
    await expect(popup.getByRole('textbox', { name: 'Search notebooks' })).toBeFocused();
  });

  test('requires at least 2 characters', async ({ popup }) => {
    await popup.getByRole('button', { name: 'Search notebooks' }).click();
    await popup.getByRole('textbox', { name: 'Search notebooks' }).fill('a');
    await expect(popup.getByText('Type at least 2 characters')).toBeVisible();
  });

  test('shows no results when nothing matches', async ({ popup }) => {
    await popup.getByRole('button', { name: 'Search notebooks' }).click();
    await popup.getByRole('textbox', { name: 'Search notebooks' }).fill('zzz-no-match-xyz');
    await expect(popup.getByText('No results')).toBeVisible({ timeout: 2000 });
  });

  test('finds content across notebooks', async ({ popup }) => {
    await createWithContent(popup, 'Alpha', 'unique-pw-search-term for testing');
    await popup.getByRole('button', { name: 'Search notebooks' }).click();
    await popup.getByRole('textbox', { name: 'Search notebooks' }).fill('unique-pw-search-term');
    await expect(popup.getByText('Alpha')).toBeVisible({ timeout: 3000 }); // group header
    // Result snippet should be visible
    await expect(popup.locator('mark').filter({ hasText: 'unique-pw-search-term' })).toBeVisible();
  });

  test('clicking a result opens the notebook without closing search', async ({ popup }) => {
    await createWithContent(popup, 'Beta', 'clickable result content');
    await popup.getByRole('button', { name: 'Search notebooks' }).click();
    await popup.getByRole('textbox', { name: 'Search notebooks' }).fill('clickable result');

    // Wait for a result button to appear and click it
    const resultBtn = popup.locator('button').filter({ hasText: 'clickable result' }).first();
    await expect(resultBtn).toBeVisible({ timeout: 3000 });
    await resultBtn.click();

    // Search panel stays open
    await expect(popup.getByRole('navigation', { name: 'Search' })).toBeVisible();
    // Editor is visible with the notebook content
    await expect(popup.locator('[data-testid="notebook-editor"]')).toBeVisible();
    await expect(popup.locator('[data-testid="notebook-editor"]')).toContainText('clickable result content');
  });

  test('clicking a result positions cursor at the match in the editor', async ({ popup }) => {
    await createWithContent(popup, 'Gamma', 'first occurrence of target and second occurrence of target');
    await popup.getByRole('button', { name: 'Search notebooks' }).click();
    await popup.getByRole('textbox', { name: 'Search notebooks' }).fill('occurrence of target');

    const results = popup.locator('button').filter({ hasText: 'occurrence of target' });
    await expect(results.first()).toBeVisible({ timeout: 3000 });
    await results.first().click();

    // Wait for the scroll effect to fire and the editor to receive focus
    await popup.waitForFunction(
      () => {
        const editor = document.querySelector('[data-testid="notebook-editor"]');
        return editor != null && editor.contains(document.activeElement);
      },
      { timeout: 3000 },
    );

    // The selection should span the matched text
    const selected = await popup.evaluate(() => window.getSelection()?.toString() ?? '');
    expect(selected.toLowerCase()).toContain('occurrence of target');
  });

  test('closes search panel with Escape', async ({ popup }) => {
    await popup.getByRole('button', { name: 'Search notebooks' }).click();
    await popup.getByRole('textbox', { name: 'Search notebooks' }).press('Escape');
    await expect(popup.getByRole('navigation', { name: 'Notebooks' })).toBeVisible();
  });

  test('closes search panel with back button', async ({ popup }) => {
    await popup.getByRole('button', { name: 'Search notebooks' }).click();
    await popup.getByRole('button', { name: 'Close search' }).click();
    await expect(popup.getByRole('navigation', { name: 'Notebooks' })).toBeVisible();
  });
});
