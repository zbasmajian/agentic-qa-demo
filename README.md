# Agentic QA Demo

[![CI](https://github.com/zbasmajian/agentic-qa-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/zbasmajian/agentic-qa-demo/actions/workflows/ci.yml)

A reference project for **agentic AI in test automation**. AI agents plan, generate and self-heal Playwright end-to-end tests inside a GitHub Actions pipeline. Guardrails keep every AI change scoped, cheap and reviewed by a human.

The app under test is a deliberately small Next.js "Sprint Task Board", so the focus stays on the testing architecture: page objects, test plans that trace to tests, AI agents connected through the Model Context Protocol (MCP), and CI workflows that heal or generate tests on every pull request.

---

## Contents

- [Capabilities](#capabilities)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [The app under test](#the-app-under-test)
- [Test suite design](#test-suite-design)
- [AI agents](#ai-agents)
- [CI/CD workflows](#cicd-workflows)
- [Guardrails](#guardrails)
- [Performance tuning](#performance-tuning)
- [Results from real runs](#results-from-real-runs)
- [Getting started](#getting-started)
- [Setting up the AI workflows](#setting-up-the-ai-workflows)
- [Roadmap](#roadmap)
- [Further reading](#further-reading)

---

## Capabilities

| Capability | What it does | Where |
|---|---|---|
| **AI test planning** | An agent explores the running app in a real browser and writes a structured test plan (scenarios, steps, expected results) | `playwright-test-planner` → `specs/*.md` |
| **AI test generation** | An agent turns each plan scenario into a Playwright test that uses the shared page object | `playwright-test-generator` → `tests/**` |
| **Self-healing tests** | When e2e fails on a PR, an agent finds the root cause, fixes the *tests* (never the app), pushes a `heal:` commit and explains each change in a PR comment | `heal` job in `ci.yml` |
| **Generation on demand** | Adding the `ai-tests` label to a PR makes an agent read the diff, plan the user-visible changes, generate tests, run them and push a `test:` commit | `ai-generate-tests.yml` |
| **Policy-governed AI** | A written healing and generation policy says what agents may and may not change. Agents read it from `CLAUDE.md` | `CLAUDE.md`, `docs/healing-policy.md` |
| **Bug vs. outdated test** | The healer separates "the app changed on purpose" (heal the test) from "the app is broken" (stop and report) | healing policy |
| **Fast feedback** | Fail-fast timeouts, parallel workers, an early stop on mass failure, browser caching, and a healer that re-runs only the failed tests | `playwright.config.ts`, workflows |
| **Health-checked app** | `/healthz` lets CI, Playwright and (later) Kubernetes probes wait until the app is ready | `src/app/healthz/route.ts` |

---

## Architecture

### System overview

```mermaid
flowchart LR
    dev([Developer]) -->|opens PR| gh[(GitHub repo)]

    subgraph GHA["GitHub Actions"]
        direction TB
        build[build] --> e2e[e2e<br/>Playwright suite]
        e2e -- fails --> heal[heal<br/>Claude Code + healer agent]
        gen[ai-generate-tests<br/>Claude Code + planner + generator]
    end

    gh -->|pull_request| build
    gh -->|"label: ai-tests"| gen

    subgraph Agent["Claude Code runtime (claude-code-action)"]
        direction TB
        policy[[CLAUDE.md<br/>healing + generation policy]]
        agents[Playwright agents<br/>planner · generator · healer]
        mcp[Playwright Test MCP server]
        agents <--> mcp
        policy -.governs.-> agents
    end

    heal --> Agent
    gen --> Agent
    mcp <-->|drives browser| app[Next.js app<br/>localhost:3000]

    Agent -->|"heal: / test: commit + PR comment"| gh
    gh -->|human review & merge| main[(main)]
```

### Self-healing flow (every PR)

```mermaid
sequenceDiagram
    autonumber
    participant PR as Pull request
    participant CI as ci.yml
    participant E2E as e2e job
    participant H as heal job (Claude)
    participant Rev as Human reviewer

    PR->>CI: push / open
    CI->>E2E: build, then run the Playwright suite
    E2E-->>CI: ❌ failures (uploads report + .last-run.json)
    CI->>H: needs: e2e, if: failure()
    H->>H: guard: skip if last commit starts with "heal:"
    H->>H: download report, run --last-failed
    H->>H: healer agent checks the live page and fixes locators in tests/
    H->>H: run the full suite once to confirm
    H->>PR: push "heal: …" commit + PR comment listing each change
    PR->>CI: new run on the heal commit
    CI-->>PR: ✅ green
    Rev->>PR: review the AI commit, then merge
```

### Generation flow (label-triggered)

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant PR as Pull request
    participant G as ai-generate-tests (Claude)
    participant App as App on :3000

    Dev->>PR: add label "ai-tests"
    PR->>G: pull_request (labeled / synchronize)
    G->>G: guard: skip if last commit starts with "test:"
    G->>App: npm run build && npm start, wait on /healthz
    G->>G: gh pr diff → find user-visible changes
    G->>App: planner explores the UI → specs/{feature}.md
    G->>App: generator writes tests → tests/{feature}/*.spec.ts
    G->>G: npx playwright test (new + existing must pass)
    G->>PR: push "test: …" commit + PR comment for review
```

---

## Repository layout

```text
.
├── src/app/
│   ├── page.tsx                 # App under test: Sprint Task Board
│   ├── layout.tsx
│   └── healthz/route.ts         # GET /healthz → {"status":"ok"}
├── specs/                       # Test plans (written by the planner, reviewed by humans)
│   ├── adding-task.md           #   10 scenarios
│   ├── clear-all.md             #    8 scenarios (generated in CI, PR #7)
│   └── free-shipping.md         #   sample requirements doc (not implemented in the app)
├── tests/
│   ├── pages/task-board-page.ts # Page object: every locator lives here
│   ├── fixtures.ts              # `taskBoard` fixture: opens a fresh board
│   ├── feature/*.spec.ts        # 10 tests from specs/adding-task.md
│   ├── clear-all/*.spec.ts      #  8 tests from specs/clear-all.md
│   ├── smoke.spec.ts            # Smoke test
│   └── seed.spec.ts             # Seed test the agents use to open the app
├── .claude/agents/              # Playwright planner / generator / healer agent definitions
├── .github/workflows/
│   ├── ci.yml                   # build → e2e → heal
│   └── ai-generate-tests.yml    # label-triggered AI test generation
├── .mcp.json                    # Playwright Test MCP server (local, Windows: `cmd /c npx …`)
├── .mcp.ci.json                 # Same server for Linux CI runners (`npx …`)
├── CLAUDE.md                    # Policy that every Claude session and subagent reads
├── docs/healing-policy.md       # Source of the healing policy
├── playwright.config.ts
├── LEARNING.md                  # Lab notes: decisions, run results, costs, lessons
└── agentic-qa-lab-workbook.md   # The lab workbook this project follows
```

---

## The app under test

A one-page Next.js 16 / React 19 app styled with Tailwind CSS:

- A heading, **Sprint Task Board**
- A text box labelled **Task Input** and a **Create Task** button. The form also submits on Enter.
- A task list, seeded with *"Deploy CI/CD pipeline"*. Each task has a **Delete task: &lt;name&gt;** button.
- A **Clear all** button, shown only while the list has at least one task
- Input is trimmed, and empty or whitespace-only input is ignored. Tasks live in React state, so a reload resets the list.

Every interactive element has an accessible name, so tests can use role-based locators instead of CSS selectors.

---

## Test suite design

| Principle | How it's applied |
|---|---|
| **Page Object Model** | `TaskBoardPage` owns every locator and action (`addTask`, `addTasks`, `deleteButton`, …), plus a few shared assertions (`expectTasks`, `expectUnchanged`). When a locator breaks, the fix usually belongs in one place. The PR #10 heal changed one page-object line, which fixed 14 failing tests. |
| **Fixtures** | `tests/fixtures.ts` provides `taskBoard`, a board opened fresh at `/` for every test, so tests stay independent and can run in parallel. |
| **Accessible locators only** | `getByRole` / `getByLabel` with accessible names. CSS and XPath selectors are banned by policy. |
| **Plans trace to tests** | Each scenario in `specs/*.md` (for example *1.6 Leading and trailing whitespace is trimmed*) maps to one spec file under `tests/`. Plans are the human-readable source of truth for what the app should do. |
| **Edge cases included** | Duplicates, HTML and special characters, very long input, whitespace handling, no persistence across reload. |

**Current suite:** 20 tests (10 adding-task, 8 clear-all, a smoke test and a seed test), all passing on `main`.

---

## AI agents

The agents are Playwright's test agents (`npx playwright init-agents`), stored as Claude Code subagents in `.claude/agents/`. They drive a real browser through the **Playwright Test MCP server** (`npx playwright run-test-mcp-server`).

| Agent | Input | Output | Can edit |
|---|---|---|---|
| `playwright-test-planner` | The running app + a feature description or PR diff | A structured plan in `specs/<feature>.md` | `specs/` |
| `playwright-test-generator` | A plan scenario | A Playwright test, verified by running it | `tests/` |
| `playwright-test-healer` | Failing tests + a live page snapshot | Fixed locators, waits or test data | `tests/`, plus name-only updates in `specs/` |

**Locally,** the agents run inside Claude Code (for example, *"use the planner to write a plan for the Clear all button"*).
**In CI,** they run through [`anthropics/claude-code-action@v1`](https://github.com/anthropics/claude-code-action) in automation mode: a `prompt` plus `claude_args` such as `--max-turns`, `--mcp-config` and `--allowedTools`.

---

## CI/CD workflows

### `ci.yml`: build → e2e → heal

| Job | Runs when | What it does |
|---|---|---|
| `build` | push to `main`, every PR | `npm ci` + `npm run build` |
| `e2e` | after `build` | Restores the cached browser, runs `npx playwright test` (Playwright starts the app through `webServer`), and uploads `playwright-report/` and `test-results/` (including `.last-run.json`) |
| `heal` | `e2e` failed **and** the event is a PR | Loop guard → install → download the e2e results → Claude runs the healer on `--last-failed` → full-suite check → `heal:` commit + PR comment |

### `ai-generate-tests.yml`: label-triggered generation

- **Trigger:** `pull_request` with `types: [labeled, synchronize]`. The job runs only `if: contains(labels, 'ai-tests')`.
- **Steps:** loop guard (`test:`) → install with the browser cache → `npm run build && (npm start &)` → wait on `/healthz` → Claude reads `gh pr diff`, runs the planner, runs the generator, runs the suite, commits `test: …` and comments.
- **`BASE_URL: http://localhost:3000`** is set at job level. This makes `playwright.config.ts` skip its own `webServer`, so the tests and the MCP browser reuse the app the job started instead of fighting over port 3000.

---

## Guardrails

AI changes need to be **safe, cheap and auditable**. Each concern has a specific control:

| Concern | Control |
|---|---|
| **Scope** | The policy in `CLAUDE.md` / `docs/healing-policy.md`: the healer edits only `tests/` (and `specs/` for name changes only). The generator edits only `specs/` and `tests/`. Neither may touch `src/`, `playwright.config.ts` or workflows. |
| **Test integrity** | Agents must never delete or loosen assertions, change expected values to match new behavior, add `test.skip()` / `test.fixme()`, or switch to CSS or XPath selectors. |
| **Real bugs** | A 5xx, a runtime error, a blank page, behavior that contradicts the spec, or a rename that looks accidental (like `Task Input` → `Task2 Input`) means **stop and report** with evidence and a suggested app fix. The agent changes nothing. |
| **Blast radius** | A fix that would change more than a few locators goes to a human. |
| **Tool access** | `--allowedTools` allows only file tools, `npx playwright`, `git`, `gh pr diff` / `gh pr comment` and the Playwright MCP server. There's no general shell access. |
| **Cost** | `--max-turns 30`, `timeout-minutes: 30`, and generation only runs when a human adds the `ai-tests` label. |
| **Loops** | `heal` skips itself if the last commit starts with `heal:`, and generation skips if it starts with `test:`. This matters because pushes made with the Claude GitHub App's token *do* start new workflow runs. |
| **Human in the loop** | Every AI commit lands on the PR branch with a comment listing each change and flagging any assertion change. A human reviews before merge, and the `protect-main` ruleset means changes reach `main` only through a pull request. |
| **Secrets** | `ANTHROPIC_API_KEY` is stored only as a GitHub Actions secret and never committed. |

---

## Performance tuning

A failing run used to take about **15 minutes**: 14 failures × 2 attempts × a 30 s default timeout, on 1 worker. The current settings:

| Setting | Value (CI) | Effect |
|---|---|---|
| `actionTimeout` / `expect.timeout` | 5 s | A missing element fails after 5 s instead of 30 s |
| `timeout` (per test) | 15 s | Caps a stuck test |
| `workers` | 4 | Uses all 4 vCPUs on GitHub's Linux runners |
| `maxFailures` | 5 | Stops early on a mass failure, which usually has one root cause, and hands over to the healer |
| `retries` | 1 | Absorbs flaky tests; with fast timeouts, a retry is cheap |
| Browser cache | `~/.cache/ms-playwright`, keyed on `package-lock.json` | Skips the browser download on a cache hit |
| Healer `--last-failed` | from `.last-run.json` | The healer reproduces only the failures, not the whole suite |

A green run's test step takes about **15–20 s** in CI. A failing run like PR #10's is estimated at under a minute.

---

## Results from real runs

| PR | Workflow | Outcome | Turns | Cost |
|---|---|---|---|---|
| [#7](https://github.com/zbasmajian/agentic-qa-demo/pull/7): Clear all button | `ai-generate-tests` | Plan with 8 scenarios + 8 tests + a page-object locator. 20/20 passing. The agent also flagged an accidental `Task2 Input` rename on `main`, which was then reverted. | 9 | ~$0.42 |
| [#10](https://github.com/zbasmajian/agentic-qa-demo/pull/10): rename *Add Task* → *Create Task* | `heal` | Red (14/20 failing) → `heal:` commit changing 2 locators, no assertions changed → green 20/20. The agent checked the rename in a live page snapshot first. | 10 | ~$0.42 |

Both runs stayed inside policy. There were no edits to `src/` and no weakened assertions, and every change was explained in a PR comment. See [`LEARNING.md`](LEARNING.md) for the full write-ups and lessons.

---

## Getting started

**Prerequisites:** Node.js 22, Git, and optionally [Claude Code](https://claude.com/claude-code) to run the agents locally.

```bash
npm ci
npx playwright install chromium

npm run dev            # dev server on http://localhost:3000
# or, production-like:
npm run build && npm start

npx playwright test    # runs the suite (starts the app via webServer if needed)
npx playwright show-report
```

If the app is already running, point the tests at it and skip `webServer`:

```bash
BASE_URL=http://localhost:3000 npx playwright test
```

**Running the agents locally:** open Claude Code in the repo. It picks up `.mcp.json` and `.claude/agents/`. Then ask, for example:

- *"Use the playwright-test-planner to write a test plan for the Clear all button in specs/."*
- *"Use the playwright-test-generator to write tests for specs/clear-all.md."*
- *"Run the tests and use the playwright-test-healer to fix any failures."*

`.mcp.json` uses `cmd /c npx …` for Windows. On macOS or Linux, use `.mcp.ci.json` (or edit the command to plain `npx`).

---

## Setting up the AI workflows

1. **API key:** create one in the [Anthropic Console](https://console.anthropic.com) (Settings → API Keys; the account needs credits), then add it as a repository secret:
   ```bash
   gh secret set ANTHROPIC_API_KEY   # paste the key when prompted
   ```
   Or use GitHub: **Settings → Secrets and variables → Actions → New repository secret**. If the workflow log shows `ANTHROPIC_API_KEY:` with nothing after it, the secret is empty.
2. **Label:** `gh label create ai-tests --color 5319E7`
3. **Try healing:** open a PR that renames a button. Watch e2e go red, then the `heal:` commit, then green.
4. **Try generation:** open a PR that adds a small feature and add the `ai-tests` label. Watch for the `test:` commit with a new spec and tests.
5. **Review** every AI commit before merging.

The run summary of each Claude step shows the turns used and the cost (`num_turns`, `total_cost_usd`).

---

## Roadmap

- [x] Testable app with `/healthz` and a production-like build
- [x] Playwright foundation, page object, fixtures and seed test
- [x] AI planner, generator and healer agents, governed by policy
- [x] CI pipeline (`build` → `e2e`) on every PR
- [ ] Make `e2e` a required status check in the `protect-main` ruleset
- [x] Self-healing and label-triggered AI test generation in CI
- [x] Fast-feedback tuning (timeouts, workers, early stop, caching, last-failed)
- [ ] Containerize the app (multi-stage, non-root image tagged with the commit SHA)
- [ ] Run e2e against the app deployed on a local Kind (Kubernetes in Docker) cluster
- [ ] A short-lived Kind cluster per PR in CI, then publish versioned images to GHCR on merge

---

## Further reading

- [`LEARNING.md`](LEARNING.md): decisions, mistakes, run results and costs, lab by lab
- [`docs/healing-policy.md`](docs/healing-policy.md): the full healing policy
- [`CLAUDE.md`](CLAUDE.md): healing and generation policy loaded by every agent
- [`agentic-qa-lab-workbook.md`](agentic-qa-lab-workbook.md): the lab workbook
- [Playwright test agents](https://playwright.dev/docs/test-agents) · [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action)
