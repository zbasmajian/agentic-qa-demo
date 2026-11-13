// spec: specs/clear-all.md (1.7)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Clear all', () => {
  test('Clear all leaves text in the input untouched', async ({ taskBoard }) => {
    await taskBoard.input.fill('Draft text');

    await taskBoard.clearAllButton.click();

    await expect(taskBoard.items).toHaveCount(0);
    await expect(taskBoard.clearAllButton).toHaveCount(0);
    await expect(taskBoard.input).toHaveValue('Draft text');

    await taskBoard.addButton.click();

    await taskBoard.expectTasks(['Draft text']);
    await expect(taskBoard.clearAllButton).toBeVisible();
  });
});
