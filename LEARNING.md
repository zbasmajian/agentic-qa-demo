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
| `agentic-ai-lab-workbook.md` | The lab workbook I'm following. |
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


### Speeding up e2e (what I changed)

| Change | Where | Why |
|---|---|---|
| `actionTimeout: 5_000`, `expect.timeout: 5_000`, `timeout: 15_000`, `navigationTimeout: 10_000` | `playwright.config.ts` | A missing element fails after 5 s instead of 30 s |
| `workers: 4` on CI (was 1) | `playwright.config.ts` | GitHub's Linux runners have 4 CPUs. The tests are independent, so they can run in parallel |
| `maxFailures: 5` on CI | `playwright.config.ts` | 5+ failures usually have one cause, so stop early and let the healer take over |
| Cache `~/.cache/ms-playwright` | `ci.yml`, `ai-generate-tests.yml` | Skips downloading the browser on a cache hit (system packages are still installed) |
| Upload `test-results/` with `include-hidden-files: true`, download it in `heal` | `ci.yml` | `.last-run.json` (the list of failed tests) is a hidden file, which `upload-artifact@v4` skips by default |
| Healer runs `npx playwright test --last-failed`, then the full suite once | heal prompt | Most of the healer's 16 minutes went into re-running the whole failing suite |

- **Rough estimate for the PR #10 red run:** 5 failures × 2 attempts × ~5 s across 4 workers ≈ **under 1 minute** instead of 15. Not measured with a broken run.
- **Green run locally with the CI settings:** 20/20 passed in about 24 s.
- **Retries:** kept `retries: 1` to absorb flaky tests. With fast timeouts and `maxFailures`, retries no longer multiply a mass failure into many minutes.
- **Would a Claude Code swarm help?** Not here. e2e is plain Playwright with no AI in it, so the fix is fast failure and Playwright's own parallelism (`workers`, `--shard`). The PR #10 heal was one root cause (one page-object locator), so parallel agents would duplicate the work and could make conflicting edits. Parallel agents are worth trying only when a PR breaks many *independent* areas, or to generate tests for several features at once.
- **Later, if the suite grows:** shard across machines in a matrix (`--shard=1/2`, `--shard=2/2`). At 20 tests, the per-machine setup time costs more than sharding would save.

## Lab 9 – Kind locally

### The two config files

| File | What it does |
| --- | --- |
| `k8s/kind-config.yaml` | Tells kind how to build the cluster: one `control-plane` node (one Docker container) and an `extraPortMappings` entry that forwards `localhost:8080` on my laptop to port `30080` inside the node. Only read when the cluster is created. |
| `k8s/app.yaml` | Tells Kubernetes what to run in the cluster. A **Deployment** keeps 2 pods of `agentic-ai-demo:dev` running, with readiness/liveness probes on `/healthz` and CPU/memory requests and limits. A **Service** of type `NodePort` opens port `30080` on the node and forwards it to port `3000` in the pods. Every field is commented in the file. |

How a request gets from my laptop to the app:

```
localhost:8080 → (kind-config) node:30080 → (Service nodePort) → Service:80 → (targetPort) pod:3000 → Next.js
```

### Step 3: the local loop, command by command

```powershell
kind create cluster --name qa --config k8s/kind-config.yaml
docker build -t agentic-ai-demo:dev .
kind load docker-image agentic-ai-demo:dev --name qa
kubectl apply -f k8s/app.yaml
kubectl rollout status deployment/agentic-ai-demo --timeout=120s
curl http://localhost:8080/healthz
$env:BASE_URL='http://localhost:8080'; npx playwright test
```

**1. `kind create cluster --name qa --config k8s/kind-config.yaml`: create the cluster**
- Starts a Docker container named `qa-control-plane` with Kubernetes running inside it. That container *is* the cluster's only node.
- `--config` reads `kind-config.yaml`: the `nodes:` list decides how many containers to start (one), and `extraPortMappings` publishes host port `8080` → container port `30080`, like `docker run -p 8080:30080`.
- `--name qa` names the cluster. kind also points `kubectl` at it by creating the context `kind-qa`, so the `kubectl` commands below talk to this cluster.
- Tied to the config: port mappings and node count are fixed **at creation**. Changing `kind-config.yaml` later does nothing until I run `kind delete cluster --name qa` and create it again.
- If something on my laptop already uses port 8080, this step fails.

**2. `docker build -t agentic-ai-demo:dev .`: build the image**
- Builds the app into an image using the `Dockerfile` from Lab 8. `.` means "use this folder as the build context" (minus what `.dockerignore` excludes).
- `-t agentic-ai-demo:dev` tags the image. The tag must match `image: agentic-ai-demo:dev` in `app.yaml` exactly, or the pods can't find it.
- The image only exists in Docker on my laptop at this point. The cluster can't see it yet.
- It doesn't depend on the cluster, so it can run before step 1.

**3. `kind load docker-image agentic-ai-demo:dev --name qa`: copy the image into the cluster**
- The kind node has its own image store, separate from my laptop's Docker. This copies the image from my laptop into the node, with no registry involved.
- `--name qa` must match the cluster name from step 1.
- Tied to `app.yaml`: this works only because of `imagePullPolicy: IfNotPresent` ("the image is already on the node, use it"). With the tag `latest`, Kubernetes defaults to `Always`, tries to download it from Docker Hub, and the pod fails with `ErrImagePull`. Skipping this step causes the same error.
- Needs both step 1 (the cluster) and step 2 (the image).

**4. `kubectl apply -f k8s/app.yaml`: deploy**
- Sends both objects in `app.yaml` to the cluster: it creates the Deployment and the Service, or updates them if they already exist.
- `apply` is declarative: I describe what I want, and Kubernetes works out what to change. Running it twice with the same file changes nothing.
- The command returns straight away. The pods are still starting in the background.

**5. `kubectl rollout status deployment/agentic-ai-demo --timeout=120s`: wait until it's ready**
- Waits until the Deployment has all its pods ready, or gives up after 120 s.
- `deployment/agentic-ai-demo` is `metadata.name` from `app.yaml`.
- "Done" means `replicas: 2` pods are running **and** passing the `readinessProbe` on `/healthz`. If the probe never passes (wrong port, broken app), this times out.
- When it fails, look with `kubectl get pods`, `kubectl describe pod <name>` and `kubectl logs deploy/agentic-ai-demo`.

**6. `curl http://localhost:8080/healthz`: check the whole path by hand**
- Sends one request through the whole chain: laptop `8080` → node `30080` (kind-config) → Service → pod `3000` (app.yaml) → the `/healthz` route.
- `{"status":"ok"}` means every port in both files lines up. "Connection refused" or a hang means one of them doesn't match.
- In Windows PowerShell 5.1, `curl` is an alias for `Invoke-WebRequest`. Use `curl.exe` to get the real curl.

**7. `$env:BASE_URL='http://localhost:8080'; npx playwright test`: run the e2e suite against the cluster**
- `$env:BASE_URL=...` sets an environment variable for this PowerShell window. `playwright.config.ts` reads it (Lab 2), so the tests open `http://localhost:8080` instead of starting their own server.
- So the same tests that ran against `npm run dev` now run against the real image, in real pods, behind a real Service. That catches problems `npm start` never shows: a wrong port, a failing probe, a bad image.

### Which command uses which setting

| Setting | File | Used by |
| --- | --- | --- |
| Cluster name `qa` | command line | `kind create` (`--name qa`), `kind load` (`--name qa`), `kind delete` |
| `extraPortMappings` 8080 → 30080 | `kind-config.yaml` | `kind create`; makes `curl` and Playwright on `localhost:8080` work |
| Image tag `agentic-ai-demo:dev` | `app.yaml` `image:` | must match `docker build -t` and `kind load` |
| `imagePullPolicy: IfNotPresent` | `app.yaml` | makes `kind load` enough, with no registry |
| `metadata.name: agentic-ai-demo` | `app.yaml` | `kubectl rollout status deployment/...`, `kubectl logs deploy/...`, `kubectl set image` |
| `replicas: 2` + `readinessProbe` | `app.yaml` | decide when `rollout status` reports success |
| `nodePort: 30080` | `app.yaml` Service | must equal `containerPort: 30080` in `kind-config.yaml` |
| `containerPort` / `targetPort: 3000` | `app.yaml` | must equal the port Next.js listens on |
| `BASE_URL` | env var | read by `playwright.config.ts` |

### Step 5: rolling update to a new image, command by command

I renamed the button in `src/app/page.tsx` to "Clear everything", then shipped the change to the running cluster without downtime.

```powershell
docker build -t agentic-ai-demo:dev2 .
kind load docker-image agentic-ai-demo:dev2 --name qa
kubectl set image deployment/agentic-ai-demo app=agentic-ai-demo:dev2
kubectl rollout status deployment/agentic-ai-demo --timeout=120s
```

**1. `docker build -t agentic-ai-demo:dev2 .`: build the changed app as a new image**
- Builds a new image with the renamed button. The Dockerfile copies `src/` and runs `next build` again.
- **Why a new tag (`:dev2`):** Kubernetes only starts a rolling update when the pod template changes. If I rebuilt as `:dev`, the template would still say `agentic-ai-demo:dev`, so Kubernetes would see nothing new and keep the old pods. And because of `IfNotPresent`, any new pod would reuse the old `:dev` image already on the node.
- `:dev` still exists, so I can switch back to it later.

**2. `kind load docker-image agentic-ai-demo:dev2 --name qa`: copy the new image into the cluster**
- The same as in Step 3. Without it, the new pods fail with `ErrImagePull`, because the node has no `:dev2` yet.

**3. (Optional) Open two more windows to watch**

Window 2, watch the pods:
```powershell
kubectl get pods -w
```

Window 3, send requests the whole time. This is how to check the "no failed requests" checkpoint:
```powershell
while ($true) { curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8080/healthz; Start-Sleep -Milliseconds 300 }
```
- It prints one HTTP code about three times a second. If every line stays `200` during the update, no requests failed. `Ctrl+C` stops it.

**4. `kubectl set image deployment/agentic-ai-demo app=agentic-ai-demo:dev2`: tell the Deployment to use the new image**
- `deployment/agentic-ai-demo` is the `metadata.name` from `app.yaml`.
- `app=` is the **container name** (`name: app`), and `agentic-ai-demo:dev2` is its new image.
- This changes the pod template, which starts the rolling update:
  1. Kubernetes starts 1 new pod with `:dev2`. The pod names get a **new hash**, because the template changed.
  2. The new pod gets traffic only after its **readinessProbe** passes. That's why window 3 keeps showing `200`.
  3. Once it's ready, one old pod is stopped.
  4. Kubernetes repeats this until both pods run `:dev2`.

**5. `kubectl rollout status deployment/agentic-ai-demo --timeout=120s`: wait for the update to finish**
- The same command as in Step 3. It returns once both new pods are ready.

**6. Check the result**
```powershell
kubectl get pods -o wide
kubectl describe deployment agentic-ai-demo
kubectl rollout history deployment/agentic-ai-demo
```
- **`get pods`:** 2 pods with a **different hash** in their names than before.
- **`describe deployment`:** the `Image:` line says `agentic-ai-demo:dev2`, and the `Events` at the bottom show the old ReplicaSet scaling down while the new one scales up.
- **`rollout history`:** lists revision 1 (`:dev`) and revision 2 (`:dev2`).
- Open http://localhost:8080 in the browser to see the renamed button.

**7. (Good to know) `kubectl rollout undo deployment/agentic-ai-demo`: undo the update**
- Goes back to the previous revision (`:dev`), using the same kind of rolling update.

**Alternative to step 4: edit `app.yaml` and apply it**

Instead of `kubectl set image`, I can change the image in the file and apply the whole file (there's no `kubectl apply image` command):

1. In `k8s/app.yaml`, change the image line to `image: agentic-ai-demo:dev2`.
2. Apply it and wait:
   ```powershell
   kubectl apply -f k8s/app.yaml
   kubectl rollout status deployment/agentic-ai-demo --timeout=120s
   ```

`docker build` and `kind load` with `:dev2` are still needed first. `kubectl apply` compares the file with what's running. Only the image changed, so it updates the pod template, and that starts **exactly the same rolling update** as `set image`: new pod hash, readiness probe controls traffic, no failed requests.

| | `kubectl set image` | Edit `app.yaml` + `kubectl apply` |
|---|---|---|
| Style | **Imperative:** "do this change now" | **Declarative:** "make the cluster match this file" |
| Where the change lives | Only in the cluster | In the file, so it's in git and gets reviewed in PRs |
| Next `kubectl apply -f app.yaml` | **Undoes** the change and goes back to `:dev` | Keeps `:dev2` |
| Good for | Quick experiments, emergencies | Real work. It's how GitOps tools like Argo CD and Flux deploy |

With `set image`, the cluster and the file disagree, and the next apply quietly rolls the update back. Editing the file keeps it the single source of truth. The lab uses `set image` because it's quick to show, not because it's the recommended way.

**Catch for Lab 10:** CI changes the image with `sed "s|agentic-ai-demo:dev|$IMAGE|" k8s/app.yaml`. `sed` replaces text, and `agentic-ai-demo:dev` also matches the start of `agentic-ai-demo:dev2`. If `:dev2` is committed, CI produces `agentic-ai-demo:<sha>2`, an image that doesn't exist, and `kind-e2e` fails with `ErrImagePull`. Before Lab 10, either:
- set `app.yaml` back to `image: agentic-ai-demo:dev` (simplest, matches the workbook), **or**
- make the `sed` match the whole line: `sed "s|image: agentic-ai-demo:.*|image: $IMAGE|"`.

**Things to watch out for**
- **The image tag in `app.yaml` still says `:dev`.** `kubectl set image` changes the cluster, not the file. Running `kubectl apply -f k8s/app.yaml` later switches back to `:dev`. That's fine for this lab, because Lab 10 relies on `app.yaml` saying `:dev`.
- **The Playwright tests fail after the rename.** The Clear all tests look for the button by its name, `getByRole('button', { name: 'Clear all' })`. Running `npx playwright test` against `localhost:8080` now fails those tests. That's expected, because the app changed on purpose. To keep the suite green, update the locator in `tests/pages/task-board-page.ts` and the button name in `specs/clear-all.md`. Or open a PR and let the healer from Lab 7 do it.

### What I learned and what broke

<!-- Fill in after running the loop: the ErrImagePull you caused on purpose, and the rolling update to :dev2. -->

- First draft of `app.yaml`: I put `spec.spec.containers` instead of `spec.template.spec.containers`, left out `selector` and the Service, and set `containerPort` and the probe port to `30080`. `30080` is the **node's** port. Inside the container the app listens on `3000`, so with `30080` the readiness probe would never pass.
- `kind create cluster` failed twice before it worked. First with `could not find a log line that matches "Reached target .*Multi-User System.*|detected cgroup v1"` (the node container booted too slowly), then with `failed to init node with kubeadm` (etcd timed out with `DeadlineExceeded`, so the API server came up too late). Cause: the laptop was overloaded, with only ~3 GB of 16 GB RAM free and the CPU at ~56%. Nothing was wrong with `kind-config.yaml`. Fix: `kind delete cluster --name qa`, close heavy apps, try again. `--retain` keeps a failed node so `docker logs qa-control-plane` can show why it failed.
- `docker build` failed with `"/app/dist": not found`. The workbook's Dockerfile is a template for a plain Node server (`dist/server.js`), but `next build` writes to `.next/`. Fix: `output: "standalone"` in `next.config.ts`, which puts a minimal `server.js` and only the `node_modules` it needs in `.next/standalone`. The runtime stage copies that plus `.next/static` and `public/` (standalone leaves those two out), sets `HOSTNAME=0.0.0.0` so it's reachable from outside the container, and runs `node server.js`. No `npm ci` in the runtime stage.
- My `.dockerignore` was empty, so `COPY . .` would have copied my Windows `node_modules` and `.next` over the Linux ones from `npm ci`. Now it lists `node_modules`, `.next`, `dist`, `test-results`, `playwright-report`, `.git` and `.env`.
- Image size: `docker images` showed 307 MB, but Docker Desktop's containerd image store counts the compressed download *and* the unpacked files. The layers in `docker history` add up to **219 MB**, under the 250 MB checkpoint. About 150 MB of that is the `node:22-alpine` base image (the `node` binary alone is 124 MB), and my app is about 50 MB.
- `ErrImagePull`: ...
- Rolling update to `:dev2`: ...

## Lab 10 – Kind in CI and CD pipeline

### What `kind-e2e` is for

The `e2e` job tests the app started with `npm start` on the runner. `kind-e2e` tests the **deployed artifact**: the real Docker image, in real pods, behind a real Service, with real probes. It catches what `e2e` can't: a wrong port, a missing environment variable, a failing probe, a bad image. It's the same Lab 9 loop, run automatically on a fresh GitHub Ubuntu machine for every PR.

Pipeline order: `build → e2e → kind-e2e` (and later `→ publish` on `main`).

### The job, step by step

```yaml
  kind-e2e:
    needs: e2e
    runs-on: ubuntu-latest
    timeout-minutes: 25
    env: { IMAGE: 'agentic-ai-demo:${{ github.sha }}' }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - uses: helm/kind-action@v1
        with: { cluster_name: qa, config: k8s/kind-config.yaml }
      - run: docker build -t "$IMAGE" .
      - run: kind load docker-image "$IMAGE" --name qa
      - run: |
          sed "s|agentic-ai-demo:dev|$IMAGE|" k8s/app.yaml | kubectl apply -f -
          kubectl rollout status deployment/agentic-ai-demo --timeout=180s
      - run: npm ci && npx playwright install --with-deps chromium
      - run: npx playwright test
        env: { BASE_URL: 'http://localhost:8080' }
      - if: failure()
        run: kubectl get pods -o wide && kubectl describe pods && kubectl logs deploy/agentic-ai-demo --all-containers
```

**Job settings**
- **`kind-e2e:`** is the job's name. It appears in the PR checks, and Step 3 makes it a required check on `main`.
- **`needs: e2e`** means it runs only after `e2e` passes. There's no point deploying an app whose plain tests already fail, and it saves runner time. If `e2e` fails, `kind-e2e` is skipped (and the `heal` job takes over, as before).
- **`runs-on: ubuntu-latest`** gives a fresh Linux machine with Docker already installed. Linux file names are case-sensitive, which is why the folder must be `k8s`, not `K8s`.
- **`timeout-minutes: 25`** kills the job if it hangs (for example, a rollout stuck forever), so it can't burn runner minutes.
- **`env: IMAGE: 'agentic-ai-demo:${{ github.sha }}'`** sets an environment variable for every step. `github.sha` is the commit's ID, so every commit gets its own unique tag, for example `agentic-ai-demo:3f9a2c1...`. This replaces `:dev` from Lab 9. It's never `latest`, so `imagePullPolicy: IfNotPresent` still works. The same tag (the same bytes) is later published by the `publish` job: "test it, then ship exactly what was tested".

**1. `actions/checkout@v4`: get the code**
- Clones the repo at the PR's commit onto the runner. The runner starts empty, so every job needs this.

**2. `actions/setup-node@v4` (`node-version: 22`, `cache: npm`): install Node**
- Installs Node 22, the same version as the Dockerfile's `node:22-alpine`.
- `cache: npm` saves npm's download cache between runs, keyed on `package-lock.json`, so `npm ci` later is faster.
- Node is needed for Playwright (step 7), not for the app. The app runs inside the image.

**3. `helm/kind-action@v1` (`cluster_name: qa`, `config: k8s/kind-config.yaml`): create the cluster**
- Installs `kind` and `kubectl` on the runner, then runs the equivalent of `kind create cluster --name qa --config k8s/kind-config.yaml`. That's Lab 9 Step 3's first command.
- It reuses the **same `kind-config.yaml`**, so `extraPortMappings` makes `localhost:8080` **on the runner** reach the NodePort `30080`. That's why the tests can use `http://localhost:8080` in CI too.
- It also points `kubectl` at the new cluster.

**4. `docker build -t "$IMAGE" .`: build the image**
- The same as Lab 9, but tagged with the commit SHA instead of `:dev`.
- It uses the `Dockerfile` and `.dockerignore` from the repo, so they must be committed.
- `"$IMAGE"` reads the job's `env`. The quotes are a shell habit that keeps the value as one argument.

**5. `kind load docker-image "$IMAGE" --name qa`: copy the image into the cluster**
- The same as Lab 9. No registry is involved: the image goes from the runner's Docker straight into the kind node.
- `--name qa` matches `cluster_name: qa` from step 3.

**6. `sed ... | kubectl apply -f -` and `kubectl rollout status`: deploy and wait**
- **`sed "s|agentic-ai-demo:dev|$IMAGE|" k8s/app.yaml`** reads `app.yaml` and replaces the text `agentic-ai-demo:dev` with the SHA tag. It prints the result; **the file itself isn't changed**.
- **`| kubectl apply -f -`** sends that output straight into `kubectl apply`. `-f -` means "read the YAML from the pipe, not from a file".
  - That's why `app.yaml` must keep `image: agentic-ai-demo:dev` in git. With `:dev2`, `sed` would produce `agentic-ai-demo:<sha>2`, which doesn't exist → `ErrImagePull`.
- **`kubectl rollout status ... --timeout=180s`** waits until both pods pass their readiness probe. The timeout is longer than Lab 9's 120 s because CI runners can be slower. If it times out, the step fails and the debug step runs.
- `run: |` lets one step hold several shell lines. If either line fails, the step fails.

**7. `npm ci && npx playwright install --with-deps chromium`: install the test tools**
- **`npm ci`** installs the exact versions from `package-lock.json`, including `@playwright/test`.
- **`npx playwright install --with-deps chromium`** downloads only the Chromium browser, and `--with-deps` adds the Linux system libraries it needs.
- `&&` runs the second command only if the first one succeeds.

**8. `npx playwright test` with `BASE_URL: 'http://localhost:8080'`: run the e2e suite against the cluster**
- `playwright.config.ts` reads `BASE_URL`. When it's set, `webServer` is skipped, so Playwright doesn't start its own `npm start`. It tests the deployed app through `localhost:8080 → node 30080 → Service → pod 3000`.
- `CI=true` is set on GitHub runners, so the config's CI settings apply: `retries: 1`, `workers: 4`.
- `env:` on a step sets the variable only for that step.

**9. `if: failure()` → `kubectl get pods`, `describe pods`, `logs`: debug output when anything fails**
- Runs **only** if an earlier step failed. When everything passes, it's skipped.
- **`kubectl get pods -o wide`** shows pod status: `ErrImagePull`, `CrashLoopBackOff`, `0/1` not ready.
- **`kubectl describe pods`** shows the **Events**, which is where probe failures (`Readiness probe failed: HTTP probe failed with statuscode: 404`) and image errors appear.
- **`kubectl logs deploy/agentic-ai-demo --all-containers`** shows the app's own output.
- The runner and the cluster are thrown away when the job ends, so this is the only chance to see what went wrong. Step 4 of the lab (pointing the probe at `/nope`) tests exactly this.

There's no cleanup step: the whole runner, cluster included, is deleted after the job.

### Lab 9 command → Lab 10 step

| Lab 9 (my laptop) | Lab 10 (`kind-e2e` step) | Difference |
| --- | --- | --- |
| `kind create cluster --name qa --config k8s/kind-config.yaml` | `helm/kind-action` | Also installs kind and kubectl |
| `docker build -t agentic-ai-demo:dev .` | `docker build -t "$IMAGE" .` | Tag is the commit SHA |
| `kind load docker-image agentic-ai-demo:dev --name qa` | `kind load docker-image "$IMAGE" --name qa` | Same |
| `kubectl apply -f k8s/app.yaml` | `sed ... \| kubectl apply -f -` | Image tag swapped on the fly |
| `kubectl rollout status ... --timeout=120s` | `... --timeout=180s` | Longer for slower runners |
| `$env:BASE_URL='http://localhost:8080'; npx playwright test` | `npx playwright test` with `env: BASE_URL` | Same tests, same URL |
| `kind delete cluster --name qa` | (none) | The runner is discarded |
| `kubectl describe pod`, `kubectl logs` by hand | `if: failure()` step | Automatic, only on failure |

### Step 2: the `publish` job

Added to `.github/workflows/ci.yml` after `kind-e2e`, at the same indentation as the other jobs:

```yaml
  publish:
    needs: kind-e2e
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    timeout-minutes: 15
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository_owner }}/agentic-ai-demo:${{ github.sha }}
            ghcr.io/${{ github.repository_owner }}/agentic-ai-demo:main
```

**Job settings**
- **`needs: kind-e2e`**: publish only after the deployed image passed its tests in Kind. Full chain: `build → e2e → kind-e2e → publish`.
- **`if: github.ref == 'refs/heads/main'`**: run only for commits on `main`. See "How the config makes it run only on main" below.
- **`permissions:`** sets what the job's `GITHUB_TOKEN` is allowed to do:
  - `contents: read` lets it clone the repo.
  - `packages: write` lets it push images to GitHub Container Registry (GHCR). Without it, the push fails with `denied: permission_denied`.
  - Any permission not listed is turned off, so the job gets only what it needs.

**1. `actions/checkout@v4`**: clones the repo, because `docker build` needs the `Dockerfile` and the source code.

**2. `docker/login-action@v3`: log in to GHCR**
- `registry: ghcr.io` is GitHub's container registry.
- `username: ${{ github.actor }}` is whoever triggered the run.
- `password: ${{ secrets.GITHUB_TOKEN }}` is a token GitHub creates for every run, so no secret needs adding. Its powers come from the `permissions:` block.

**3. `docker/build-push-action@v6`: build and push**
- `context: .` builds from the repo root with the `Dockerfile`.
- `push: true` uploads the image after building it.
- `tags:` pushes the image under two tags:
  - **`:${{ github.sha }}`**: a permanent tag for exactly this commit. It never changes, so I can always deploy or roll back to an exact version.
  - **`:main`**: a moving tag that always points to the newest image from `main`. Handy for "give me the latest", but not for rollbacks.
- `${{ github.repository_owner }}` is `zbasmajian`, so the images become `ghcr.io/zbasmajian/agentic-ai-demo:<sha>` and `:main`. GHCR needs lowercase names, and mine already is.

**After the first push on `main`**
- The image shows up under my GitHub profile → **Packages**. It's **private** by default. To let others pull it without logging in, change its visibility to Public in the package's **Package settings**.
- To check it: `docker pull ghcr.io/zbasmajian/agentic-ai-demo:main`.

**Caveat: "same bytes"**: Lab 10 says the image tested in Kind is the one published. With this job, `build-push-action` **builds the image again** from the same commit. That's very close to the tested image, but not byte-for-byte identical, since a base image like `node:22-alpine` could change in between. Truly the same bytes would mean `kind-e2e` saves its image (`docker save`) and uploads it as an artifact, then `publish` downloads it and pushes it as is.

### How the config makes `publish` run only on `main`

Two parts of `ci.yml` work together.

**1. The triggers at the top of `ci.yml`** decide *when the workflow runs at all*:

```yaml
on:
  push:
    branches: [main]   # a push to main, for example when a PR is merged
  pull_request:        # a PR is opened or gets new commits
```

So the whole workflow runs in two situations: for every PR, and for every push to `main`. Every job, `publish` included, is considered both times.

**2. The `if:` on the `publish` job** decides *whether this one job runs*:

```yaml
    if: github.ref == 'refs/heads/main'
```

- `github.ref` is a value GitHub fills in for each run. It says what the run is for:

  | What started the run | `github.ref` | `publish` |
  | --- | --- | --- |
  | Merging a PR (push to `main`) | `refs/heads/main` | **runs** |
  | Opening or updating PR #12 | `refs/pull/12/merge` | **skipped** |

- `refs/heads/` is git's prefix for branches, so `refs/heads/main` means "the main branch". A PR run is about a temporary merge commit, `refs/pull/<number>/merge`, so the condition is false.
- When `if:` is false, the job shows as **skipped** (grey) in the PR checks. It isn't a failure, and a skipped job doesn't block merging.

**Both parts are needed:**
- Without the `if:`, every PR would push images to GHCR, including untested and unreviewed changes.
- Without the `push: branches: [main]` trigger, nothing would run after a merge, so `publish` would never get a chance to run.
- `needs: kind-e2e` adds a third rule: even on `main`, `publish` waits for `kind-e2e` and doesn't run if it fails.

### Step 3: required status checks on `main`

**What "Require status checks to pass" means:** every job in `ci.yml` reports a **status check** on the PR (`build`, `e2e`, `kind-e2e`, …). Without the rule, a red check is only a warning and the Merge button still works. With it, GitHub **blocks the merge** until every required check is green (or skipped). It turns "please look at CI" into a rule nobody can skip. CI is the smoke detector; the required check is the door lock wired to it.

**What I set up** (repo → Settings → Rules → Rulesets → `protect-main`):
1. Ticked **Require status checks to pass**.
2. Left **Require branches to be up to date before merging** off (on would mean re-running CI after every update to `main`) and **Do not require status checks on creation** off.
3. **Add checks** → `build`, `e2e`, `kind-e2e`, each with source **GitHub Actions**, so only my workflow can mark them green. The API shows this as `integration_id: 15368` (the GitHub Actions app).
4. **Save changes**, with Enforcement status still **Active**.

`protect-main` now has 4 rules: restrict deletions, block force pushes, require a pull request, require status checks.

**Which checks are required, and which not**

| Check | Required? | Why |
| --- | --- | --- |
| `build` | yes | The app must compile |
| `e2e` | yes | The tests must pass against `npm start` |
| `kind-e2e` | yes | The tests must pass against the deployed image |
| `heal` | no | A helper that only runs when `e2e` fails, not a quality gate |
| `publish` | no | Never runs on PRs. A required check that never reports would block every PR forever |

**Gotchas**
- **Skipped counts as passing.** If `e2e` fails, `kind-e2e` is skipped (`needs: e2e`), and a skipped required check counts as passed. That's why `e2e` must be required too, not just `kind-e2e`.
- **The rule matches the job name.** Renaming `kind-e2e` in `ci.yml` without updating the ruleset leaves every PR waiting for a check that never reports.
- **Admins can bypass.** As the repo owner I may still see "Merge without waiting for requirements to be met (bypass rules)". To block myself too, the ruleset's **Bypass list** must be empty.
- A check only shows up in the **Add checks** search after it has run at least once.

**Check it from the terminal**
```powershell
gh api repos/zbasmajian/agentic-ai-demo/rulesets/27099866
```
The `required_status_checks` rule lists `build`, `e2e`, `kind-e2e`.

**Proof it works:** on PR #15, `gh pr view 15 --json mergeStateStatus` said **`BLOCKED`** while `kind-e2e` was still running, and **`CLEAN`** once it passed.

### Step 4: breaking the deploy on purpose (PR #14)

The only change: the `readinessProbe` path in `k8s/app.yaml` went from `/healthz` to `/nope`. Opened as a draft titled "DO NOT MERGE", then closed without merging.

| Check | Result | Why |
| --- | --- | --- |
| `build` | ✅ pass | The code is fine |
| `e2e` | ✅ **pass** | It tests `npm start`, which never reads `app.yaml`, so it **can't see** this bug |
| `kind-e2e` | ❌ **fail** (4m32s) | Pods never became Ready |
| `heal` | skipped | Only runs when `e2e` fails, so no Claude cost |

The failing step:
```
Waiting for deployment "agentic-ai-demo" rollout to finish: 0 of 2 updated replicas are available...
error: timed out waiting for the condition
```

What the `if: failure()` debug step showed:
```
NAME                              READY   STATUS    RESTARTS
agentic-ai-demo-bc5b466c6-47dqr   0/1     Running   0
agentic-ai-demo-bc5b466c6-dml2k   0/1     Running   0

Warning  Unhealthy  (x25 over 2m54s)  kubelet  Readiness probe failed: HTTP probe failed with statuscode: 404
```
- **`Running` but `0/1`:** the app started, but Kubernetes never marked it ready, so the Service sent it no traffic.
- **`RESTARTS 0`:** only *readiness* was broken. The *liveness* probe still called `/healthz`, so nothing was restarted.
- **`404` × 25:** the probe called `/nope` every 5 s, and the app answered "not found" every time.

**Lesson:** `e2e` alone would have called this PR green. Only testing the *deployed* app caught it. At that time `main` had no required checks yet, so the red PR's Merge button still worked. Only the draft status and the title stopped it.

To close a PR without merging in the UI: open the PR → Conversation tab → bottom of the page → **Close pull request** (the grey button next to the comment box, not the green merge button). Then **Delete branch** in the timeline. Locally: `git checkout main; git branch -D break-readiness-probe` (`-D` because the branch was never merged).

### Publish in practice (PR #15)

- **On the PR:** `build`, `e2e`, `kind-e2e` passed, and `publish` showed as **skipped**, because a PR run's `github.ref` is `refs/pull/15/merge`, not `refs/heads/main`.
- **After the merge:** the push to `main` started a new CI run (`build → e2e → kind-e2e → publish`). In the Actions graph, `publish` sits greyed out at the end of the chain until `kind-e2e` finishes, so it's easy to miss while `kind-e2e` is still running.
- **Result:** every job on the `main` run passed (`heal` skipped). The `publish` log showed `Login Succeeded!`, then `docker buildx build ... --tag ghcr.io/zbasmajian/agentic-ai-demo:644d68c6e638... --tag ghcr.io/zbasmajian/agentic-ai-demo:main --push`, then `pushing manifest for ghcr.io/zbasmajian/agentic-ai-demo:644d68c...@sha256:c03766cf...`. Both tags point to the same image digest.
- **Reading packages from the terminal** needs an extra scope: `gh api /users/zbasmajian/packages/...` returned `403 You need at least read:packages scope`. Fix: `gh auth refresh -s read:packages`. The job log is enough to confirm the push.
- **Where to find the image:** profile → **Packages** tab (https://github.com/zbasmajian?tab=packages) → `agentic-ai-demo`, or the **Packages** section in the repo's right sidebar. Before the first push there are no packages, and the tab may not show at all; packages can't be turned off for a personal account. On a narrow window, the tab can also be hidden in the **…** menu.

### Before the first run

- `k8s/` must be lowercase (`git mv K8s tmp; git mv tmp k8s`).
- `Dockerfile`, `.dockerignore`, `next.config.ts` (`output: "standalone"`) and `k8s/` must be committed.
- `app.yaml` must say `image: agentic-ai-demo:dev`.
- The Playwright tests must match the app (the "Clear everything" rename), or `e2e` fails first and `kind-e2e` never runs.
