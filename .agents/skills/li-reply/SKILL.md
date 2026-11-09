---
name: li-reply
description: >-
  Handle the replies under the user's own LinkedIn posts - draft answers to
  every comment, sorted by which ones are worth answering. Use when the user
  pastes the comments on their post, says "reply to these", "handle my
  comments", "someone said X on my post", or is dealing with a critic or a
  lead in the comments.
---

# li-reply

Before presenting reply copy, apply `.agents/skills/li-bilingual/SKILL.md`. Draft separate Spanish and English versions and recommend using the language of the original comment thread.

Replies can continue a useful discussion. Do not claim that a reply changes
reach or ranking; sort comments by relevance to the user's goals before drafting.

## Input

The user pastes the comments, ideally with names and roles. Screenshots are
fine. Do not scrape the thread with a browser tool.

## Triage first

Sort every comment into one of five buckets and say the count out loud:

| bucket | what it is | what it gets |
| --- | --- | --- |
| **LEAD** | someone describing the problem you solve | a real answer + a soft open door |
| **SUBSTANCE** | adds data, disagrees, extends | the longest reply on the thread |
| **PEER** | someone in a relevant professional conversation | a reply that adds something useful |
| **SUPPORT** | "great post", 🔥, a tag | a like or a brief reply, if it feels natural |
| **NOISE** | pitch, spam, bad faith | nothing, or one line and out |

Then write in that order, and stop writing when the value stops.

## How to reply

- **Answer the actual question.** If someone asks how, tell them how, in the
  reply. Do not send them to a DM to hear the answer they could have had.
- **Use their name once**, at the start, and never with an exclamation mark.
- **Match their length.** A two-line comment does not get a six-line reply.
- **To a critic:** acknowledge any valid point, then explain the user's view
  calmly. If a correction or follow-up is needed, make it clearly and avoid
  escalating the exchange.
- **To a relevant contact:** answer fully in public when appropriate. If
  useful, end with one genuine offer to continue the conversation; do not
  promise that a public reply will lead to a DM.
- **To an irrelevant pitch in your comments:** skip it unless the user wants to
  respond for a specific reason.

## Output

One block, grouped by bucket, with copy-ready replies reviewed using
`.agents/skills/li-human/SKILL.md`:

```
EXAMPLE FORMAT ONLY — names, comments and outcomes below are fictional.

REPLIES  ·  [number of comments provided]  ·  [counts by bucket]

LEAD
@[name] - "[comment supplied by the user]"
> [A direct, accurate reply using only facts the user confirms.]

SUBSTANCE
@[name] - [comment supplied by the user]
> [Acknowledge what is useful, then explain the user's actual perspective.]

SUPPORT  (decide individually whether a like or reply fits)
@[name] "[short supportive comment]" -> [brief, natural acknowledgement]
...

NOISE  (1)
Skipped only if the supplied message supports that classification.
```

Then the gate: **nothing is posted until the user says yes.** They paste the
replies themselves.
