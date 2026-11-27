# Case-sider og overgangen fra cirkel eller kort til cover: implementeringsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ruten `/projects/[slug]` med cover, titel, Introduction og Details og "What I did" for alle 9 projekter, og overgangen, hvor en cirkel i ringen eller et kort i griddet vokser op og bliver til coveret.

**Architecture:** Siden er en statisk serverside med `generateStaticParams`. Overgangen er et fast lag (`CoverLayer`) i `app/layout.tsx`, som bliver liggende, når siden skifter. Cirkel og kort kalder `startCover()` fra Next' `onNavigate`, og coveret melder sig med `coverArrived()`, når det er sat ind. Begge dele går gennem et lille modul i `lib/cover.ts`. Laget kører én frame-løkke (`onFrame`), der blander kopiens boks fra kilden mod coverets rigtige placering, og GSAP tager sig af dække og titel.

**Tech Stack:** Next.js 16.4 (App Router, `cacheComponents`), React 19.3, TypeScript, Tailwind CSS 4, GSAP via `@/lib/gsap`, Lenis via `lib/scroll.ts`, `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-27-project-case-design.md` (godkendt 27. november 2026). Prototypen, som tallene kommer fra: `.superpowers/brainstorm/75194-1795802578/content/transition.html`.

## Global Constraints

- Læs den relevante guide i `node_modules/next/dist/docs/`, før du skriver Next-kode (AGENTS.md). Next 16: `params` er et Promise, `PageProps<"/projects/[slug]">` er global, og `priority` på `Image` er forældet (brug `loading="eager"`).
- Tal fra spec'en: vækst 1 s `power3.out`. Dække ind 0,3 s `power1.out` fra klikket. Dække ud 0,4 s `power1.inOut` fra landingen. Titlen 36 px op og fra opacity 0 over 1,2 s `power3.out` fra landingen. Opgiv efter 2 s uden cover.
- Cover: top 72 px på mobil og 96 px fra 768 px. Siderne 16 px og 24 px. Højde 480 px og `max(320px, 100svh - 340px)`. Hjørner `--radius-xl` (28 px). Titel under: `text-h1` med 16 px luft og `text-display-l` med 28 px luft.
- Laget ligger under kontakt-pillen (`z-30`) og headeren (`z-40`). Brug `z-[29]`.
- Dækket har farven `bg-bg-page`, så det følger temaet.
- `RESPECT_REDUCED_MOTION` i `lib/motion.ts` styrer reduced motion. Når `matchMedia(STILL).matches`, er linket et almindeligt link.
- Commit kun, når brugeren har bedt om det. Kør `git status -sb` før hver commit, for brugeren merger og puller main midt i en session. Arbejd på grenen `feat/project-case` fra main.
- Kun engelsk tekst på sitet. Kommentarer forklarer kun hvorfor, på én linje.

## Review Focus

1. **Tilbage eller menuklik midt i overgangen:** laget forsvinder med det samme, kilden vises igen, og der kommer ikke et sent `router.push`. Testes i Task 5, tjek D.
2. **Scroll under landingen:** kopien bliver liggende på coveret. Testes i Task 5, tjek B.
3. **Cmd-, ctrl- og midterklik:** åbner en ny fane, og intet lag vises. Testes i Task 5, tjek C.
4. **Tilbage til forsiden efter overgangen:** kilden er synlig, ringen drejer, og kortene står, hvor de stod (`cacheComponents` kører forsidens effekter igen). Testes i Task 5, tjek E.
5. **Siden kommer ikke:** dækket bliver ikke hængende. Testes som ren logik i Task 2 (`phase` giver `"giveUp"` efter 2 s).

---

### Task 1: Data til case-siden

**Files:**
- Modify: `data/projects.ts`
- Test: `data/projects.test.mjs`

**Interfaces:**
- Produces: `Project` får valgfrie felter: `intro?: string`, `role?: string`, `period?: string`, `live?: string`, `code?: string` og `did?: string[]`.
- Produces: `detailRows(project: Project): { label: string; value: string; href?: string }[]`. Rækkefølgen er Project, Type, Timeframe, Role, Live site og Code. Rækker uden værdi udelades. Timeframe er `period` og ellers `year`. Live site og Code har `href` = URL'en og `value` = URL'en uden `https://` og uden afsluttende `/`.

- [ ] **Step 1: Opret grenen**

Run: `git status -sb && git switch -c feat/project-case`
Expected: `## main...origin/main`, og derefter `Switched to a new branch 'feat/project-case'`. Den ucommittede spec og plan følger med.

- [ ] **Step 2: Skriv de fejlende tests**

```js
test("detail rows leave out what is not known", () => {
  const rows = detailRows({ slug: "x", title: "Wash World", type: "School exam, Web dev", year: "2026", color: "#000", mockup: "phone" });
  assert.deepEqual(rows.map((r) => r.label), ["Project", "Type", "Timeframe"]);
  assert.equal(rows[2].value, "2026");
});

test("a period wins over the year, and links show without https", () => {
  const rows = detailRows({ slug: "x", title: "T", type: "School", year: "2026", period: "Spring 2026", role: "UI design + frontend", live: "https://project01.vercel.app/", code: "https://github.com/mads/project01", color: "#000", mockup: "phone" });
  assert.deepEqual(rows.map((r) => [r.label, r.value, r.href]), [
    ["Project", "T", undefined],
    ["Type", "School", undefined],
    ["Timeframe", "Spring 2026", undefined],
    ["Role", "UI design + frontend", undefined],
    ["Live site", "project01.vercel.app", "https://project01.vercel.app/"],
    ["Code", "github.com/mads/project01", "https://github.com/mads/project01"],
  ]);
});

test("every project has an intro and a list of what I did", () => {
  for (const p of projects) assert.ok(p.intro && p.did?.length, p.slug);
});
```

- [ ] **Step 3: Kør testene og se dem fejle**

Run: `npm test`
Expected: FAIL. `detailRows` findes ikke, og projekterne mangler `intro`.

- [ ] **Step 4: Implementér felterne og `detailRows` i `data/projects.ts`**

Pladsholderteksten fra Figma ligger i ét fælles objekt, der spreades ind i hvert projekt (også i `placeholder()`), så det er tydeligt, hvad der skal skiftes ud:
`intro: "A web app I designed and built in a school project. One or two sentences on the problem, who it is for and what I set out to achieve."`, `role: "UI design + frontend"` og `did: ["UI and UX design", "Frontend development", "Animation and interaction"]`. `live`, `code` og `period` sættes ikke, fordi de ikke kendes.

- [ ] **Step 5: Kør testene og se dem bestå**

Run: `npm test`
Expected: PASS, alle tests.

- [ ] **Step 6: Checkpoint**

Run: `git status -sb`. Commit (`feat: add case page data`) kun, hvis brugeren har bedt om commits.

---

### Task 2: Overgangens regning og forbindelse (`lib/cover.ts`)

**Files:**
- Create: `lib/cover.ts`
- Test: `lib/cover.test.mjs`

**Interfaces:**
- Produces:
  - `COVER = { grow: 1, veilIn: 0.3, veilOut: 0.4, titleRise: 36, titleTime: 1.2, giveUp: 2 } as const` (sekunder og px). Kurvenavnene står i laget (Task 5).
  - `type Box = { x: number; y: number; w: number; h: number; r: number }` (px, r = hjørneradius).
  - `mixBox(from: Box, to: Box, t: number): Box` blander hvert felt lineært.
  - `phase(elapsed: number, arrived: boolean): "grow" | "wait" | "land" | "giveUp"`. Det er `"grow"`, mens `elapsed < COVER.grow`. Derefter `"land"`, hvis `arrived`. Ellers `"giveUp"` ved `elapsed >= COVER.giveUp` og `"wait"` før.
  - `type CoverStart = { project: Project; source: HTMLElement; round: boolean; sizes: string }`. `round` er sand for en cirkel. `sizes` er kildens `sizes`, så kopien bruger det billede, der allerede er hentet.
  - `type CoverParts = { cover: HTMLElement; title: HTMLElement }`.
  - `connectLayer(layer: { start(s: CoverStart): boolean; arrive(parts: CoverParts): void }): () => void` returnerer en funktion, der kobler fra.
  - `startCover(s: CoverStart): boolean` returnerer `true`, hvis laget overtager navigationen. Det giver `false` uden et lag.
  - `coverArrived(parts: CoverParts): void` gør intet uden et lag.
- Modulet må ikke røre `window` eller `document`, når det importeres (testene kører i Node). Typen importeres med `import type { Project } from "../data/projects.ts"`.

- [ ] **Step 1: Skriv de fejlende tests**

```js
const circle = { x: 100, y: 200, w: 122, h: 122, r: 61 };
const cover = { x: 24, y: 96, w: 1392, h: 560, r: 28 };

test("the copy starts on its source and ends on the cover", () => {
  assert.deepEqual(mixBox(circle, cover, 0), circle);
  assert.deepEqual(mixBox(circle, cover, 1), cover);
  assert.deepEqual(mixBox(circle, cover, 0.5), { x: 62, y: 148, w: 757, h: 341, r: 44.5 });
});

test("it lands when grown and the cover is there, and gives up after 2 s", () => {
  assert.equal(phase(0.5, true), "grow");
  assert.equal(phase(1, true), "land");
  assert.equal(phase(1.2, false), "wait");
  assert.equal(phase(2, false), "giveUp");
});

test("without a layer the link is a plain link", () => {
  assert.equal(startCover({ project: {}, source: {}, round: false, sizes: "" }), false);
});

test("a connected layer decides, and hears the cover arrive", () => {
  const heard = [];
  const off = connectLayer({ start: () => true, arrive: (parts) => heard.push(parts) });
  assert.equal(startCover({ project: {}, source: {}, round: true, sizes: "" }), true);
  coverArrived({ cover: 1, title: 2 });
  assert.deepEqual(heard, [{ cover: 1, title: 2 }]);
  off();
  assert.equal(startCover({ project: {}, source: {}, round: true, sizes: "" }), false);
});
```

- [ ] **Step 2: Kør testene og se dem fejle**

Run: `npm test`
Expected: FAIL. Modulet `./cover.ts` findes ikke.

- [ ] **Step 3: Implementér `lib/cover.ts` med signaturerne ovenfor**

- [ ] **Step 4: Kør testene og se dem bestå**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `git status -sb`. Commit (`feat: add cover transition maths`) kun, hvis brugeren har bedt om commits.

---

### Task 3: Ruten, coveret og titlen

**Files:**
- Create: `app/projects/[slug]/page.tsx`
- Create: `components/molecules/project-cover.tsx`
- Modify: `components/atoms/artwork.tsx`

**Interfaces:**
- Consumes: `projects` (Task 1), `coverArrived` (Task 2) og `mockupFit(mockup, w, h)` fra `lib/orbit.ts`.
- Produces from `project-cover.tsx`:
  - `COVER_TOP = "pt-18 md:pt-24"` og `COVER_BOX = "relative mx-4 h-120 overflow-hidden rounded-xl @container-size md:mx-6 md:h-[max(320px,100svh-340px)]"`. Laget i Task 5 bruger begge til at måle coverets plads, før siden findes.
  - `ProjectCover({ project }: { project: Project })` er en client-komponent. Den viser `<div className={COVER_TOP}>`, i den boksen (`COVER_BOX`, `style.backgroundColor = project.color`) med `<Artwork project sizes="100vw" />` og under boksen `<h1>` med titlen (`mx-4 mt-4 text-h1 md:mx-6 md:mt-7 md:text-display-l`).
- Produces in `artwork.tsx`: en valgfri prop `onLoad?: () => void`, som sendes videre til billedets `Image`. Laget bruger den i Task 5.

- [ ] **Step 1: Hent Figmas detaljer**

Load skill `figma:figma-design-to-code`, og kald så `get_design_context` på fil `NEl3WNAwp0tCOAmPVdknAo` med nodes `17:644` (desktop-cover) og `17:850` (mobil-cover). Brug kun skrift og farver derfra. Placering og størrelse står i Global Constraints, fordi titlen er flyttet under coveret.

- [ ] **Step 2: Skriv `ProjectCover`**

- Brug `useLayoutEffect`, så `coverArrived({ cover, title })` kaldes, før siden tegnes. Laget kan så skjule titlen, før den bliver vist.
- Kun for mockups: en `ResizeObserver` på boksen sætter `--art-scale` til `mockupFit(project.mockup, width, height)`, så coveret og kopien skalerer ens.

- [ ] **Step 3: Skriv siden**

`app/projects/[slug]/page.tsx`:
- `generateStaticParams` returnerer `projects.map(({ slug }) => ({ slug }))`.
- `export const dynamicParams = false`.
- `Page(props: PageProps<"/projects/[slug]">)` finder projektet ud fra `(await props.params).slug` og kalder `notFound()`, hvis det ikke findes. Den returnerer `<main className="pb-24 md:pb-32"><ProjectCover project={project} /></main>`.

- [ ] **Step 4: Byg og tjek ruterne**

Run: `npm run build`
Expected: Bygget lykkes. Outputtet viser `/projects/[slug]` som prerenderet (●) med de 9 slugs.

Run: `npx next start -p 3100 &` og derefter `curl -s -o /dev/null -w "%{http_code}\n" localhost:3100/projects/wash-world localhost:3100/projects/nope`
Expected: `200` og `404`.

- [ ] **Step 5: Kig på det**

Åbn `localhost:3100/projects/cc-design` og `/projects/project-03` ved 1440 × 900, 1280 × 720 og 390 × 844 i lyst og mørkt tema.
Expected: Det ligner skitse C. Logoet står over coveret og ikke på det. Titlen rører ikke kontakt-pillen ved 1280 × 720. Telefonmockuppen er centreret og har samme størrelse som i Figma 17:851.

- [ ] **Step 6: Lint, typer og checkpoint**

Run: `npm run lint && npx tsc --noEmit && git status -sb`
Expected: ingen fejl. Commit (`feat: add project case page with cover`) kun, hvis brugeren har bedt om commits.

---

### Task 4: Introduction, Details og What I did

**Files:**
- Create: `components/atoms/tag.tsx`
- Create: `components/organisms/case-details.tsx`
- Create: `components/organisms/case-scope.tsx`
- Modify: `app/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `detailRows` og felterne fra Task 1.
- Produces: `Tag({ label }: { label: string })`, `CaseDetails({ project }: { project: Project })` og `CaseScope({ items }: { items: string[] })`. Alle er serverkomponenter.

- [ ] **Step 1: Hent Figmas detaljer**

Kald `get_design_context` på `17:652` (Introduction + Details), `17:683` (What I did), `17:853`, `17:856` og `17:878` (mobil) og på Tag-komponenten i siden "05 Komponenter". Brug tokens fra `app/globals.css` i stedet for rå værdier, hvor de findes.

- [ ] **Step 2: Skriv komponenterne**

- `CaseDetails`: Desktop er to kolonner. Introduction er 620 px bred, og Details er 468 px bred med 112 px fra kanterne og 128 px over. På mobil står de under hinanden med 16 px margen. Details viser `detailRows(project)`. Rækker med `href` er links, der åbner i en ny fane (`target="_blank" rel="noreferrer"`). Tags (`project.tech`) står under listen.
- `CaseScope`: Overskriften er "What I did". Hver række har en streg imellem og nummeret til højre, nulstillet (`01`, `02` …), og er 70 px høj på desktop.
- I siden: `<CaseDetails project={project} />` og, hvis `project.did` findes, `<CaseScope items={project.did} />` under coveret.

- [ ] **Step 3: Kig på det**

Byg og start som i Task 3, Step 4. Sammenlign `/projects/wash-world` med Figma 17:643 og 17:846 i begge temaer.
Expected: Details viser Project, Type og Timeframe "2026", og tags er "Figma". Der er ingen tomme rækker.

- [ ] **Step 4: Lint, typer, tests og checkpoint**

Run: `npm test && npm run lint && npx tsc --noEmit && git status -sb`
Expected: ingen fejl. Commit (`feat: add case intro, details and scope`) kun, hvis brugeren har bedt om commits.

---

### Task 5: Laget og kilderne

**Files:**
- Create: `components/organisms/cover-layer.tsx`
- Modify: `app/layout.tsx` (render `<CoverLayer />` efter `<ContactPill />`)
- Modify: `components/molecules/project-circle.tsx`
- Modify: `components/molecules/project-card.tsx`

**Interfaces:**
- Consumes: `COVER`, `Box`, `mixBox`, `phase`, `connectLayer`, `CoverStart` og `CoverParts` (Task 2). `COVER_TOP` og `COVER_BOX` (Task 3). `Artwork` med `onLoad` (Task 3). `onFrame` fra `lib/frame.ts`. `gsap` fra `@/lib/gsap`. `STILL` fra `lib/motion.ts`. `mockupFit` fra `lib/orbit.ts`.
- Produces: `CoverLayer()` er en client-komponent uden props.

- [ ] **Step 1: Kilderne**

- `ProjectCircle`: en ref på den runde `span` (den med `rounded-full` og projektets farve). Tilføj `onNavigate={(e) => { if (startCover({ project, source: ref.current!, round: true, sizes: "140px" })) e.preventDefault(); }}`.
- `ProjectCard`: tilføj `"use client"`, en ref på `[data-card]`, og det samme `onNavigate` med `round: false, sizes: "(min-width: 768px) 66vw, 100vw"`.
- Fjern `prefetch={false}` og dens kommentar begge steder.
- `onNavigate` kaldes ikke ved cmd-, ctrl- eller midterklik, så de åbner stadig en ny fane.

- [ ] **Step 2: `CoverLayer`**

DOM: en `fixed inset-0 z-[29] pointer-events-none` container, som er skjult, når der ikke er en overgang. Indeni:
1. Dækket: `absolute inset-0 bg-bg-page`. Det er `pointer-events-auto`, mens det er synligt, så et andet kort under det ikke kan klikkes.
2. Kopien: `absolute left-0 top-0 overflow-hidden @container-size` med projektets farve. Den indeholder `<Artwork project sizes={start.sizes} />` og, kun for billeder, en `<Artwork project sizes="100vw" onLoad={…} />` ovenpå, som toner ind over 300 ms, når den er hentet.
3. Målet: `<div aria-hidden className={`invisible fixed inset-x-0 top-0 ${COVER_TOP}`}><div className={COVER_BOX} /></div>`.

`start(s)` gennem `connectLayer`:
- Returnér `true` (ignorér) under en overgang og `false` ved `matchMedia(STILL).matches`.
- Mål `from: Box` fra `s.source.getBoundingClientRect()`. `r` er `w / 2` for `round` og ellers kildens beregnede `borderTopLeftRadius`.
- Sæt `s.source.style.visibility = "hidden"`. Orbit-hooket rører ikke `visibility` på de to elementer, så det giver ingen konflikt.
- Gem `target = /projects/${slug}` og vis laget med projektet. Resten starter i en `useLayoutEffect`, så kopien står på `from`, før den tegnes.

Forløbet:
- Dækket: `gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: COVER.veilIn, ease: "power1.out" })`.
- Én `onFrame`-løkke. `elapsed` regnes fra start.
  - Ved `elapsed >= COVER.veilIn` kaldes `router.push(target)` én gang (standard scroll til toppen).
  - `t = gsap.parseEase("power3.out")(min(1, elapsed / COVER.grow))`.
  - `to` = boksen for `parts.cover`, når coveret er kommet, og ellers målets boks fra start. Begge måles i hver frame, så kopien følger coveret, når der scrolles.
  - Skriv `mixBox(from, to, t)` til kopiens `transform: translate(x, y)`, `width`, `height` og `borderRadius`. For mockups sættes også `--art-scale` til `mockupFit(mockup, w, h)`.
  - `phase(elapsed, Boolean(parts))`:
    - `"land"` (én gang): `gsap.to(veil, { opacity: 0, duration: COVER.veilOut, ease: "power1.inOut", onComplete: finish })` og `gsap.fromTo(parts.title, { y: COVER.titleRise, opacity: 0 }, { y: 0, opacity: 1, duration: COVER.titleTime, ease: "power3.out" })`.
    - `"giveUp"` (én gang): `gsap.to([veil, copy], { opacity: 0, duration: COVER.veilOut, onComplete: finish })`.
- `finish()`: Stop løkken, dræb tweens, skjul laget, ryd kopiens styles, og kør `source.style.removeProperty("visibility")`. Nulstil derefter tilstanden.

`arrive(parts)`: Gør intet uden en overgang. Ellers gemmes `parts`, og titlen får `gsap.set(parts.title, { y: COVER.titleRise, opacity: 0 })`. Kald også `scrollToY(0)` fra `lib/scroll.ts`, så Lenis følger med, når Next scroller den nye side til toppen. Scroll ikke forsiden før skiftet, for så husker historikken top i stedet for, hvor man var (tjek E).

Afbrydelse: `usePathname()` i en effect. Hvis en overgang kører, og stien skifter til noget andet end `target`, sker der dette: `abort()` = `finish()`, ingen push bagefter, og `gsap.set(parts?.title, { clearProps: "transform,opacity" })`. Det dækker både tilbage-knappen og menuen før og efter push.

- [ ] **Step 3: Byg og kør tjekkene i headless Chrome**

Skriv et engangsscript i scratchpad-mappen (ikke i repoet), der styrer Chrome over CDP mod `npx next start -p 3100`. Et eksempel er `cdp-check.mjs` i sessionens scratchpad: Chrome med `--remote-debugging-port`, `Runtime.evaluate` og `Page.captureScreenshot`. Kør med vinduet 1440 × 900:

- **A. Kort:** Scroll til `#projects`, og klik på det andet kort. Efter 150 ms er dækkets opacity mellem 0 og 1, og kortet har `visibility: hidden`. Efter 2,5 s er `location.pathname` `/projects/wash-world`, laget er skjult, og titlens opacity er `1`.
- **B. Scroll under landingen:** Klik på det første kort. Fra coveret er kommet, og til laget er skjult, sendes `Input.dispatchMouseEvent` med `type: "mouseWheel"` og `deltaY: 400` hver 100 ms. Sammenlign kopiens og coverets `getBoundingClientRect()` i hver frame. Den største forskel efter `t = 1` er under 1 px.
- **C. Cmd-klik:** Klik på et kort med `modifiers: 4` (meta). Laget vises ikke, og `location.pathname` er stadig `/`.
- **D. Tilbage midt i:** Klik på en cirkel, og kald `history.back()` efter 500 ms. Efter 100 ms mere er laget skjult, kilden har ikke `visibility: hidden`, og stien er `/` efter 1,5 s.
- **E. Tilbage efter:** Lad en overgang fra en cirkel køre færdig, og kald `history.back()`. Kilden er synlig, og cirklens `transform` ændrer sig over 500 ms (ringen drejer). Scrollpositionen er den samme som før klikket (±2 px).

Expected: Alle fem holder. Gem skærmbilleder midt i og efter A.

- [ ] **Step 4: Tjek i Firefox og Safari**

Kør A og D med hånden i Firefox og Safari. Mærk efter, at kopien ikke hopper ved landingen, og at cirklens hjørner glider jævnt. Kør også A på en telefon på samme wifi (dev-serveren tillader `192.168.*.*`).
Expected: Det samme som i Chrome. Skriv ned, hvad der afviger.

- [ ] **Step 5: Alt grønt og checkpoint**

Run: `npm test && npm run lint && npx tsc --noEmit && npm run build && git status -sb`
Expected: ingen fejl. Commit (`feat: grow a circle or card into the case cover`) kun, hvis brugeren har bedt om commits.
