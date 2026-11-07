# Perfil Profundo y Formato de LinkedIn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Perfil into a private personal and career dossier distinct from the published LinkedIn copy, and validate LinkedIn's published language and list entries without breaking existing JSON.

**Architecture:** Extend `profile.json` with three optional, schema-validated context objects while preserving the current evidence collections. Add optional `published.languages` and validate every published list item as a string. Keep older LinkedIn files valid, never edit private user files, and update the UI, agent-format guide and prompts to respect that personal context is internal by default.

**Tech Stack:** React, Vite, JavaScript/JSX, JSON Schema 2020-12, pnpm.

---

## File map

- `schemas/profile.schema.json`, `templates/profile.json`, `src/data/storage.js`: optional personal context, career preferences and content direction, including empty-state detection and unknown-field reporting.
- `src/ui/pages/ProfilePage.jsx`, `src/ui/components/FormPrimitives.jsx` or a focused new `src/ui/components/StringListField.jsx`, `src/i18n/es.js`: editable, accessible sections and Spanish copy.
- `schemas/linkedin.schema.json`, `templates/linkedin.json`, `schemas/agent-format.md`, `src/data/storage.js`: optional language section and string validation for published lists.
- `src/ui/pages/LinkedInPage.jsx`, `src/i18n/es.js`: language editing, preview and audit section labels.
- `src/i18n/prompt-inbox.es.js`, `README.md`: agent use of private context and safe handling of partial LinkedIn source files.

## Task 1: Extend Profile's data contract

**Files:**
- Modify `schemas/profile.schema.json`
- Modify `templates/profile.json`
- Modify `src/data/storage.js`
- Modify `schemas/agent-format.md`

- [ ] **Step 1: Add optional Profile context fields.** Define these optional properties in `profile.schema.json`; every property inside the objects remains optional so partial edits and old files remain valid.

```json
{
  "$defs": {
    "stringList": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "personalContext": {
    "type": "object",
    "properties": {
      "aboutMe": { "type": "string" },
      "values": { "$ref": "#/$defs/stringList" },
      "interests": { "$ref": "#/$defs/stringList" },
      "motivations": { "type": "string" },
      "thinkingStyle": { "type": "string" },
      "learningStyle": { "type": "string" },
      "workStyle": { "type": "string" },
      "strengths": { "$ref": "#/$defs/stringList" },
      "growthAreas": { "$ref": "#/$defs/stringList" },
      "preferredEnvironment": { "type": "string" },
      "boundaries": { "type": "string" }
    },
    "additionalProperties": true
  },
  "careerPreferences": {
    "type": "object",
    "properties": {
      "roleFamilies": { "$ref": "#/$defs/stringList" },
      "tasks": { "$ref": "#/$defs/stringList" },
      "industries": { "$ref": "#/$defs/stringList" },
      "workModes": { "$ref": "#/$defs/stringList" },
      "location": { "type": "string" },
      "conditions": { "type": "string" },
      "avoid": { "$ref": "#/$defs/stringList" }
    },
    "additionalProperties": true
  },
  "contentDirection": {
    "type": "object",
    "properties": {
      "themes": { "$ref": "#/$defs/stringList" },
      "viewpoints": { "$ref": "#/$defs/stringList" },
      "tone": { "type": "string" },
      "avoid": { "$ref": "#/$defs/stringList" }
    },
    "additionalProperties": true
  }
}
```

- [ ] **Step 2: Add empty structures to `templates/profile.json`.** Use only empty strings and arrays; do not include sample values.
- [ ] **Step 3: Update runtime validation and content state.** Validate each known string and string-array property when supplied, retain optional nested unknown properties, include these objects in `hasModuleContent`, and list their known keys in `findUnknown` so legitimate fields do not raise warnings.
- [ ] **Step 4: Document the distinction.** State that personal context and content direction are internal by default and are not CV evidence or published LinkedIn copy unless the user explicitly confirms use.
- [ ] **Step 5: Check the data contract.** Run `pnpm format:check`, `pnpm build`, and `pnpm check:publish` after the complete implementation; verify no old Profile fields become required.

## Task 2: Redesign the Profile form around private context

**Files:**
- Modify `src/ui/pages/ProfilePage.jsx`
- Modify `src/ui/components/FormPrimitives.jsx` or create `src/ui/components/StringListField.jsx`
- Modify `src/i18n/es.js`
- Modify `src/ui/styles.css` or `src/ui/editorial.css` only if the new cards need specific responsive styling

- [ ] **Step 1: Group fields into four clear areas.** Render “Quién eres y cómo trabajas”, “Qué trabajo buscas”, “Intereses y voz para publicaciones”, and “Trayectoria y evidencias”. Keep `professionalProfile` labeled as a short professional summary, separate from personal context.
- [ ] **Step 2: Add accessible list editing.** Use a reusable textarea list control where one line represents one item. It receives an array of strings and emits trimmed non-empty lines, with an associated label and helper text.
- [ ] **Step 3: Bind all new fields to the current draft.** Update nested objects immutably and preserve unrelated/unknown keys when saving. Use no example personal details in labels, placeholders or help text.
- [ ] **Step 4: Explain privacy at the field group.** Mark the first three groups as internal context and explain that the agent can use them for search direction and draft voice, but the app never publishes them.
- [ ] **Step 5: Review small and wide layouts.** Confirm headings, labels, add/remove controls and save action remain keyboard accessible and do not overflow at mobile widths.

## Task 3: Update agent guidance for the richer Profile

**Files:**
- Modify `src/i18n/prompt-inbox.es.js`
- Modify `README.md` if its description of Profile's contents needs to match

- [ ] **Step 1: Make the manual Profile prompt ask before inferring.** It may ask about interests, values, work style, strengths and growth areas, but saves only answers the user actually provides. Keep subjective information out of CV evidence and LinkedIn by default.
- [ ] **Step 2: Keep the CV-to-Profile prompt factual.** Import explicit CV facts only; do not infer personal values, interests, preferences, strengths or goals from a CV.
- [ ] **Step 3: Ground job search in declared fit.** Use `careerPreferences`, objectives and confirmed evidence; leave missing location, salary, sector or modality unspecified rather than guessing.
- [ ] **Step 4: Ground LinkedIn ideas in private editorial context.** Update relevant post, plan and repurpose prompts to use `contentDirection` and user-confirmed interests as guidance. Never invent first-person opinions or experiences, copy private personal notes into `published`, or publish anything.
- [ ] **Step 5: Keep the LinkedIn audit evidence-based.** Use confirmed professional evidence for public factual claims. Keep any ideas informed by private context as separate suggestions, and preserve `published` unless explicitly asked to update it.

## Task 4: Complete and validate LinkedIn's published sections

**Files:**
- Modify `schemas/linkedin.schema.json`
- Modify `templates/linkedin.json`
- Modify `src/data/storage.js`
- Modify `src/ui/pages/LinkedInPage.jsx`
- Modify `src/i18n/es.js`
- Modify `schemas/agent-format.md`
- Modify `src/i18n/prompt-inbox.es.js`

- [ ] **Step 1: Add `published.languages` as an optional string list.** Include an empty array in the template. Keep it optional in the schema/runtime validator so existing files without this field remain valid.
- [ ] **Step 2: Define every published list item as a string.** For `experience`, `education`, `languages`, `skills`, `certifications`, `projects` and `featured`, add `items: { "type": "string" }` to the JSON Schema. Keep each item as its literal published text rather than inferring object fields.
- [ ] **Step 3: Expose Languages in the LinkedIn editor and preview.** Add the section to edit, preview and audit selection lists; add the Spanish label and preserve the existing edit/preview switch.
- [ ] **Step 4: Align the agent-format guide and transcription prompt.** Include `published.languages`, preserve each published item as its own string, and tell the agent that absent sections stay unchanged. If an item is visibly truncated (such as “... más”), do not replace a fuller saved version with that fragment; ask for an expanded copy or explicit confirmation first.
- [ ] **Step 5: Confirm old files stay valid.** Existing LinkedIn snapshots without `published.languages` must validate, retain unknown properties and open in the editor without runtime errors.

## Task 5: Final verification and PR update

**Files:**
- No private JSON files; do not open or modify `private-data/`
- Update the open PR #5 description after successful verification

- [ ] **Step 1: Check formatting and public output.** Run `pnpm format`, `pnpm format:check`, `pnpm build`, and `pnpm check:publish`.
- [ ] **Step 2: Check prompt references.** Confirm prompt IDs are unique, all referenced skills exist, and prompts distinguish private context from published copy.
- [ ] **Step 3: Review the diff.** Confirm only code, schema, templates, docs and empty UI copy are changed; no private files or personal information are present.
- [ ] **Step 4: Commit focused changes.** Use a descriptive commit for the Profile redesign and LinkedIn schema/UI updates, then push the current feature branch and update PR #5 with the delivered scope and verification results.

## Scope notes

- Do not read or update `linkdn(1).docx` or `private-data/linkedin.json` as part of this implementation.
- Do not replace, clear, translate or complete any LinkedIn data from a partial file.
- Do not introduce new modules, public/private publishing automation, agent execution, APIs, accounts or remote services.
- The repository has no `lint:check` script. Do not add tests as part of this work; the task uses the existing format, build and publication checks plus a manual interface review.
