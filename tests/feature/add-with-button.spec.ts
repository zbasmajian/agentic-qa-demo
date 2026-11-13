// spec: specs/adding-task.md (1.1)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Adding a task', () => {
  test('Add a valid task with the Create Task button', async ({ taskBoard }) => {
    await taskBoard.expectTasks([SEEDED_TASK]);
    await expect(taskBoard.input).toHaveValue('');

    await taskBoard.input.fill('Write tests');
    await expect(taskBoard.input).toHaveValue('Write tests');

    await taskBoard.addButton.click();
    await taskBoard.expectTasks([SEEDED_TASK, 'Write tests']);
    await expect(taskBoard.deleteButton('Write tests')).toBeVisible();
    await expect(taskBoard.input).toHaveValue('');
  });
});
