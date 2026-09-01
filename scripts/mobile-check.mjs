/* Drives the Expo app's web build in Chromium to verify the React Native UI
   renders and its interactions work. Serve mobile/dist-web first. */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:4190/'
const EXEC = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

let failures = 0
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` (${detail})` : ''}`)
  if (!ok) failures++
}

mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ executablePath: EXEC })
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, hasTouch: true })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => {
  if (m.type() !== 'error') return
  if (m.location().url.endsWith('/favicon.ico')) return
  errors.push(m.text())
})

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
check('app renders', await page.getByText('Your attendance').isVisible())
await page.screenshot({ path: 'shots/rn-01-empty.png' })

// Create a subject through the sheet
await page.getByLabel('Add subject').click()
await page.waitForTimeout(700)
await page.getByPlaceholder('e.g. Operating Systems').fill('Operating Systems')
await page.getByPlaceholder('e.g. CS-204').fill('CS-204')
await page.getByLabel('Increase Attended').click()
await page.getByLabel('Increase Attended').click()
await page.getByLabel('Increase Attended').click()
await page.getByLabel('Increase Missed').click()
await page.screenshot({ path: 'shots/rn-02-new-subject.png' })
await page.getByText('Add subject', { exact: true }).last().click()
await page.waitForTimeout(900)
check('subject card renders', await page.getByText('Operating Systems').first().isVisible())
check('ring shows 75%', await page.getByText('75%').first().isVisible())
await page.screenshot({ path: 'shots/rn-03-attendance.png' })

// Counters
await page.getByLabel('Add one attended').click()
await page.waitForTimeout(900)
check('counter updates to 80%', await page.getByText('80%').first().isVisible())

// Timetable: add a class for today, then mark it
await page.getByRole('tab', { name: 'Timetable' }).click()
await page.waitForTimeout(700)
check('timetable renders', await page.getByText('No classes on').isVisible())
await page.getByLabel('Add class').click()
await page.waitForTimeout(700)
await page.screenshot({ path: 'shots/rn-04-new-class.png' })
await page.getByText('Add class', { exact: true }).last().click()
await page.waitForTimeout(900)
check('class appears', await page.getByText('Operating Systems').first().isVisible())
await page.screenshot({ path: 'shots/rn-05-timetable.png' })

await page.getByText('Present').click()
await page.waitForTimeout(600)
check('marking shows a toast', await page.getByText(/marked present/i).isVisible())

await page.getByRole('tab', { name: 'Attendance' }).click()
await page.waitForTimeout(1000)
check('mark fed into attendance (83%)', await page.getByText('83%').first().isVisible())

// Settings + accent switch
await page.getByLabel('Settings').click()
await page.waitForTimeout(700)
await page.screenshot({ path: 'shots/rn-06-settings.png' })
await page.getByLabel('Violet').click()
await page.waitForTimeout(400)
await page.getByLabel('Close').first().click()
await page.waitForTimeout(600)

// History + undo
await page.getByLabel('History').click()
await page.waitForTimeout(700)
check('history lists the mark', await page.getByText(/Marked present/).isVisible())
await page.screenshot({ path: 'shots/rn-07-history.png' })

check('no console errors', errors.length === 0)
if (errors.length) console.log(errors.slice(0, 5))

await browser.close()
console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
