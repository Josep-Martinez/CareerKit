---
name: li-plan
description: Build a LinkedIn content and networking plan from the user's goals, schedule, supplied experiences, and any metrics they provide.
---

# LinkedIn planning

Plan only when the user requests it. The cadence, time slots, topics, and networking priorities must come from their stated preferences and evidence, not from defaults embedded in this guide.

## Context to use

- Read `AGENTS.md` and `schemas/agent-format.md`. With permission, use relevant objectives and confirmed facts from `private-data/profile.json` and the published copy in `private-data/linkedin.json`.
- Ask for the desired audience, topics, actual recent experiences, available time, and preferred cadence when those details materially affect the plan.
- If the user supplies metrics or prior posts, read `.agents/skills/li-audit/SKILL.md` before using those results. Treat small samples as weak signals, not proof of causation.
- Research people or companies only when asked. Use current public information, verify the reason for relevance, and do not imply a relationship that has not been confirmed.

## Build the plan

- Suggest only topics grounded in something the user actually did, learned, observed, or believes and can support.
- Vary formats only when the material suits them: an evidence-based result, a reasoned opinion, a useful method, a personal lesson the user is comfortable sharing, or a product/work decision.
- For a post slot, include a specific angle and, when helpful, a matching pattern from `.agents/skills/li-post/hooks.json`. Do not claim that a hook, day, or posting frequency guarantees reach.
- If recommending a posting time, distinguish current external research from the user's own audience data and label uncertainty. Ask which timezone matters.
- For draft copy, read `.agents/skills/li-bilingual/SKILL.md` and the relevant writing skill. Do not add a date, cadence, post, or contact to any schedule automatically.

## Output

Return a realistic plan for the requested period, with optional slots clearly labeled and the evidence or preference behind each suggestion. Ask which item the user wants to draft first. Do not create a planning log, access LinkedIn, schedule, publish, or message anyone.
