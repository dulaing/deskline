# Deskline Frontend Learning Guide

This note is meant to grow while you build Deskline. Do not try to memorize it in one sitting.

Use this learning loop for every topic:

1. Read the small explanation.
2. Type the example yourself.
3. Change one thing and predict what will happen.
4. Use it in Deskline.
5. Explain it aloud without looking.

If you cannot explain a line, do not let AI quietly keep it in your app.

---

## 1. The two files are for different jobs

### `Day-1-Homework-Deskline-Ticket-Tracker.md`

This is a **small learning exercise** for Day 1.

You build the same tiny ticket tracker in stages:

1. Static HTML and CSS.
2. Vanilla JavaScript with manual DOM updates.
3. React with state.
4. TypeScript types.
5. A simulated network request.
6. A deliberate bug fixed with DevTools.
7. A short reflection about using AI.

Deliverable: the tiny working exercise plus a 3–4 sentence AI reflection.

### `DESKLINE-INTERN-SPEC.md`

This is the **full two-week product contract and assessment rubric**.

It defines:

- the React + TypeScript stack;
- requester, technician, and admin roles;
- exactly five routes;
- request data and status rules;
- all required screens and states;
- the mock API contract;
- accessibility, theme, motion, and performance requirements;
- daily milestones and assessment criteria.

Deliverable: the complete Deskline app that grows in one repository over seven sessions.

### How they fit together

The homework teaches the basic mechanics. The spec is the real app.

Do not build the full authentication, 500-request queue, routing, and API during the Day 1 exercise. Also do not mistake the tiny exercise for the completed assessment.

A sensible repository shape is:

```text
deskline/
├─ experiments/
│  └─ day-1-vanilla/       # the manual DOM learning exercise
├─ src/                    # the real React + TypeScript Deskline app
├─ README.md
└─ package.json
```

The React version of the exercise can become the first small part of the real app. The vanilla version can remain an experiment that proves what React is helping with.

### Important current-project check

This folder currently has the two Markdown briefs and `form.html`, but no Vite starter, `package.json`, or Git repository.

Before building the assessed app:

- locate or request the provided Vite + React + TypeScript starter;
- make sure you are working in the intended folder;
- initialize the required Git repository if the starter does not already contain one;
- make the first small commit;
- do not turn the current `form.html` into the entire assessed app.

---

## 2. What to learn first

Learn in dependency order:

```text
HTML → CSS → JavaScript → TypeScript → React → component design
```

- **HTML** gives the page meaning and structure.
- **CSS** controls layout and appearance.
- **JavaScript** provides values, decisions, functions, events, and data changes.
- **TypeScript** checks your JavaScript before it runs.
- **React** builds the UI from data and reusable components.
- **Component design** keeps the growing app understandable.

TypeScript does not replace JavaScript. It adds a checking layer to JavaScript. Learn each JavaScript idea first, then learn how TypeScript describes it.

---

## 3. JavaScript foundation

### Values and variables

```js
const title = "Broken keyboard";
let resolved = false;
```

- A **value** is data such as `"Broken keyboard"`, `42`, or `false`.
- A **variable** is a name that points to a value.
- Use `const` unless the variable itself must be reassigned.

### Arrays and objects

```js
const ticket = {
  id: "req-1",
  title: "Broken keyboard",
  resolved: false,
};

const tickets = [ticket];
```

- An **object** groups named values.
- An **array** stores an ordered list.

### Functions

```js
function markResolved(ticket) {
  return { ...ticket, resolved: true };
}
```

A function accepts inputs and returns an output. The spread syntax copies the old object and replaces `resolved`.

### Conditions

```js
if (ticket.resolved) {
  console.log("Done");
} else {
  console.log("Still open");
}
```

### Array methods

```js
const openTickets = tickets.filter((ticket) => !ticket.resolved);
const titles = tickets.map((ticket) => ticket.title);
```

- `filter` keeps matching items.
- `map` transforms every item.

These two methods will be used constantly in Deskline filters and list rendering.

### Events and the DOM

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();
});
```

An event is something that happened. `preventDefault()` stops the browser's normal form submission so your code can handle it.

Learn these JavaScript topics before advanced TypeScript:

- values and primitive types;
- `const` and `let`;
- objects and arrays;
- functions and return values;
- `if`, equality, and booleans;
- `map`, `filter`, and `find`;
- imports and exports;
- DOM selection and events;
- `Promise`, `async`/`await`, and `fetch`;
- immutable object and array updates.

---

## 4. TypeScript foundation

### TypeScript describes allowed values

```ts
const title: string = "Broken keyboard";
const count: number = 1;
const resolved: boolean = false;
```

The part after `:` is a type annotation. It does not create a runtime value.

### Inferred types

TypeScript can often work out a type without being told:

```ts
const title = "Broken keyboard"; // TypeScript knows this is a string
let count = 1;                   // TypeScript knows this is a number
```

This is **type inference**.

Use inference for obvious local values. Add an explicit type when it creates a useful contract, such as component props, API results, or an initially empty state array.

```ts
const [requests, setRequests] = useState<Request[]>([]);
```

Without `<Request[]>`, an empty array does not give TypeScript enough useful information about the future items.

### String literal types

`string` means any string:

```ts
let name: string = "John";
name = "Maya";
```

`"john"` as a type means exactly that one string:

```ts
type UserId = "john";

const validId: UserId = "john";
// const invalidId: UserId = "maya"; // error
```

This creates a type, not a variable. Type names normally use `PascalCase`, so prefer `UserId`, not `userId`.

### Union types

The `|` symbol means “one of these”.

```ts
type AccordionState = "expanded" | "collapsed";
```

Your original syntax was basically correct:

```ts
type AccordionState = "closed" | "collapsed" | "open";
```

But `closed` and `collapsed` probably mean the same thing. Only keep both if the UI truly treats them differently. Good types model real product meaning.

Deskline uses unions heavily:

```ts
type Status = "open" | "pending" | "closed" | "cancelled";
type Priority = "low" | "medium" | "high";
type Category = "hardware" | "software" | "facilities" | "access";
```

Now a typo such as `"close"` is rejected before the app runs.

### Template literal types

To combine allowed string types, use backticks and `${...}`:

```ts
type ElementType = "button" | "input";
type VariantState = "default" | "disabled";
type ElementEvent = `${ElementType}:${VariantState}`;
```

`ElementEvent` becomes:

```ts
// "button:default"
// | "button:disabled"
// | "input:default"
// | "input:disabled"
```

`ElementType + ":" + VariantState` is JavaScript-style value thinking. A template literal type is the TypeScript way to construct this type.

### `type` versus `interface`

They overlap for object shapes, but they are not identical.

```ts
type Ticket = {
  id: string;
  title: string;
};

interface Ticket {
  id: string;
  title: string;
}
```

Both examples describe the same object shape.

Use `type` when you need:

- a union;
- a literal type;
- a tuple;
- a template literal type;
- an intersection or another computed type.

```ts
type Status = "open" | "closed";
type Point = [number, number];
```

An `interface` is mainly for object-like contracts. It supports `extends` and declaration merging.

```ts
interface Person {
  name: string;
}

interface Staff extends Person {
  role: "technician" | "admin";
}
```

Practical rule for Deskline:

- use `type` for unions such as `Status`, `Role`, and `Priority`;
- use either `type` or `interface` consistently for objects such as `Request` and component props;
- do not spend hours arguing about the object-style choice.

### Generics

A generic is a type parameter: a blank type slot filled in by the caller.

```ts
type ApiResult<T> = {
  data: T;
  error: string | null;
};

type RequestResult = ApiResult<Request>;
```

`T` means “the data type will be supplied later.”

### `ComponentProps<"button">`

```ts
type ButtonProps = React.ComponentProps<"button">;
```

Break it down:

- `ComponentProps<...>` is a generic helper supplied by React's types.
- `"button"` is a string literal type argument.
- the result is the props a normal HTML `<button>` accepts, such as `disabled`, `onClick`, and `type`.

You can add your own props:

```ts
type ButtonProps = React.ComponentProps<"button"> & {
  intent?: "primary" | "danger";
};
```

This makes your component act like a real button instead of manually retyping all button attributes.

### Does TypeScript keep expanding a type?

The useful mental model is:

- TypeScript checks relationships between types when needed.
- An explicit annotation creates a contract that a value must satisfy.
- A generic stays abstract until TypeScript can infer or receive its type argument.
- Type aliases may be shown by name or expanded by editor tooltips.
- Recursive or extremely complex types have compiler depth limits.
- Types are removed when TypeScript becomes JavaScript; they do not perform runtime validation.

Do not think of a generic as a wall where expansion stops. Think of it as a named blank that must be filled or kept abstract.

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const firstStatus = first(["open", "closed"]);
```

TypeScript infers `T` from the argument.

---

## 5. CSS foundation

### Block elements and inline elements

A block-level box normally starts on a new line and takes the available inline space.

Common examples:

```html
<div>Block</div>
<p>Block</p>
<section>Block</section>
```

An inline-level box normally stays inside the current line of text.

```html
<span>Inline</span>
<a href="/">Inline link</a>
<strong>Inline emphasis</strong>
```

CSS can change this behavior:

```css
.thing {
  display: block;
}
```

Do not confuse **block/inline elements** with the **block/inline directions** below. They are related CSS ideas, but not the same question.

### Inline and block directions

These are logical directions based on the writing mode.

For normal English:

- inline direction: left to right, along a line of text;
- block direction: top to bottom, from one line/paragraph to the next.

For Arabic or Hebrew, inline text starts on the right. In a vertical writing mode, the axes can change again.

That is why logical CSS is useful:

```css
.icon {
  margin-inline-end: 0.5rem;
}
```

This means “space after the icon in the text direction.” It adapts better than `margin-right`.

Useful logical properties:

```css
padding-inline: 1rem;
padding-block: 0.75rem;
margin-inline-start: auto;
inline-size: 20rem;
block-size: 3rem;
```

### Media queries

A media query asks about the browser/device environment, commonly the viewport:

```css
@media (width >= 48rem) {
  .request-list {
    grid-template-columns: 16rem 1fr;
  }
}
```

Meaning: when the viewport is at least `48rem` wide, use this layout.

Deskline also needs:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms;
    transition-duration: 0.01ms;
  }
}
```

### Container queries

A container query asks how much space a particular component has, not how wide the whole browser is.

```css
.request-list-wrapper {
  container-type: inline-size;
}

@container (inline-size >= 40rem) {
  .request-row {
    grid-template-columns: 1fr auto auto;
  }
}
```

This is useful when the same component can appear in a wide page or narrow sidebar.

### `container-type: inline-size` versus `size`

- `inline-size` allows size queries on the inline axis. In normal horizontal English text, that is width. This is the common choice for responsive components.
- `size` adds containment on both inline and block axes. It is more restrictive and is rarely needed for an ordinary responsive card/list component.

Start with `inline-size`.

### Media query or container query?

- Use `@media` for page-level decisions and user/device preferences.
- Use `@container` when a reusable component should respond to the space its parent gives it.

---

## 6. React foundation

### A component is a function that returns UI

```tsx
type RequestTitleProps = {
  title: string;
};

function RequestTitle({ title }: RequestTitleProps) {
  return <h2>{title}</h2>;
}
```

- `RequestTitleProps` describes the input.
- `{ title }` reads the `title` property from the props object.
- the function returns JSX.

### State

State is data React remembers between renders:

```tsx
const [status, setStatus] = useState<Status>("open");
```

- `status` is the current value.
- `setStatus` requests a state change.
- changing state causes React to render again.

### Props versus state

- **Props** come from the parent.
- **State** is owned and changed by the component (or a shared owner).

Do not copy a prop into state unless you have a specific reason.

### Render from data

```tsx
requests.map((request) => (
  <RequestRow key={request.id} request={request} />
));
```

React describes what the UI should look like for the current data. You do not manually create and append every DOM node.

---

## 7. Figma components compared with React components

Your Figma knowledge transfers well.

| Figma idea | React/TypeScript idea |
| --- | --- |
| Main component | React component |
| Instance | JSX use, such as `<Button />` |
| Text property | `label: string` prop or `children` |
| Variant property | union prop such as `intent: "primary" \| "danger"` |
| Boolean property | boolean prop such as `disabled` |
| Instance swap | component/element prop or composition |
| Nested component | child component |
| Auto layout | Flexbox/Grid |
| Design variables | CSS custom properties/tokens |

Important difference: a code component must also own behavior, semantics, keyboard interaction, accessibility, and valid state rules. It is not only a visual drawing.

---

## 8. Internal states and visual variants

A button can have both.

### Visual variants

These express design meaning selected by the component user:

```ts
type ButtonIntent = "primary" | "secondary" | "danger";
type ButtonSize = "small" | "medium";
```

### Interaction/internal states

These come from behavior or the browser:

- hover;
- focus-visible;
- active/pressed;
- disabled;
- loading.

Example:

```tsx
<Button intent="danger" disabled={isCancelling}>
  {isCancelling ? "Cancelling…" : "Cancel request"}
</Button>
```

`danger` is a visual/semantic variant. `disabled` and `isCancelling` describe current behavior/state.

Avoid a giant `state` prop containing unrelated ideas such as:

```tsx
// Avoid this confused API
<Button state="red-loading-large" />
```

---

## 9. Logical components and visual components

These terms are informal, so ask the teacher what exact definition they use.

A useful distinction is:

- **logical/behavior component:** knows product rules, data, or state;
- **visual/presentational component:** knows how something looks and receives simple props.

```tsx
function RequestActions({ request, currentUser }: RequestActionsProps) {
  const canCancel =
    currentUser.role === "requester" &&
    currentUser.id === request.requesterId &&
    request.status === "open";

  return canCancel ? <Button intent="danger">Cancel</Button> : null;
}
```

`RequestActions` contains product logic. `Button` handles reusable appearance and button behavior.

Do not force every component into only one category. Use the distinction to notice when a reusable visual component has accidentally learned too many Deskline business rules.

---

## 10. Slots, children, and composition

A **slot** is a place where a component allows the caller to insert UI.

React's default slot is `children`:

```tsx
function Message({ children }: { children: React.ReactNode }) {
  return <article className="message">{children}</article>;
}

<Message>
  <p>Could you reset my VPN access?</p>
  <Button>Reply</Button>
</Message>
```

You can create named slots with props:

```tsx
type MessageProps = {
  children: React.ReactNode;
  actions?: React.ReactNode;
};

function Message({ children, actions }: MessageProps) {
  return (
    <article>
      <div>{children}</div>
      {actions && <div className="message-actions">{actions}</div>}
    </article>
  );
}

<Message
  actions={
    <>
      <Button>Reply</Button>
      <Button>Copy</Button>
    </>
  }
>
  Could you reset my VPN access?
</Message>
```

### Do actions need a wrapper component?

Not always.

Use a wrapper such as `<MessageActions>` when it provides something meaningful:

- shared layout or spacing;
- semantics;
- accessibility behavior;
- shared context/state;
- a clear public component API.

If it only exists to avoid writing a Fragment, it may be unnecessary.

### Compound components

For a genuinely complex component, named child components can make the structure explicit:

```tsx
<Message>
  <Message.Body>Could you reset my VPN access?</Message.Body>
  <Message.Actions>
    <Button>Reply</Button>
    <Button>Copy</Button>
  </Message.Actions>
</Message>
```

This is a **compound component** style. The children may share state through context.

Do not begin every small component this way. Start simple. Introduce compound components when the component has real named regions or too many configuration props.

---

## 11. React portals

A portal renders a child into a different place in the HTML DOM:

```tsx
import { createPortal } from "react-dom";

function Dialog({ children }: { children: React.ReactNode }) {
  return createPortal(
    <div role="dialog">{children}</div>,
    document.body,
  );
}
```

Typical uses:

- dialogs;
- popovers;
- tooltips;
- overlays.

It can help the DOM escape an ancestor with `overflow: hidden` or awkward stacking/layout rules.

Important: it changes physical DOM placement, but it remains a child in the React tree. React context still works, and React events bubble through the React tree.

A portal does not automatically make a dialog accessible. You still need focus management, an accessible name, Escape handling, and focus return.

---

## 12. `clsx` and `cva`

Both tools help produce CSS class-name strings. They do not replace CSS.

### `clsx`

Use `clsx` for simple conditional classes:

```tsx
const className = clsx(
  "button",
  isLoading && "button--loading",
  classNameFromProps,
);
```

Falsy entries are left out.

Use it when the question is: **which extra classes apply right now?**

### `cva`

Use Class Variance Authority (`cva`) to define a reusable variant system:

```tsx
const buttonStyles = cva("button", {
  variants: {
    intent: {
      primary: "button--primary",
      danger: "button--danger",
    },
    size: {
      small: "button--small",
      medium: "button--medium",
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "medium",
  },
});
```

Then:

```tsx
<button className={buttonStyles({ intent, size })}>
  {children}
</button>
```

Use it when the question is: **what is this component's supported variant API?**

### A typed button

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const buttonStyles = cva("button", {
  variants: {
    intent: {
      primary: "button--primary",
      danger: "button--danger",
    },
    size: {
      small: "button--small",
      medium: "button--medium",
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "medium",
  },
});

type ButtonProps =
  React.ComponentProps<"button"> &
  VariantProps<typeof buttonStyles>;

function Button({
  intent,
  size,
  className,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      className={clsx(buttonStyles({ intent, size }), className)}
      {...buttonProps}
    />
  );
}
```

Read it in layers:

1. `cva` maps allowed variant values to CSS classes.
2. `typeof buttonStyles` asks TypeScript for the function's type.
3. `VariantProps` extracts the allowed variant props.
4. `ComponentProps<"button">` adds normal HTML button props.
5. `clsx` combines the generated classes with a caller-supplied class.
6. `...buttonProps` forwards remaining real button props.

For Deskline, good early CVA candidates are:

- `Button`: intent and size;
- `StatusBadge`: status;
- `PriorityBadge`: priority;
- perhaps `CategoryBadge`: category.

Do not use CVA for one element with one fixed appearance.

---

## 13. The assigned video: “Composition Is All You Need”

The 22-minute talk by Fernando Rojo uses a message composer to show a scaling problem.

The central lesson:

> Prefer composing clear pieces over adding more and more flags to one giant component.

Warning sign:

```tsx
<Composer
  isEditing
  isThread
  showActions
  hideAttachments
  shouldRenderFooter
/>
```

Every new boolean creates more possible combinations and more conditional code inside the component.

A compositional API makes the desired structure visible:

```tsx
<Composer>
  <Composer.Input />
  <Composer.Attachments />
  <Composer.Actions />
</Composer>
```

Takeaways to write down while watching:

1. What problem did each new boolean prop create?
2. Which pieces became separate components?
3. Where did shared state live?
4. When was normal `children` enough?
5. When did compound components/context help?
6. What would be over-engineering for a simple Deskline badge?

Apply the lesson carefully:

- A `StatusBadge` can stay a simple component with a `status` prop.
- A confirmation dialog can use slots such as title, body, and actions.
- A request detail page should compose `RequestHeader`, `MessageList`, `CommentForm`, and `RequestActions`.
- Do not build a giant `<RequestDetail isAdmin canCancel canClose ... />` API.

Video: <https://www.youtube.com/watch?v=4KvbVq3Eg5w>

---

## 14. Learn by completing Day 1

### Stage A — static HTML and CSS

Build:

- page heading;
- title input;
- description input;
- submit button;
- empty ticket-list container.

Learn:

- semantic HTML;
- labels and inputs;
- block/inline flow;
- spacing;
- CSS custom properties;
- basic responsive layout.

Checkpoint: explain why a `<button type="submit">` belongs inside a `<form>`.

### Stage B — vanilla JavaScript

Build:

- read form values;
- create a ticket object;
- store tickets in an array;
- render the list;
- mark one resolved;
- prevent empty submissions.

Learn:

- variables;
- objects and arrays;
- functions;
- events;
- DOM methods;
- immutable updates;
- `map` and `find`.

Checkpoint: explain the data change separately from the DOM change.

### Stage C — TypeScript practice before React

Write:

```ts
interface Ticket {
  id: string;
  title: string;
  description: string;
  resolved: boolean;
}
```

Then deliberately create wrong values and read each compiler error.

Learn:

- annotations;
- inference;
- object types;
- function parameter/return types;
- arrays;
- literal unions;
- `null` and `undefined`.

Checkpoint: explain why `any` would remove the protection you just added.

### Stage D — React + TypeScript

Build:

- `TicketForm`;
- `TicketList`;
- `TicketRow`;
- `useState<Ticket[]>`;
- typed props;
- submit and resolve handlers.

Learn:

- components;
- JSX;
- props;
- state;
- event handlers;
- list keys;
- rendering from data;
- lifting state to the nearest shared owner.

Checkpoint: explain why React state replaces manual `appendChild`.

### Stage E — network and debugging

Build:

- load initial tickets with `fetch`;
- show loading, success, empty, and error states;
- inspect the request in the Network tab;
- deliberately create and debug one bug.

Learn:

- promise;
- `async`/`await`;
- HTTP request and response;
- status codes;
- `useEffect` for synchronization with the network;
- Console, Network, and breakpoint debugging.

Checkpoint: identify the request URL, method, status, response, and when it fired.

### Stage F — reflection

Write:

- what AI got right;
- what you verified;
- what was wrong or incomplete;
- what you now understand well enough to explain.

---

## 15. Then turn the exercise into the first Deskline slice

The full spec's first target is not just the homework. Add:

- app shell;
- fixture request list;
- one static request detail;
- the spec's `Request`, `Status`, `Priority`, and `Category` types;
- theme color tokens with CSS custom properties;
- README run instructions.

Use the spec's word **request** in the real app. “Ticket” belongs to the small homework exercise.

Example domain types:

```ts
type Status = "open" | "pending" | "closed" | "cancelled";
type Priority = "low" | "medium" | "high";
type Category = "hardware" | "software" | "facilities" | "access";

type Request = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  category: Category;
  requesterId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
};
```

Notice that the description is the first `Message`, not a field on the suggested final `Request` shape.

---

## 16. Fast study schedule

### First focused block — 90 minutes

- 25 min: HTML forms and semantic elements.
- 25 min: CSS flow, Flexbox, custom properties.
- 40 min: JavaScript values, arrays, objects, functions.

Output: static homework UI.

### Second block — 2 hours

- events and form submission;
- DOM creation;
- array updates;
- manual rendering.

Output: working vanilla ticket tracker.

### Third block — 2 hours

- primitive, object, array, and function types;
- inference;
- literal unions;
- `type` versus `interface`;
- generics only after the earlier ideas make sense.

Output: typed ticket model and small `.ts` exercises.

### Fourth block — 2–3 hours

- React component;
- props and state;
- list rendering;
- typed event handlers.

Output: React + TypeScript ticket tracker.

### Fifth block — 90 minutes

- `fetch`;
- loading/error/empty states;
- Network tab;
- deliberate bug and breakpoint.

Output: finished homework plus reflection.

### Sixth block — 2 hours

- app shell;
- fixture list and detail;
- domain types;
- CSS theme tokens;
- README and small Git commits.

Output: full-spec Day 1 target.

Stop after each block and write three sentences:

1. What did I build?
2. What caused a data change?
3. What part can I explain without looking?

---

## 17. Topic backlog for this note

Add these as you meet them; do not front-load all of them.

### JavaScript

- scope and closures;
- destructuring;
- spread and rest;
- modules;
- promises and error handling;
- reference versus value;
- immutable updates.

### TypeScript

- `unknown` versus `any`;
- optional properties;
- narrowing;
- discriminated unions;
- generics;
- `keyof` and indexed access;
- utility types;
- UI types versus API types;
- runtime validation versus compile-time checking.

### React

- controlled forms;
- state ownership;
- derived state;
- effects;
- context;
- composition;
- portals;
- routing;
- error/loading/empty states;
- accessibility.

### CSS

- cascade and specificity;
- box model;
- Flexbox;
- Grid;
- logical properties;
- custom properties/tokens;
- media queries;
- container queries;
- focus styles;
- reduced motion.

---

## 18. Reliable references

- MDN Learn Web Development: <https://developer.mozilla.org/en-US/docs/Learn_web_development>
- JavaScript Guide: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide>
- TypeScript Handbook: <https://www.typescriptlang.org/docs/handbook/intro.html>
- TypeScript Everyday Types: <https://www.typescriptlang.org/docs/handbook/2/everyday-types.html>
- React Learn: <https://react.dev/learn>
- React `createPortal`: <https://react.dev/reference/react-dom/createPortal>
- CSS logical properties: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values>
- CSS container queries: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries>
- `clsx`: <https://github.com/lukeed/clsx>
- CVA: <https://cva.style/docs>

Prefer these primary references over random snippets. Read only the section needed for the current task.

