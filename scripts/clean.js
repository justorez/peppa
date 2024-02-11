import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

fs.rmSync(path.join(__dirname, '../dist'), {
    recursive: true,
    force: true
})
