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
- When asked to find a hiring contact for each opening, prioritize a publicly identified HR/recruiting person or recruiter connected to screening that vacancy. If unavailable, look for the hiring manager or department lead. Confirm their current role and relation to the opening or employer through public, credible sources. If the user also wants people to follow, keep up to three verified executives or relevant team members in a separate list from the hiring contact; explain why each is relevant. Saving a profile does not follow or contact that person. Never guess a person's identity, email, phone number, or affiliation. If no reliable person is found, leave the contact empty. Do not reach out.

## Requested result count

- If the user or the CareerKit prompt requests a minimum number of vacancies (for example, ten), treat it as a target for **new, active, verified, eligible** listings, not as a reason to lower their criteria. Continue broadening relevant task-based search clusters, role-title variants, employer pages, recruiters, ATS boards, and suitable portals until the target is met or the plausible channels are reasonably exhausted.
- Return every eligible verified result found, ordered by preference. If fewer than requested exist or can be verified, return all that qualify and state the shortfall and the concrete search limits. Never pad with duplicates, expired, inaccessible, or unverified listings.

## Output and saving

Present the number and breadth of results requested, not automatically a short shortlist. For each role include a direct link, actual tasks, location/work mode, salary status, seniority, strongest matching evidence, largest gap, employer notes, and what remains unverified. State that the search is not exhaustive and explain any shortfall against the requested count.

Save vacancies into `private-data/vacancies.json` only when the user explicitly asks. Keep the complete description, dates, source, verification and salary status, stable IDs, evidence IDs, and requested preference order. When a vacancy is checked, record `availability.status` as `active`, `closed`, or `uncertain` with `checkedAt` and `sourceUrl`. Keep closed vacancies in the file until the user asks to remove them. A verified public hiring contact may be stored in `hiringContact` with name, role, LinkedIn or other public contact URL, an explicitly published work email, source URL, and verification date. Do not store inferred or private contact details. Validate the JSON and preserve other fields. If local access is unavailable, give the researched results but say they were not saved.
