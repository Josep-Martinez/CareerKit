---
name: li-inbox
description: >-
  Triage the LinkedIn inbox - sort connection requests and DMs into leads,
  recruiters, peers and spam, and draft the replies worth sending. Use when the
  user says "my inbox is a mess", "triage my DMs", "should I reply to this",
  pastes a batch of LinkedIn messages, or is drowning in connection requests.
---

# li-inbox

Before presenting reply drafts, apply `.agents/skills/li-bilingual/SKILL.md`. Provide Spanish and English separately and recommend sending only the version that matches the incoming message or conversation.

An inbox can mix relevant opportunities, networking messages and low-value
outreach. This skill sorts only the messages the user provides and drafts replies
where useful.

## Input

The user pastes the messages. Screenshots are fine. Do not log into their
account or read their inbox with a browser tool.

## Sort into five

| bucket | signal | action |
| --- | --- | --- |
| **OPPORTUNITY** | recruiter or hiring contact with a potentially relevant role | reply if the role is worth exploring |
| **RECRUITER** | a role, a company, a salary band | reply if the role is real, one line if not |
| **PEER** | someone in the same field with something to say | reply this week, keep it human |
| **ASK** | wants advice, time, an intro, a favour | reply if it is cheap and specific, decline cleanly if not |
| **SPAM** | agency pitch, lead-gen sequence, crypto, "quick question" with no question | archive, no reply |

Print the counts first. Do not classify an unfamiliar sender as spam without
enough evidence; mark uncertain cases for the user.

## Detecting a sequence

Generic outreach can contain signs such as no specific reference, an immediate
pitch or a templated follow-up. Treat these as clues, not proof of spam; show
the evidence and let the user decide when the case is uncertain.

## Replies

- **LEAD** - answer the actual question in the message, in full, for free. If
  it is a fit, the offer is one sentence at the end. If it is not, say so and
  point them somewhere useful. Both outcomes are good.
- **RECRUITER** - if the role is genuinely interesting, ask the three things
  the message left out: comp band, level, and whether it is in-office. If it
  is not, one line: not looking, happy to refer, and mean the refer.
- **ASK** - if it is specific and the user wants to help, answer directly. If it is
  "can I pick your brain", decline in one warm sentence and give them the one
  answer you would have given on the call. That is the polite version and it
  is also the more useful one.
- **DECLINES** are short, warm and final. No "let's revisit in Q3" if there is
  no Q3.

## Output

Group by bucket and show counts first. Draft only replies that are useful, then
review them with `.agents/skills/li-human/SKILL.md`. The user decides what to
send; do not access the account or send anything.

```
EXAMPLE FORMAT ONLY — the counts and message pattern below are fictional.

INBOX  ·  [number provided]  ·  [counts by bucket]

[BUCKET]  ([count]) - [brief reason tied to the supplied messages]
```
