// spec: specs/clear-all.md (1.3)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Clear all', () => {
  test('Clear all removes multiple added tasks', async ({ taskBoard, page }) => {
    await taskBoard.addTasks(['First', 'Second', 'Third']);
    await taskBoard.expectTasks([SEEDED_TASK, 'First', 'Second', 'Third']);

    await taskBoard.clearAllButton.click();

    await expect(taskBoard.items).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Delete task: / })).toHaveCount(0);
    await expect(taskBoard.clearAllButton).toHaveCount(0);
  });
});
