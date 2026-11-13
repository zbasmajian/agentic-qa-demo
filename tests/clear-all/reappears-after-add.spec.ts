// spec: specs/clear-all.md (1.6)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Clear all', () => {
  test('Clear all reappears after adding a task post-clear', async ({ taskBoard }) => {
    await taskBoard.clearAllButton.click();
    await expect(taskBoard.items).toHaveCount(0);
    await expect(taskBoard.clearAllButton).toHaveCount(0);

    await taskBoard.input.fill('New task');
    await taskBoard.addButton.click();

    await taskBoard.expectTasks(['New task']);
    await expect(taskBoard.clearAllButton).toBeVisible();
    await expect(taskBoard.input).toHaveValue('');

    await taskBoard.clearAllButton.click();
    await expect(taskBoard.items).toHaveCount(0);
    await expect(taskBoard.clearAllButton).toHaveCount(0);
  });
});
