# Project instructions for Claude

## Test healing policy

Follow this whenever you fix, heal or debug failing tests, including when you run as the `playwright-test-healer` agent. Source: `docs/healing-policy.md`.

The healer (the `playwright-test-healer` agent, or Claude fixing failing tests) may change test code under `tests/` (spec files, page objects and fixtures) and, in a limited way, the test plans in `specs/*.md` (see below). It may do so only when the **test** is out of date and the app is still working correctly. Examples: updating a locator after an intentional UI or accessible-name change it has confirmed in a live page snapshot, fixing timing or synchronization, or refreshing test data. It may update a plan in `specs/*.md` only to keep names and wording in step with the same confirmed, intentional change it healed in the tests, for example replacing a renamed button's old name with its new one. It must never change what a plan expects the app to do: no adding, removing or rewriting scenarios, steps or expected results. It must never edit application code (`src/`) or `playwright.config.ts`. It must never make a test pass by deleting or loosening assertions, changing expected values to match new behavior, adding `test.fixme()`/`test.skip()`, or switching to brittle CSS or XPath selectors. When a failure points to a real application bug, a human decides what happens next: stop, change nothing, and report the root cause with evidence (file and line, error, HTTP status) plus a suggested app fix. Application bugs include a 5xx response, a runtime error such as `ReferenceError`, a crash or blank page, or behavior that contradicts the spec. The same goes for an accessible name or text change that might not be intentional, like `Task Input` → `Task2 Input`, and for any fix that would change more than a few locators.

## Test generation policy

Follow this whenever you plan or write new tests, including when you run as the `playwright-test-planner` or `playwright-test-generator` agent (for example in the `ai-generate-tests` workflow).

- The **planner** may create or update test plans in `specs/`. Plans describe user-visible behavior only: what a user does and what they should see.
- The **generator** may create or update tests under `tests/` (spec files, page objects and fixtures). It writes tests from the plans in `specs/`.
- Neither may edit application code (`src/`), `playwright.config.ts`, CI workflows, or existing assertions in other tests.
- Use role-based and accessible-name locators (`getByRole`, `getByLabel`). Don't use brittle CSS or XPath selectors.
- New tests must pass against the running app before committing. If a test fails because the app behaves differently from what the PR intends, don't weaken the test. Report it in the PR comment for a human to decide.
- Commit generated work as `test: <summary>`. A human reviews every generated plan and test before merge.
