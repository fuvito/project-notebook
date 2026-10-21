import { expect, test } from './fixtures.ts';
import { createNotebook, openNotebook } from './helpers.ts';

test.describe('Editor', () => {
  test.beforeEach(async ({ popup }) => {
    await createNotebook(popup, 'Test');
    await openNotebook(popup, 'Test');
  });

  test('can type plain text', async ({ popup }) => {
    await popup.locator('.notebook-editor').click();
    await popup.keyboard.type('Hello world');
    await expect(popup.locator('[data-testid="notebook-editor"]')).toContainText('Hello world');
  });

  test('H1 button creates a heading', async ({ popup }) => {
    await popup.locator('.notebook-editor').click();
    await popup.getByRole('button', { name: 'Heading 1' }).click();
    await popup.keyboard.type('Big Title');
    await expect(popup.locator('.notebook-editor h1')).toContainText('Big Title');
  });

  test('H2 button creates a sub-heading', async ({ popup }) => {
    await popup.locator('.notebook-editor').click();
    await popup.getByRole('button', { name: 'Heading 2' }).click();
    await popup.keyboard.type('Section');
    await expect(popup.locator('.notebook-editor h2')).toContainText('Section');
  });

  test('H3 button creates a minor heading', async ({ popup }) => {
    await popup.locator('.notebook-editor').click();
    await popup.getByRole('button', { name: 'Heading 3' }).click();
    await popup.keyboard.type('Sub-section');
    await expect(popup.locator('.notebook-editor h3')).toContainText('Sub-section');
  });

  test('Bold button wraps text in strong', async ({ popup }) => {
    await popup.locator('.notebook-editor').click();
    await popup.getByRole('button', { name: 'Bold' }).click();
    await popup.keyboard.type('Bold text');
    await expect(popup.locator('.notebook-editor strong')).toContainText('Bold text');
  });

  test('Italic button wraps text in em', async ({ popup }) => {
    await popup.locator('.notebook-editor').click();
    await popup.getByRole('button', { name: 'Italic' }).click();
    await popup.keyboard.type('Italic text');
    await expect(popup.locator('.notebook-editor em')).toContainText('Italic text');
  });

  test('Bullet list button creates a list', async ({ popup }) => {
    await popup.locator('.notebook-editor').click();
    await popup.getByRole('button', { name: 'Bullet list' }).click();
    await popup.keyboard.type('First item');
    await popup.keyboard.press('Enter');
    await popup.keyboard.type('Second item');
    await expect(popup.locator('.notebook-editor li').nth(0)).toContainText('First item');
    await expect(popup.locator('.notebook-editor li').nth(1)).toContainText('Second item');
  });

  test('mixed content renders in correct order', async ({ popup }) => {
    await popup.locator('.notebook-editor').click();
    await popup.getByRole('button', { name: 'Heading 1' }).click();
    await popup.keyboard.type('My Heading');
    await popup.keyboard.press('Enter');
    await popup.keyboard.type('Some paragraph text');
    await expect(popup.locator('.notebook-editor h1')).toContainText('My Heading');
    // Use .first() since TipTap always keeps a trailing empty paragraph
    await expect(popup.locator('.notebook-editor p').first()).toContainText('Some paragraph text');
  });

  test('editor regains focus and allows continued typing after clicking away', async ({ popup }) => {
    await popup.locator('.notebook-editor').click();
    await popup.keyboard.type('Initial text');
    // Click the toolbar (outside the editor), then back into the editor
    await popup.getByRole('button', { name: 'Heading 1' }).click();
    await popup.locator('.notebook-editor').click();
    await popup.keyboard.type(' continued');
    await expect(popup.locator('[data-testid="notebook-editor"]')).toContainText('continued');
  });
});
