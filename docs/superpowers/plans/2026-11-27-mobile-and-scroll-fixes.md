# Rettelser til mobil og scroll: implementeringsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seks rettelser fra brugeren: blødere scroll på Windows, ingen kort der flyver op over skærmen fra række 3 på mobil, ingen streg over About på mobil, gennemsigtige Safari-bjælker, en mindre ring på mobil og et logo, der kan ses over footeren.

**Architecture:** Hver task er en lille, selvstændig ændring i den kode, der findes. Den eneste nye logik er en ren funktion `keepLanded` i `lib/orbit.ts` med en Node-test. Resten er klasser, CSS-værdier og én scroll-lytter i headeren.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Lenis 1.3, GSAP via `@/lib/gsap`, `node --test`.

**Spec:** Brugerens besked fra 27. november 2026 (findes ikke som fil). Kravene står herunder.

## Krav (brugerens ord, forkortet)

1. Smooth scroll skal være slået til. På Windows føles siden ikke lige så smooth som på Mac.
2. På mobil, når man scroller op: projektkortene må ikke hoppe op igen. Kun række 1 og 2 må flyve tilbage til ringen (rettet af brugeren fra "kun række 1"). På mobil er gitteret én kolonne, så række 1 og 2 er kort nr. 1 og 2 (`cards[0]` og `cards[1]`).
3. På mobil skal stregen mellem Projects og About væk.
4. Undersøg, om statusbaren og adresselinjen kan undgå at blive solide farver.
5. På mobil skal ringen og cirklerne være lidt mindre, så de holder sig inden for skærmens bredde.
6. iPhone i landscape: logoet ligger oven på footeren og forsvinder. Det skal skifte til den modsatte farve over footeren.

## Hvad koden gør i dag

- **Krav 1:** Lenis kører allerede på hele siden (`components/organisms/smooth-scroll.tsx` → `startLenis` i `lib/scroll.ts`) med `LERP = 0.2`. Lenis dæmper med `lerp * 60` per sekund, så hvert hak på hjulet glider færdigt på cirka 250 ms. En trackpad på Mac sender mange små skridt, så det føles blødt alligevel. En mus på Windows sender hak på 100 px ved 60 Hz, og så kan man se hvert hak. Lenis' standard er `0.1`, som giver cirka 500 ms.
- **Krav 2:** `progress()` i `lib/orbit.ts` regner kortets vej mellem ring og plads ud fra scrollpositionen alene. Når man scroller op, krymper et kort til en cirkel ved 85 % af skærmen og flyver ved 95 % hele vejen op til ringen, som ligger langt over skærmen.
- **Krav 4:** Safari 26 bruger ikke `theme-color`. Den farver bjælken i farven fra det første fixed- eller sticky-element i fuld bredde ved skærmens kant. Hero-sektionen er `sticky top-0 h-svh` i fuld bredde og rører både toppen og bunden. Menuens baggrund (`fixed inset-0`, kun `opacity-0`, når den er lukket) kan også blive valgt. Headeren er allerede gennemsigtig og `pointer-events-none`, og det anbefaler kilderne. Kilder: [hawkshift.com/research/ios-26-safari-status-bar](https://hawkshift.com/research/ios-26-safari-status-bar), [1ar.io/updates/safari-26-liquid-glass-web](https://1ar.io/updates/safari-26-liquid-glass-web/), [exsesx.dev/blog/en/safari-26-invisible-tint-sampler](https://exsesx.dev/blog/en/safari-26-invisible-tint-sampler). Det er ikke Apples dokumentation, og kilderne er ikke enige om alt.
- **Krav 6:** Footeren er `bg-bg-inverse`, og logoet er `text-text-primary`, altså samme farve som footeren i begge temaer. Menuknapperne har samme problem. `.ink-on-card` i `app/globals.css` blander allerede mellem de to farver med `--on-card`.

## Før du starter

- Lav branchen `fix/mobile-polish` fra `main`.
- **Projektregel:** ingen commits eller push, før brugeren beder om det. Hver task slutter med et tjek, ikke et commit.
- Planen bruger ingen nye Next-API'er (`AGENTS.md`).
- Headless Chrome (`/Applications/Google Chrome.app`) via et CDP-script i sessionens scratchpad bruges til målingerne. Scripts bliver i scratchpad, ikke i repoet.
- Tests på telefon og Windows laver brugeren. Det kræver enten en Vercel-preview af branchen (kræver push) eller dev-serveren over wifi med `allowedDevOrigins` sat lokalt (`node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/allowedDevOrigins.md`). Spørg brugeren, hvad de foretrækker.

## Global Constraints

- "Mobil" i krav 2 er under `md` (48rem), hvor gitteret har én kolonne. "Mobil" i krav 5 er under `sm` (40rem), hvor `.orbit` har sine mobilværdier i dag.
- Ingen nye pakker. Kommentarer er én linje om hvorfor, på engelsk.
- Reduced motion ignoreres stadig (CLAUDE.md, 26. november). Rør ikke `RESPECT_REDUCED_MOTION`.
- Farver kommer fra tokens, så begge temaer og temaskiftet virker.
- `npm test` og `npm run lint` skal bestå efter hver task.

## Review Focus

1. **Hop til toppen fra bunden** (tryk på statusbaren på iPhone, Home-tasten): ingen kort fra række 3 og ned flyver hen over skærmen, og alle ni cirkler er i ringen, når hero'en kommer til syne. Tjekkes i Task 3.
2. **Safaris bjælke folder sammen** (skærmen bliver højere): et kort, der bliver holdt fast, slipper først, når dets plads er under den synlige skærm, ellers popper det ud i bunden. Tjekkes i Task 3 med en resize.
3. **Skift tema, mens logoet ligger over footeren:** logoet skal stadig kunne ses i begge temaer. Tjekkes i Task 4.
4. **Drej telefonen, mens man er ved footeren:** logoets farve regnes ud igen ved resize. Tjekkes i Task 4.
5. **Hero'ens skjulte boks:** hover-pausen på cirklerne, tastaturfokus, markering af sætningen og intro-animationen virker som før. Tjekkes i Task 6.

---

### Task 1: Ingen streg over About på mobil

**Files:**
- Modify: `components/organisms/about-teaser.tsx` (section'ens `className`)

- [ ] **Step 1:** Fjern `border-t border-border-default` og `md:border-t-0` fra `<section>`.
- [ ] **Step 2: Tjek:** i headless Chrome ved 390 × 844 er `getComputedStyle(section).borderTopWidth` lig med `"0px"`. Tag et skærmbillede af overgangen til brugeren.

### Task 2: Mindre ring og cirkler på mobil

**Files:**
- Modify: `components/molecules/project-circle.tsx` (`size-18`, `mockupScale`, kommentaren)
- Modify: `app/globals.css` (`.orbit`, `--rx` under `sm`)

**Værdier:** cirklen går fra 72 px til 64 px (`size-16`). `--rx: calc(50vw - 3rem)`, så den yderste cirkel (64 px ved dybde ca. 0.95) holder ca. 1rem til kanten. På 390 px bliver ringens radius 147 px i stedet for 175 px. `--ry` følger med via `min(var(--rx), …)`. Brugeren kan rette tallene bagefter.

- [ ] **Step 1:** I `project-circle.tsx`: `size-18` → `size-16`, `mockupScale.browser` `[--art-scale:0.108]` → `[--art-scale:0.096]` og `mockupScale.phone` `[--art-scale:0.144]` → `[--art-scale:0.128]` (0.15 og 0.2 gange 0.64). Ret kommentaren til "64 px on phones".
- [ ] **Step 2:** I `.orbit` i `app/globals.css`: `--rx: 45vw;` → `--rx: calc(50vw - 3rem); /* the outermost 64 px circle stays 1rem inside the screen */`.
- [ ] **Step 3: Tjek:** i headless Chrome ved bredderne 360, 375, 390 og 430 læses alle `[data-orbit-item] a`'s `getBoundingClientRect()` hver frame i 5 sekunder efter introen. Kravet er `min(left) ≥ 15` og `max(right) ≤ width − 15`. Tjek også, at ingen cirkel overlapper hero-sætningens rektangel, og at titlen under ringen stadig kan ses. Skærmbillede ved 390 til brugeren.

### Task 3: Kort fra række 3 bliver liggende, når man scroller op på mobil

**Files:**
- Modify: `lib/orbit.ts` (ny eksport `keepLanded`)
- Modify: `lib/orbit.test.mjs`
- Modify: `hooks/use-orbit.ts` (matchMedia-betingelse, `Card`, `measure`, `placeCard`)

**Interfaces:**
- Produces: `keepLanded(kept: boolean, landed: boolean, top: number, screenBottom: number): boolean`. Returnerer `(kept || landed) && top < screenBottom`. `top` er toppen af kortets plads på siden, og `screenBottom` er bunden af den synlige skærm på siden.

- [ ] **Step 1: Skriv testen** i `lib/orbit.test.mjs`:

```js
test("a landed card is kept until its place is below the screen", () => {
  assert.equal(keepLanded(false, false, 500, 1000), false); // never landed: flies as before
  assert.equal(keepLanded(false, true, 500, 1000), true); // lands
  assert.equal(keepLanded(true, false, 999, 1000), true); // scrolled back up, place still on screen
  assert.equal(keepLanded(true, false, 1000, 1000), false); // place below the screen: let go
});
```

- [ ] **Step 2:** Kør `npm test`. Forventet: FAIL, fordi `keepLanded` ikke findes.
- [ ] **Step 3:** Eksportér `keepLanded` fra `lib/orbit.ts` med en doc-kommentar: *On one column a card flying back up would cross the whole screen, so it stays until its place is below it.*
- [ ] **Step 4:** Kør `npm test`. Forventet: alle tests består.
- [ ] **Step 5:** I `hooks/use-orbit.ts`:
  - Tilføj `columns: "(min-width: 48rem)"` til `gsap.matchMedia().add({...})` (kommentar: *where the grid gets six columns*) og læs den ud ved siden af `still` og `wide`.
  - `Card` får `kept: boolean` (start `false`).
  - `measure()` gemmer `screen = innerHeight` (den synlige skærm, også når Safaris bjælke er foldet sammen. Resize kører allerede `measure`).
  - I `placeCard`: når `!columns && i >= 2`, sæt `card.kept = keepLanded(card.kept, p >= 1 && g >= 1, card.place.cy - card.place.h / 2, s + screen)`, og hvis `card.kept`, så `p = g = 1`. `i < 2` (række 1 og 2) og alle kort på større skærme opfører sig som før.
- [ ] **Step 6: Tjek** i headless Chrome ved 390 × 844 med touch-emulering. Scroll langsomt til bunden og derefter langsomt op til toppen, og log hver frame for hvert kort: `data-flying` og om pladsens rektangel er på skærmen.
  - Kort 3-9 har aldrig `data-flying`, mens deres plads er på skærmen, når man scroller op.
  - Kort 1 og 2 får `data-flying` på vej op, som i dag.
  - Hop fra bunden til `scrollY = 0` i ét skridt (Review Focus 1): intet kort 3-9 med `data-flying` på skærmen, og alle ni cirkler er synlige (`visibility` ≠ `hidden`), når hero'en vises.
  - Resize fra 390 × 750 til 390 × 844, mens kort 5 holdes (Review Focus 2): det slipper først, når dets top er under 844.
  - Ved 1440 × 900 flyver række 2 stadig op igen, som i dag.

### Task 4: Logo og menuknapper skifter farve præcis der, hvor de ligger over footeren

**Files:**
- Modify: `components/organisms/header.tsx` (bliver `"use client"`)
- Modify: `components/molecules/logo.tsx` (`data-ink`, `ink-split`)
- Modify: `components/organisms/menu.tsx` (`data-ink` på rækken med knapperne)
- Modify: `components/atoms/flap-text.tsx` (tegn, der ikke flipper, får `<span className="flap-still">`)
- Modify: `components/atoms/menu-dots.tsx`, `components/atoms/theme-switch.tsx` (to SVG-kopier)
- Modify: `app/globals.css` (`.ink-split`, `.ink-above`, `.ink-below`)

**Regel (brugerens ønske 27. november):** den del af logoet og knapperne, der ligger over footeren, har footerens blæk (`text-inverse`), og resten har sidens (`text-primary`). Skillelinjen glider med footerens kant. Det gælder alle skærme.

**Interfaces:**
- Produces: CSS-variablen `--ink-edge`: afstanden i px fra toppen af et `[data-ink]`-element ned til footerens top. Den sættes af headeren og arves af børnene.

- [ ] **Step 1:** I `header.tsx`: `"use client"`, `ref` på `<header>` og en effect med `update()`. Den læser først `footer.getBoundingClientRect().top` og hvert `[data-ink]`-elements `getBoundingClientRect().top` i headeren. Bagefter sætter den `--ink-edge` på hvert element, låst til `[-1, offsetHeight + 1]`, og skriver kun, når værdien har ændret sig. Den kører med det samme og på `scroll` (`{ passive: true }`) og `resize`. `footer` er `document.getElementById("footer")`, som i `contact-pill.tsx`.
- [ ] **Step 2:** I `flap-text.tsx`: tegn, der ikke flipper, renderes som `<span className="flap-still">{char}</span>`. Uden for `.ink-split` ændrer det ikke noget.
- [ ] **Step 3:** I `globals.css`:
  - `.ink-split` sætter `color: transparent`.
  - Bladene (`.flap-cell > *` og `.flap-still`) får `background: linear-gradient(var(--color-text-primary) var(--ink-edge, 100vh), var(--color-text-inverse) 0)` og `background-clip: text`.
  - `.flap-whole` får `display: block`, og `.flap-still` får `display: inline-block; white-space: pre`, så alle blade har samme top som cellen, og linjen ligger samme sted, også midt i et flip.
  - `.ink-above { clip-path: inset(0 0 calc(100% - var(--ink-edge, 100vh)) 0) }` og `.ink-below { clip-path: inset(var(--ink-edge, 100vh) 0 0 0) }`.
  - Tjek, at den serverede CSS har `-webkit-background-clip: text` til Safari.
- [ ] **Step 4:** I `logo.tsx`: `Link` får `data-ink` og `ink-split`. Linket er et flex-item, så dets top er linjens top og den samme som cellernes. I `menu.tsx`: `div.ink-on-card` får `data-ink`.
- [ ] **Step 5:** I `menu-dots.tsx` og `theme-switch.tsx`: SVG'en tegnes to gange i en `relative`-wrapper. Den første får `ink-above` og arver farven fra `ink-on-card`. Den anden er `absolute inset-0 text-text-inverse ink-below` og `aria-hidden`.
  - `MenuDots` animerer prikkerne parvis (`dots[i]` og `dots[i + 9]`).
  - Den anden kopi i `ThemeSwitch` har kun cirklen og bruger den samme `mask="url(#moon)"`, så hover-animationen følger med.
- [ ] **Step 6: Tjek** i headless Chrome ved 844 × 390 (iPhone i landscape) og 1440 × 500, i lyst og mørkt tema:
  - Øverst på siden ser logo og knapper ud som før (pixel-diff mod `main`).
  - Når footerens kant skærer gennem midten af logoet, er pixels over kanten i logoet og prikkerne `text-primary`, og pixels under er `text-inverse`. Skærmbillede til brugeren.
  - Hover på logoet, mens kanten skærer igennem: bogstaverne flipper, og linjen bliver liggende.
  - Menuen åbnes over footeren: prikkerne er `text-inverse` hele vejen.
  - Skift tema, mens logoet er over footeren (Review Focus 3): logoet kan stadig ses.
  - Resize fra 844 × 390 til 390 × 844 ved bunden (Review Focus 4): kanten regnes ud igen.
  - Skærmlæser: logoets navn er stadig "mads buchhave.", og kopierne er skjult.

### Task 5: Blødere scroll på Windows

**Files:**
- Modify: `lib/scroll.ts` (`LERP`, og midlertidigt `startLenis`)

- [ ] **Step 1:** `LERP = 0.2` → `LERP = 0.1` (Lenis' standard).
- [ ] **Step 2 (midlertidigt, så brugeren kan prøve tal på sin Windows-maskine):** i `startLenis`: `lerp: Number(new URLSearchParams(location.search).get("lerp")) || LERP`. Fjernes igen før commit.
- [ ] **Step 3: Tjek** i headless Chrome ved 1440 × 900: send fem `mouseWheel`-hændelser på 100 px med 120 ms mellemrum via CDP (`Input.dispatchMouseEvent`), og log `scrollY` hver frame. Med `?lerp=0.2` og `?lerp=0.1` skal den sidste glidning nå 95 % efter cirka 250 og 500 ms. Bremsen indtil række 1 er landet virker stadig: et hurtigt skub over hero'en giver højst cirka 1500 px/s (`npm test` dækker `createBrake`).
- [ ] **Step 4 (brugeren):** prøv `?lerp=0.08`, `0.1` og `0.12` med mus på Windows og med trackpad på Mac. Orbit-flyvningen følger scroll, så den bliver også lidt blødere og langsommere på Mac. Brugeren vælger tallet. Sæt det i `LERP`, og fjern Step 2.

### Task 6: Safari-bjælker, der ikke bliver solide

**Files:**
- Modify: `components/organisms/hero.tsx` (`<section data-hero>` og `<div data-hero-fade>`)
- Modify: `components/organisms/menu.tsx` (baggrunden bag menuen på mobil)

- [ ] **Step 1:** I `hero.tsx`: `<section data-hero>` får `pointer-events-none invisible *:visible` med kommentaren *Safari 26 paints its bars in the colour of a full-width pinned box at the edge; a hidden box is skipped, and its children still show.* `<div data-hero-fade>` får `pointer-events-auto`, så sætningen stadig kan markeres. `nav.orbit` er allerede `pointer-events-none`, og cirklerne er `pointer-events-auto`. Brug ikke `*:pointer-events-auto`, for den ville tænde `nav`'en over hele hero'en.
- [ ] **Step 2:** I `menu.tsx`: baggrunden (`fixed inset-0 bg-bg-page/65`) får `invisible` sammen med `opacity-0`, når menuen er lukket, og `transition-opacity` → `transition-[opacity,visibility]`, så den stadig fader ud, før den skjules. Kommentar: *hidden, not only transparent, so Safari does not paint its bars from it*.
- [ ] **Step 3: Tjek** i headless Chrome ved 390 × 844 (Review Focus 5):
  - Skærmbilleder af hero'en før og efter er ens (pixel-diff).
  - Introen viser ringen og sætningen.
  - Hover på en cirkel stopper ringen (desktop 1440 × 900).
  - Tab når cirklerne.
  - Sætningen kan markeres (`elementFromPoint` på sætningen giver `h1`).
  - Menuens baggrund fader ind og ud på mobil.
- [ ] **Step 4 (brugeren, iPhone med iOS 26):** se statusbaren og adresselinjen øverst på siden, mens ringen spoler op, i Projects, ved footeren og med menuen åben og lukket, i lyst og mørkt tema. En solid farve med menuen åben er forventet (baggrunden dækker hele skærmen).
- [ ] **Step 5:** Hvis bjælkerne stadig er solide et sted, så stop og rapportér hvor. Næste kandidat er `viewportFit: "cover"` via `export const viewport` i `app/layout.tsx`. Den lægger indhold under notchen i landscape og kræver `env(safe-area-inset-*)` på header, contact pill og footer, så den er ikke en del af denne plan uden brugerens ja.

---

## Til sidst

- [ ] `npm test` og `npm run lint` består. `npm run build` bygger.
- [ ] Vis brugeren skærmbillederne og målingerne fra Task 1-6, og nævn det, der ikke blev tjekket (rigtig iPhone, Windows).
- [ ] Ingen commit, før brugeren beder om det.
