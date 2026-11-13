// spec: specs/adding-task.md (1.10)
// seed: tests/seed.spec.ts

import { test, expect, SEEDED_TASK } from '../fixtures';

test.describe('Adding a task', () => {
  test('Added tasks are not persisted across reload', async ({ taskBoard, page }) => {
    await taskBoard.addTask('Temp task');
    await taskBoard.expectTasks([SEEDED_TASK, 'Temp task']);

    await page.reload();

    await taskBoard.expectTasks([SEEDED_TASK]);
    await expect(page.getByText('Temp task')).toHaveCount(0);
  });
});
