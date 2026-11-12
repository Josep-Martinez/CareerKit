---
name: job-search
description: Use when the user asks for current job openings, role families, search terms, or research into potential employers.
---

# Job search

Find current vacancies and verify the work and employer. A search snippet is a lead, not a confirmed opening. Do not invent postings, salary details, or hiring outcomes.

## Candidate context

- Read `AGENTS.md` and `schemas/agent-format.md`. When the user has authorized local access, read relevant objectives and confirmed evidence from `private-data/profile.json`; use `private-data/cv.json` for current CV context when available.
- Follow the user's stated goals and constraints. If the target role, location, seniority, language, salary, or work mode is unclear and could change results, ask a focused question or show the uncertainty.
- Keep role families separate. Derive role names from recurring responsibilities and compare them with evidence; do not promote an unsupported title or imply that a title guarantees an interview.

## Search tools and LinkedIn

- Use current public web search and employer career pages as the default. A LinkedIn job-search connector is optional; its absence must not block the search or prompt the user to install anything. If there is no current web-search tool either, explain that current openings cannot be checked and do not invent results.
- If a LinkedIn integration is available, inspect its actual capabilities. A people-search connector can help find a public professional contact, but it does not count as a job-search connector. Use either capability only for public information relevant to the task.
- Never use signed-in account content, private profile data, messages, applications, or private contacts. Publicly search a person's professional profile only when the user asks for a relevant hiring contact. Do not message, follow, connect with, or otherwise contact them.

## Search and verify

1. Translate the user's goal into a small set of search clusters: task phrases, common role-title variants, seniority, location, and work mode. Include adjacent titles only when the duties align with the user's confirmed evidence.
2. Search several suitable sources, including broad job boards, specialist portals, aggregators, recruiters, and employer career pages. Start with the sources listed in `portals.md`, then add other relevant sources; the list is a coverage guide, not a limit. Prefer the employer's active listing as the source of truth. Never scrape a social feed, apply, or contact anyone.
3. Open each promising listing. Verify that it is live and capture the title, employer, direct URL, location/work mode, date if shown, salary if shown, level, and full responsibilities. A snippet, stale listing, or inaccessible page is unverified; say what could not be checked.
4. Record source, search date, verification date, and salary-verification status. Do not estimate salary from title, company, market averages, or currency conversions. Label absent or unclear data as unknown.
5. Deduplicate by employer, role, location, and listing URL. Exclude expired or clearly duplicate listings from the recommended set.

## Employer and fit review

- Read public employer and product information to distinguish a product company, consultancy/staffing firm, mixed model, or unclear case. Do not infer the actual work from a company label.
- Cite current first-party sources for the opening and company claims. Use reputable recent reporting for material developments. Treat employee reviews as dated anecdotes, never as proof of universal culture.
- Apply `.agents/skills/job-fit-assessor/SKILL.md` to verified vacancies. Separate facts, inferences, unknowns, and confirmed gaps. Use only evidence the user provided or authorized in CareerKit.
- When asked to find a hiring contact for each opening, look first for a publicly identified department lead or hiring manager, then a named recruiter connected to that vacancy. Confirm their current role and employer through public, credible sources. Save only publicly published professional details and the source URL; never guess a person's identity, email, phone number, or affiliation. If no reliable person is found, say so and leave the contact empty. Do not reach out.

## Output and saving

Present a short ordered shortlist. For each role include a direct link, actual tasks, location/work mode, salary status, seniority, strongest matching evidence, largest gap, employer notes, and what remains unverified. State that the search is not exhaustive.

Save vacancies into `private-data/vacancies.json` only when the user explicitly asks. Keep the complete description, dates, source, verification and salary status, stable IDs, evidence IDs, and requested preference order. When a vacancy is checked, record `availability.status` as `active`, `closed`, or `uncertain` with `checkedAt` and `sourceUrl`. Keep closed vacancies in the file until the user asks to remove them. A verified public hiring contact may be stored in `hiringContact` with name, role, LinkedIn or other public contact URL, an explicitly published work email, source URL, and verification date. Do not store inferred or private contact details. Validate the JSON and preserve other fields. If local access is unavailable, give the researched results but say they were not saved.
