// spec: specs/clear-all.md (1.8)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Clear all', () => {
  test('Reload after clear restores the seeded task', async ({ taskBoard, page }) => {
    await taskBoard.clearAllButton.click();
    await expect(taskBoard.items).toHaveCount(0);
    await expect(taskBoard.clearAllButton).toHaveCount(0);

    await page.reload();

    await taskBoard.expectTasks([SEEDED_TASK]);
    await expect(taskBoard.clearAllButton).toBeVisible();
  });
});
