/* Captures every screen of the web app into shots/pages/. */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:4173/'
const EXEC = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const pad = (n) => String(n).padStart(2, '0')
const d = new Date()
const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const todayDay = d.getDay()
// A weekday that deliberately has no classes, for the empty-day screen.
const emptyDay = (todayDay + 3) % 7

const seed = {
  version: 1,
  subjects: [
    { id: 'sub_a', name: 'Operating Systems', code: 'CS-204', accent: 'lime', attended: 18, missed: 2, requirement: 75, createdAt: 1 },
    { id: 'sub_b', name: 'Theory of Computation', code: 'CS-211', accent: 'violet', attended: 9, missed: 5, requirement: 75, createdAt: 2 },
    { id: 'sub_c', name: 'Environmental Science', code: 'EVS-101', accent: 'cyan', attended: 6, missed: 2, requirement: 70, createdAt: 3 },
    { id: 'sub_d', name: 'Discrete Maths', code: 'MA-108', accent: 'amber', attended: 12, missed: 0, requirement: 80, createdAt: 4 },
  ],
  slots: [
    { id: 'slot_1', subjectId: 'sub_a', day: todayDay, start: '09:00', end: '10:30', room: 'Lab 2' },
    { id: 'slot_2', subjectId: 'sub_b', day: todayDay, start: '11:00', end: '12:00', room: 'H-14' },
    { id: 'slot_3', subjectId: 'sub_d', day: todayDay, start: '14:00', end: '15:30', room: 'B-201' },
  ],
  marks: { [`${today}|slot_1`]: 'present' },
  log: [
    { id: 'log_1', ts: Date.now() - 1800_000, kind: 'present', subjectId: 'sub_a', subjectName: 'Operating Systems', label: 'Marked present', delta: { attended: 1, missed: 0 }, markKey: `${today}|slot_1` },
    { id: 'log_2', ts: Date.now() - 5400_000, kind: 'absent', subjectId: 'sub_b', subjectName: 'Theory of Computation', label: 'Marked absent', delta: { attended: 0, missed: 1 } },
    { id: 'log_3', ts: Date.now() - 90000_000, kind: 'cancelled', subjectId: 'sub_c', subjectName: 'Environmental Science', label: 'Class cancelled', delta: { attended: 0, missed: 0 } },
    { id: 'log_4', ts: Date.now() - 180000_000, kind: 'create', subjectId: 'sub_d', subjectName: 'Discrete Maths', label: 'Subject added', delta: { attended: 0, missed: 0 } },
  ],
  settings: { defaultRequirement: 75, weekStartsMonday: true, accent: 'lime', reduceGlow: false },
  updatedAt: Date.now() - 900_000,
}

mkdirSync('shots/pages', { recursive: true })
const browser = await chromium.launch({ executablePath: EXEC })
const problems = []

async function page(name, { empty = false, prepare, full = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  if (!empty) {
    await ctx.addInitScript((data) => localStorage.setItem('attendly.state.v1', JSON.stringify(data)), seed)
  }
  const p = await ctx.newPage()
  p.on('pageerror', (e) => problems.push(`${name}: ${e}`))
  p.on('console', (m) => {
    if (m.type() === 'error' && !m.location().url.endsWith('/favicon.ico')) problems.push(`${name}: ${m.text()}`)
  })
  await p.goto(BASE, { waitUntil: 'networkidle' })
  if (prepare) await prepare(p)
  await p.waitForTimeout(1000)
  await p.screenshot({ path: `shots/pages/${name}.png`, fullPage: full })
  await ctx.close()
  console.log('captured', name)
}

const toTimetable = (p) => p.getByRole('button', { name: 'Timetable' }).click()

await page('01-attendance')
await page('02-attendance-empty', { empty: true })
await page('03-attendance-at-risk', {
  prepare: (p) => p.getByRole('tab', { name: 'At risk' }).click(),
})
await page('04-timetable-today', { prepare: toTimetable })
await page('05-timetable-empty-day', {
  prepare: async (p) => {
    await toTimetable(p)
    await p.getByRole('button', { name: DAY_NAMES[emptyDay] }).click()
  },
})
await page('06-new-subject', { prepare: (p) => p.getByRole('button', { name: 'Add subject' }).click() })
await page('07-edit-subject', {
  prepare: (p) => p.getByRole('button', { name: 'Edit Operating Systems' }).click(),
})
await page('08-new-class', {
  prepare: async (p) => {
    await toTimetable(p)
    await p.getByRole('button', { name: 'Add class' }).click()
  },
})
await page('09-edit-class', {
  prepare: async (p) => {
    await toTimetable(p)
    await p.getByRole('button', { name: 'Edit Operating Systems class' }).click()
  },
})
await page('10-settings', { prepare: (p) => p.getByRole('button', { name: 'Settings' }).click() })
await page('11-history', { prepare: (p) => p.getByRole('button', { name: 'History' }).click() })

await browser.close()
console.log(problems.length ? `\nconsole problems:\n${problems.join('\n')}` : '\nNo console errors on any page.')
