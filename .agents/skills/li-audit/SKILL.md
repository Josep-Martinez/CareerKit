---
name: li-audit
description: >-
  Post-mortem on what the user has already published - which posts actually
  worked, why, and what to stop doing. Use when the user pastes their LinkedIn
  analytics or past posts and asks "what's working", "why did this flop", "read
  my analytics", "audit my content", or wants to know what to double down on.
---

# li-audit

When the audit includes rewritten LinkedIn copy, apply `.agents/skills/li-bilingual/SKILL.md` and provide separate Spanish and English versions by default.

The best account-specific evidence is the data and content the user supplies.
Every rule in every LinkedIn guide, including the ones in this pack, is only a
starting hypothesis; the user's own posts and results can help assess fit.

## Input

Ask for whichever the user has:

- The post analytics export (LinkedIn: Analytics -> Content -> Export). CSV.
- Or a screenshot per post with impressions, reactions, comments, reposts.
- Or just the posts and their reaction counts, which is enough for a first
  pass.

Use the user's labels and any publication dates they provide. CareerKit does
not keep a separate post-performance log, so do not create one or infer which
hook a post used unless the user identifies it.

## What to actually measure

Use only metrics the user supplies. Compute these where the required values are
available, show the working, and treat patterns as correlations rather than
proof of what caused performance:

| metric | how | what it tells you |
| --- | --- | --- |
| **Engagement rate** | (reactions + comments + reposts) / impressions | whether the post earned its reach |
| **Comment ratio** | comments / reactions | whether it started something or just got a nod |
| **Reach multiple** | impressions / follower count | whether it travelled past the existing audience |
| **Save/send rate** | if available | another engagement signal to compare |

Compare engagement rate and reach multiple alongside the absolute counts. Do
not treat one metric as a universal ranking of post quality.

## Then find the pattern

With the top 5 and bottom 5 side by side, look for what actually separates
them, and be willing to conclude something the user will not like:

- Hook formula. Which patterns from `../li-post/hooks.json` are in the top 5?
- Format. Text, document, image, video.
- Length.
- Theme.
- Day and time - check only if the supplied sample is large and comparable
  enough to support the comparison. Treat it as correlation, not cause.
- Comments or responses, only when the user provides comparable data.

State the finding as a claim with the evidence attached, and say how confident
it is. With 30 posts you can see a pattern; with 6 you cannot, and you should
say that instead of inventing one.

## Output

```
EXAMPLE FORMAT ONLY — all counts, percentages, dates and post examples below
are fictional. Never present them as the user's results.

AUDIT  ·  [number of supplied posts]  ·  [date range, if known]

TOP POSTS BY [selected metric]
  [metric]  [hook]  [first line supplied by the user]  [supplied count]
  ...

OTHER POSTS
  [metric]  [hook]  [first line supplied by the user]  [supplied count]
  ...

WHAT THE DATA SAYS
1. [pattern tied to the actual supplied sample and sample size]
2. [alternative explanation or limitation]

POSSIBLE NEXT EXPERIMENT: [small, testable change grounded in the evidence]
```

If the user requests a follow-up plan, read `.agents/skills/li-plan/SKILL.md`
and ground it in the supplied sample. Do not save analytics or change LinkedIn
data unless the user explicitly asks.
