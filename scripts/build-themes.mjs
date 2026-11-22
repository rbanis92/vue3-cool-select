// Compiles the stylus themes to dist/themes/*.css
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import stylus from 'stylus'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const themesDir = join(root, 'src/styles/themes')
const outDir = join(root, 'dist/themes')
const themes = ['bootstrap', 'material-design']

await mkdir(outDir, { recursive: true })

for (const theme of themes) {
  const input = join(themesDir, theme + '.styl')
  const css = stylus(await readFile(input, 'utf8'))
    .set('filename', input)
    .set('compress', true)
    .render()

  await writeFile(join(outDir, theme + '.css'), css)
  console.log(`dist/themes/${theme}.css`)
}
