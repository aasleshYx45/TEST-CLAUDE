/* Drives the built app in Chromium and writes screenshots to ./shots. */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:4173/'
const EXEC = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

const seed = {
  version: 1,
  subjects: [
    { id: 'sub_a', name: 'Operating Systems', code: 'CS-204', accent: 'lime', attended: 18, missed: 2, requirement: 75, createdAt: 1 },
    { id: 'sub_b', name: 'Theory of Computation', code: 'CS-211', accent: 'violet', attended: 9, missed: 5, requirement: 75, createdAt: 2 },
    { id: 'sub_c', name: 'Environmental Science', code: 'EVS-101', accent: 'cyan', attended: 6, missed: 2, requirement: 75, createdAt: 3 },
    { id: 'sub_d', name: 'Discrete Maths', code: 'MA-108', accent: 'amber', attended: 12, missed: 0, requirement: 80, createdAt: 4 },
  ],
  slots: [
    { id: 'slot_1', subjectId: 'sub_a', day: 2, start: '09:00', end: '10:30', room: 'Lab 2' },
    { id: 'slot_2', subjectId: 'sub_b', day: 2, start: '11:00', end: '12:00', room: 'H-14' },
    { id: 'slot_3', subjectId: 'sub_d', day: 2, start: '14:00', end: '15:30', room: 'B-201' },
    { id: 'slot_4', subjectId: 'sub_c', day: 3, start: '10:00', end: '11:00', room: '' },
  ],
  marks: {},
  log: [
    { id: 'log_1', ts: Date.now() - 3600_000, kind: 'present', subjectId: 'sub_a', subjectName: 'Operating Systems', label: 'Marked present', delta: { attended: 1, missed: 0 }, markKey: 'x|slot_1' },
    { id: 'log_2', ts: Date.now() - 7200_000, kind: 'absent', subjectId: 'sub_b', subjectName: 'Theory of Computation', label: 'Marked absent', delta: { attended: 0, missed: 1 } },
    { id: 'log_3', ts: Date.now() - 86400_000, kind: 'create', subjectId: 'sub_d', subjectName: 'Discrete Maths', label: 'Subject added', delta: { attended: 0, missed: 0 } },
  ],
  settings: { defaultRequirement: 75, weekStartsMonday: true, accent: 'lime', reduceGlow: false },
  updatedAt: Date.now(),
}

mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ executablePath: EXEC })

async function shot(name, { width = 430, height = 932, empty = false, prepare } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    isMobile: width < 700,
    hasTouch: width < 700,
  })
  if (!empty) {
    await ctx.addInitScript((data) => {
      localStorage.setItem('attendly.state.v1', JSON.stringify(data))
    }, seed)
  }
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  if (prepare) await prepare(page)
  await page.waitForTimeout(900)
  await page.screenshot({ path: `shots/${name}.png` })
  if (errors.length) console.log(`  ! ${name} console:`, errors.slice(0, 3))
  await ctx.close()
  console.log('shot', name)
}

await shot('01-attendance')
await shot('02-empty', { empty: true })
await shot('03-timetable', { prepare: (p) => p.getByRole('button', { name: 'Timetable' }).click() })
await shot('04-add-subject', { prepare: (p) => p.getByRole('button', { name: 'Add subject' }).click() })
await shot('05-settings', { prepare: (p) => p.getByRole('button', { name: 'Settings' }).click() })
await shot('06-history', { prepare: (p) => p.getByRole('button', { name: 'History' }).click() })
await shot('07-desktop', { width: 1280, height: 900 })
await shot('08-add-class', {
  prepare: async (p) => {
    await p.getByRole('button', { name: 'Timetable' }).click()
    await p.getByRole('button', { name: 'Add class' }).click()
  },
})

await browser.close()
