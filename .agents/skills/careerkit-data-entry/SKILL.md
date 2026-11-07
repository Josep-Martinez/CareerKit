---
name: careerkit-data-entry
description: Use when the user asks to fill or update CareerKit profile data, record LinkedIn content they provide, or edit one of the local CareerKit JSON modules.
---

# CareerKit data entry

Use this guide for careful, user-directed changes to CareerKit's local files. Before editing, read `AGENTS.md` and `schemas/agent-format.md`, then inspect only the JSON modules needed for the requested task.

## Source and permission

- Use information the user provides in the current conversation or data they have authorized you to read in `private-data/`. Do not search other projects, documents, PDFs, browsers, or accounts for missing information.
- If the local folder is unavailable, ask the user to open it or provide the relevant content. Do not claim to have read or saved anything.
- A prompt in CareerKit is a request to the agent only after the user pastes it into an agent conversation. Do not write files merely because a prompt is visible or copied.

## Profile

- Use `profile.json` for confirmed and pending facts the user explicitly supplies. Ask when a material fact, date, result, language level, or privacy status is unclear.
- Preserve stable IDs. Create an ID only for a genuinely new item. Keep university activities, independent projects, and employment distinct.
- Set `confirmed: true` only when the user has confirmed the facts. Mark `cvEvidence`, `onLinkedIn`, and `internal` according to the user's instructions; do not infer that an item is public or suitable for a CV.
- Keep private context internal. Do not copy pending facts or internal notes into LinkedIn or the CV.

## LinkedIn copy

- Only record content the user supplies or transcribes. Preserve spelling, punctuation, wording, and section boundaries. Do not log in to LinkedIn, scrape it, infer missing content, translate it, or improve it during transcription.
- Keep the published copy in `linkedin.json.published`. Store audits separately in `linkedin.json.audits`; an audit never changes the published copy by itself.
- Link audit notes to stable profile evidence IDs when applicable. Ask if an ID or the underlying evidence is unclear.

## Safe file changes

- Validate each affected file against its own `schemas/<module>.schema.json` before editing and after writing. Preserve unknown properties and unaffected modules.
- If the source JSON is invalid, missing required information, has a conflicting schema version, or cannot be validated, leave it unchanged and identify the exact file and issue. Do not replace it with a template automatically.
- Save only the module the user asked you to update. Report the file actually changed and any fields that still need confirmation.
- Never place personal information in tracked files, templates, examples, skills, screenshots, build output, or commit history.
