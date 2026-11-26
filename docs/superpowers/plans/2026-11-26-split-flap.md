# Split-flap hover: implementeringsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En genanvendelig `<FlapText>`, hvor bogstaverne klapper som på en lufthavnstavle ved hover og lander på sig selv. Den skal sidde på logoet, menuens hovedlinks, "Let's talk" og kontaktkortets email og telefonnummer.

**Architecture:**
- Al matematik er rene funktioner i `lib/flap.ts` med Node-tests: tegnsekvenser, hvilket flip et bogstav er nået til, perspektiv og clip-paths.
- `components/atoms/flap-text.tsx` renderer et helt bogstav og fire halvdele per bogstav eller tal. Ved hover kører ét `gsap.to` et tal `turn` fra 0 til 4 per bogstav, og `onUpdate` tegner det.
- I hvile vises kun det hele bogstav. Halvdelene er kun synlige, mens bogstavet flipper.

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS 4, GSAP 3.15 via `@/lib/gsap` (`gsap`, `useGSAP`), `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-26-split-flap-design.md`. Læs den først.

**Prototype:** `split-flap.html` i sessionens scratchpad viser opførslen. Spec'en er facit, hvis den er væk.

## Før du starter

- `app/page.tsx` har en ucommittet ændring fra brugeren. Rør den ikke.
- **Projektregel:** ingen commits eller push, før brugeren beder om det. Hver task slutter med et tjek, ikke et commit.
- `AGENTS.md`: planen bruger ingen nye Next-API'er. Læs den relevante guide i `node_modules/next/dist/docs/`, hvis du får brug for en.

## Global Constraints

- Tal fra spec'en: 3 flips per bogstav, 700 ms per bogstav, 75 ms forskydning fra venstre, kurven `power2.out`, perspektiv 7.5em, delelinje 58 % fra toppen og gennemsigtige flapper.
- Kun bogstaver og tal (`/[\p{L}\p{N}]/u`) flipper. Alt andet står stille og bruger ikke en plads i forskydningen.
- Tegn undervejs er tilfældige fra bogstavets egen gruppe: `0-9` for tal, `A-Z` for store bogstaver og `a-z` for alt andet, også æ, ø og å.
- Ingen nye pakker. GSAP importeres fra `@/lib/gsap`.
- Atomic design: atoms importerer ingen komponenter, molecules importerer atoms, organisms må alt.
- Starter kun ved mus (`pointerType === "mouse"`) og tastaturfokus (`:focus-visible`). En ny hover, mens den kører, gør ingenting.
- Reduced motion: spring effekten over, når `matchMedia(STILL).matches`, ligesom `hooks/use-unfold.ts`. `STILL` matcher aldrig lige nu (brugerens ønske, 26. november).
- Farver arves med `currentColor`. Ingen faste farver, så temaskiftet virker.
- Kommentarer er én linje om hvorfor, på engelsk, som i resten af koden.

## Review Focus

1. **Tegn i email og telefonnummer** ("@", ".", "+", mellemrum): de står stille, og tal flipper kun gennem tal. Testes i Task 1.
2. **Halen på g, j, p, q, y:** gamle bogstavers hale under linjen forsvinder, når cellen er dækket. Testes i Task 1 (`clips` ved 179°).
3. **Unmount midt i et flip** (klik på et menulink, så menuen lukker, eller navigation): ingen fejl i konsollen, og intet bliver hængende. Tjekkes i Task 3.
4. **Touch:** et tryk på et link flipper ikke. Tjekkes i Task 2 med touch-emulering i DevTools.
5. **Logoet på 320 px:** navnet brydes ikke og går ikke ud over menuknapperne. Tjekkes i Task 2, når forholdet 7.41 er målt igen.

---

### Task 1: Matematikken i `lib/flap.ts`

**Files:**
- Create: `lib/flap.ts`
- Test: `lib/flap.test.mjs`

**Interfaces:**
- Produces:
  - `FLAP = { flips: 3, duration: 0.7, stagger: 0.075, ease: "power2.out", perspective: 7.5, split: 0.58 } as const`. Duration og stagger er i sekunder og perspective i em.
  - `moves(char: string): boolean`: om tegnet flipper.
  - `sequence(char: string, count: number, random?: () => number): string[]`: `[char, ...count tilfældige fra gruppen, char]`, eller `[char]`, når tegnet ikke flipper. `random` er som standard `Math.random`.
  - `flipAt(turn: number, steps: number): { step: number; angle: number }`: `step = min(floor(turn), steps - 1)` og `angle = 180 * (turn - step)` i grader.
  - `covered(degrees: number, half: number, perspective: number): number`: hvor stor en del af en halvdel (`half` em høj) flappen dækker, når den står `degrees` fra fladt. Værdien er mellem 0 og 1.
  - `clips(angle: number, lineHeight: number): { top: string; bottom: string }`: clip-paths til den faste top og bund under et flip. `""` betyder, at CSS'ens clip bruges.

- [ ] **Step 1: Skriv de fejlende tests i `lib/flap.test.mjs`**

Brug samme stil som `lib/orbit.test.mjs` (`node:test`, `node:assert/strict`, import fra `./flap.ts`). Testene:

```js
test("only letters and digits move", () => {
  for (const ch of "buchhavee@gmail.com+45 24 26 43 48'.")
    assert.equal(moves(ch), /[a-z0-9]/.test(ch), ch);
  assert.equal(moves("æ"), true);
});

test("characters that stand still keep one entry", () => {
  for (const ch of [".", "'", " ", "@", "+"]) assert.deepEqual(sequence(ch, 3), [ch]);
});

test("a sequence starts and ends on its own character, from its own group", () => {
  assert.deepEqual(sequence("d", 3, () => 0), ["d", "a", "a", "a", "d"]);
  assert.deepEqual(sequence("P", 3, () => 0), ["P", "A", "A", "A", "P"]);
  assert.deepEqual(sequence("4", 3, () => 0.99), ["4", "9", "9", "9", "4"]);
  assert.deepEqual(sequence("æ", 3, () => 0), ["æ", "a", "a", "a", "æ"]);
  for (const ch of "+45 24 26 43 48".replace(/\D/g, ""))
    assert.ok(sequence(ch, 3).every((c) => /\d/.test(c)), ch);
});

test("flipAt splits a turn into a step and an angle", () => {
  assert.deepEqual(flipAt(0, 4), { step: 0, angle: 0 });
  assert.deepEqual(flipAt(2.25, 4), { step: 2, angle: 45 });
  assert.deepEqual(flipAt(4, 4), { step: 3, angle: 180 });
});

test("covered follows the flap in perspective", () => {
  assert.equal(covered(0, 0.5, 7.5), 1);
  near(covered(90, 0.5, 7.5), 0);
  const c = covered(60, 0.5, 7.5);
  assert.ok(c > 0.5 && c < 1, `${c}`); // perspective makes it larger than cos 60°
  assert.equal(covered(80, 2, 1), 1); // the edge has passed the viewer
});

test("clips uncover the new top and cover the old bottom", () => {
  assert.deepEqual(clips(0, 1.1), { top: "inset(0 -1em 100% -1em)", bottom: "" });
  assert.deepEqual(clips(90, 1.1), { top: "", bottom: "inset(58% -1em -0.5em -1em)" });
  const top = parseFloat(clips(45, 1.1).top.split(" ")[2]);
  assert.ok(top > 42 && top < 100, `${top}`);
});

test("once covered, the old letter is hidden completely, tail and all", () => {
  assert.equal(clips(179, 1.1).bottom, "inset(100% 0 0 0)");
});
```

`near` er den samme hjælper som i `orbit.test.mjs`.

- [ ] **Step 2: Kør testene, og se dem fejle**

Run: `npm test`
Expected: FAIL i `lib/flap.test.mjs`, fordi `./flap.ts` ikke findes. `orbit`-, `frame`- og `scroll`-testene består stadig.

- [ ] **Step 3: Skriv `lib/flap.ts` med signaturerne fra Interfaces**

`covered` og `clips` er algoritmen fra prototypen:

```ts
// covered: d = perspective - half * sin(r); d <= 0 → 1, ellers min(1, cos(r) * perspective / d)
// clips, med sp = FLAP.split og P = FLAP.perspective:
//   angle < 90:  top = `inset(0 -1em ${pct(1 - sp + sp * covered(angle, sp * lineHeight, P))}% -1em)`, bottom = ""
//   angle >= 90: c = covered(180 - angle, (1 - sp) * lineHeight, P), top = ""
//                bottom = c < 1 ? `inset(${pct(sp + (1 - sp) * c)}% -1em -0.5em -1em)` : "inset(100% 0 0 0)"
// pct(x) = +(x * 100).toFixed(2), så 0.58 bliver 58 og ikke 57.99999999999999
```

Skriv en linje over den sidste gren om hvorfor: en hale som g's hænger under cellen, så det gamle bogstav skal skjules helt.

- [ ] **Step 4: Kør testene, og se dem bestå**

Run: `npm test`
Expected: PASS, alle tests, også de gamle.

---

### Task 2: `FlapText` og logoet

**Files:**
- Create: `components/atoms/flap-text.tsx`
- Modify: `app/globals.css` (ny blok i `@layer components`)
- Move: `components/atoms/logo.tsx` → `components/molecules/logo.tsx`. Et atom må ikke importere `FlapText`.
- Modify: `components/organisms/header.tsx:1` (importen af `Logo`)

**Interfaces:**
- Consumes: `FLAP`, `moves`, `sequence`, `flipAt` og `clips` fra Task 1. `gsap` og `useGSAP` fra `@/lib/gsap`. `STILL` fra `@/lib/motion`.
- Produces: `FlapText({ text }: { text: string })`. Den lægges inde i et eksisterende `a` eller `button` og starter på nærmeste `a, button`.

- [ ] **Step 1: Tilføj CSS'en i `app/globals.css` under `@layer components`**

```css
  /* Split-flap letters (components/atoms/flap-text.tsx). At rest only the whole letter shows, so there is no seam. */
  .flap-cell {
    position: relative;
    display: inline-block;
    white-space: pre;
    perspective: var(--flap-perspective);
    perspective-origin: 50% var(--flap-split);
  }
  .flap-cell > :not(.flap-whole) {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center; /* a wider letter overflows evenly on both sides */
    visibility: hidden;
  }
  .flap-cell[data-flipping] > * { visibility: visible; }
  .flap-cell[data-flipping] > .flap-whole { visibility: hidden; }
  .flap-top, .flap-fold { clip-path: inset(-0.5em -1em calc(100% - var(--flap-split)) -1em); }
  .flap-bottom, .flap-land { clip-path: inset(var(--flap-split) -1em -0.5em -1em); }
  .flap-fold, .flap-land { transform-origin: 50% var(--flap-split); }
```

Rækkefølgen af lagene i en celle er: `flap-whole` (i flow, giver bredden), `flap-top` (nyt bogstav), `flap-bottom` (gammelt bogstav), `flap-fold` (gammel top, der falder) og `flap-land` (ny bund, der lander).

- [ ] **Step 2: Skriv `components/atoms/flap-text.tsx`**

Opbygning (`"use client"`):
- Yderste `<span ref={root}>` med `style` `--flap-split: 58%` og `--flap-perspective: 7.5em`, regnet ud fra `FLAP`.
- Indeni en `<span className="sr-only">{text}</span>` og en `<span aria-hidden="true" className="whitespace-nowrap">`.
- I den: hvert tegn, hvor `moves(ch)` er sand, bliver `<span className="flap-cell">` med de fem lag, alle med `ch` som tekst. Andre tegn forbliver almindelig tekst. Ingen tilfældighed ved render, så serverens og klientens HTML er ens.

Opførsel i `useGSAP((_, contextSafe) => …, { scope: root })`:
- `trigger = root.current.closest("a, button")`. Lyt på `pointerenter` (kun når `pointerType === "mouse"`) og `focus` (kun når `trigger.matches(":focus-visible")`). Fjern lytterne i cleanup.
- `play` pakkes i `contextSafe`, så tweenen ryddes op ved unmount. Den gør ingenting, hvis den forrige tween stadig kører (`isActive()`), eller hvis `matchMedia(STILL).matches`.
- Første gang `play` kører, læses linjehøjden i em én gang: `parseFloat(lineHeight) / parseFloat(fontSize)` fra `getComputedStyle(root)`.
- Hver celle bliver et objekt `{ turn: 0, step: -1, seq: sequence(ch, FLAP.flips), … de fire lag }`. Så kører `gsap.to(cells, { turn: FLAP.flips + 1, duration, ease, stagger, onUpdate: draw })` med værdierne fra `FLAP`.

`draw` for hver celle:

```ts
// turn === 0: not started yet (stagger). turn >= steps: landed, so settle once.
const steps = cell.seq.length - 1;
if (!cell.turn) continue;
if (cell.turn >= steps) { /* remove data-flipping, clear inline styles on the four layers, once */ continue; }
const { step, angle } = flipAt(cell.turn, steps);
if (step !== cell.step) {
  // top = seq[step + 1], bottom = seq[step], fold = seq[step], land = seq[step + 1]; set data-flipping
}
fold.style.transform = `rotateX(${-Math.min(angle, 90)}deg)`;
land.style.transform = `rotateX(${Math.min(90, 180 - angle)}deg)`;
({ top: top.style.clipPath, bottom: bottom.style.clipPath } = clips(angle, lineHeight));
```

Skriv kun tekst, når `textContent` faktisk ændrer sig.

- [ ] **Step 3: Flyt logoet, og brug `FlapText`**

Run: `git mv components/atoms/logo.tsx components/molecules/logo.tsx`

I `logo.tsx` bliver `mads buchhave.` til `<FlapText text="mads buchhave." />`. Ret importen i `header.tsx` til `@/components/molecules/logo`.

- [ ] **Step 4: Tjek typer, lint og tests**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: ingen fejl, og alle tests består.

- [ ] **Step 5: Mål logoets forhold igen**

Kør `npm run dev`, og åbn siden i et bredt vindue. Kør i konsollen:
`(a => a.getBoundingClientRect().width / parseFloat(getComputedStyle(a).fontSize))(document.querySelector("header a"))`

Ret `7.41` i både kommentaren og klassen i `logo.tsx`, hvis tallet er ændret. Rund op til to decimaler.

- [ ] **Step 6: Tjek i browseren**

- Hover på logoet: 12 bogstaver flipper fra venstre, og "." og mellemrummet står stille. Forløbet tager ca. 1,5 s og lander på "mads buchhave." uden delelinje eller rester.
- Med Tab til logoet flipper det. Et klik med musen flipper ikke en gang til.
- Med touch-emulering i DevTools flipper et tryk ikke.
- Et skift af tema mens det flipper: farven følger med.
- Ved 320 px er navnet på én linje og rører ikke knapperne.
- Konsollen har ingen fejl eller hydration-advarsler.

---

### Task 3: Menu og kontaktpille

**Files:**
- Modify: `components/molecules/menu-card.tsx` (hovedlinkenes `{label}`)
- Modify: `components/molecules/contact-pill.tsx` ("Let's talk" og kontaktlinkenes `{text}`)

**Interfaces:**
- Consumes: `FlapText({ text })` fra Task 2.

- [ ] **Step 1: Indsæt `FlapText`**

- `menu-card.tsx`: kun hovedlinkene (`mainLinks`) bliver `<FlapText text={label} />`. Elsewhere-linkene bliver uændret.
- `contact-pill.tsx`: `Let&apos;s talk` bliver `<FlapText text="Let's talk" />`, og `{text}` i kontaktlinkene bliver `<FlapText text={text} />`. Labels ("Email", "Phone") bliver uændret.

- [ ] **Step 2: Tjek typer, lint og tests**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: ingen fejl.

- [ ] **Step 3: Tjek i browseren**

- Projects, About og Contact flipper hver for sig ved hover, og GitHub og LinkedIn flipper ikke.
- "Let's talk" flipper, mens kortet folder sig ud, og apostroffen står stille.
- Emailen flipper på ca. 1,9 s, og "@" og "." står stille. Telefonnummeret flipper kun gennem tal, og "+" og mellemrummene står stille.
- Klik på et menulink midt i et flip: menuen lukker, og konsollen har ingen fejl.
- Skærmlæser eller Accessibility-panelet i DevTools: linkene hedder "Projects", "Let's talk" osv. og ikke enkelte bogstaver.
