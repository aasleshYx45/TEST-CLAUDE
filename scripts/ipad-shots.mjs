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
  ],
  slots: [{ id: 'slot_1', subjectId: 'sub_a', day: 2, start: '09:00', end: '10:30', room: 'Lab 2' }],
  marks: {},
  log: [],
  settings: { defaultRequirement: 75, weekStartsMonday: true, accent: 'lime', reduceGlow: false },
  updatedAt: Date.now(),
}

mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ executablePath: EXEC })

for (const [name, width, height] of [
  ['ipad-portrait', 820, 1180],
  ['ipad-landscape', 1180, 820],
  ['ipad-mini-portrait', 744, 1133],
]) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, hasTouch: true })
  await ctx.addInitScript((d) => localStorage.setItem('attendly.state.v1', JSON.stringify(d)), seed)
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  await page.screenshot({ path: `shots/${name}.png` })
  await ctx.close()
  console.log('shot', name, `${width}x${height}`)
}
await browser.close()
