import { expect, test } from './fixtures.ts';
import { createNotebook } from './helpers.ts';

test.describe('Notebook list', () => {
  test('shows empty state on first open', async ({ popup }) => {
    await expect(popup.getByText('No notebooks yet.')).toBeVisible();
    await expect(popup.getByText('Select a notebook or create one to get started.')).toBeVisible();
  });

  test('creates a notebook', async ({ popup }) => {
    await popup.getByRole('button', { name: 'New notebook' }).click();
    await popup.getByLabel('New notebook name').fill('My Notes');
    await popup.keyboard.press('Enter');
    await expect(popup.getByRole('button', { name: 'My Notes', exact: true })).toBeVisible();
  });

  test('cancels create with Escape', async ({ popup }) => {
    await popup.getByRole('button', { name: 'New notebook' }).click();
    await popup.getByLabel('New notebook name').fill('Should not appear');
    await popup.keyboard.press('Escape');
    await expect(popup.getByText('No notebooks yet.')).toBeVisible();
  });

  test('cancels create with Cancel button', async ({ popup }) => {
    await popup.getByRole('button', { name: 'New notebook' }).click();
    await popup.getByLabel('New notebook name').fill('Nope');
    await popup.getByRole('button', { name: 'Cancel create' }).click();
    await expect(popup.getByText('No notebooks yet.')).toBeVisible();
  });

  test('opens the editor when a notebook is selected', async ({ popup }) => {
    await createNotebook(popup, 'Dev Notes');
    await popup.getByRole('button', { name: 'Dev Notes', exact: true }).click();
    await expect(popup.locator('[data-testid="notebook-editor"]')).toBeVisible();
  });

  test('renames a notebook', async ({ popup }) => {
    await createNotebook(popup, 'Old Name');
    await popup.getByRole('button', { name: 'Old Name', exact: true }).hover();
    await popup.getByRole('button', { name: 'Rename "Old Name"' }).click();
    await popup.getByLabel('New notebook name').fill('New Name');
    await popup.keyboard.press('Enter');
    await expect(popup.getByRole('button', { name: 'New Name', exact: true })).toBeVisible();
    await expect(popup.getByRole('button', { name: 'Old Name', exact: true })).not.toBeVisible();
  });

  test('cancels rename with Escape', async ({ popup }) => {
    await createNotebook(popup, 'Keep This');
    await popup.getByRole('button', { name: 'Keep This', exact: true }).hover();
    await popup.getByRole('button', { name: 'Rename "Keep This"' }).click();
    await popup.getByLabel('New notebook name').press('Escape');
    await expect(popup.getByRole('button', { name: 'Keep This', exact: true })).toBeVisible();
  });

  test('deletes a notebook after confirmation', async ({ popup }) => {
    await createNotebook(popup, 'To Delete');
    await popup.getByRole('button', { name: 'To Delete', exact: true }).hover();
    await popup.getByRole('button', { name: 'Delete "To Delete"' }).click();
    await popup.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(popup.getByText('No notebooks yet.')).toBeVisible();
  });

  test('cancels delete', async ({ popup }) => {
    await createNotebook(popup, 'Keep Me');
    await popup.getByRole('button', { name: 'Keep Me', exact: true }).hover();
    await popup.getByRole('button', { name: 'Delete "Keep Me"' }).click();
    await popup.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(popup.getByRole('button', { name: 'Keep Me', exact: true })).toBeVisible();
  });

  test('sidebar collapses and expands', async ({ popup }) => {
    await popup.getByRole('button', { name: 'Hide sidebar' }).click();
    await expect(popup.getByRole('navigation', { name: 'Notebooks' })).not.toBeVisible();
    await popup.getByRole('button', { name: 'Show notebooks' }).click();
    await expect(popup.getByRole('navigation', { name: 'Notebooks' })).toBeVisible();
  });
});
