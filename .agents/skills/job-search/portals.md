# Public vacancy-search leads

These patterns can help discover openings; they are not endorsements or proof that a listing is current. `<q>` means a URL-encoded query and `<loc>` a location. Check each portal and URL pattern when used; prefer a live employer careers page for final verification.

## Spain coverage guide

Search across several relevant source types. Do not restrict a search to this list; choose sources based on the user's role, sector, location, and seniority.

| Source | Useful for |
|---|---|
| InfoJobs | Broad Spanish-market listings |
| LinkedIn Jobs | Publicly visible job listings and company postings |
| Indeed | Broad listings and employer-posted vacancies |
| Infoempleo | General Spanish-market vacancies |
| Tecnoempleo | Technology, IT, and engineering roles |
| Turijobs | Tourism, hospitality, and restaurant roles |
| JobToday | Retail, hospitality, and faster-moving local roles |
| Jobzen | Additional Spanish-market discovery |
| Google Jobs | Aggregated listings; follow through to the original posting |
| JobTeaser | Early-career, graduate, and university-linked roles |
| Michael Page | Recruiter-listed professional roles |
| Sesame | Employer career opportunities and company postings |
| Employer career pages | Current primary source for active status and application route |

Also consider other regional boards, specialist communities, public-sector portals, professional associations, recruitment firms, and company-hosted applicant-tracking systems such as Greenhouse, Lever, Workday, and SmartRecruiters. Aggregators and search snippets are leads only; verify the opening on the employer's live page whenever possible.

When asked to identify people at the employer, find the official company profile first, then search public professional sources for recruiters, talent-acquisition staff, or HR people connected to the vacancy. Prioritize a recruiter named in the listing or a publicly verifiable member of the hiring/recruiting team. Save a person in `hiringContact` only when their identity and recruiting/selection relationship are verified; never claim they will review the CV unless a source confirms it. If no recruiter or selection contact can be verified, leave `hiringContact` empty. Keep up to three executives, department leaders, or relevant team members separately in `peopleToFollow`, with a reason for relevance. A hiring manager or CEO is not a substitute for a recruiter. Save only public profile links; never guess contact details or send a message.

## Search-engine patterns (via web search)

| Board | Pattern | Market |
|---|---|---|
| Indeed | `site:indeed.com "<q>" <loc>` (or the local TLD: indeed.fr, indeed.de, ...) | Global |
| StepStone | `site:stepstone.de "<q>" <loc>` (also .fr, .nl, .be) | DACH/EU |
| Welcome to the Jungle | `site:welcometothejungle.com "<q>" <loc>` | FR/EU tech |
| Welcome to the Jungle | `site:welcometothejungle.com/jobs "<q>" <loc>` | FR/EU tech; includes the former Otta platform |
| Greenhouse boards | `site:boards.greenhouse.io "<q>"` | Direct company postings |
| Lever boards | `site:jobs.lever.co "<q>"` | Direct company postings |
| EURES | `site:eures.europa.eu "<q>" <loc>` | EU cross-border |

## Direct search pages (use only if currently available)

| Board | Pattern |
|---|---|
| LinkedIn | `https://www.linkedin.com/jobs/search/?keywords=<q>&location=<loc>&f_TPR=r604800` |
| Indeed | `https://www.indeed.com/jobs?q=<q>&l=<loc>&fromage=7` |
| StepStone | `https://www.stepstone.de/jobs/<q>/in-<loc>` |
| Welcome to the Jungle | `https://www.welcometothejungle.com/en/jobs?query=<q>` |

## Coverage and limits

Use several focused queries by responsibilities and role-title variants. Public
search results can be stale, incomplete, or personalized. Open the original
listing and confirm that it remains live before recommending or saving it. If
a portal blocks access, provide its search link and state that you could not
verify the listing; never describe it as current based on a snippet alone.
