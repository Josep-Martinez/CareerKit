---
name: li-post
description: Turn a user-provided idea or experience into a specific LinkedIn post draft with several suitable openings; never publish it.
---

# LinkedIn post writer

Turn one real idea into a clear, natural post. Do not claim that writing formulas improve ranking or guarantee performance.

## Before writing

1. Read `.agents/skills/li-bilingual/SKILL.md`. Unless the user asks for one language, prepare separate complete Spanish and English versions with equivalent facts and meaning.
2. Use only the user's idea, authorized confirmed CareerKit data, and writing examples they supplied. Do not read other projects or invent a voice. If voice matters and is unclear, ask for a sample.
3. Read `.agents/skills/li-post/hooks.json`. Choose three different opening patterns only when they genuinely fit the material. If the idea is too broad, ask one concise question about what happened, what the user did, or what evidence supports the point.

## Draft

- One central idea. Lead with a specific, supported opening; use short readable paragraphs; close with one relevant question or action, not both.
- When it fits the material, make the opening line specific, let the next line add its payoff or context, develop the evidence in short paragraphs, and end with one clear insight before the close. This is an optional shape, not a template to force on every idea.
- Keep the length appropriate to the idea. Check current official guidance before stating platform character limits or feed behavior.
- Keep numbers, names, metrics, and outcomes exactly as supplied. Never invent a client, result, view, lesson, or personal claim. Use a visible placeholder only when the user can safely fill it in.
- Avoid generic engagement bait, irrelevant hashtags, and tagging people or organizations without a clear reason and the user's approval.
- Run the draft through `.agents/skills/li-human/SKILL.md` and review every change. Do not optimize for or report an authorship score.

## Output and publishing

Show three suitable opening options when they genuinely fit, recommend one with a short reason, then provide one complete, copy-ready draft in the language the user requested. If the user explicitly requests English only, provide no Spanish translation.

By default, return the draft in the conversation and do not save it. In CareerKit's Content flow, when the copied prompt explicitly asks to save the generated draft and you have authorized local access, read and validate `private-data/linkedin-content.json` with `schemas/linkedin-content.schema.json`, then append the final recommended text to `drafts[]` as an English draft with a unique ID and `status: "needs-review"`. Preserve existing drafts and unknown properties. Never put an unshared draft in `publications[]` or mark its source article `published`. Validate and reread the file after writing. Tell the user to open **CareerKit → Tus publicaciones → Borradores** to review, edit, confirm as ready, or delete it; if the browser reports an external change, reload `linkedin-content.json`. If local access is unavailable, return the draft in chat and say it was not saved. The user reviews and shares it manually; do not publish, schedule, or contact anyone. Marking a draft ready in the web app only confirms its wording and does not indicate publication.
