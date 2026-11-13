// spec: specs/adding-task.md (1.7)
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Adding a task', () => {
  test('Edge: HTML-like and special characters are rendered as literal text', async ({ taskBoard, page }) => {
    const payload = '<b>bold</b> & <script>alert(1)</script>';
    const dialogs: string[] = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    await taskBoard.addTask(payload);

    await expect(taskBoard.items).toHaveCount(2);
    await expect(taskBoard.item(1).getByText(payload, { exact: true })).toBeVisible();
    await expect(page.locator('li b')).toHaveCount(0);
    await expect(taskBoard.deleteButton(payload)).toBeVisible();
    expect(dialogs, 'no dialog should appear').toEqual([]);
  });
});
