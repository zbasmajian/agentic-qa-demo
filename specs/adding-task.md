# Adding a Task - Sprint Task Board

## Application Overview

Scope: adding tasks only on http://localhost:3000/. Page has heading "Sprint Task Board", textbox "Task Input" (placeholder "Add a new task..."), button "Add Task", and a list pre-seeded with one task "Deploy CI/CD pipeline" (button "Delete task: Deploy CI/CD pipeline"). Input and button are in a form, so Enter submits. Tasks are in-memory React state only (lost on reload). Observed: no error messages exist; invalid input is silently ignored. The only role=alert on the page is the Next.js dev route announcer, not an app error. Each scenario starts fresh via page.goto('/').

## Test Scenarios

### 1. Adding a task

**Seed:** `tests/seed.spec.ts`

#### 1.1. Add a valid task with the Add Task button

**File:** `tests/adding-task/add-with-button.spec.ts`

**Steps:**
  1. Navigate to / (fresh state)
    - expect: List has exactly 1 item: 'Deploy CI/CD pipeline'
    - expect: Textbox 'Task Input' is empty
  2. Fill textbox 'Task Input' with 'Write tests'
    - expect: Textbox shows 'Write tests'
  3. Click button 'Add Task'
    - expect: List has 2 items; the new item 'Write tests' is last, after 'Deploy CI/CD pipeline'
    - expect: Button 'Delete task: Write tests' is visible
    - expect: Textbox 'Task Input' is cleared (empty)

#### 1.2. Add a valid task by pressing Enter

**File:** `tests/adding-task/add-with-enter.spec.ts`

**Steps:**
  1. Navigate to /; click textbox 'Task Input' and type 'Enter task'
    - expect: Textbox shows 'Enter task'
  2. Press Enter
    - expect: 'Enter task' is appended to the list (2 items total)
    - expect: Textbox is cleared
    - expect: Button 'Delete task: Enter task' is visible

#### 1.3. Add multiple tasks preserves order

**File:** `tests/adding-task/add-multiple.spec.ts`

**Steps:**
  1. Navigate to /; add 'First', then 'Second', then 'Third' via the button
    - expect: List order is: Deploy CI/CD pipeline, First, Second, Third
    - expect: Each item has its own 'Delete task: <name>' button

#### 1.4. Empty input is silently ignored

**File:** `tests/adding-task/empty-input.spec.ts`

**Steps:**
  1. Navigate to /; leave 'Task Input' empty; click 'Add Task'
    - expect: No task added; list still has 1 item
    - expect: No error text shown; button is NOT disabled (it stays enabled)
    - expect: No native browser validation popup (input has no required attribute)
  2. Focus empty textbox and press Enter
    - expect: Same result: nothing added, no error

#### 1.5. Whitespace-only input is silently ignored and not cleared

**File:** `tests/adding-task/whitespace-only.spec.ts`

**Steps:**
  1. Navigate to /; fill 'Task Input' with '   ' (three spaces); click 'Add Task'
    - expect: No task added; list still has 1 item
    - expect: No error message shown
    - expect: Textbox still contains the three spaces (NOT cleared) - observed behavior

#### 1.6. Leading and trailing whitespace is trimmed

**File:** `tests/adding-task/trim.spec.ts`

**Steps:**
  1. Navigate to /; fill 'Task Input' with '   padded   '; click 'Add Task'
    - expect: New item text is exactly 'padded' (no surrounding spaces)
    - expect: Button 'Delete task: padded' is visible
    - expect: Textbox cleared

#### 1.7. Edge: HTML-like and special characters are rendered as literal text

**File:** `tests/adding-task/special-characters.spec.ts`

**Steps:**
  1. Navigate to /; fill 'Task Input' with '<b>bold</b> & <script>alert(1)</script>'; click 'Add Task'
    - expect: New item displays the exact literal string '<b>bold</b> & <script>alert(1)</script>'
    - expect: No <b> element exists inside the list (0 matches for li b)
    - expect: No alert dialog fires; no script executes
    - expect: Delete button name is 'Delete task: <b>bold</b> & <script>alert(1)</script>'

#### 1.8. Edge: duplicate task names are allowed

**File:** `tests/adding-task/duplicates.spec.ts`

**Steps:**
  1. Navigate to /; add 'Write tests' twice via the button
    - expect: List shows two separate 'Write tests' items (3 items total); no duplicate warning
    - expect: Two buttons named 'Delete task: Write tests' exist (locators need .first()/.nth() to avoid strict-mode errors)

#### 1.9. Edge: very long single-word task (layout overflow, possible bug)

**File:** `tests/adding-task/long-text.spec.ts`

**Steps:**
  1. Navigate to /; fill 'Task Input' with 300 'A' characters; click 'Add Task'
    - expect: Task is added with full 300-character text (no maxlength, no truncation)
    - expect: Observed: text does not wrap; the list item (~3252px scroll width vs ~398px client width) and the page (~3693px vs 1280px viewport) overflow horizontally. Record as a layout defect; the Delete button is pushed far off-screen

#### 1.10. Added tasks are not persisted across reload

**File:** `tests/adding-task/no-persistence.spec.ts`

**Steps:**
  1. Navigate to /; add 'Temp task'; reload the page
    - expect: After reload the list contains only 'Deploy CI/CD pipeline'; 'Temp task' is gone (in-memory state only)
