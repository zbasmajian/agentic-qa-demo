// spec: specs/clear-all.md (1.1)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Clear all', () => {
  test('Clear all button is visible on fresh load', async ({ taskBoard }) => {
    await taskBoard.expectTasks([SEEDED_TASK]);
    await expect(taskBoard.clearAllButton).toBeVisible();
    await expect(taskBoard.clearAllButton).toBeEnabled();
  });
});
