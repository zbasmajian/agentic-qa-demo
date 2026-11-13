import { expect, type Locator, type Page } from '@playwright/test';

/** Task that exists on every fresh load of the board. */
export const SEEDED_TASK = 'Deploy CI/CD pipeline';

/**
 * Page object for the Sprint Task Board (/).
 * Locators and actions live here; tests keep their own assertions
 * except for the shared helpers at the bottom.
 */
export class TaskBoardPage {
  readonly heading: Locator;
  readonly input: Locator;
  readonly addButton: Locator;
  readonly items: Locator;
  /** Shown below the list only while at least one task exists. */
  readonly clearAllButton: Locator;
  /** Non-empty alerts. Ignores the empty Next.js route announcer. */
  readonly errorAlerts: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Sprint Task Board' });
    this.input = page.getByRole('textbox', { name: 'Task Input' });
    this.addButton = page.getByRole('button', { name: 'Create Task' });
    this.items = page.getByRole('listitem');
    this.clearAllButton = page.getByRole('button', { name: 'Clear all', exact: true });
    this.errorAlerts = page.getByRole('alert').filter({ hasText: /\S/ });
  }

  async goto() {
    await this.page.goto('/');
  }

  /** Type a task and submit it with the Create Task button (default) or the Enter key. */
  async addTask(name: string, { via = 'button' }: { via?: 'button' | 'enter' } = {}) {
    await this.input.fill(name);
    if (via === 'enter') {
      await this.input.press('Enter');
    } else {
      await this.addButton.click();
    }
  }

  async addTasks(names: string[]) {
    for (const name of names) {
      await this.addTask(name);
    }
  }

  item(index: number): Locator {
    return this.items.nth(index);
  }

  deleteButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Delete task: ${name}`, exact: true });
  }

  // ---- shared assertions ----

  /** Asserts the list holds exactly these tasks, in this order. */
  async expectTasks(names: string[]) {
    await expect(this.items).toHaveCount(names.length);
    for (const [i, name] of names.entries()) {
      await expect(this.items.nth(i)).toContainText(name);
    }
  }

  /** Asserts that nothing was added: only the seeded task remains and no error is shown. */
  async expectUnchanged() {
    await this.expectTasks([SEEDED_TASK]);
    await expect(this.errorAlerts).toHaveCount(0);
  }
}
