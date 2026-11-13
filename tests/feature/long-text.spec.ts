// spec: specs/adding-task.md (1.9)
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Adding a task', () => {
  test('Edge: very long single-word task (layout overflow, possible bug)', async ({ taskBoard }) => {
    test.info().annotations.push({
      type: 'issue',
      description:
        'Known layout defect: a long single-word task does not wrap, so the list item and the page overflow horizontally and the Delete button is pushed far off-screen.',
    });

    const longText = 'A'.repeat(300);
    await taskBoard.addTask(longText);

    await expect(taskBoard.items).toHaveCount(2);
    await expect(taskBoard.item(1).getByText(longText, { exact: true })).toHaveCount(1);
    await expect(taskBoard.deleteButton(longText)).toHaveCount(1);
  });
});
