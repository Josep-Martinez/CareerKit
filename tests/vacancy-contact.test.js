import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  validVacancyAvailability,
  validVacancyHiringContact,
} from '../src/data/vacancy-data.js'

const vacancySchema = JSON.parse(
  readFileSync(new URL('../schemas/vacancies.schema.json', import.meta.url)),
)

const availability = {
  status: 'active',
  checkedAt: 'sample-date',
  sourceUrl: 'https://example.com/jobs/role',
}
const hiringContact = {
  name: 'Publicly listed name',
  role: 'Department lead',
  linkedinUrl: 'https://example.org/public-profile',
  contactUrl: '',
  publicEmail: '',
  sourceUrl: 'https://example.com/team',
  verifiedAt: 'sample-date',
}

test('vacancies accept optional availability details', () => {
  assert.equal(validVacancyAvailability(availability), true)
})

test('vacancies reject unknown availability states', () => {
  assert.equal(
    validVacancyAvailability({ ...availability, status: 'maybe' }),
    false,
  )
})

test('vacancies accept public hiring contact details', () => {
  assert.equal(validVacancyHiringContact(hiringContact), true)
})

test('vacancies preserve partial contact details and allow no contact', () => {
  assert.equal(validVacancyHiringContact(undefined), true)
  assert.equal(
    validVacancyHiringContact({ name: 'Publicly listed name' }),
    true,
  )
})

test('the public schema describes the same availability states', () => {
  assert.deepEqual(vacancySchema.$defs.availability.properties.status.enum, [
    'active',
    'closed',
    'uncertain',
  ])
  assert.ok(vacancySchema.properties.items.items.properties.hiringContact)
})
