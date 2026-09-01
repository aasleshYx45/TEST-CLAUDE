/* Inlines the production build into one self-contained HTML page.
   Written in Artifact page form: no doctype/html/head/body wrapper. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const out = process.argv[2]
if (!out) {
  console.error('usage: node scripts/build-artifact.mjs <output.html>')
  process.exit(1)
}

execFileSync('npm', ['run', 'build'], { stdio: 'inherit', env: { ...process.env, VITE_SW: 'off' } })

const assets = readdirSync('dist/assets')
const cssFile = assets.find((f) => f.endsWith('.css'))
const jsFile = assets.find((f) => f.endsWith('.js'))
if (!cssFile || !jsFile) {
  console.error('no built assets found')
  process.exit(1)
}

const css = readFileSync(join('dist/assets', cssFile), 'utf8')
// A literal </script> inside the bundle would close the inline tag early.
const js = readFileSync(join('dist/assets', jsFile), 'utf8').replaceAll('</script', '<\\/script')

writeFileSync(
  out,
  `<title>Attendly</title>
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`,
)

const kb = (n) => `${Math.round(n / 1024)} KB`
console.log(`wrote ${out} — css ${kb(css.length)}, js ${kb(js.length)}`)
