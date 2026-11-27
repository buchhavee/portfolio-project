# Brief: Portfolio site for Mads Buchhave

## Purpose & audience
Portfolio sent with applications for a frontend internship (starting after summer 2027).
Audience: recruiters and developers at agencies/companies. Show what I've designed AND built, plus contact info.
Language: English only.

## Pages & content
- **Home:** hero, Projects bento grid, short About, footer.
- **Project case** (one per project), modeled on offmenu.design/work/closetnow:
  - near-fullscreen cover with title bottom-left
  - intro paragraph + Details list (type, period, role, live/GitHub links, tech tags)
  - numbered "What I did" list
  - chapters: The problem / Design / Build (with code snippet) / Result (live + code buttons)
  - "Want to see more?" with two other projects
- **About:** intro with portrait + CV button, skills as tags, education, experience.
- **404.**
- **Menu:** 3x3 dot button top-right opens a dark rounded menu card (dot icon turns into an X). Contact pill bottom-left on all pages.
- **Projects not chosen yet:** build from a data file (title, type/year, role, tech, description, links, color, show in hero/grid) with 6 placeholders.

## Design direction
- Source of truth: Figma https://www.figma.com/design/NEl3WNAwp0tCOAmPVdknAo/Portfolio-design
  (03 Foundations, 05 Components, 06 Hi-fi; variables already have CSS names).
- Inspired by offmenu.design (landing + menu), but original.
- **Hero:** round project circles on an orbit that rotates constantly (~60s per turn) around a centered sentence; pauses on hover. Circles link to projects.
- **Projects section:** huge faded "Projects" heading, bento grid of rounded cards in rows 2/3+1/3, 1/2+1/2, 1/3+2/3. Each project has its own color; browser/phone mockup until real images exist.
- **Footer:** dark rounded card with "Let's build something.", link columns, email with copy button, internship status.
- **Type:** Manrope (code: JetBrains Mono). Accent #3355FF. Logo text "mads buchhave.". Light + dark mode tokens.
- Respect prefers-reduced-motion. Mobile: smaller orbit (8 circles), single-column grid, near-full-width menu.

## Tech stack
- Next.js (App Router) + TypeScript + Tailwind CSS (tokens from Figma variables).
- Lenis for smooth scroll, synced with GSAP ScrollTrigger.
- GSAP via @gsap/react (useGSAP) with ScrollTrigger, SplitText and Flip, for offmenu-style animations.
- All animations disabled/reduced under prefers-reduced-motion.
- Deploy on Vercel.

## Out of scope
- No AI chat button (offmenu has one; we don't).
- No separate Contact page (footer, menu and contact pill cover it).
- No PP Neue Montreal on the live site, and no font files in a public repo (license).
- Don't copy offmenu's assets, copy or exact layout.

## Decisions after the brief
- When Figma and this brief don't settle something, use offmenu.design as the reference, within the limits under "Out of scope".
- Contact email is buchhavee@gmail.com for now. A domain and domain email are planned, so define the address in one place.
- Scrolling from the hero speeds up the orbit and sends each circle down to become its own Projects card. The grid has 9 cards in rows of 2, 3, 2, 2, and the ring has 9 circles on mobile too. Fast mouse and trackpad scrolling is capped from the top until the first row has landed. Figma still shows 6 cards. Spec: docs/superpowers/specs/2026-11-25-orbit-to-grid-design.md
- Reduced motion is ignored for now (user's request, 26 November 2026), against the brief above. The switch is RESPECT_REDUCED_MOTION in lib/motion.ts, plus the CSS marked "reduced motion" in app/globals.css.
- Project case cover (27 November 2026): the cover starts under the logo and the title sits under it, not on it, because the photos are dark. Clicking a ring circle or a grid card grows its image into the cover (own layer + GSAP, like offmenu). Spec: docs/superpowers/specs/2026-11-27-project-case-design.md

@AGENTS.md
