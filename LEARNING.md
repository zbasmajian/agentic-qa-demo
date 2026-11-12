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
