// spec: specs/adding-task.md (1.8)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Adding a task', () => {
  test('Edge: duplicate task names are allowed', async ({ taskBoard }) => {
    await taskBoard.addTasks(['Write tests', 'Write tests']);

    await taskBoard.expectTasks([SEEDED_TASK, 'Write tests', 'Write tests']);

    // Duplicate names produce duplicate accessible names, so use count/nth, not a single locator.
    const deleteButtons = taskBoard.deleteButton('Write tests');
    await expect(deleteButtons).toHaveCount(2);
    await expect(deleteButtons.first()).toBeVisible();
    await expect(deleteButtons.nth(1)).toBeVisible();
  });
});
