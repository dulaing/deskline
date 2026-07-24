# Day 1 Homework — Deskline Ticket Tracker

## 📚 Reading List (optional, at your own pace)

### How the Web Works
- [MDN — How the Web Works / HTTP overview](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works)

### HTML, CSS & JavaScript
- [MDN — HTML, CSS & JavaScript basics](https://developer.mozilla.org/en-US/docs/Learn_web_development)

### React Fundamentals
- [react.dev — Describing the UI](https://react.dev/learn/describing-the-ui) (start here, then see "Adding Interactivity")

### TypeScript Fundamentals
- [typescriptlang.org — TypeScript for JS Programmers / Everyday Types](https://www.typescriptlang.org/docs/)

### DevTools & Debugging
- [Chrome DevTools docs — debugging JavaScript](https://developer.chrome.com/docs/devtools/)

### Working With AI as a Developer
- [Anthropic Claude docs](https://docs.anthropic.com/) — practice: ask AI to review your code

---

## 📝 Homework: Deskline Ticket Tracker

Build a tiny app: a form to log a "ticket" (title + description) and a list of tickets with a "mark resolved" button. You're free to build this in any library or framework you're comfortable with — these steps use React as the example, so map each one to whatever you're using. Every step below catches a specific bad habit before it forms.

### Step 1: Static Layout
Build the HTML/CSS layout first — no JS yet. Title, form, list container. Forces structure-then-behavior order, matching HTML → CSS → JS from today.

### Step 2: Vanilla JS Version
Add tickets to the list using `document.createElement` / `appendChild` and manual event listeners. Feel the manual-DOM pain firsthand — the same lesson as the counter exercise.

### Step 3: Convert to a Component Framework (React example)
Rebuild the same feature as a component using your framework's state mechanism (React's `useState`, if you're following the example) to hold the array of tickets. Compare line count and readability to Step 2 directly.

### Step 4: Add TypeScript
Define an `interface Ticket` and type your component's state/props with it. If a type error appears, fix the real mismatch — don't widen the type to `any` just to silence it.

### Step 5: Simulate a Network Request
Use `fetch()` to load an initial list on page load. Open the Network tab — identify the request, the status code, and when in the page lifecycle it fires. Same instinct as Activity 1: check the Network tab, don't guess.

### Step 6: Break It, Then Fix It
Intentionally introduce one bug (e.g. a typo in a state setter, or a missing key prop). Fix it using DevTools breakpoints/console — not guesswork. Reinforces the manual-debugging muscle from Activity 5a, on your own code.

### Step 7: AI Reflection
Ask an AI assistant for help on one part of this project. Write 3–4 sentences: one thing it got right, one thing you had to double-check or correct yourself. Use AI to get smarter — not just to get an answer.

---

## ✅ Deliverable
- Working mini-app: HTML/CSS + vanilla JS + component-framework/TypeScript version (React shown as the example — swap in your framework of choice)
- Short AI reflection write-up (3–4 sentences)

> Bring this to Day 2 — Ryan will build directly on the component you create here.
