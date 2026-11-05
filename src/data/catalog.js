import profile from '../../templates/profile.json'
import linkedin from '../../templates/linkedin.json'
import cv from '../../templates/cv.json'
import vacancies from '../../templates/vacancies.json'
import priorities from '../../templates/priorities.json'

export const FILES = ['profile', 'linkedin', 'cv', 'vacancies', 'priorities']

// The public app creates missing files from these same empty templates, so
// the in-app setup flow cannot drift from templates/.
export const EMPTY = { profile, linkedin, cv, vacancies, priorities }
