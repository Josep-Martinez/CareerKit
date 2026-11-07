---
name: li-human
description: >-
  Polish a LinkedIn draft for clear, natural language and clean typography, and
  optionally inspect local style heuristics. Use before presenting a post,
  comment, reply, or DM. The heuristics cannot establish authorship or predict
  how any external detector will respond.
---

# li-human

When presenting polished copy to the user, apply `.agents/skills/li-bilingual/SKILL.md` and give separate Spanish and English versions by default. Review each language on its own; the local heuristics are especially limited for Spanish.

Use this as a style and cleanup aid. Preserve the user's meaning, facts and
personal voice; do not optimize text to obtain an authorship score. Any
indicators are local heuristics, not a measure of quality, authorship,
recruiter response or detector performance. The heuristics are English-oriented
and especially limited for Spanish, so treat them only as prompts for review.

This folder contains a cleanup helper and optional local style signals. Use
the cleanup when it is helpful; review every edit yourself.

```bash
python3 .agents/skills/li-human/humanize.py draft.txt --report
python3 .agents/skills/li-human/detect.py draft.txt
python3 .agents/skills/li-human/detect.py before.txt after.txt
```

Both read `slop.json`, which is the lexicon: stock words and phrases, 17
invisible character classes, 11 typographic substitutions, and structural
patterns. Spanish entries are suggestions only; review them manually. The
lexicon is editable. Remove any entry that conflicts with the user's usual voice.

## What gets fixed automatically

**1. Invisible formatting.** The tool flags uncommon zero-width and spacing
characters that can appear during copy-paste. It removes or normalizes them
according to the lexicon; review the result if the text uses a script or
formatting where such characters may be meaningful.

**2. Typography.** The tool can change em dashes, en dashes, curly quotes,
ellipses and bullet characters. These are style choices, not authorship
signals; keep the original punctuation if it fits the user's voice better.

**3. The phrase lexicon.** English entries can be replaced automatically;
Spanish entries are shown as suggestions because a short replacement may
change the original meaning. URLs are left untouched.

## What does NOT get fixed automatically

Structural tells get **flagged, not rewritten**, because changing the shape of
a sentence needs judgement:

- "It's not just X, it's Y" and "not only X but also Y"
- Rule-of-three triads
- Rhetorical one-word question lines: "The result?"
- Rocket, fire, bulb, sparkle and dart emoji
- Hashtag walls
- Reflex engagement bait: "Thoughts?", "Agree?", "Who else?"
- Uniform sentence length and uniform bullet length

Review flagged patterns manually. Keep, rewrite or remove them according to
the intended meaning and the user's voice. The script cannot judge those things.

## Optional local indicators

`detect.py` reports five local signals from 0-100. The values are formula
outputs, not grades; a higher score is not evidence of better writing:

| check | rough local signal | what may trigger a review |
| --- | --- | --- |
| BURSTINESS | sentence-length variation | a narrow variation range in the supplied text |
| SPECIFICITY | names, numbers and concrete markers | few markers, which may be entirely appropriate |
| SLOP DENSITY | lexicon hits per 100 words | a word or phrase in the editable local lexicon |
| FINGERPRINT | selected invisible characters and punctuation | formatting that may not match the requested style |
| VOICE | contractions, pronouns and structural patterns | patterns defined by English-oriented heuristics |

The combined number and its thresholds are arbitrary heuristics. They must not
be described as a pass, fail, or prediction about authorship or any external
detector.

## Say this honestly

The optional checks run locally and do not upload text. They are not validated
against people, hiring outcomes or external detectors. Do not present their
scores as proof of human authorship, quality, or detector results.

## Order of operations

1. Run the cleanup tool on a draft when useful.
2. Review changed words and punctuation. Restore anything that changes the user's
   intended meaning or preferred style.
3. Review structural flags manually; the script cannot decide whether a
   pattern fits the piece.
4. Use the optional style panel only when useful or when the user asks. Do not
   iterate toward a score or report it as an authorship test.
5. Show the cleaned text and briefly describe material edits. Omit scores by
   default.
