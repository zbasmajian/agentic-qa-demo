// spec: specs/adding-task.md (1.4)
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Adding a task', () => {
  test('Empty input is silently ignored', async ({ taskBoard }) => {
    // Button click
    await taskBoard.addButton.click();
    await taskBoard.expectUnchanged();
    await expect(taskBoard.addButton).toBeEnabled();
    await expect(taskBoard.input).not.toHaveAttribute('required');

    // Enter key
    await taskBoard.addTask('', { via: 'enter' });
    await taskBoard.expectUnchanged();
    await expect(taskBoard.addButton).toBeEnabled();
  });
});
