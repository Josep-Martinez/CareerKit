---
name: li-profile
description: Audit or improve LinkedIn profile sections the user provides, connecting recommendations to confirmed CareerKit evidence without editing the published copy automatically.
---

# LinkedIn profile audit

Review the sections the user actually supplies. This rubric is an editorial aid, not an official LinkedIn score or a prediction of hiring outcomes.

## Inputs and evidence

- Read `.agents/skills/li-bilingual/SKILL.md` before proposing copy. Use the relevant confirmed goals and evidence in `private-data/profile.json` only when the user has authorized access.
- Work from text or screenshots the user provides. Do not log in, scrape LinkedIn, infer missing sections from a URL, or treat a missing section as a verified zero.
- Read `rubric.json` in this directory. Score only the supplied information; label other areas unassessed. Explain that a numeric score is a writing aid, not a platform or hiring metric.
- Compare claims with confirmed, relevant evidence. Keep projects separate from employment. Do not invent titles, dates, outcomes, skills, or details to fill gaps.

## Review and rewrite

Review the headline, About, experience, education, skills, certifications, projects, and featured sections when provided. Identify the few changes with the greatest practical effect, then propose copy for those sections first. Keep the headline specific to the user's goals and proof; avoid keyword lists and unsupported titles. Keep a concise opening in About, and make experience bullets show scope, action, and result where available.

Provide separate Spanish and English versions by default, following `li-bilingual`. Review each language independently and do not add claims in translation. The user chooses what to paste.

## CareerKit audit notes

The published LinkedIn copy in `private-data/linkedin.json.published` is a faithful record. Never replace it with a recommendation. Add section-linked audit notes to `linkedin.json.audits` only when the user asks, including priority, observed issue, reason and evidence, linked profile evidence IDs, recommendation, optional proposed text, known date, and pending status. Validate the affected JSON and leave it unchanged if invalid.

Return the score or unassessed areas, the strongest evidence, prioritized changes, and copy-ready options. Do not access the account or apply changes.
