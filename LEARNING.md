# Learning Log

## Lab 1 – What each file in this project does

This project is a small **Next.js** website: a one-page "Sprint Task Board" where you type a task, add it to a list, and delete it.

### The code you'd actually edit (`src/app/`)

| File | What it does |
| --- | --- |
| `src/app/page.tsx` | **The home page.** Builds the task board: a heading, a text box, an "Add Task" button, and a list of tasks with "Delete" buttons. `useState` is how React remembers things while the page is open (the task list and what you've typed). `"use client"` at the top makes the page run in the browser, which the buttons need. Tasks aren't saved, so a refresh resets the list. |
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
