// spec: specs/clear-all.md (1.2)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Clear all', () => {
  test('Clear all removes the seeded task and hides itself', async ({ taskBoard, page }) => {
    await taskBoard.clearAllButton.click();

    await expect(taskBoard.items).toHaveCount(0);
    await expect(page.getByText(SEEDED_TASK)).toHaveCount(0);
    await expect(taskBoard.deleteButton(SEEDED_TASK)).toHaveCount(0);
    await expect(taskBoard.clearAllButton).toHaveCount(0);
    await expect(taskBoard.errorAlerts).toHaveCount(0);
  });
});
