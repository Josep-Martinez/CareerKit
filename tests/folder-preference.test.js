import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getFolderPreference,
  saveFolderPreference,
} from '../src/data/folder-preference.js'

class MemoryStorage {
  values = new Map()
  failSet = false
  failRemove = false

  getItem(key) {
    return this.values.get(key) ?? null
  }

  setItem(key, value) {
    if (this.failSet) throw new Error('storage unavailable')
    this.values.set(key, String(value))
  }

  removeItem(key) {
    if (this.failRemove) throw new Error('storage unavailable')
    this.values.delete(key)
  }
}

test('persistent folder choice takes precedence over stale session choice', () => {
  const local = new MemoryStorage()
  const session = new MemoryStorage()
  local.setItem('careerkit-folder-preference', 'picked')
  session.setItem('careerkit-folder-preference', 'local')

  assert.equal(getFolderPreference(local, session), 'picked')
})

test('session-only disconnect overrides an older persistent folder choice', () => {
  const local = new MemoryStorage()
  const session = new MemoryStorage()
  local.setItem('careerkit-folder-preference', 'picked')
  local.failSet = true

  assert.equal(saveFolderPreference('disconnected', local, session), false)
  assert.equal(getFolderPreference(local, session), 'disconnected')
})

test('persistent disconnect remains authoritative when stale session cleanup fails', () => {
  const local = new MemoryStorage()
  const session = new MemoryStorage()
  local.setItem('careerkit-folder-preference', 'picked')
  session.setItem('careerkit-folder-preference', 'local')
  session.failRemove = true

  assert.equal(saveFolderPreference('disconnected', local, session), true)
  assert.equal(getFolderPreference(local, session), 'disconnected')
})
