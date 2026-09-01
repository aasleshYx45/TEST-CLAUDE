# Attendly

A timetable and attendance tracker for students. Log every class, see at a glance
how many you can still afford to skip, and mark attendance straight from your
weekly schedule.

Built as a mobile-format web app that runs on any device — phone, tablet, or
desktop — and installs to the home screen as a PWA. Everything is stored locally
in the browser; nothing is uploaded anywhere.

| Attendance | Timetable | New subject | Settings |
| --- | --- | --- | --- |
| ![Attendance](docs/screenshots/attendance.png) | ![Timetable](docs/screenshots/timetable.png) | ![New subject](docs/screenshots/add-subject.png) | ![Settings](docs/screenshots/settings.png) |

## What it does

**Attendance**
- One card per subject with a live percentage ring, colour-coded by how you're doing.
- Tells you the thing you actually want to know: **“Can skip 4”** when you're
  comfortable, **“Attend next 6”** when you've slipped below your requirement.
- Per-subject requirement (60–85%), so a subject with an 80% rule is judged at 80%.
- Quick +/− counters on every card, plus overall totals across all subjects.
- Filter to just the subjects at risk once you have a few.

**Timetable**
- Weekly schedule with a day picker; days that have classes are dotted.
- Mark each class **Present**, **Absent**, or **Off** (cancelled) in one tap — marks
  feed straight into your attendance numbers, and *Off* deliberately does not
  move your percentage.
- Marks are recorded per calendar date, so a Monday class marked on Monday is
  independent of next Monday's. Future days are read-only until they arrive.

**Everything else**
- History of every change, with undo on anything that moved your numbers.
- Five accent themes, Monday/Sunday week start, and a reduced-glow mode.
- Export/import your data as JSON, and a full reset.
- Works offline after the first load.

## The maths

Both headline numbers come from `src/lib/attendance.ts`:

- **Can skip** — the largest `k` where `attended / (total + k) ≥ requirement`.
- **Attend next** — the smallest `k` where `(attended + k) / (total + k) ≥ requirement`.

`tests/attendance.test.ts` checks these against each other exhaustively over a
grid of attended/missed pairs: skipping exactly `canSkip` classes must stay at or
above the line, and one more must fall below it.

## Running it

```bash
npm install
npm run dev        # development server
npm run build      # type-check and build to dist/
npm run preview    # serve the production build
```

## Checks

```bash
npm run typecheck  # tsc
npm test           # attendance maths unit tests
npm run smoke      # end-to-end browser test (needs `npm run preview` running)
npm run shots      # regenerate screenshots into shots/
```

`smoke` and `shots` drive Chromium through Playwright against the preview server
at `http://localhost:4173`. Set `BASE_URL` or `CHROMIUM_PATH` to point them
elsewhere.

## Single-file build

```bash
npm run build:single -- attendly.html
```

Inlines the CSS and JS into one self-contained HTML file you can host anywhere
or open directly. It builds with `VITE_SW=off`, since a lone HTML file has no
`sw.js` beside it to register. `scripts/verify-artifact.mjs` checks that the
result runs on its own with no console errors.

Note that the browser download in **Settings → Export** relies on a blob link,
which some sandboxed hosts block; it works when the app is served normally.

## Layout

```
src/
  lib/          attendance maths, date and week helpers, accent palette
  store/        reducer, localStorage persistence, React context
  components/   Ring, Sheet, Toast, Stepper, Switch, SubjectCard, icons
  screens/      Attendance, Timetable, and the four sheets
  styles/       design tokens, base layer, component layer
```

State lives in one reducer (`src/store/store.ts`) and is written to
`localStorage` on every change. Each attendance-changing action records the delta
it applied, which is what makes undo exact rather than approximate.
