---
name: li-repurpose
description: >-
  Turn a long asset - a YouTube video, podcast, newsletter, blog post,
  transcript or call summary - into LinkedIn draft options. Use when the user
  says "repurpose this", "turn this into posts", "I have a video/newsletter/
  transcript", or pastes a long piece of content and wants it on LinkedIn.
---

# li-repurpose

Before presenting repurposed LinkedIn copy, apply `.agents/skills/li-bilingual/SKILL.md` and provide separate Spanish and English drafts by default.

One long source may contain several distinct ideas. Extract only what the
source supports; there is no target number of posts.

## Input

A transcript, an article, a newsletter, a script, a call summary. If the user
gives a YouTube URL and there is a transcript tool available in the session,
use it; otherwise ask them to paste the text. Read the whole thing before
extracting anything.

## Extract, do not summarise

Avoid summary-only drafts. Read the asset and pull out ideas that can stand on
their own:

| pull | what it is |
| --- | --- |
| **Claims** | every sentence that would start an argument |
| **Numbers** | every figure, cost, duration, percentage |
| **Stories** | every moment with a person, a scene and a cost |
| **Mechanisms** | every "the way this works is..." explanation |
| **Mistakes** | every admission of something that went wrong |
| **Lines** | every sentence that is already quotable as-is |

List what you found before writing. If the source supports only one or two
useful angles, report that instead of stretching it to a weekly series.

## Then shape the set

Each extract can become a post only when it is useful on its own. Assume the
reader may not have seen the source; avoid relying on context that the draft
does not include.

Use a fitting hook from `.agents/skills/li-post/hooks.json` when helpful. Vary
the shapes when the material supports it; do not force a formula to create
variety.

Order the drafts in a way that supports the user's goal and the substance of the
source. Do not claim that a particular sequence or weekday improves results.
Ask about cadence before turning the set into a calendar.

## Output

```
EXAMPLE FORMAT ONLY — source details, counts and claims below are fictional.

SOURCE: [title supplied by the user] ([duration or length, if known])

FOUND  [count actual claims, numbers, stories, mechanisms, mistakes and lines]

DRAFT OPTIONS
1. #1  Contrarian    [supported idea from the supplied source]
2. #17 Time Anchor   [verified metric and context, only if supplied]
3. #9  Cold Open     [real scene or quote from the source]
4. #21 Direct Value  [useful method described in the source]

Ask the user which item they want drafted first.
```

Draft the number the user asks for using
`.agents/skills/li-post/SKILL.md` and `.agents/skills/li-human/SKILL.md`. If
they have not specified a number, start with one draft and offer the remaining
angles so they can choose how to continue.
