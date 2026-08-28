# Frontend Engineering Handbook

The stack, design language, and conventions for building a new frontend on this
team. Follow this and any engineer can open your code and recognise it
immediately.

---

## 1. Stack

Use these. Adding a dependency that overlaps something below needs a reason in
the pull request.

| Concern   | Choice                              | Why this one                                                                |
| --------- | ----------------------------------- | --------------------------------------------------------------------------- |
| Framework | **Next.js 15** (App Router)         | File routing, layouts, and a static export path when we don't need a server |
| Language  | **TypeScript 5**, strict            | Non-negotiable. No new `.js` files                                          |
| UI        | **React 19**                        | Function components and hooks only                                          |
| Styling   | **Tailwind CSS 4**                  | Utilities in markup; tokens defined once in CSS. No CSS-in-JS               |
| State     | **Zustand 5**                       | Small stores, no boilerplate, usable outside React                          |
| Icons     | **lucide-react**                    | One icon set. Don't mix in another                                          |
| Charts    | **recharts**                        | Only when a chart is genuinely needed                                       |
| Markdown  | **react-markdown** + **remark-gfm** | Never render untrusted HTML without deliberate review                       |
| Tests     | **Playwright**                      | End-to-end against real screens                                             |
| Lint      | **ESLint 9** + `eslint-config-next` | Zero errors merges                                                          |

### Static export

If the app has no server-side needs, export it as static files. Simplest thing
to host, and it removes a whole class of runtime failure.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};
```

> **Consequence:** a static export can't serve dynamic routes like `/item/[id]`
> without a host rewrite. Decide this early — retrofitting URLs later touches
> every link, guard, and test. If you need real paths, plan the rewrite with
> whoever owns hosting _before_ you build.

---

## 2. Project structure

One folder per concern. A file's location should tell you what it's allowed to
do.

```
src/
├── app/            routes, layouts — thin; no business logic
├── components/
│   ├── ui/         Button, Dialog, Toast — no feature knowledge
│   └── <feature>/  screens and parts for one feature
├── hooks/          reusable logic; the only place components combine stores + API
├── store/          Zustand stores
├── lib/
│   └── api/        client, endpoints, typed request functions
├── types/          shared TypeScript types
├── constants/      storage keys, event names, enums — never inline strings
├── context/        React context (only where state doesn't fit)
└── utils/          small pure functions
```

### The dependency rule

Data flows one direction. A component never calls `fetch`; a store never imports
a component.

```
Component  →  Hook  →  Store  ←  API client
```

**Don't:** call an endpoint from a component, keep server data in `useState`, or
hardcode a `localStorage` key inline. All three make behaviour impossible to find
later.

---

## 3. Design tokens

Colour is defined once, semantically. You write `bg-surface`, not `bg-white` — so
dark mode is a token swap rather than a rewrite of every component.

### How it's wired

CSS variables hold the values; Tailwind's `@theme` maps them to utility names.
Dark mode overrides only the variables, in one block.

```css
/* app/globals.css */
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));

@theme {
  /* utility name  ←  variable */
  --color-surface: var(--surface);
  --color-text-primary: var(--text-primary);
  --color-border: var(--border-color);
}

/* light — the defaults */
:root {
  --base: #f8fafc; /* page */
  --surface: #ffffff; /* cards, panels */
  --surface-raised: #f1f5f9; /* hover, inputs */
  --text-primary: #0f172a;
  --border-color: #e2e8f0;
}

/* dark — override the same variables, nothing else */
.dark {
  --base: #020617;
  --surface: #0f172a;
  --surface-raised: #1e293b;
  --text-primary: #f1f5f9;
  --border-color: #334155;
}
```

### The token set

| Token             | Use for               | Light     | Dark      |
| ----------------- | --------------------- | --------- | --------- |
| `page`            | App background        | `#f8fafc` | `#020617` |
| `surface`         | Cards, panels, inputs | `#ffffff` | `#0f172a` |
| `surface-raised`  | Hover, subtle fills   | `#f1f5f9` | `#1e293b` |
| `surface-overlay` | Active states, chips  | `#e2e8f0` | `#334155` |
| `text-primary`    | Body and headings     | `#0f172a` | `#f1f5f9` |
| `text-secondary`  | Supporting copy       | `#475569` | `#cbd5e1` |
| `text-muted`      | Timestamps, captions  | `#64748b` | `#94a3b8` |
| `border`          | Default dividers      | `#e2e8f0` | `#334155` |
| `border-strong`   | Inputs, emphasis      | `#cbd5e1` | `#475569` |

### Status colour

Separate from the neutral scale and from the brand accent. Use it only to mean
something — never for decoration. Always pair it with a word or icon so the
meaning survives for colour-blind users.

| Meaning            | Family  | Typical use                         |
| ------------------ | ------- | ----------------------------------- |
| Success / positive | `green` | Completed, passed, saved            |
| Caution / pending  | `amber` | Rate-limited, waiting, needs review |
| Error / critical   | `red`   | Failed, destructive actions         |
| Informational      | `blue`  | Selected, active, links             |

**Don't:** write a raw colour in a component (`bg-white`, `text-gray-500`,
`#fff`). It will look correct in light mode and break in dark. If a token is
missing, add it to `globals.css` rather than working around it.

---

## 4. Typography

A fixed scale, defined as tokens. Pick the nearest step rather than inventing a
size.

| Token                       | Size       | Use for                         |
| --------------------------- | ---------- | ------------------------------- |
| `label`                     | 0.75rem    | Badges, captions, table headers |
| `body`                      | 0.875rem   | Default UI text                 |
| `body-md`                   | 1rem       | Long-form reading               |
| `heading-sm` → `heading-xl` | 1 → 1.5rem | Section and panel titles        |
| `display`                   | 1.875rem   | Page titles. Sparingly          |

- **Weight carries hierarchy** more than size. Prefer `font-medium` /
  `font-semibold` over jumping two steps up the scale.
- **Body copy stays near 65–75 characters** wide. Wider is measurably harder to
  read.
- **Numbers in columns** get `tabular-nums` so they align.

---

## 5. Components

### Shape

```tsx
// components/reports/ReportCard.tsx
"use client";

interface ReportCardProps {
  report: Report;
  onOpen: (id: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onOpen }) => {
  return (
    <button
      onClick={() => onOpen(report.id)}
      className="w-full text-left bg-surface border border-border rounded-lg
                 p-4 hover:bg-surface-raised transition-colors"
    >
      <h3 className="text-heading-sm font-semibold text-text-primary">
        {report.title}
      </h3>
      <p className="text-body text-text-secondary mt-1">{report.summary}</p>
    </button>
  );
};
```

- **Named exports**, one component per file, filename matches the component.
- **Typed props via an interface.** Never `any`.
- **`'use client'` only where you need interactivity** — state, effects, or event
  handlers.
- **Split at ~200 lines**, or when a file does two unrelated jobs.
- **Semantic elements.** A clickable thing is a `<button>`; a navigation is an
  `<a>`. Not a `div` with an `onClick`.

### Interaction states

Every interactive element needs all four. Missing states are the most common
review comment.

| State    | Pattern                                                                               |
| -------- | ------------------------------------------------------------------------------------- |
| Hover    | `hover:bg-surface-raised transition-colors`                                           |
| Focus    | Visible ring — keyboard users depend on it                                            |
| Active   | `active:scale-95` or a darker fill                                                    |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed`, plus the real `disabled` attribute |

### Touch targets

Minimum **44×44px** for anything tappable. Build mobile-first: style the small
screen, then add `sm:` / `md:` for larger.

---

## 6. State

Choose the smallest thing that works, in this order.

| Scope                           | Use             |
| ------------------------------- | --------------- |
| One component                   | `useState`      |
| A component and its children    | Props           |
| Across unrelated components     | A Zustand store |
| Rarely-changing app-wide config | React context   |

### Store conventions

- **Split by lifetime.** Keep persisted domain data and transient UI state in
  separate stores — mixing them means UI flags get written to disk.
- **Persist deliberately.** Use `partialize` to name exactly what survives a
  reload. Anything re-fetchable shouldn't be persisted. Bump `version` when the
  shape changes, so stale data is discarded rather than rehydrated.
- **Actions live in the store**, not spread across components. Components
  dispatch intent; the store owns the transition.
- **One owner per piece of state.** If two effects can write the same value, they
  will race.

> **Watch for:** two effects restoring the same thing on load is a common and
> expensive bug — the second silently overwrites the first, and it only shows up
> as flicker or lost context. When something is restored at startup, give it
> exactly one owner and say so in a comment.

---

## 7. Data layer

All network calls go through one client. That's what makes auth, refresh, and
retry behaviour consistent instead of reimplemented per call site.

```
lib/api/
├── config.ts   base URLs + every endpoint path
├── client.ts   the only place fetch is called
└── index.ts    typed functions, grouped by domain
```

### What the client owns

- Attaching the auth token
- Refreshing an expired token once, and queueing calls made during the refresh so
  they don't stampede
- Turning non-2xx into a typed error carrying `status`, a machine-readable code,
  and the server message
- **Bounded** retries. Honour `Retry-After` on 429; never retry in a tight loop

### Endpoints are never inline

```ts
// lib/api/config.ts
export const ENDPOINTS = {
  REPORTS: {
    LIST: "/api/reports",
    DETAIL: (id: string) => `/api/reports/${id}`,
  },
} as const;
```

### Tolerate backend change

Responses evolve. Normalise at the boundary so one shape change doesn't ripple
through the app.

```ts
// Older deployments return a bare array; newer ones an object.
// Normalise here so callers only ever see one shape.
async getItems(id: string): Promise<ItemsResponse> {
  const data = await api.get<ItemsResponse | Item[]>(ENDPOINTS.ITEMS(id));
  return Array.isArray(data) ? { items: data } : data;
}
```

### Streaming

For server-sent events, parse the stream by hand and expose named callbacks
(`onChunk`, `onEnd`, `onError`) rather than leaking the reader to callers. Always
return a cleanup function and call it on unmount. Treat **every** terminal event
explicitly — an unhandled one leaves the UI spinning forever.

---

## 8. Errors and loading

Every async surface has four states. Design all of them before you build the
happy path.

| State   | Show                                                                   |
| ------- | ---------------------------------------------------------------------- |
| Loading | A skeleton matching the final layout, so nothing jumps when data lands |
| Empty   | What this is, and the one action that fills it                         |
| Error   | What failed and what to do — plus a retry when retrying can help       |
| Success | The content                                                            |

### Error messages

- **4xx:** show the server's message — it's specific and safe.
- **5xx:** use your own copy. Server detail is noise to the user.
- **Network:** say it's a connection problem and to try again.
- **Never** surface a raw exception or stack trace.

**Do:** distinguish "not found" from "empty". A record that was deleted and a
record with no children look identical in code and completely different to a
user.

**Don't:** swallow an error into a silent empty state. The user thinks the data
is gone; you get no bug report.

---

## 9. Accessibility

Baseline, not extra credit. These are review-blocking.

- **Keyboard reachable.** Tab to every control, act with Enter/Space, close with
  Escape.
- **Visible focus.** Never remove the outline without replacing it.
- **Labels on icon-only buttons** — `aria-label` saying what happens.
- **Contrast** at 4.5:1 for body text, in _both_ themes.
- **Meaning never in colour alone.** Pair it with text or an icon.
- **Live regions** for toasts and async results, so they're announced.
- **Respect `prefers-reduced-motion`** for anything animated.

---

## 10. Quality gates

All four pass locally before you push. Same commands in CI, so there are no
surprises.

```bash
npm run type-check                        # zero errors
npx eslint src                            # zero errors
npm audit --omit=dev --audit-level=high   # zero high/critical
npm run build                             # must succeed
```

### Commits and branches

- **Branch per ticket:** `feat/TICKET-123-short-description`, or `fix/`.
- **Conventional commits:** `feat(scope):`, `fix(scope):`, `chore(scope):`.
- **Explain the why.** The diff shows what changed; the message explains the
  reasoning and anything non-obvious you ruled out.
- **One concern per pull request.** Mixing an unrelated fix into a feature makes
  both harder to review and to revert.

### Environment variables

Anything `NEXT_PUBLIC_*` is **inlined at build time** and visible to anyone.
Never put a secret in one. Because it's baked in at build, changing it needs a
rebuild — not a restart — so verify the built output when a value looks stale.
