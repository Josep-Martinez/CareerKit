---
name: li-comment
description: >-
  Write comments on other people's LinkedIn posts that read as a person with an
  opinion, not a bot. Use when the user pastes a post and wants a comment, says
  "comment on this", "engage with this", "what do I say here", or wants a batch
  of comments for their engagement round.
---

# li-comment

Before presenting comment copy, apply `.agents/skills/li-bilingual/SKILL.md`. Give separate Spanish and English versions; recommend posting only the one matching the post and conversation language.

Use comments to contribute a specific, useful point and build professional
relationships. Do not promise reach or visibility; those outcomes depend on
the post and audience.

## Input

The user pastes the post text (and the author's name and role if they have
it). If they paste a screenshot, read it. If they give you a URL you cannot
open, ask them to paste the text - do not guess what the post said, and do not
use browser automation to scrape the feed.

## The nine comment types

Pick by what the post actually is. Never default to type 1.

| # | type | when | shape |
| --- | --- | --- | --- |
| 1 | **Add a datum** | post makes a claim you can support with a number | "We saw the same thing: 40% of our..." |
| 2 | **Add the missing case** | post is right but incomplete | "This holds until {condition}. Then..." |
| 3 | **Respectful disagree** | you genuinely think it is wrong | name the agreement first, then the fork |
| 4 | **Extend one line** | one sentence in the post is the good one | quote it, then build on it |
| 5 | **Ask the real question** | post skipped the hard part | one question, specific, no "curious to hear" |
| 6 | **The receipt** | you have done the thing they described | what happened, in two sentences |
| 7 | **The correction** | there is a factual error | be right, be brief, be kind, be sure |
| 8 | **The reframe** | the post has the right facts and the wrong frame | "Another way to read this:" |
| 9 | **The one-liner** | a concise point is enough | one short sentence that adds something genuine |

## Rules

- **Keep it concise.** A few sentences can be a useful starting point; fit the
  length to the post and the point the user wants to add.
- **Avoid generic openers by default**, such as "Great post", "Love this",
  "So true", "Couldn't agree more" or "This resonates". Use one only if it is
  genuinely how the user would respond and it adds something.
- **No emoji openers.** No 🔥 or 👏 as a first character.
- Avoid simply restating the post; add a useful point if the user has one.
- **One idea.** A comment with two points reads as a blog attempt.
- **Say the specific thing.** If the comment could sit under any post on the
  topic, it is not a comment, it is noise.
- A comment on a recruiter's or hiring manager's post should contribute to the
  discussion; do not turn it into an unsolicited public application or expose
  private job-search details.
- **Disagreement is appropriate when sincere.** Acknowledge any point of
  agreement only when it is genuine; do not use a formula to manufacture it.

## Output

Give **two options of different types**, labelled, plus a one-line reason for
the one the user might choose. Run both through
`.agents/skills/li-human/SKILL.md` first, then review whether the edits
preserve the user's intended meaning and voice. Do not infer
authorship from punctuation.

```
EXAMPLE FORMAT ONLY — the roles, actions and outcomes below are fictional;
do not attribute them to the user.

COMMENT OPTIONS  (on a fictional post about product discovery)

[2 · Add the missing case]
This also depends on who owns the decision after discovery. If that is unclear,
the team can agree on the problem and still build toward different outcomes.

[5 · Ask the real question]
How are you validating that the proposed solution changed the user outcome,
rather than just increasing feature adoption?

Choose only after checking the actual post and the user's genuine point of view.
```

## Batch mode

If the user wants an engagement round, ask them to provide the post texts,
return one comment per post, and avoid repetitive copy-paste engagement.
CareerKit does not track comments; do not create a log or say anything was
posted. The user publishes manually.

## Never

Do not auto-post or scrape. This skill drafts the comment; the user decides
whether to post it.
