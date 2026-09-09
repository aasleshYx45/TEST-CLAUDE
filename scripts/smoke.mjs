/* End-to-end smoke test against the built app. Run: node scripts/smoke.mjs */
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:4173/'
const EXEC = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

let failures = 0
const check = (label, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
  if (!ok) failures++
}

const browser = await chromium.launch({ executablePath: EXEC })
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await page.goto(BASE, { waitUntil: 'networkidle' })

// 0. With no subjects yet, the timetable's + must not open a class form: a class
//    belongs to a subject, and that form would offer nothing to pick.
await page.getByRole('button', { name: 'Timetable' }).click()
await page.waitForTimeout(400)
check('empty timetable offers a way to add a subject', await page.getByRole('button', { name: 'Add a subject' }).isVisible())
await page.getByRole('button', { name: 'Add class' }).click()
await page.waitForTimeout(500)
const firstSheet = await page.locator('.sheet__title').innerText()
check(`timetable + with no subjects opens the subject form (got "${firstSheet}")`, firstSheet === 'New subject')
check('and shows no day picker', (await page.locator('.sheet .days').count()) === 0)
await page.getByRole('button', { name: 'Close' }).click()
await page.waitForTimeout(400)
await page.getByRole('button', { name: 'Attendance' }).click()
await page.waitForTimeout(400)

// 1. Create a subject
await page.getByRole('button', { name: 'Add subject' }).click()
await page.getByLabel('Subject name').fill('Physics')
await page.getByLabel('Increase Required').click() // 75 -> 80
await page.locator('.sheet').getByRole('button', { name: 'Add subject' }).click()
await page.waitForTimeout(400)
check('subject card renders', await page.getByText('Physics').first().isVisible())
check('requirement stepper applied', (await page.getByText('of 80%').count()) === 1)

// 2. Counters
await page.getByRole('button', { name: 'Add one attended' }).click()
await page.getByRole('button', { name: 'Add one attended' }).click()
await page.getByRole('button', { name: 'Add one missed' }).click()
await page.waitForTimeout(800)
const pct = await page.locator('.ring__pct').first().innerText()
check(`ring shows 67% (got ${pct})`, pct.trim() === '67%')
check('standing tells you to attend more', await page.getByText(/Attend next/).first().isVisible())

// 3. Timetable: with a subject in hand, + now opens the class form as intended
await page.getByRole('button', { name: 'Timetable' }).click()
await page.getByRole('button', { name: 'Add class' }).click()
await page.waitForTimeout(500)
check('timetable + with a subject opens the class form', (await page.locator('.sheet__title').innerText()) === 'New class')
check('class form offers the subject to pick', (await page.locator('.sheet .chip').count()) === 1)
await page.locator('.sheet').getByRole('button', { name: 'Add class' }).click()
await page.waitForTimeout(400)
check('class appears on the timetable', await page.getByText('Physics').first().isVisible())
await page.getByRole('button', { name: 'Present' }).click()
await page.waitForTimeout(300)
check('marking shows a toast', await page.getByText(/marked present/i).isVisible())

// 4. Attendance reflects the mark
await page.getByRole('button', { name: 'Attendance' }).click()
await page.waitForTimeout(700)
const afterMark = await page.locator('.ring__pct').first().innerText()
check(`mark fed into attendance, 75% (got ${afterMark})`, afterMark.trim() === '75%')

// 5. Persistence across a reload
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(700)
check('state survives reload', (await page.locator('.ring__pct').first().innerText()).trim() === '75%')

// 6. Undo from history
await page.getByRole('button', { name: 'History' }).click()
await page.waitForTimeout(300)
check('history lists the mark', await page.getByText('Marked present · Physics').isVisible())
await page.getByRole('button', { name: 'Undo' }).first().click()
await page.waitForTimeout(300)
await page.getByRole('button', { name: 'Close' }).click()
await page.waitForTimeout(700)
const afterUndo = await page.locator('.ring__pct').first().innerText()
check(`undo reverted the mark, 67% (got ${afterUndo})`, afterUndo.trim() === '67%')

// 7. Theme switching
await page.getByRole('button', { name: 'Settings' }).click()
await page.getByRole('button', { name: 'Violet' }).click()
await page.waitForTimeout(200)
check('accent applies to the document', (await page.getAttribute('html', 'data-accent')) === 'violet')

check('no console or page errors', errors.length === 0)
if (errors.length) console.log(errors.slice(0, 5))

await browser.close()
console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
