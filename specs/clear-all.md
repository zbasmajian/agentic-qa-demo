# Clear All - Sprint Task Board

## Application Overview

Scope: the "Clear all" button on http://localhost:3000/. The button renders below the task list only when the list has at least one task; clicking it removes all tasks. Page has heading "Sprint Task Board", textbox "Task2 Input" (the accessible name was changed from "Task Input"; confirm the change is intentional), button "Add Task", and a list pre-seeded with one task "Deploy CI/CD pipeline" (button "Delete task: Deploy CI/CD pipeline"). Tasks are in-memory only (lost on reload). NOTE: the planner's browser setup failed (webServer port conflict with the already-running app under CI=true), so expectations were derived from the PR diff and src/app/page.tsx; all scenarios were then confirmed by running the generated tests against the live app at http://localhost:3000. Each scenario starts fresh via page.goto('/').

## Test Scenarios

### 1. Clear all

**Seed:** `tests/seed.spec.ts`

#### 1.1. Clear all button is visible on fresh load

**File:** `tests/clear-all/visible-on-load.spec.ts`

**Steps:**
  1. Navigate to / (fresh state)
    - expect: List has exactly 1 item: 'Deploy CI/CD pipeline'
    - expect: Button 'Clear all' is visible below the list

#### 1.2. Clear all removes the seeded task and hides itself

**File:** `tests/clear-all/clear-seeded.spec.ts`

**Steps:**
  1. Navigate to /; click button 'Clear all'
    - expect: List has 0 items; 'Deploy CI/CD pipeline' is no longer visible
    - expect: Button 'Delete task: Deploy CI/CD pipeline' is gone
    - expect: Button 'Clear all' is no longer present
    - expect: No error message is shown

#### 1.3. Clear all removes multiple added tasks

**File:** `tests/clear-all/clear-multiple.spec.ts`

**Steps:**
  1. Navigate to /; add 'First', 'Second', 'Third' via 'Add Task'
    - expect: List has 4 items in order: Deploy CI/CD pipeline, First, Second, Third
  2. Click 'Clear all'
    - expect: List has 0 items
    - expect: All 'Delete task: ...' buttons are gone
    - expect: Button 'Clear all' is not present

#### 1.4. Clear all disappears when last task is removed via Delete

**File:** `tests/clear-all/hidden-after-last-delete.spec.ts`

**Steps:**
  1. Navigate to /; click 'Delete task: Deploy CI/CD pipeline'
    - expect: List has 0 items
    - expect: Button 'Clear all' is not present

#### 1.5. Clear all stays visible while tasks remain after a single delete

**File:** `tests/clear-all/visible-after-partial-delete.spec.ts`

**Steps:**
  1. Navigate to /; add 'Extra'; click 'Delete task: Extra'
    - expect: List has 1 item: 'Deploy CI/CD pipeline'
    - expect: Button 'Clear all' is still visible

#### 1.6. Clear all reappears after adding a task post-clear

**File:** `tests/clear-all/reappears-after-add.spec.ts`

**Steps:**
  1. Navigate to /; click 'Clear all'
    - expect: List empty; 'Clear all' not present
  2. Fill textbox 'Task2 Input' with 'New task'; click 'Add Task'
    - expect: List has exactly 1 item: 'New task'
    - expect: Button 'Clear all' is visible again
    - expect: Textbox is cleared
  3. Click 'Clear all'
    - expect: List is empty and 'Clear all' is hidden again

#### 1.7. Clear all leaves text in the input untouched

**File:** `tests/clear-all/input-untouched.spec.ts`

**Steps:**
  1. Navigate to /; fill textbox 'Task2 Input' with 'Draft text'; click 'Clear all'
    - expect: List is empty; 'Clear all' hidden
    - expect: Textbox still shows 'Draft text' (not cleared; Clear all only resets tasks)
  2. Click 'Add Task'
    - expect: 'Draft text' is added as the only list item; 'Clear all' is visible

#### 1.8. Reload after clear restores the seeded task

**File:** `tests/clear-all/reload-restores-seed.spec.ts`

**Steps:**
  1. Navigate to /; click 'Clear all'
    - expect: List empty; 'Clear all' hidden
  2. Reload the page
    - expect: List has exactly 1 item: 'Deploy CI/CD pipeline'
    - expect: Button 'Clear all' is visible again (state is in-memory only)
