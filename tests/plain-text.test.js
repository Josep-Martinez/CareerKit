import assert from 'node:assert/strict'
import test from 'node:test'
import { plainText } from '../src/ui/plain-text.js'

test('removes complete markup while keeping its text', () => {
  assert.equal(plainText('<b>Perfil profesional</b>'), 'Perfil profesional')
})

test('does not leave an unterminated tag in the resulting plain text', () => {
  assert.equal(plainText('Nombre <script'), 'Nombre')
})

test('turns supported line breaks into spaces', () => {
  assert.equal(plainText('Una línea<br>otra línea'), 'Una línea otra línea')
})
