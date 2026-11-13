// spec: specs/clear-all.md (1.5)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Clear all', () => {
  test('Clear all stays visible while tasks remain after a single delete', async ({ taskBoard }) => {
    await taskBoard.addTask('Extra');
    await taskBoard.expectTasks([SEEDED_TASK, 'Extra']);

    await taskBoard.deleteButton('Extra').click();

    await taskBoard.expectTasks([SEEDED_TASK]);
    await expect(taskBoard.clearAllButton).toBeVisible();
  });
});
