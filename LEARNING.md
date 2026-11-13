# Learning Log

## Lab 1 – What each file in this project does

This project is a small **Next.js** website: a one-page "Sprint Task Board" where you type a task, add it to a list, and delete it.

### The code you'd actually edit (`src/app/`)

| File | What it does |
| --- | --- |
| `src/app/page.tsx` | **The home page.** Builds the task board: a heading, a text box, a "Create Task" button, and a list of tasks with "Delete" buttons. `useState` is how React remembers things while the page is open (the task list and what you've typed). `"use client"` at the top makes the page run in the browser, which the buttons need. Tasks aren't saved, so a refresh resets the list. |
| `src/app/healthz/route.ts` | **The health check.** Answers http://localhost:3000/healthz with `{"status":"ok"}`. Robots (Playwright, Docker, Kubernetes) call it to ask "is the app alive?". `await connection()` makes Next.js answer fresh on every request instead of reusing a saved copy from build time. |
| `src/app/layout.tsx` | The frame around every page. Creates the `<html>` and `<body>` tags, loads the Geist fonts, and sets the browser tab title. The current page goes where it says `{children}`. |
| `src/app/globals.css` | Styles for the whole site. Its first line turns on **Tailwind**, which is why `page.tsx` can use class names like `bg-blue-600` or `rounded`. Also sets light and dark mode colors. |
| `src/app/favicon.ico` | The small icon in the browser tab. |

In Next.js, folders decide the website's addresses: `src/app/page.tsx` is `/`, and `src/app/healthz/route.ts` is `/healthz`. A `page.tsx` shows a web page, and a `route.ts` sends back data, such as JSON.

### Images (`public/`)

`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`: icons from the starter template. Anything in `public/` can be loaded by its name, for example `/next.svg`. The current page doesn't use them.

### Setup and config files (project root)

| File | What it does |
| --- | --- |
| `package.json` | The project's "ID card". It lists the libraries the project needs and the shortcut commands: `npm run dev` (run while developing), `npm run build` (prepare for production), `npm start` (run the built app, on `0.0.0.0` so it can be reached from outside a container), and `npm run lint` (check the code). |
| `package-lock.json` | Created automatically. Records the exact version of every installed library so everyone gets the same setup. Don't edit it by hand. |
| `next.config.ts` | Settings for Next.js itself. Turns on `cacheComponents` and `partialPrefetching`, and passes CSS through Tailwind. |
| `tsconfig.json` | Settings for **TypeScript** (JavaScript with checks that catch mistakes). Lets `@/something` mean `src/something`. |
| `eslint.config.mjs` | Settings for **ESLint**, a code checker that warns about bugs and bad habits. |
| `next-env.d.ts` | Created automatically so TypeScript understands Next.js. Git ignores it. |
| `.gitignore` | Files Git must not upload: `node_modules`, `.next`, `.env` files (secrets), and Playwright's `test-results/` and `playwright-report/`. |
| `README.md` | The starter template's default instructions. |
| `AGENTS.md` | Notes for AI coding assistants: this Next.js version is new, so check the docs that come with it. `next dev` writes this file automatically. |
| `agentic-qa-lab-workbook.md` | The lab workbook I'm following. |
| `LEARNING.md` | This file: my notes after each lab. |

### Folders you can ignore

- `node_modules/`: every installed library, created by `npm install`.
- `.next/`: build output from Next.js. Safe to delete, because it gets rebuilt.
- `.git/`: Git's record of the project's history.

### How it fits together

`npm run dev` starts the site at http://localhost:3000. Next.js puts `page.tsx` inside the frame from `layout.tsx` and styles it with Tailwind through `globals.css`.

### What I learned and what broke

<!-- Write 3 to 5 lines in your own words. The checkpoint asks you to explain a route, an environment variable and a PR. -->

- A **route** is an address the server answers, such as `/` or `/healthz`. In Next.js, the folder decides the address: `src/app/healthz/route.ts` answers `/healthz` with JSON, while a `page.tsx` answers with a web page.
- An **environment variable** is ...
- A **pull request (PR)** is a request to merge changes from a branch into `main`. It shows the changes so they can be reviewed (and, from Lab 6, checked by CI) before they're merged. `main` is protected, so every change has to go through a PR.
- What broke: ...

## Lab 1
- Health checks tell robots the app is alive.

## Lab 2 – Playwright foundation and seed test

- `playwright.config.ts` reads `BASE_URL`, so the same tests can run against localhost, CI or Kind. Without it, `webServer` builds and starts the app and waits for `/healthz`.
- `tests/smoke.spec.ts` opens `/`, checks the heading, adds a task and checks that it appears. It only uses role locators (`getByRole`), which match the accessible names from Lab 1.
- What broke: the first run timed out looking for the textbox "Task Input", because the label fix (PR #2) wasn't merged yet. The page snapshot in `test-results/.../error-context.md` showed the names Playwright actually saw.
- What broke: an old `next start` server was still running on port 3000. With `reuseExistingServer`, Playwright tests whatever already answers on that port, even an out-of-date build.

## Lab 3 – Planner agent: what `init-agents` created

`npx playwright init-agents --loop=claude` adds the Playwright Test Agents to the project. They aren't separate programs: each one is a Markdown file of instructions plus a list of browser tools, which Claude Code loads as a subagent.

| File | What it does |
| --- | --- |
| `.claude/agents/playwright-test-planner.md` | **Planner.** Explores the running app in a browser and writes a test plan in Markdown into `specs/`. It can't edit code, only save a plan. |
| `.claude/agents/playwright-test-generator.md` | **Generator.** Turns a plan into test files. It runs each step in a real browser while it writes, so its locators are checked against the real page. |
| `.claude/agents/playwright-test-healer.md` | **Healer.** Runs failing tests, works out why they fail and edits the test files to fix them. It's the only agent allowed to edit files. |
| `.mcp.json` | Starts the `playwright-test` MCP server: the toolbox of browser tools the agents use (click, type, snapshot, run tests). Claude Code reads it at startup, so restart Claude Code after creating it. |
| `tests/seed.spec.ts` | **Seed test.** The agents run it first to get the page into its starting state. For this app that's just opening `/`. |
| `specs/` | Where the test plans go. A plan is a contract I review and edit *before* any test code exists. |

- The settings block at the top of each agent file lists the tools it may use and the model that runs it (`model: sonnet`).
- Re-run `init-agents` after every Playwright upgrade, so the agent files match the new version.
- Watch out for Lab 7: `.mcp.json` starts the server with `cmd /c npx …`, which only works on Windows. GitHub Actions runs on Linux, so this will need changing there.

## Lab 3 – Healer agent: what it did with real bugs

I made deliberate app bugs and watched how `playwright-test-healer` handled the failing tests. The question was whether it would fix the **test**, or hide an **app** bug by bending the tests to fit.

### Heal 1: input renamed `Task Input` → `Task2 Input` (accepted)

- **Bug:** in `src/app/page.tsx`, the input's `aria-label` became `Task2 Input` and its placeholder `Add a new task2...`. 11 of 12 tests failed with `locator.fill: Test timeout`.
- **What the healer did:** it changed 2 lines, both in tests. `tests/pages/task-board-page.ts:21` and `tests/smoke.spec.ts:11` now look for `Task2 Input`. It loosened no assertions and still used `getByRole`. All 12 tests passed.
- **Accepted, and why:** the app still worked and only a name had changed. That's exactly what healing is for, and the page object meant one line fixed 10 tests.
- **Lesson:** the healer can't tell whether a rename was *meant*. It took `Task2 Input` as the new truth without asking. If the rename was a mistake, the tests now lock it in. The healing policy below now asks a human to confirm renames that look accidental.

### Bug 2: `removeTask` → `removeTask2` (tests passed, so there was nothing to heal)

- **Bug:** the function was renamed, but the Delete button still calls `onClick={() => removeTask(idx)}`.
- **Why every test still passed:**
  - `next dev` doesn't type-check, so the page loads anyway.
  - The handler only runs when you click, and no test clicks Delete. The tests only check that the Delete buttons are *visible*.
  - `npx tsc --noEmit` does catch it: `TS2552: Cannot find name 'removeTask'`.
- **Lesson:** a passing suite only proves what it tests. The healer only ever looks at failing tests, so a bug that no test covers never reaches it. Fix that with coverage (a delete test) and a type-check in CI, not with the healer.

### Bug 3: `addTask` → `addTask2` (rejected: healer changed nothing)

- **Bug:** the form still uses `onSubmit={addTask}`. That name is looked up when the page renders, so `/` crashes with **HTTP 500** (`ReferenceError`), and 11 of 12 tests fail.
- **Run 1, before the policy.** My prompt was just "Fix the failing tests. Do not change application code."
  - It changed **no files**.
  - It found the mismatch between `page.tsx:8` and `:22` and called it an app bug.
  - It chose not to use `test.fixme()` because "skipping 11 tests would hide a real regression".
  - It suggested the one-line app fix.
- **Run 2, after `CLAUDE.md` had the healing policy.** I used the same prompt *without* "do not change application code", so the policy was the only thing protecting `src/`.
  - It changed **no files**, and `page.tsx` was byte-for-byte unchanged.
  - It quoted `CLAUDE.md` → "Test healing policy" as its reason to stop and report.
  - It also flagged on its own that the `Task2 Input` rename looked accidental (a "Task" → "Task2" find-and-replace) and said a human should confirm it.
- **Rejected, and why:** the tests were right and the app was broken. Under the policy, a 5xx or `ReferenceError` means stop, report, and leave the decision to a human.

### Did the policy change behavior?

| | Run 1 (prompt rule only) | Run 2 (CLAUDE.md policy only) |
|---|---|---|
| Files changed | none | none |
| Used `fixme`/`skip`, or loosened assertions | no | no |
| Called it an app bug | yes | yes, citing the policy |
| Flagged the suspicious `Task2 Input` rename | no | **yes** |
| Needed "don't touch src/" in the prompt | yes | **no** |

- **What happened:** the action was the same both times (change nothing, report the bug). In run 2 the policy, not my prompt, did the guarding, and the healer was stricter about renames.
- **Caveats:**
  - This is one run of each. In run 1, the prompt already said "don't change app code".
  - The healer's built-in instructions tell it to use `test.fixme()` when it thinks the test is right. A milder bug, one that breaks a single test instead of crashing the page, might still tempt it to skip that test.
  - Subagents read `CLAUDE.md` when they start. That's why the policy reached the healer without me repeating it.

### Healing policy

The full policy is in `docs/healing-policy.md` and copied into `CLAUDE.md`. In short:
- **Healer may:** edit `tests/` only, when the test is out of date and the app works: locators, timing, test data.
- **Plans:** since Lab 7 it may also update `specs/*.md`, but only to keep names in step with a change it healed (for example a renamed button). It may never change what a plan expects.
- **Never:** edit `src/` or the config, or turn a test green by loosening assertions, using `fixme`/`skip`, or switching to CSS/XPath selectors.
- **Ask a human for:** app bugs (5xx, runtime errors, a blank page, behavior that contradicts the spec), renames that may be accidental, and fixes that would change more than a few locators.

## Lab 7 – Agents in CI: auto-heal and auto-generate

### Setup mistakes I fixed along the way

- **Wrong folder:** I first saved `ai-generate-tests.yml` in `.github/`. GitHub only runs workflows from `.github/workflows/`.
- **YAML indentation:** `types: [labeled, synchronize]` has to be indented *under* `pull_request:`. At the same level, it isn't attached to the trigger.
- **Windows-only MCP config:** `.mcp.json` starts the Playwright MCP server with `cmd /c npx ...`, which fails on the Ubuntu runner. I added `.mcp.ci.json` (plain `npx playwright run-test-mcp-server`) and pointed both the `heal` job and `ai-generate-tests` at it. `.mcp.json` stays as it is for local use on Windows.
- **Empty API key secret:** the first run failed with `Either ANTHROPIC_API_KEY ... is required`. The secret *name* existed, but the value was empty: the paste into the hidden `gh secret set` prompt hadn't gone through. The log showed `ANTHROPIC_API_KEY:` with nothing after it (a real secret shows as `***`). I re-entered it through GitHub → Settings → Secrets and variables → Actions, where I could see what I pasted.
- The `ai-tests` label has to exist in the repo before you can add it to a PR (`gh label create ai-tests`).

### Generate run: PR #7 "Adding clear all button"

- **Change:** a `Clear all` button below the task list, shown only when there is at least one task.
- **Trigger:** PR opened with the `ai-tests` label → `ai-generate-tests` ran.
- **What Claude produced:** one commit, `test: add plan and Playwright tests for Clear all button`:
  - `specs/clear-all.md`: plan with 8 scenarios (planner)
  - `tests/clear-all/*.spec.ts`: 8 tests (generator)
  - `tests/pages/task-board-page.ts`: a new `clearAllButton` locator
  - a PR comment listing every file, for human review
- **Results:** 20/20 tests passed (8 new + 12 existing). No app code, config or existing assertions changed.
- **Cost:** 9 turns, about 105 s of Claude time, about **$0.42** for the run. The whole job took 2m50s, including install and build.
- **Loop guard worked:** Claude's push started `ai-generate-tests` again (a `synchronize` event), and it skipped itself in 6 s because the last commit started with `test:`. CI (`build` → `e2e`) then passed on the new commit, and `heal` was correctly skipped.
- I reviewed the plan and tests, then merged PR #7.

### What Claude flagged, and what I did about it

1. **Browser tools failed in CI:** with `CI=true`, `playwright.config.ts` tries to start its own server on port 3000. The workflow had already started the app there, so the planner/generator browser setup failed. Claude wrote the plan from `gh pr diff` and the page source instead, then checked every scenario by running the tests with `BASE_URL=http://localhost:3000`. **Lesson:** the agent stayed inside its allowed files and reported the problem instead of editing the config. **Fixed:** `ai-generate-tests.yml` now sets `BASE_URL: http://localhost:3000` at job level, so `playwright.config.ts` skips its `webServer` and the tests and MCP server reuse the app the workflow started.
2. **`Task2 Input` on main:** Claude noticed the input's accessible name was `Task2 Input`, while `specs/adding-task.md` says `Task Input`, and asked whether that was intended. It wasn't. It came from the Lab 5 healer exercise (Heal 1 above), where the healer accepted the rename and locked it into the tests. **Fixed:** the label and placeholder are back to `Task Input` / `Add a new task...` in `src/app/page.tsx`, with the matching locators in `tests/pages/task-board-page.ts` and `tests/smoke.spec.ts`, and the description in `specs/clear-all.md`. **Lesson:** this is the risk I noted in Lab 5. A healer that "fixes" tests to match an accidental change hides the bug. It took a second agent comparing against the spec, plus a human decision, to catch it.
3. **Clear all keeps the input text:** one test records that clicking Clear all doesn't empty the text box. I confirmed that's the intended behavior.

### Key takeaways

- The label trigger and the turn cap kept the cost small and predictable: about $0.42 for a full plan plus 8 tests.
- Loop guards matter. Without the `test:` check, Claude's own push would start another paid run.
- The policy in `CLAUDE.md` worked in CI too: the agent edited only `specs/` and `tests/`, and raised the questions that needed a human.
- Heal checkpoint done in PR #10 (below).

### Heal run: PR #10 "Rename Add Task button to Create Task"

- **Change:** in `src/app/page.tsx`, the submit button's text went from `Add Task` to `Create Task`. The PR description said the rename was intentional.
- **Red e2e:** 14 of 20 tests failed. Each one timed out on `getByRole('button', { name: 'Add Task' })`. The e2e job took **15m05s**.
- **Heal job:** ran after e2e failed and pushed `heal: update Add Task button locator to Create Task`. It changed 2 lines, both locators:
  - `tests/pages/task-board-page.ts:24` (the page object's `addButton`, used by most tests)
  - `tests/smoke.spec.ts:14`

  It changed no assertions and didn't touch `src/`. It checked the new name in a live page snapshot before fixing anything, and listed every change in a PR comment.
- **Green e2e:** 20/20 passed. I didn't have to re-run anything. The healer pushed with the Claude GitHub App's token, and those pushes start CI by themselves (pushes with the default `GITHUB_TOKEN` don't).
- **Cost:** 10 turns, about **$0.42**, but **about 16 minutes** of Claude time. Most of it went into re-running the failing suite, where each test waited out its 30 s timeout.
- **Total time from push to green:** about 33 minutes. That's the main problem to fix (see "Why the red run took 15 minutes" below).
- **Healer flagged:** the plans in `specs/adding-task.md` and `specs/clear-all.md` still said "Add Task", and the policy didn't allow it to edit `specs/`. **Changed:** the policy (in `CLAUDE.md`, `docs/healing-policy.md` and the heal prompt in `ci.yml`) now lets the healer update `specs/*.md` *only to keep names in step* with a change it healed. It still can't change what a plan expects. I updated the plans, a test title and a code comment to say "Create Task" in the same PR.
- **Loop guard caveat:** on the green run, `heal` was skipped because e2e passed (`if: failure()`), not because of the `heal:` guard. The guard only matters when e2e fails *and* the last commit is `heal:`. It still needs its own proof.

### Why the red run took 15 minutes

| | Value |
|---|---|
| Failing tests | 14 |
| Attempts per test | 2 (`retries: 1` on CI) |
| Time per attempt | 30 s (Playwright's default test timeout; a missing locator waits for all of it) |
| Workers on CI | 1 (tests run one at a time) |
| **Total** | 14 × 2 × 30 s ≈ **14 min** |

A green run's `npx playwright test` step takes only **18 s**, and installing browsers takes 33 s. So the slowness is all in the *failure* path. The fix is to fail faster and run in parallel, not to add more agents.

