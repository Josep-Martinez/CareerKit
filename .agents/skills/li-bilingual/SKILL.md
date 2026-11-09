---
name: li-bilingual
description: >-
  Prepare LinkedIn copy as separate Spanish and English versions. Use with
  LinkedIn post, profile, comment, DM, reply, carousel, repurposing, and
  content-planning work unless the user explicitly requests one language.
---

# li-bilingual

Use this skill whenever preparing copy the user may paste into LinkedIn. Provide
complete, standalone English and Spanish versions by default, including for
headlines, About sections, experience descriptions, posts, comments, replies,
connection notes, DMs, carousel slides, and reusable content drafts. Use the
language of the original as the factual reference, then create the other
version without changing its meaning.

## Adapt each version

- Preserve the same ideas, facts, level of detail, structure, emphasis, and
  call to action in both versions. Change only the language, making small
  grammatical or idiomatic adjustments so the Spanish reads naturally.
- Never add, remove, or materially reframe content in one version. Keep the
  meaning, confidence level, and claims equivalent. Never add a credential,
  result, role, or specialization to make one version sound stronger.
- Keep the Spanish and English versions separate. Do not put both languages in
  one post, comment, or message unless the user explicitly asks for a bilingual
  single piece.
- For a comment or direct message, provide both drafts but recommend sending
  only the version that matches the recipient's language or the conversation.
- For profile fields, keep both versions independently clear and readable.
  The Spanish translation may need a different character count; verify each
  version against current platform limits when exact limits matter.
- In CareerKit, public language versions are separate `published.variants[]`
  snapshots. Keep every draft scoped to its language and write to a published
  snapshot only when the user asks; never copy or translate it automatically.
- If the user explicitly asks for only one language, follow that request.

## Context and review

When useful and authorized, consult the relevant facts in `private-data/profile.json` and any writing examples the user supplies in the conversation. Do not read other projects or infer profile details. Preserve CareerKit's rule that LinkedIn text is only recorded as published copy when the user provides it; keep drafts separate from the published profile. If polishing a draft, keep its meaning and the user's voice.
