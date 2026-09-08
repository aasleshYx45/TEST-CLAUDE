/* Renders every icon size from public/icon.svg, for both the web and native apps.
   Screenshots are taken over an opaque background: the App Store rejects icons
   with an alpha channel. */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'

const svg = readFileSync('public/icon.svg', 'utf8')
const EXEC = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

const targets = [
  // Web app / PWA
  ['public/icon-192.png', 192, 0],
  ['public/icon-512.png', 512, 0],
  ['public/icon-180.png', 180, 0],
  ['public/icon-maskable.png', 512, 0.11],
  // Native app. Apple requires exactly 1024x1024 for the App Store icon, and
  // Android's adaptive icon needs padding so the launcher mask can crop it.
  ['mobile/assets/icon.png', 1024, 0],
  ['mobile/assets/splash.png', 1024, 0],
  ['mobile/assets/adaptive-icon.png', 1024, 0.18],
]

const browser = await chromium.launch({ executablePath: EXEC })

for (const [path, size, pad] of targets) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
  const inner = pad ? `padding:${Math.round(size * pad)}px;` : ''
  await page.setContent(
    `<body style="margin:0;background:#0a0b0e"><div style="width:${size}px;height:${size}px;box-sizing:border-box;background:#0a0b0e;${inner}">${svg.replace('<svg', '<svg style="width:100%;height:100%;display:block"')}</div></body>`,
  )
  writeFileSync(path, await page.screenshot({ omitBackground: false }))
  await page.close()
  console.log('wrote', path, `${size}x${size}`)
}

await browser.close()
