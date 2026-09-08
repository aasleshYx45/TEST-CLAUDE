/* Verifies the built app works when hosted under a subpath, as on GitHub Pages
   (https://<user>.github.io/<repo>/) rather than at a domain root. */
import { chromium } from 'playwright'

const URL = process.argv[2] || 'http://localhost:4200/TEST-CLAUDE/'
const EXEC = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

const browser = await chromium.launch({ executablePath: EXEC })
const page = await browser.newPage({ viewport: { width: 430, height: 932 } })
const bad = []
page.on('pageerror', (e) => bad.push(String(e)))
page.on('response', (r) => {
  if (r.status() >= 400) bad.push(`HTTP ${r.status()} ${r.url()}`)
})

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

console.log('app renders:      ', await page.getByText('Your attendance').isVisible())
console.log('manifest href:    ', await page.getAttribute('link[rel="manifest"]', 'href'))
console.log(
  'service worker:   ',
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration()
    return reg ? reg.scope : 'not registered'
  }),
)
console.log(bad.length ? `\nPROBLEMS:\n${bad.join('\n')}` : '\nNo failed requests or page errors.')

await browser.close()
process.exit(bad.length ? 1 : 0)
