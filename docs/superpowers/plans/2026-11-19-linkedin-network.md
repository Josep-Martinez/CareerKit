# LinkedIn Network Implementation Plan

> **For agentic workers:** Implement each task in order in the current CareerKit checkout. Use test-first changes and review each task before continuing.

**Goal:** Add a Red tab in LinkedIn Content that copies a careful people-discovery prompt and displays public profile recommendations saved in the existing local content JSON.

**Architecture:** Extend the optional `network[]` list in `linkedin-content.json` without changing its schema version. Keep prompt text in the existing prompt catalog so the Buzón and Red tab use the same source. Add local validation and status transitions, then render a review queue in the existing LinkedIn Content page.

**Tech Stack:** React, JSON Schema draft 2020-12, existing browser clipboard helper, Node's built-in test runner, pnpm/Vite.

---

## Files and responsibilities

- `schemas/linkedin-content.schema.json`: validates public profile recommendations while keeping `network` optional.
- `templates/linkedin-content.json`: creates an empty `network` list for new local setups.
- `src/data/linkedin-content-data.js`: validates profile items and updates only one recommendation while preserving unknown fields.
- `src/data/storage.js`: treats `network` as a known content field and inspects its recognized item keys.
- `tests/linkedin-content-data.test.js`: validates compatible old data, profile fields, status transitions and preservation.
- `src/i18n/prompt-inbox.es.js`: defines the one prompt shared by the Buzón and Red tab.
- `src/i18n/es.js`: provides Red UI labels, empty states, category names and save/copy feedback.
- `tests/prompt-requirements.test.js`: checks prompt requirements and its local-access, privacy and no-contact safeguards.
- `src/ui/pages/LinkedInContentPage.jsx`: adds the fourth tab, prompt composition/copy, recommendation filters and cards.
- `src/ui/editorial.css`: adds responsive card and status styling matching the current page.
- `schemas/agent-format.md` and `README.md`: explain the data shape and how to run the prompt and reload saved results.
- `scripts/check-publish.mjs`: prevent ISO verification dates in fixtures from being misidentified as phone numbers by the privacy scan.

## Task 1: Extend the local data model compatibly

**Files:** schema, template, `src/data/linkedin-content-data.js`, `src/data/storage.js`, data tests, `scripts/check-publish.mjs`.

- [x] Add tests for an old object with no `network`, valid and invalid profiles, single-item status changes and preservation of unknown item/root fields.
- [x] Run the data tests as part of `pnpm test`; they pass.
- [x] Add the optional schema definition:

```json
"network": {
  "type": "array",
  "items": { "$ref": "#/$defs/networkPerson" }
}
```

`networkPerson` requires `id`, `name`, `profileUrl`, `category`, `relevance`, `sourceUrl`, `verifiedAt` and `status`. Categories are `recruiter`, `hiring-manager`, `team-leader`, `industry-expert` and `company-leader`; statuses are `pending`, `followed` and `dismissed`. `role` and `company` are optional; unknown properties remain allowed.

- [x] Add `network: []` to the empty template, local validation/update helpers and unknown-field inspection; old files without `network` remain valid.
- [x] Exclude strict `YYYY-MM-DD` dates from phone-pattern findings in `check-publish.mjs`.
- [x] Run the data tests; valid and legacy records pass.

## Task 2: Add one safe search prompt to the catalog

**Files:** `src/i18n/prompt-inbox.es.js`, `tests/prompt-requirements.test.js`.

- [x] Add prompt assertions for relevant people, public research, optional LinkedIn people search, deduplication, validation, privacy and no-contact safeguards.
- [x] Add prompt metadata for the `linkedin` category with the schemas and the relevant local data-entry/job-search references. Its text directs the agent to:

```text
Read profile.json, linkedin.json and cv.json only from the authorized local project.
Build broad public search terms from declared role/task/industry preferences,
confirmed evidence, published LinkedIn facts and stated professional themes.
Never put private contact details, address or subjective personal context into
searches. Use public web results for discovery. If LinkedIn people search is
available, use it to locate or cross-check a person after discovering their name;
the connector requires firstName or lastName. Continue with web search if absent.
Verify each candidate's public profile, name, role and current company from
current sources. Prioritize recruiters, relevant hiring leads, team leaders,
professionals and relevant company leaders. Give source, profile URL, verification
date and a specific reason; separate unknowns and do not promise hiring outcomes.
Deduplicate against all network statuses by canonical profile URL. Save only new,
verified candidates in network[], preserving IDs/unknown fields and validating
linkedin-content.json before and after. Never follow, connect or message anyone.
```

- [x] Keep the prompt in Spanish and use the shared preflight to check CareerKit and folder access; if local access is missing, research can continue without claiming a save.
- [x] Run the prompt requirements tests; they pass.

## Task 3: Add the Red tab and review queue

**Files:** `src/i18n/es.js`, `src/ui/pages/LinkedInContentPage.jsx`, `src/ui/editorial.css`.

- [x] Add UI strings and a fourth flow key `network: 'Red'`.
- [x] Build the prompt from the shared catalog entry, add the optional focus, exact read-only preview and shared copy handler.
- [x] Render pending, followed and dismissed lists with verified details, safe links, counts and immediate status saves that preserve unknown fields.
- [x] Keep follow/connect/message actions outside CareerKit; include empty/error states, accessible button states and responsive layout.
- [x] Run `pnpm test`; all 72 tests pass.

## Task 4: Document and verify the complete flow

**Files:** `schemas/agent-format.md`, `README.md`, current PR description.

- [x] Document `network[]`, its statuses, the Red prompt and the after-run review/reload steps in the format guide and README.
- [x] Confirm no `private-data/` file was touched and the public build check passes.
- [x] Run `pnpm format`, `pnpm format:check`, `pnpm test` (72 passing), `pnpm build`, `pnpm check:publish` and `git diff --check`. `lint:check` is not defined in `package.json`.
- [x] Inspect the rendered Red tab on desktop and mobile; verify no horizontal overflow, prompt copy feedback, queue status changes and source/profile links with synthetic preview data.
- [x] Update the existing PR #19 title and description to cover the current branch and the checks actually run; keep the current branch and PR.

## Plan review

- Every design decision maps to a task: compatible JSON storage and dedupe (Tasks 1–2), MCP/public-web discovery and safeguards (Task 2), interface and states (Task 3), user instructions and acceptance checks (Task 4).
- No task migrates or reads real private data; `schemaVersion` stays 1 and `network` is optional.
- Prompt profile fields, candidate categories, statuses and UI labels use the same names throughout.
