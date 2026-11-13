import { test as base } from '@playwright/test';
import { TaskBoardPage } from './pages/task-board-page';

type Fixtures = {
  /** Task board already opened at / in a fresh state. */
  taskBoard: TaskBoardPage;
};

export const test = base.extend<Fixtures>({
  taskBoard: async ({ page }, use) => {
    const taskBoard = new TaskBoardPage(page);
    await taskBoard.goto();
    await use(taskBoard);
  },
});

export { expect } from '@playwright/test';
export { SEEDED_TASK } from './pages/task-board-page';
