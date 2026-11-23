# Portfolio redesign

Goal: a concise, professional portfolio for Krish Sav, suitable for consulting and technology opportunities.

Design: pure white, near-black type, restrained forest green, editorial typography and a custom soccer illustration. Use a lightweight static site, native HTML, CSS, and JavaScript. Keep the source deployable directly on GitHub Pages. Do not add a framework or runtime dependency.

Content: use the user's latest role titles and metrics. Twelve experience entries with actual organization logos, a linked SSRN paper, five awards without dates, UT Austin education, and email, LinkedIn, GitHub contact links. Keep Stealth deliberately vague and omit the headshot. No em dashes. Remove old slogans, repeated statistics, long biography, skill tags, GPA, and stale counts.

Implementation plan:
- [x] Replace the page with semantic, concise content and local logo assets.
- [x] Add responsive editorial styling and a restrained soccer ball entrance animation.
- [x] Add accessible navigation, progressive enhancement, and reduced-motion behavior.
- [x] Verify desktop/mobile rendering, all local assets, links, keyboard navigation, and source integrity.
- [x] Review changes independently and resolve meaningful findings.
- [ ] Commit, open a GitHub PR, and publish through the existing GitHub Pages setup.

Review focus: narrow viewports; disabled JavaScript; reduced motion; long role titles; all twelve roles and current metrics; confidential business details absent; contact links; no copied navigation from supplied source pages.

Verification: JavaScript syntax and Git whitespace checks passed. Browser checked at 1440, 809, 390, and 320 pixel widths, with no horizontal overflow. Source audit checked all assets and navigation targets. Main text contrast exceeds 4.5:1. Independent review found incorrect district branding, corrected to the official Prosper ISD logo. Techinance uses its working canonical domain. SSRN blocks automated HTTP checks with 403; the user-provided paper URL is preserved.
