// spec: specs/adding-task.md (1.5)
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Adding a task', () => {
  test('Whitespace-only input is silently ignored and not cleared', async ({ taskBoard }) => {
    await taskBoard.addTask('   ');

    await taskBoard.expectUnchanged();
    // Observed behavior: the input keeps the spaces (a successful add clears it).
    await expect(taskBoard.input).toHaveValue('   ');
  });
});
