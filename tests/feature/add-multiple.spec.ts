// spec: specs/adding-task.md (1.3)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Adding a task', () => {
  test('Add multiple tasks preserves order', async ({ taskBoard }) => {
    const expected = [SEEDED_TASK, 'First', 'Second', 'Third'];

    await taskBoard.addTasks(['First', 'Second', 'Third']);

    await taskBoard.expectTasks(expected);
    for (const name of expected) {
      await expect(taskBoard.deleteButton(name)).toBeVisible();
    }
  });
});
