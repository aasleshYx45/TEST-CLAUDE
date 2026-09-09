import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
mkdirSync('shots/repro', { recursive: true })
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

// 1. Attendance tab, fresh install, tap +
await page.getByRole('button', { name: 'Add subject' }).click()
await page.waitForTimeout(700)
console.log('A) Attendance + -> sheet title:', await page.locator('.sheet__title').innerText())
console.log('   has a Day picker?', await page.locator('.sheet .days').count() > 0)
await page.screenshot({ path: 'shots/repro/a-attendance-plus.png' })
await page.getByRole('button', { name: 'Close' }).click()
await page.waitForTimeout(500)

// 2. Timetable tab with NO subjects yet, tap +
await page.getByRole('button', { name: 'Timetable' }).click()
await page.waitForTimeout(600)
await page.screenshot({ path: 'shots/repro/b-timetable-empty.png' })
await page.getByRole('button', { name: 'Add class' }).click()
await page.waitForTimeout(700)
console.log('B) Timetable + (no subjects) -> sheet title:', await page.locator('.sheet__title').innerText())
console.log('   has a Day picker?', await page.locator('.sheet .days').count() > 0)
console.log('   subject chips offered:', await page.locator('.sheet .chip').count())
const addBtn = page.locator('.sheet').getByRole('button', { name: 'Add class' })
console.log('   "Add class" button disabled?', await addBtn.isDisabled())
console.log('   any guidance shown?', (await page.locator('.sheet .center-note').count()) > 0)
await page.screenshot({ path: 'shots/repro/c-timetable-plus-no-subjects.png' })

await browser.close()
