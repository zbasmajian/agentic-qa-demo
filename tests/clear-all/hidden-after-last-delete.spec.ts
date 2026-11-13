// spec: specs/clear-all.md (1.4)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Clear all', () => {
  test('Clear all disappears when last task is removed via Delete', async ({ taskBoard }) => {
    await expect(taskBoard.clearAllButton).toBeVisible();

    await taskBoard.deleteButton(SEEDED_TASK).click();

    await expect(taskBoard.items).toHaveCount(0);
    await expect(taskBoard.clearAllButton).toHaveCount(0);
  });
});
