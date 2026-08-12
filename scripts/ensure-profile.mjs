import { constants } from 'node:fs'
import { access, copyFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(root, 'assets/profile.temp.json')
const target = resolve(root, 'assets/profile.json')

async function exists(path) {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

if (!(await exists(target))) {
  if (!(await exists(source))) {
    throw new Error('Missing assets/profile.temp.json')
  }

  await copyFile(source, target)
  console.log('Created assets/profile.json from assets/profile.temp.json')
}
