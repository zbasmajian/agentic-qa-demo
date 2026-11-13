// spec: specs/adding-task.md (1.2)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Adding a task', () => {
  test('Add a valid task by pressing Enter', async ({ taskBoard }) => {
    await taskBoard.addTask('Enter task', { via: 'enter' });

    await taskBoard.expectTasks([SEEDED_TASK, 'Enter task']);
    await expect(taskBoard.input).toHaveValue('');
    await expect(taskBoard.deleteButton('Enter task')).toBeVisible();
  });
});
