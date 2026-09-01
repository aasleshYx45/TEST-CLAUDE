import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'

const svg = readFileSync('public/icon.svg', 'utf8')
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
for (const [name, size, pad] of [
  ['icon-192.png', 192, 0],
  ['icon-512.png', 512, 0],
  ['icon-180.png', 180, 0],
  ['icon-maskable.png', 512, 0.11],
]) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
  const inner = pad ? `padding:${Math.round(size * pad)}px;background:#0a0b0e` : ''
  await page.setContent(
    `<body style="margin:0;background:#0a0b0e"><div style="width:${size}px;height:${size}px;box-sizing:border-box;${inner}">${svg.replace('<svg', '<svg style="width:100%;height:100%;display:block"')}</div></body>`,
  )
  writeFileSync(`public/${name}`, await page.screenshot({ omitBackground: false }))
  await page.close()
  console.log('wrote', name)
}
await browser.close()
