# Fra ring til projektgrid: implementeringsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Projects-sektionen med 9 kort, hvor hver cirkel fra hero-ringen flyver ned og bliver til sit kort, når man scroller, og hvor hurtigt scroll med mus og trackpad bremses.

**Architecture:**
- Én `requestAnimationFrame`-løkke (`lib/frame.ts`) driver Lenis, ringen og kortene med skærmens tidsstempler. GSAP tweener kun tal (fart) og styrer `matchMedia`.
- Al matematik er rene funktioner i `lib/orbit.ts` med Node-tests.
- `hooks/use-orbit.ts` måler DOM'en ved resize og skriver kun `transform`, `clip-path`, `opacity` og `visibility` pr. frame.
- Det er det rigtige kort i griddet, der flyver.

**Tech Stack:** Next.js 16.4.6 (App Router), React 19.3, TypeScript, Tailwind CSS 4.3, GSAP 3.15 med `@gsap/react`, Lenis 1.3 (ny), `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-25-orbit-to-grid-design.md`. Læs den først. Formlerne og tallene står der.

**Status:** udført 26. november 2026 (alle 7 tasks). Hvad der blev ændret undervejs, står i afsnittet "Ændret under udførelsen" nederst. Tallene og teksten ovenfor er rettet til, så de passer med koden.

## Før du starter

- Arbejdstræet har ucommittede ændringer fra temaskiftet: `app/globals.css`, `app/layout.tsx`, `components/atoms/logo.tsx`, `components/organisms/header.tsx`, `components/organisms/menu.tsx`, `components/atoms/theme-switch.tsx` og to specs. Rør dem ikke, og rul dem ikke tilbage. Brugeren afgør, om de committes før dette arbejde.
- **Projektregel:** ingen commits eller push, før brugeren beder om det. Hver task slutter derfor med et tjek, ikke et commit.
- `AGENTS.md`: læs `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` (`fill`, `sizes`, `loading`) og `link.md` (scroll til `#id`), før du skriver kode.
- Prototypen ligger midlertidigt i sessionens scratchpad: `orbit-to-grid/index.html`, og målescripts i `cdp/`. Spec'en er facit, hvis den er væk.

## Global Constraints

- Ny pakke: kun `lenis` (^1.3.28). CSS'en importeres fra `lenis/dist/lenis.css`.
- Tal fra spec'en: hold 85 % af hero-højden, 1,25 omgange, 6× ekstra fart, højst 0,7 omgange/s fra scroll, ringen 1,2× med loft ved skærmkanten (1× under 640 px), slip 50 px efter hold, 48 px mellem cirkler i en række, kurve 3, tyngde 0,5, landing ved 80 %, 200 px ved landing, vækst fra 100 % til 70 % (først 40 %, så 60 %, ændret af brugeren), bredden fører med 0,14, hjørne 28 px, Lenis lerp 0,2, eftergang 300 ms, bremse 1500 px/s med et budget på højst 150 px. Hjultrin inden for 80 % af budgettet går uændret igennem.
- Grid: rækker med 2, 3, 2, 2 kort. Spans i 6 kolonner: `[4, 2, 2, 2, 2, 3, 3, 2, 4]`. Bento fra `md` (768 px). Under `md` er der én kolonne med titel under kortet. Ringens mobiludgave gælder under `sm` (640 px) som i dag.
- Atomic design som i hero-spec'en: atoms importerer ingen komponenter, molecules importerer atoms, organisms må alt. Serverkomponent, medmindre der er tilstand eller animation.
- Pr. frame skrives kun `transform`, `clip-path`, `opacity`, `visibility` og data-attributter. Ingen layout læses i løkken. Der måles ved mount, resize, `ResizeObserver` og `document.fonts.ready`.
- Links, der bevæger sig, har `[text-decoration:none]` (hero-spec'en: 2,9 ms mod 0,4 ms).
- Reduced motion **ignoreres indtil videre** (brugerens ønske, 26. november). Kontakten er `RESPECT_REDUCED_MOTION` i `lib/motion.ts` og CSS'en mærket "reduced motion" i `app/globals.css`. Slås den til igen: hero'en står ikke fast, intet flyver, bremsen er slået fra, og Lenis glatter ikke.
- Tekst på siden er engelsk. Kommentarer er én linje om hvorfor, som i resten af koden.

## Review Focus

1. **Indlæsning midt på siden** (refresh ved række 2, frem og tilbage i historikken, eller `/#projects` som første side): kortene står rigtigt fra første frame uden at blinke i ringen, og `/#projects` lander, hvor række 1 er færdig. Tjekkes i Task 6.
2. **Resize midt i overgangen** (vindue, rotation, mobilens adresselinje): alt måles igen, og intet kort hænger forskudt. Tjekkes i Task 5.
3. **Forlad siden og kom tilbage** (`cacheComponents` skjuler siden og kører effekter igen): præcis én løkke og én Lenis, så ringen ikke kører dobbelt så hurtigt. Tjekkes i Task 3 og Task 5.
4. **Tastatur:** Tab til et kort, mens det sidder i ringen. Siden scroller, kortet lander, og fokusringen ses. PageDown, mellemrum og End bremses ikke. Tjekkes i Task 6.
5. **Reduced motion slås til, mens siden er åben:** siden falder tilbage til den stille udgave uden reload, via `gsap.matchMedia`. Tjekkes i Task 5. *Gælder ikke, så længe reduced motion ignoreres: nu skal alt bevæge sig, også med reduced motion slået til.*

## Filer

| Fil | Ansvar |
|---|---|
| `data/projects.ts` (ændres) | 9 projekter, typer og `metaLine` |
| `data/projects.test.mjs` (ny) | Data-tests |
| `components/atoms/artwork.tsx` (ny) | Billede eller browser- eller telefon-mockup. Bruges af cirkel og kort |
| `components/molecules/project-circle.tsx` (ændres) | Bruger `Artwork`, ingen `repeat` |
| `components/molecules/project-card.tsx` (ny) | Bento-kortet med info-panel og mobiltitel |
| `components/organisms/projects.tsx` (ny) | Sektionen: overskrift og grid |
| `components/organisms/orbit.tsx` (ændres) | 9 pladser, én pr. projekt |
| `components/organisms/hero.tsx` (ændres) | Spor, sticky og fade-indpakning om sætningen |
| `components/organisms/smooth-scroll.tsx` (ny) | Starter Lenis én gang |
| `lib/frame.ts` og `lib/frame.test.mjs` (nye) | Den fælles løkke |
| `lib/scroll.ts` og `lib/scroll.test.mjs` (nye) | Lenis, bremse og scroll-position |
| `lib/orbit.ts` og `lib/orbit.test.mjs` (ændres) | Formlerne |
| `hooks/use-orbit.ts` (ændres) | Måling og skrivning pr. frame for ring og kort |
| `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `package.json` (ændres) | Montering, tokens og CSS |
| `public/images/artwork/browser.svg`, `public/images/icons/arrow-up-right.svg` (nye) | Assets fra Figma |

---

### Task 1: Ni projekter, og mockups i ringen

**Files:**
- Modify: `data/projects.ts`, `components/molecules/project-circle.tsx`, `components/organisms/orbit.tsx`, `app/globals.css` (`.orbit`: `--count: 9` også under `sm`), `docs/superpowers/specs/2026-11-25-hero-design.md` (rækken "Antal": 9 også på mobil, se orbit-to-grid-spec'en)
- Create: `data/projects.test.mjs`, `components/atoms/artwork.tsx`, `public/images/artwork/browser.svg`, `public/images/icons/arrow-up-right.svg`

**Interfaces:**
- Produces:
  ```ts
  export type Mockup = "browser" | "phone";
  export type Project = { slug: string; title: string; type: string; year?: string; tech?: string[]; color: string }
    & ({ image: string; mockup?: never } | { mockup: Mockup; image?: never });
  export const projects: Project[]; // 9, i ring- og grid-rækkefølge
  export function metaLine(project: Pick<Project, "type" | "year" | "tech">): string;
  export function Artwork(props: { project: Project; sizes: string }): React.JSX.Element; // roden har data-art="image" | "browser" | "phone"
  ```

- [ ] **Step 1: Skriv de fejlende tests** i `data/projects.test.mjs`

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { metaLine, projects } from "./projects.ts";

test("nine projects, one per circle and card", () => {
  assert.equal(projects.length, 9);
  assert.equal(new Set(projects.map((p) => p.slug)).size, 9);
});

test("each project has an image or a mockup, never both", () => {
  for (const p of projects) assert.ok(Boolean(p.image) !== Boolean(p.mockup), p.slug);
});

test("the meta line joins what is known", () => {
  assert.equal(metaLine({ type: "School", year: "2026", tech: ["React", "TypeScript"] }), "School · 2026 · React, TypeScript");
  assert.equal(metaLine({ type: "Website redesign" }), "Website redesign");
});
```

- [ ] **Step 2: Kør `npm test`**. Forventet: FAIL, fordi `metaLine` ikke findes, og der kun er 2 projekter.

- [ ] **Step 3: Udvid `data/projects.ts`.**
  - De to rigtige projekter beholder deres felter. `year` og `tech` mangler fra brugeren, så de udelades.
  - Pladsholdere 3-9 har slug `project-03` til `project-09`, titel `Project 03` til `Project 09`, type `School`, år `2026` og tech `["React", "TypeScript"]`. Farve og mockup i den rækkefølge: `#dcefe1` phone, `#d6e8f7` phone, `#f6dfe6` phone, `#1e2a6b` browser, `#f7e4d4` phone, `#e6dff6` phone, `#f1eec6` browser.
  - `metaLine` joiner `type`, `year` og `tech.join(", ")` med ` · ` og springer manglende felter over.

- [ ] **Step 4: Kør `npm test`**. Forventet: PASS, alle tests, også de gamle.

- [ ] **Step 5: Hent Figmas assets.**
  - Kald `get_design_context` på fil `NEl3WNAwp0tCOAmPVdknAo`, node `17:607` (browser-kort) og `17:608` (kort med info-panel), for at få friske asset-URL'er. Load skillen `figma:figma-design-to-code` først.
  - Hent `Artwork`-SVG'en med `curl -L` til `public/images/artwork/browser.svg` og `Arrow`-SVG'en til `public/images/icons/arrow-up-right.svg`.
  - Tjek, at begge filer ikke er tomme, og at roden har `width` og `height`.

- [ ] **Step 6: Byg `components/atoms/artwork.tsx`** (serverkomponent).
  - **Billede:** en kvadratisk indpakning på `max(100cqw, 100cqh)`, centreret, med `next/image` `fill`, `object-cover`, `alt=""`, `loading="eager"` og de `sizes`, den får. Eager, fordi kortet vises oppe ved ringen længe før dets plads i layoutet når skærmen.
  - **Browser:** 520 × 340 centreret med SVG'en som `<img>` og Figmas negative inset `-4.71% -7.69% -18.82% -7.69%`, så skyggen kommer med.
  - **Telefon:** 180 × 370 bygget som Figmas komponent `17:60`: ramme `#12110d` med radius 32, skærm 164 × 354 ved 8, 8 med radius 26 i hvid, og de 8 rektangler med Figmas mål og farver.
  - Mockups skaleres med `scale: var(--art-scale, 1)`.

- [ ] **Step 7: Brug `Artwork` i `ProjectCircle`, og fjern `repeat`.**
  - Det farvede `span` får `[container-type:size]`.
  - Mockups i cirklen får `--art-scale`: 0,15 (browser) og 0,2 (telefon), gange 0,72 under `sm` og 1 fra `sm`.
  - I `Orbit` mappes `projects` direkte: ingen `PLACES`, ingen `aria-hidden` på gentagelser og ingen `max-sm:last:hidden`.

- [ ] **Step 8: Tjek.** `npm test`, `npm run lint` og `npm run build` består. I `npm run dev` ved 1440 × 900 og 390 × 844 viser ringen 9 forskellige cirkler. Mockups ses inde i pladsholder-cirklerne, og hover-navn og mobilens titel virker som før.

---

### Task 2: Projects-sektionen uden animation

**Files:**
- Create: `components/molecules/project-card.tsx`, `components/organisms/projects.tsx`
- Modify: `app/page.tsx` (`<Projects />` efter `<Hero />`, og `main` får `overflow-x-clip`), `components/organisms/hero.tsx` (fjern `overflow-clip`), `app/globals.css` (tokens `--text-display` og `--radius-lg`)

**Interfaces:**
- Consumes: `Project`, `projects`, `metaLine` og `Artwork` fra Task 1.
- Produces (DOM-kontrakt for Task 5 og 6):
  - `<section id="projects" data-projects>`
  - Ét kort pr. projekt i projekt-rækkefølge: `<Link data-card-slot>` indeholder `<div data-card-frame>` (står stille og måles, `[container-type:size]`). Det indeholder `<div data-card data-mockup="…">` (det, der flyver: `absolute inset-0`, `rounded-xl`, projektets farve, `overflow-hidden`). Det indeholder `<Artwork>` og info-panelet `[data-card-info]`. Under rammen står `[data-card-caption]`, kun under `md`.
  - `ProjectCard(props: { project: Project; span: 2 | 3 | 4 })`

- [ ] **Step 1: Tokens i `@theme static`** fra Figma.
  - `--text-display: 15rem` med linjehøjde `0.9`, letter-spacing `-0.04em` og vægt `500` (Display/XL).
  - `--radius-lg: 20px`.

- [ ] **Step 2: Byg `ProjectCard`** efter Figma: Bento Card `7:76` med hover-varianterne `7:70` og `17:2199`, desktop `17:601` og mobil `17:803`.
  - **Ramme:** `md:h-140`. Under `md` er den `h-70` med billede eller browser og `h-89.5` med telefon.
  - **Info-panel** (kun fra `md`): `bg-bg-surface`, `rounded-lg`, `p-4`, 24 px fra kanten nederst. Titel i `text-h3`, `metaLine` i `text-body-sm text-text-secondary`, og pilen som `<img>` på 24 px med `dark:invert`.
  - Panelet er skjult. På hover og `focus-visible` glider det op: fra 1 rem nede og opacity 0, 300 ms ease-out, som navnet under cirklen. Det må ikke vise sig, mens `[data-card]` har `data-flying`.
  - **Under `md`:** titel i `text-h3` 12 px under rammen og `metaLine` 12 px under titlen.
  - Linket går til `/projects/<slug>` med `prefetch={false}` som cirklerne.
  - `Artwork` får `sizes="(min-width: 768px) 66vw, 100vw"`.

- [ ] **Step 3: Byg `Projects`.**
  - Overskriften "Projects" i `text-display` og `text-text-display-faded` i en boks på 173 px med `overflow-clip`, teksten 10 px over boksens top, og en gradient fra transparent til `bg-bg-page`. Under `md` er overskriften 96 px.
  - Afstand som i Figma: `pt-16 pb-24 px-6` og 16 px under overskriften. Under `md`: `pt-12 px-4` og 24 px.
  - Griddet er `md:grid-cols-6 gap-4` med `SPANS = [4, 2, 2, 2, 2, 3, 3, 2, 4] as const` gennem et opslag af statiske klasser (`md:col-span-2`, `md:col-span-3` og `md:col-span-4`). Under `md` er der én kolonne med 24 px mellem kortene.

- [ ] **Step 4: Tjek.** `npm run lint` og `npm run build` består.
  - I dev ved 1440 × 900 matcher sektionen Figma `17:601`, bortset fra de 9 kort i rækkerne 2, 3, 2, 2. Ved 390 × 844 matcher den `17:803`. Ved 1024 og 768 er alle mockups inde i deres kort.
  - Mørkt tema: overskrift, panel og pil kan ses.
  - Tab når hvert kort, fokusringen ses, og panelet glider op.
  - Uden JavaScript står alt færdigt.

- [ ] **Step 5: Stop. Brugeren kigger** (spec'ens trin 1).

---

### Task 3: Lenis og én fælles løkke, med ringen flyttet over uden synlig ændring

**Files:**
- Create: `lib/frame.ts`, `lib/frame.test.mjs`, `lib/scroll.ts`, `lib/scroll.test.mjs`, `components/organisms/smooth-scroll.tsx`
- Modify: `package.json` (`npm install lenis`), `app/layout.tsx` (`import "lenis/dist/lenis.css"` og `<SmoothScroll />` i `body` før `{children}`), `hooks/use-orbit.ts`

**Interfaces:**
- Produces:
  ```ts
  // lib/frame.ts
  /** time is the frame's timestamp in ms; dt is seconds since the last frame, at most 0.05. Lower order runs first. */
  export function onFrame(callback: (time: number, dt: number) => void, order?: number): () => void;
  // lib/scroll.ts
  export const LERP = 0.2;
  export const BRAKE_CAP = 1500;
  export function createBrake(cap: number): (deltaY: number, now: number) => number;
  export function setBrakeEnd(scrollY: number): void; // 0 = no brake
  export function startLenis(): () => void;           // one instance, hooked into onFrame at order -1
  export function getScroll(): number;                 // Lenis' scroll, or scrollY without Lenis
  export function scrollToY(y: number): void;          // immediate
  ```

- [ ] **Step 1: Skriv de fejlende tests.** `lib/frame.test.mjs` stubber `globalThis.requestAnimationFrame` og `cancelAnimationFrame`, gemmer callbacks og kalder dem selv med tidsstempler:

```js
test("callbacks run once a frame, lowest order first, with dt in seconds", () => {
  const calls = [];
  const offA = onFrame((t, dt) => calls.push(["a", dt]));
  const offB = onFrame((t, dt) => calls.push(["b", dt]), -1);
  tick(1000); tick(1016.7);
  assert.deepEqual(calls.map((c) => c[0]), ["b", "a", "b", "a"]);
  assert.ok(Math.abs(calls[3][1] - 0.0167) < 1e-6);
  offA(); offB();
});
test("a long pause counts as at most 0.05 s", () => { /* tick(1000), tick(3000): dt === 0.05 */ });
test("the loop stops when nobody listens, and unsubscribing twice is harmless", () => { /* after off(), off(): no rAF pending */ });
```

`lib/scroll.test.mjs`:

```js
test("slow scrolling passes through almost untouched", () => {
  const brake = createBrake(1500);
  for (let k = 1; k <= 20; k++) assert.ok(Math.abs(brake(20, k * 50) - 20) < 0.5);
});
test("fast scrolling is capped near 1500 px a second", () => {
  const brake = createBrake(1500);
  let sum = 0;
  for (let k = 1; k <= 120; k++) sum += brake(140, (k * 1000) / 120);
  assert.ok(sum <= 1500 + 150 + 1 && sum > 1200, String(sum));
});
test("it brakes upwards too", () => { /* same as above with -140: sum >= -1651 and < -1200 */ });
```

- [ ] **Step 2: Kør `npm test`**. Forventet: FAIL, fordi modulerne mangler.

- [ ] **Step 3: Implementér `lib/frame.ts`.** Én løkke, der startes ved første tilmelding og stoppes, når ingen er tilmeldt. Den sorteres efter `order` og derefter tilmeldingsrækkefølge.

- [ ] **Step 4: Implementér `createBrake`.** Budgettet starter fuldt:

```ts
budget = Math.min(cap * 0.1, budget + (cap * (now - last)) / 1000); last = now;
const out = budget * Math.tanh(deltaY / Math.max(budget, 1)); budget -= Math.abs(out); return out;
```

- [ ] **Step 5: Implementér resten af `lib/scroll.ts`.** `startLenis` laver `new Lenis({ lerp: LERP, autoRaf: false, virtualScroll })` og tilmelder `lenis.raf(time)` med `order -1`. En gentagen start, mens en kører, returnerer en no-op.
  - `virtualScroll` sætter `data.deltaY = brake(data.deltaY, performance.now())`, når alt dette gælder: `data.event.type` indeholder `"wheel"`, `brakeEnd > 0`, `lenis.scroll < brakeEnd`, og reduced motion er slået fra. Den returnerer altid `true`.
  - `SmoothScroll` er en klientkomponent, som kalder `useEffect(startLenis, [])` og returnerer `null`.

- [ ] **Step 6: Kør `npm test`**. Forventet: PASS.

- [ ] **Step 7: Flyt ringen over på `onFrame` i `hooks/use-orbit.ts`.**
  - Erstat `gsap.to(clock, { repeat: -1 })` med et `speed = { value: 1 }`, som GSAP tweener: intro fra 30 til 1 over 3 s med `power3.out`, bremse til 0 over 1,6 s med `power2.out`, og tilbage til 1 over 2,4 s med `power2.inOut`.
  - Løkken lægger `dt · (2π/60) · speed.value` til vinklen og skriver positionerne, som koden gør i dag.
  - Afmeld i `matchMedia`-cleanup.

- [ ] **Step 8: Tjek.** `npm test`, `npm run lint` og `npm run build` består.
  - I dev ser ringen ud og opfører sig som før: intro, hover-bremse og mobilens titel ved bunden.
  - Hjul og trackpad scroller blødt.
  - Review Focus 3: gå til `/about` (404) og tilbage via logoet tre gange. Ringen tager stadig 60 s pr. omgang (tag tid på en omgang), og der er ét `requestAnimationFrame` pr. frame i Chrome DevTools' Performance-panel.

---

### Task 4: Formlerne i `lib/orbit.ts`

**Files:**
- Modify: `lib/orbit.ts`, `lib/orbit.test.mjs` (de gamle tests bliver)

**Interfaces:**
- Produces:
  ```ts
  export const MOTION = { turns: 1.25, boost: 6, maxTurns: 0.7, growth: 1.2, launch: 50, gap: 48, power: 3,
    gravity: 0.5, land: 0.8, landSize: 200, growFrom: 1, growTo: 0.7, lead: 0.14, smoothing: 0.3, corner: 28 } as const;
  export const mix: (a: number, b: number, t: number) => number;
  export const clamp01: (t: number) => number; // within a millionth of 0 or 1 counts as 0 or 1
  export const finishedAt: (place: Place, scene: Scene) => number; // where a card has landed and grown
  export function inOut(t: number, power: number): number;
  export function wind(x: number): number;
  export function turnRing(angle: number, o: { dt: number; speed: number; wound: number; push: number }): number;
  export function ringGrowth(o: { width: number; height: number; rx: number; ry: number; size: number }): number;
  export type Scene = { height: number; release: number; flight: number; end: number }; // end: the furthest the page scrolls
  export type Place = { cx: number; cy: number; w: number; h: number; col: number };
  export function sceneOf(o: { height: number; hold: number; firstRowY: number; end?: number }): Scene;
  export function progress(s: number, place: Place, scene: Scene): { p: number; g: number };
  export function cardFrame(p: number, g: number, place: Place, circle: { x: number; y: number; d: number }):
    { dx: number; dy: number; d: number; w: number; h: number; radius: number; gw: number };
  export function mockupFit(mockup: "browser" | "phone", w: number, h: number): number;
  export function rowDone(firstRowY: number, height: number): number;
  ```
  `orbitPoint`, `bottomIndex`, `restingTransform` og `restingLabelScale` bliver, som de er.

- [ ] **Step 1: Skriv de fejlende tests.** Scenen er 1440 × 900 med spec'ens tal: hold 765 og række 1's midte ved 900 + 765 + 64 + 173 + 16 + 280 = 2198.

```js
const scene = sceneOf({ height: 900, hold: 765, firstRowY: 2198 });
const place = { cx: 484, cy: 2198, w: 920, h: 560, col: 0 };
const circle = { x: 700, y: 1500, d: 115 };

test("the throw starts 50 px after the hold and lands when the place is at 80 % of the screen", () => {
  assert.equal(scene.release, 815);
  near(scene.flight, 2198 - 720 - 815);
  assert.deepEqual(progress(814, place, scene), { p: 0, g: 0 });
  near(progress(2198 - 720, place, scene).p, 1);
});
test("cards further along a row leave 48 px later", () => {
  near(progress(815 + 48, { ...place, col: 1 }, scene).p, 0);
});
test("a card sits on its circle when thrown and fills its place when finished", () => {
  const a = cardFrame(0, 0, place, circle);
  near(a.dx, 216); near(a.dy, -698); near(a.w, 115); near(a.h, 115); near(a.radius, 57.5);
  const b = cardFrame(1, 1, place, circle);
  near(b.dx, 0); near(b.dy, 0); near(b.w, 920); near(b.h, 560); near(b.radius, 28);
});
test("a card is finished when its centre is at 70 % of the screen", () => { // the code's tests use 630 and 1568 now
  near(progress(2198 - 360, place, scene).g, 1);
  near(progress(2198 - 900, place, scene).g, 0);
  assert.equal(rowDone(2198, 900), 1838);
});
test("nothing jumps: one pixel of scroll moves a card less than 15 px", () => {
  for (const pl of [place, { cx: 1188, cy: 2198, w: 456, h: 560, col: 1 }, { cx: 484, cy: 3926, w: 920, h: 560, col: 0 }]) {
    let last;
    for (let s = 0; s < 4500; s++) {
      const { p, g } = progress(s, pl, scene);
      const f = cardFrame(p, g, pl, circle);
      if (last) for (const k of ["dx", "dy", "w", "h", "radius"]) assert.ok(Math.abs(f[k] - last[k]) < 15, `${k} at ${s}`);
      last = f;
    }
  }
});
test("curves start and end softly", () => {
  for (const n of [2, 3]) { assert.ok(inOut(0.001, n) < 1e-4); assert.ok(1 - inOut(0.999, n) < 1e-4); near(inOut(0.5, n), 0.5); }
});
test("the ring winds faster and faster, then keeps its speed", () => { near(wind(0.5), 0.25); near(wind(1), 1); near(wind(1.5), 2); });
test("60 s a turn at rest, 6× more when wound, and scrolling never adds more than 0.7 turns a second", () => {
  const dt = 1 / 60, base = ((2 * Math.PI) / 60) * dt;
  near(turnRing(0, { dt, speed: 1, wound: 0, push: 0 }), base);
  near(turnRing(0, { dt, speed: 1, wound: 1, push: 0 }), 7 * base);
  assert.ok(turnRing(0, { dt, speed: 0, wound: 0, push: 10 }) <= 2 * Math.PI * 0.7 * dt + 1e-9);
});
test("the ring grows 1.2× only where the screen has room, and not on phones", () => {
  near(ringGrowth({ width: 1440, height: 900, rx: 400, ry: 330, size: 100 }), (450 - 57.5) / 330);
  near(ringGrowth({ width: 1920, height: 1080, rx: 534, ry: 396, size: 100 }), 1.2);
  assert.equal(ringGrowth({ width: 390, height: 844, rx: 175.5, ry: 175.5, size: 72 }), 1);
});
test("mockups fit their card like in Figma", () => {
  near(mockupFit("browser", 920, 560), 1); near(mockupFit("browser", 358, 280), (0.7 * 358) / 520);
  near(mockupFit("phone", 456, 560), 1); near(mockupFit("phone", 358, 358), (0.72 * 358) / 370);
});
```

- [ ] **Step 2: Kør `npm test`**. Forventet: FAIL, fordi funktionerne ikke findes.

- [ ] **Step 3: Implementér.** Formlerne står i spec'ens afsnit "Formlerne fra prototypen". Her er det, spec'en ikke fastlægger:
  - `turnRing` returnerer `angle + dt·(2π/60)·speed·(1 + boost·wound) + L·tanh(push/L)`, hvor `L = 2π·maxTurns·dt`.
  - `sceneOf`: `release = hold + launch` og `flight = max(200, firstRowY − land·height − release)`.
  - `progress`: start er `cy − land·height − flight + col·gap`. `p = clamp((s − start) / flight)` og `g = clamp((s − (cy − growFrom·height)) / ((growFrom − growTo)·height))`.
  - `cardFrame`: `ex = inOut(p, power)` og `ey = inOut(p^(1 + gravity), power)`. Resten står i spec'en.
  - `ringGrowth`: 1 under 640 px bredde. Ellers `min(growth, (height/2 − size·1.15/2)/ry, (width/2 − size·0.95/2)/rx)`.
  - `mockupFit`: browser `min(1, 0.7·w/520, 0.7·h/340)` og telefon `min(1, 0.72·h/370, 0.8·w/180)`.
  - `rowDone`: `firstRowY − growTo·height`.

- [ ] **Step 4: Kør `npm test`**. Forventet: PASS, også de gamle tests.

---

### Task 5: Overgangen

**Files:**
- Modify: `app/globals.css`, `components/organisms/hero.tsx`, `components/organisms/orbit.tsx`, `components/molecules/project-circle.tsx`, `hooks/use-orbit.ts`

**Interfaces:**
- Consumes: DOM-kontrakten fra Task 2, `onFrame` og `getScroll` fra Task 3, og alt fra Task 4.
- Produces:
  - `<div data-hero-track>` indeholder `<section data-hero>` (sticky). Inden i den ligger `<div data-hero-fade>` om `HeroSentence` og ringen.
  - På ringens rod: `data-scrolled`, når siden ikke står i toppen.

- [ ] **Step 1: CSS.**
  - `--hero: max(100svh, 35rem)` flyttes fra `.orbit` til `:root`.
  - `@property --rx` og `--ry` registreres med `syntax: "<length>"`, så `getComputedStyle` giver pixels.
  - `.hero-track { height: var(--hero) }`, og i `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)` er højden `calc(var(--hero) * 1.85)`. Hero-sektionen er `sticky top-0`.
  - Navnet under en cirkel er skjult, når ringen har `data-scrolled`.

- [ ] **Step 2: Mål i `hooks/use-orbit.ts`** i en `measure()`, som køres ved mount, `resize`, en `ResizeObserver` på `[data-projects]` og `[data-hero]`, og `document.fonts.ready`.
  - Hero og hold: `H = hero.offsetHeight` og `hold = track.offsetHeight − H`.
  - Ringen: `rx` og `ry` fra `getComputedStyle(ring).getPropertyValue("--rx")`, og `size` fra en cirkels `offsetWidth`.
  - Hvert kort får `Place` fra `[data-card-frame]`: `getBoundingClientRect()` plus `scrollY`. `col` er kortets nummer blandt rammer med samme afrundede top.
  - Desuden `scene = sceneOf(…)` og `growth = ringGrowth(…)`.

- [ ] **Step 3: Skriv pr. frame** (`onFrame`, standardrækkefølge, efter Lenis).
  - **Scroll:** `s` følger `getScroll()` med `MOTION.smoothing`. `x = s / scene.release`.
  - **Vinkel:** `push = 2π·turns·(wind(x) − forrige wind)`, så `turnRing(...)` med `speed.value` og `wound = clamp(x)²`.
  - **Ringen:** størrelse `mix(1, growth, inOut(clamp(x), 2))`, midte på siden `min(getScroll(), hold) + H/2`.
  - **Hvert kort:** `progress` og `cardFrame`.
    - Ved `p ≤ 0` vises cirklen, og kortet har `opacity: 0`, `pointer-events: none` og `data-flying`.
    - Ellers skjules cirklen med `visibility: hidden`, og kortet får `translate(dx, dy)`, `clip-path: inset(((h0 − h)/2)px ((w0 − w)/2)px round radius px)` og `will-change: transform`.
    - Art-skala: et billede `max(w, h) / max(w0, h0)`, en mockup `mix(s0·d/100, mockupFit(...), gw)` med `s0` 0,15 eller 0,2.
    - `[data-card-caption]` får opacity `g`. `data-flying` fjernes, og `will-change` nulstilles, når `p = 1` og `g = 1`.
    - Skriv intet, hvis tallene er de samme som sidste frame.
  - **Sætningen:** `[data-hero-fade]` får opacity `1 − 1,6x`.

- [ ] **Step 4: Toppen af siden.**
  - Hover og fokus bremser kun ringen, når `getScroll() ≤ 1`.
  - Når siden forlader toppen, sættes `data-scrolled`, farten tweenes tilbage til 1, og mobilens titel får `-1`.

- [ ] **Step 5: Reduced motion.** `measure()` sætter kun mockups' skala til `mockupFit`. Intet flyver, og ringen står som i dag. Review Focus 5: slå reduced motion til og fra i DevTools' Rendering-panel, mens siden er åben. Siden skifter mellem udgaverne uden reload, uden kort fanget halvvejs og uden to løkker.

- [ ] **Step 6: Tjek.** `npm test`, `npm run lint` og `npm run build` består.
  - Ved 1440 × 900 og 390 × 844 ligner forløbet prototypen med brugerens tal, både ned og op.
  - Skiftet fra cirkel til kort kan ikke ses på nærbilleder ved 2×.
  - I Chrome er der under 2 ms main-thread-arbejde pr. frame fra overgangen, ingen layout i løkken og ingen hop over 3 px pr. frame ved jævn scroll. Mål som prototypens `cdp/smooth.mjs`: positioner pr. frame og ændring i fart.
  - Review Focus 2: ændr vinduets bredde og højde midt i en flyvning og ved række 3. Alt følger med efter næste resize-måling.
  - Review Focus 3: frem og tilbage til `/about` som i Task 3, nu midt i overgangen.

- [ ] **Step 7: Stop. Brugeren kigger** (spec'ens trin 3).

---

### Task 6: Bremsen, `/#projects` og landing midt på siden

**Files:**
- Modify: `hooks/use-orbit.ts`

**Interfaces:**
- Consumes: `setBrakeEnd` og `scrollToY` fra Task 3, og `rowDone` fra Task 4.

- [ ] **Step 1: Bremsezonen.** `measure()` kalder `setBrakeEnd(rowDone(firstRowY, H))`. Ved cleanup og reduced motion kaldes `setBrakeEnd(0)`.

- [ ] **Step 2: `/#projects`.**
  - `measure()` sætter `section.style.scrollMarginTop` til `sectionTop − rowDone(firstRowY, H)` px, så både browserens og Next's scroll til `#projects` lander, hvor række 1 er færdig.
  - Står der `#projects` i adressen ved første måling, kaldes `scrollToY(rowDone(...))`.
  - Den udglattede `s` sættes lig scroll ved første måling, så kortene ikke flyver fra ringen, når siden åbnes midt på.

- [ ] **Step 3: Tjek bremsen** med et hårdt trackpad-ryk, som i prototypens `cdp/fling.mjs`: 22 hjul-hændelser på 140 px med 16 ms mellemrum fra toppen. Siden flytter sig ca. 700 px, ikke 3000. Fra række 2 flytter samme ryk siden frit. Langsomt scroll (12 px hver 30 ms) bremses ikke.

- [ ] **Step 4: Review Focus 1.**
  - Åbn `/#projects` som første side: række 1 står færdig.
  - Menuens "Projects" fra toppen lander samme sted.
  - Genindlæs ved scroll 2500: kortene står rigtigt fra første frame uden at blinke i ringen.
  - Frem og tilbage i historikken giver samme resultat.

- [ ] **Step 5: Review Focus 4.**
  - Tab fra toppen til første kort: siden scroller, kortet lander, og fokusringen og info-panelet ses.
  - PageDown, mellemrum og End bremses ikke.
  - Touch i mobilemulering bremses ikke.

---

### Task 7: Gennemgang i browsere

**Files:** ingen nye.

- [ ] **Step 1:** `npm test`, `npm run lint` og `npm run build` består. `npm start` køres, og Task 5's målinger gentages på production-buildet.
- [ ] **Step 2:** Ved fuld fart klippes ingen cirkel og intet kort af skærmkanten ved 1024 × 768, 1440 × 900 og 1920 × 1080.
- [ ] **Step 3:** Firefox: hele forløbet ned og op, bremsen, `/#projects`, mørkt tema og reduced motion.
- [ ] **Step 4:** Opdater hukommelsesfilen `orbit-to-grid-transition.md`: bygget, og hvad der mangler (Safari, rigtig telefon, test med 2-3 personer, brugerens billeder og år/teknologier, Figma med 9 kort).
- [ ] **Step 5: Stop. Brugeren kigger** (spec'ens trin 4). Spørg, om der skal committes.

---

## Ændret under udførelsen

Alle ændringer er grundet i loggen `.superpowers/sdd/2026-11-26-orbit-to-grid/progress.md` (linjer med "Ruling:" og "Final:").

**Tal, brugeren ændrede**
- Kortene er færdige ved 70 % af skærmhøjden, ikke 40 %. Først 60 %, fordi info-panelet kom for sent, derefter 70 %. Bremsen og `/#projects` følger med: 1558 ved 1440 × 900.
- Bremsen lader hjultrin inden for 80 % af budgettet gå uændret igennem. Tidligere blev et trin på 100 px til 87 px.
- Reduced motion ignoreres indtil videre. Se Global Constraints.

**Huller i planen, der blev lukket**
- Sidste række kunne aldrig blive færdig, fordi siden slutter før 40 %. `Scene.end` og `late` i `progress` rykker den tidligere.
- Afrunding efterlod sidste kort på g = 0,9999999999999998, så det aldrig landede. `clamp01` tæller tæt på 0 og 1 som 0 og 1, og den udglattede scroll springer sidste halve pixel over.
- De første 20 frames efter mount følger scroll direkte, fordi browseren kan genskabe positionen sent.
- `#projects` rettes kun, når siden står ved sektionens top lige efter browserens eget hop. En position fra historikken bliver.
- Tab til et kort, der ikke er færdigt, scroller videre til `finishedAt`. Det gælder kun ved fokus fra tastaturet (`:focus-visible`), ellers hoppede siden under musen.
- Introens fart (30×) spinder kun op i toppen. Længere nede hvirvlede de flyvende kort med op til 25 px pr. frame.
- Info-panelet og navnene under cirklerne skjules med `opacity-0!`, ikke `invisible`, så linkene beholder deres navn for skærmlæsere.
- En måling efter `document.fonts.ready` kører ikke efter oprydning.
- Lenis har `stopInertiaOnNavigate: true`, og et klik på et link til et anker på samme side, som menuens `#projects`, stopper også glidningen.
- `tsconfig` har `allowImportingTsExtensions`, så Node-testene kan importere `./frame.ts`.

**Taget ud af designet:** styringen, der skulle få de to første cirkler nederst i kastet. Loftet på 0,7 omgange/s ødelægger forudsigelsen.

**Åbent:** Safari, en rigtig telefon, en test med 2-3 personer, brugerens billeder og år og teknologier, Figma med 9 kort. Positionen ændrer fart med op til 7 px pr. frame midt i kurven (blødhed 3). Planens grænse var 3 px, og brugeren har ikke afgjort det.
