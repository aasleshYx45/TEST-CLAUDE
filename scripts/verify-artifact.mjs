/* Checks the single-file build actually runs on its own, with no console noise.
   Serve the file first, e.g. `python3 -m http.server 4180` in its directory. */
import { chromium } from 'playwright'

const URL = process.argv[2] || 'http://localhost:4180/attendly.html'
const EXEC = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

let failures = 0
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` (${detail})` : ''}`)
  if (!ok) failures++
}

const browser = await chromium.launch({ executablePath: EXEC })
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, hasTouch: true, isMobile: true })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
// The bare static server has no /favicon.ico; that 404 is the harness, not the page.
page.on('console', (m) => {
  if (m.type() !== 'error') return
  if (m.location().url.endsWith('/favicon.ico')) return
  errors.push(m.text())
})

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
check('app renders', await page.getByText('Your attendance').isVisible())

await page.getByRole('button', { name: 'Add subject' }).click()
await page.getByLabel('Subject name').fill('Chemistry')
await page.locator('.sheet').getByRole('button', { name: 'Add subject' }).click()
await page.waitForTimeout(500)
check('subject added', await page.getByText('Chemistry').first().isVisible())

await page.getByRole('button', { name: 'Add one attended' }).click()
await page.waitForTimeout(700)
const pct = (await page.locator('.ring__pct').first().innerText()).trim()
check('ring updates', pct === '100%', pct)

await page.getByRole('button', { name: 'Timetable' }).click()
await page.waitForTimeout(400)
check('timetable tab works', await page.getByText('No classes on').isVisible())

check('no console errors', errors.length === 0)
if (errors.length) console.log(errors.slice(0, 4))

await browser.close()
process.exit(failures === 0 ? 0 : 1)
