import { test, expect } from '@playwright/test';

test('user can add a task', async ({ page }) => {
  // 1. Open the home page
  await page.goto('/');

  // 2. The main heading is visible
  await expect(page.getByRole('heading', { name: 'Sprint Task Board' })).toBeVisible();

  // 3. Type a new task into the text box
  await page.getByRole('textbox', { name: 'Task Input' }).fill('Write my first test');

  // 4. Click the add button
  await page.getByRole('button', { name: 'Add Task' }).click();

  // 5. The new task appears, with its own Delete button
  await expect(page.getByText('Write my first test')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete task: Write my first test' })).toBeVisible();
});