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

## LinkedIn connector preflight

- Before searching, inspect the current assistant's available apps, components, and MCP tools for a LinkedIn integration that can search publicly listed jobs. A generic browser or web-search tool is not proof that this integration exists.
- If the requested workflow requires LinkedIn and no suitable integration is available, stop before researching. Ask the user to connect or install one and give steps that match the current assistant, using its official help when available. Never invent menu paths, MCP server names, commands, or credential requirements. If the host is unknown or setup guidance cannot be verified, ask which assistant they use or explain that you cannot give exact setup steps yet.
- Use the integration only to discover public job listings. Never use a signed-in account, private profile data, messages, applications, or contacts. Verify every promising listing on a current public page, preferably the employer's careers site. If the integration cannot search public jobs, state that clearly and stop to ask how the user wants to proceed.

## Search and verify

1. Translate the user's goal into a small set of search clusters: task phrases, common role-title variants, seniority, location, and work mode. Include adjacent titles only when the duties align with the user's confirmed evidence.
2. Use current public search tools and employer career pages. Prefer the employer's active listing as the source of truth; use job boards to discover leads. Never access a logged-in account, scrape a social feed, apply, or contact anyone.
3. Open each promising listing. Verify that it is live and capture the title, employer, direct URL, location/work mode, date if shown, salary if shown, level, and full responsibilities. A snippet, stale listing, or inaccessible page is unverified; say what could not be checked.
4. Record source, search date, verification date, and salary-verification status. Do not estimate salary from title, company, market averages, or currency conversions. Label absent or unclear data as unknown.
5. Deduplicate by employer, role, location, and listing URL. Exclude expired or clearly duplicate listings from the recommended set.

## Employer and fit review

- Read public employer and product information to distinguish a product company, consultancy/staffing firm, mixed model, or unclear case. Do not infer the actual work from a company label.
- Cite current first-party sources for the opening and company claims. Use reputable recent reporting for material developments. Treat employee reviews as dated anecdotes, never as proof of universal culture.
- Apply `.agents/skills/job-fit-assessor/SKILL.md` to verified vacancies. Separate facts, inferences, unknowns, and confirmed gaps. Use only evidence the user provided or authorized in CareerKit.

## Output and saving

Present a short ordered shortlist. For each role include a direct link, actual tasks, location/work mode, salary status, seniority, strongest matching evidence, largest gap, employer notes, and what remains unverified. State that the search is not exhaustive.

Save vacancies into `private-data/vacancies.json` only when the user explicitly asks. Keep the complete description, dates, source, verification and salary status, stable IDs, evidence IDs, and requested preference order. Validate the JSON and preserve other fields. If local access is unavailable, give the researched results but say they were not saved.
