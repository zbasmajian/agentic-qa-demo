// spec: specs/adding-task.md (1.6)
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Adding a task', () => {
  test('Leading and trailing whitespace is trimmed', async ({ taskBoard }) => {
    await taskBoard.addTask('   padded   ');

    await expect(taskBoard.items).toHaveCount(2);
    // Regex, because toHaveText/toContainText normalize whitespace and would hide untrimmed text.
    await expect(taskBoard.item(1).getByText(/^padded$/)).toBeVisible();
    await expect(taskBoard.deleteButton('padded')).toBeVisible();
    await expect(taskBoard.input).toHaveValue('');
  });
});
