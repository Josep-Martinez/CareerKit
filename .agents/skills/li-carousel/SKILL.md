---
name: li-carousel
description: >-
  Build a LinkedIn document post (carousel) - slide-by-slide copy, the cover
  that earns the swipe, and the PDF to upload. Use when the user says
  "carousel", "document post", "slides for LinkedIn", "turn this into a
  carousel", or has a list-shaped idea that would die as a text post.
---

# li-carousel

Before presenting slide copy, apply `.agents/skills/li-bilingual/SKILL.md`. Provide separate Spanish and English carousel versions; do not mix languages across slides in a single deck unless the user asks.

Use a document post when the idea has a real sequence or framework. Do not
claim that the format gets more reach or dwell time without current evidence.

## When to use it instead of a text post

Consider a carousel when the idea has a meaningful sequence - steps, a
before/after progression, or a framework with parts. A single claim may work
better as text; do not split it into slides just to fill a format. If that is
all the material supports, offer a text draft using
`.agents/skills/li-post/SKILL.md`.

## Structure

Use 8-12 slides only as a starting range when the material supports it. A
shorter or longer deck may be better for the actual idea.

```
1        COVER      the hook, 6 words or fewer, plus one line of promise
2        THE STAKE  why this matters, in one sentence
3-N      ONE IDEA PER SLIDE. A headline of 3-7 words, and at most 25 words
                    under it. If a slide needs a paragraph, it is two slides.
N+1      RECAP      the whole thing as a list, so the screenshot is useful
LAST     CTA        one action. Follow, comment a keyword, or the link. One.
```

## Slide copy rules

- **Keep slide 1 direct.** A short cover can make the promise easier to scan.
- **Number slides when it helps orientation.** Do not claim this guarantees
  completion.
- **No slide is a paragraph.** If you cannot say it in 25 words, split it.
- **A recap slide can help a reader revisit the material.** Make it standalone
  if a recap adds value.
- Add the user's handle to slides only if they want it visible and the design
  benefits from it.

## Making the PDF

Check LinkedIn's current document upload requirements before producing a PDF.
The following dimensions are a design starting point, not a current platform
specification. Build it as HTML and print to PDF only after the user approves the
copy:

```bash
# one page per slide, 1080x1350, no margins
# then: Chrome headless --print-to-pdf, or any HTML-to-PDF you already use
```

Write the HTML with one `<section>` per slide, `width:1080px; height:1350px;
page-break-after:always`, a single accent colour, and type no smaller than
28px as a starting point for phone readability. If the user has a brand
skill or design system in this project, use it and do not invent a palette.

## Output

Show the slide-by-slide copy first as a numbered list, followed by the
accompanying **post text**. Read `.agents/skills/li-human/SKILL.md` to review
the draft. Build a local PDF only if the user approves the copy; use local
assets and tools, and do not upload it to LinkedIn or another service.

Nothing is uploaded to LinkedIn. The user posts the PDF themselves.
