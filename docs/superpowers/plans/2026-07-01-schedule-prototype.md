# Schedule Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small Vite + React + TypeScript prototype that proves the 6-person meeting scheduling UX.

**Architecture:** Use static sample data, a pure recommendation function, and one React app with four steps. Keep all product copy Korean and avoid backend, auth, routing, and persistent storage.

**Tech Stack:** Vite, React, TypeScript, Vitest, CSS.

## Global Constraints

- `build` and `lint` are not run unless preparing an ait file or release.
- Do not add unnecessary or duplicate copy.
- Do not arbitrarily change approved Korean copy.
- Follow Karpathy guidelines: think first, keep it simple, make surgical changes, verify success criteria.
- The product must focus on Toss-style simplicity: the user-facing screen should reduce decision burden.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

**Interfaces:**
- Produces: Vite app entry point `src/main.tsx`
- Produces: React root component `App`

- [ ] **Step 1: Add minimal package scripts**

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "test": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "vitest": "latest"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: Add Vite, TypeScript, and React entry files**

Create `index.html` with `<div id="root"></div>`.
Create `src/main.tsx` that renders `<App />`.
Create a temporary `App` that returns `<main>일정 조율</main>`.

- [ ] **Step 3: Install dependencies**

Run: `npm install`

Expected: `node_modules` and `package-lock.json` are created.

### Task 2: Recommendation Logic

**Files:**
- Create: `src/scheduler.ts`
- Create: `src/scheduler.test.ts`

**Interfaces:**
- Produces: `recommendSlot(attendees: Attendee[], slots: TimeSlot[]): Recommendation`
- Produces: `Attendee`, `TimeSlot`, `Recommendation` types
- Consumes: no React APIs

- [ ] **Step 1: Write failing test for required attendee priority**

```ts
import { describe, expect, it } from "vitest";
import { recommendSlot, type Attendee, type TimeSlot } from "./scheduler";

describe("recommendSlot", () => {
  it("keeps every required attendee available before considering optional attendees", () => {
    const slots: TimeSlot[] = [
      { id: "mon-14", label: "월요일 오후 2:00" },
      { id: "tue-15", label: "화요일 오후 3:00" }
    ];
    const attendees: Attendee[] = [
      { name: "민준", role: "required", unavailable: ["mon-14"], avoid: [] },
      { name: "서연", role: "required", unavailable: [], avoid: [] },
      { name: "도윤", role: "optional", unavailable: ["tue-15"], avoid: [] }
    ];

    const result = recommendSlot(attendees, slots);

    expect(result.slot.id).toBe("tue-15");
    expect(result.requiredUnavailable).toHaveLength(0);
    expect(result.optionalUnavailable).toEqual(["도윤"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/scheduler.test.ts`

Expected: FAIL because `src/scheduler` does not exist yet.

- [ ] **Step 3: Implement minimal recommendation logic**

Create types and score candidates by required unavailable count, optional unavailable count, avoid count, then original order.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/scheduler.test.ts`

Expected: PASS.

### Task 3: Four-Step Product Flow

**Files:**
- Modify: `src/App.tsx`
- Create: `src/data.ts`

**Interfaces:**
- Consumes: `recommendSlot` from `src/scheduler.ts`
- Produces: one-page prototype with steps `create`, `conditions`, `result`, `confirmed`

- [ ] **Step 1: Add sample attendees and slots**

Create six attendees with four required and two optional roles. Include unavailable and avoid values that make `화요일 오후 3:00` the recommended slot.

- [ ] **Step 2: Build the step flow**

Implement local state:

```ts
type Step = "create" | "conditions" | "result" | "confirmed";
```

Show one screen at a time with primary buttons:
- `조건 입력하기`
- `추천 시간 보기`
- `이 시간으로 확정`
- `다시 보기`

- [ ] **Step 3: Render the recommendation result**

Show recommendation label, evidence badges, one-line explanation, and a collapsed secondary candidate preview.

### Task 4: Visual Polish and Responsive Layout

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: class names from `src/App.tsx`
- Produces: desktop and mobile layouts with clear hierarchy

- [ ] **Step 1: Add layout tokens**

Use CSS variables for background, text, muted text, border, primary blue, warning, and surface.

- [ ] **Step 2: Style cards, badges, buttons, and step navigation**

Keep one primary action per screen. Use color with text labels so meaning is not color-only.

- [ ] **Step 3: Add responsive rules**

At mobile width, stack all grids into one column and keep buttons at least 44px high.

### Task 5: Manual Verification

**Files:**
- No code files unless verification finds issues.

**Interfaces:**
- Consumes: local dev server
- Produces: browser-verified flow

- [ ] **Step 1: Run tests**

Run: `npm test -- --run src/scheduler.test.ts`

Expected: PASS.

- [ ] **Step 2: Start dev server**

Run: `npm run dev -- --port 5173`

Expected: Vite serves the app.

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173` and confirm:
- meeting creation screen appears
- condition screen distinguishes impossible and avoid
- result screen shows one recommended hour and short reasons
- confirmation screen shows share copy

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json index.html tsconfig.json vite.config.ts src docs/superpowers/plans/2026-07-01-schedule-prototype.md
git commit -m "feat: add schedule prototype"
```
