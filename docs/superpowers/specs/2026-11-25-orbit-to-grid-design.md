# Design: fra ring til projektgrid

Status: godkendt 25. november 2026.

Markering: **[Dig]** er noget, du har besluttet, eller som står i briefen eller Figma. **[Forslag]** er mit valg, som du kan rette.

## Formål

Når man scroller væk fra hero'en, skal ringen tage fart, og projektcirklerne skal sendes ned i Projects-sektionen, hvor hver cirkel bliver til sit eget kort **[Dig]**. Det binder hero og projekter sammen i én bevægelse og viser i sig selv, at du kan bygge bevægelse. Det vigtigste er stadig, at det føles naturligt og flydende **[Dig]**.

## Omfang

**Med:** Projects-sektionen som i Figma, men med 9 kort. Overgangen fra ring til kort. Bremse på hurtigt scroll med mus og trackpad. Lenis. Lyst og mørkt tema. Reduced motion.

**Ikke med:** About-teaser, footer og case-sider. Overgangen fra kort til case-side.

**Må ikke ske:** hak eller hop i flyvningen, at et kort står halvt udfoldet, når man lander på `/#projects`, eller at man ikke kan komme ud af overgangen. Kode og grafik fra offmenu kopieres ikke.

## Ændringer i briefen og Figma

- Briefen siger "No scroll-driven hero animation". Den linje rettes i CLAUDE.md under "Decisions after the brief", når dette design er godkendt.
- Figma viser 6 kort. Det skal være 9, ét pr. cirkel **[Dig]**. Figma er ikke opdateret endnu.
- Hero-designet siger 8 cirkler på mobil. Nu er der 9 også på mobil, så alle cirkler har et kort **[Forslag]**. Med 72 px og ringens mobilradius er der stadig ca. 40 px mellem cirklerne.

## Projects-sektionen

Udseende fra Figma, node `17:601` (desktop) og `17:803` (mobil) **[Dig]**.

- **Overskrift:** "Projects" i Display/XL (240 px, medium, linjehøjde 0,9, -4 % spacing) med `text/display-faded` og en gradient ned mod sidens baggrund. På mobil 96 px. Typografien tilføjes som token med Figmas navn.
- **Grid:** 6 kolonner, 16 px mellemrum, 24 px kant, rækker på 560 px. Rækkerne er 2, 3, 2, 2 kort **[Dig]**: 2/3 + 1/3, så 1/3 + 1/3 + 1/3, så 1/2 + 1/2, så 1/3 + 2/3.
- **Kort (Bento Card):** projektets farve, artwork centreret, 28 px hjørner. På hover glider et info-panel op med titel, en linje med metadata og en pil, som Figma beskriver. Panelet virker først, når kortet er landet.
- **Mobil:** én kolonne. Kortet er 280 px højt med browser-mockup og 358 px med telefon-mockup. Titel og metadata står under kortet.
- **Tablet:** byggeren vælger, hvornår griddet går fra 6 til færre kolonner. Intet kort må blive så smalt, at telefon-mockuppen ikke kan være der.
- **Indhold:** 9 projekter. C.C. Design A/S og 9t7 er rigtige. De 7 andre er pladsholdere med Figmas 6 farver (`#e6dff6`, `#dcefe1`, `#1e2a6b`, `#f7e4d4`, `#d6e8f7`, `#f1eec6`) og `#f6dfe6` **[Forslag]**, skiftevis med browser- og telefon-mockup. Pladsholdernes metadata er Figmas "School · 2026 · React, TypeScript".
- Kortene linker til `/projects/<slug>` som cirklerne og giver 404, indtil case-siderne findes.

## Overgangen

Referencen er prototypen `orbit-to-grid/index.html` i sessionens scratchpad. Den er midlertidig, så tallene og formlerne står herunder.

### Forløbet

1. **Ringen spinder op.** Hero'en står fast, mens man scroller 85 % af en skærmhøjde. Scroll drejer ringen hurtigere og hurtigere, og ringen vokser. Sætningen toner ud.
2. **Første række kastes.** Når hero'en slipper, glider de to cirkler, der hører til række 1, fra ringen ned mod deres pladser. Imens drejer ringen videre, så banen bliver en spiral.
3. **Landing.** Cirklen vokser fra rund til kortets form: bredden først, højden lidt efter, og hjørnerne går fra rund til 28 px.
4. **Række 2-4 falder ned, når man når dem** **[Dig]**. Ringen er da scrollet ud af billedet, så de kommer oppefra.

Alt følger scroll begge veje. Scroller man op, flyver kortene tilbage i ringen.

### Tal

| | Værdi | |
|---|---|---|
| Hero'en står fast i | 85 % af skærmhøjden | [Dig] |
| Omgange fra scroll | 1,25 | [Dig] |
| Ekstra fart, når den er spundet op | 6× | [Dig] |
| Højeste fart fra scroll | 0,7 omgange/s, blødt loft | [Dig] |
| Ringens størrelse ved fuld fart | 1,2×, men højst til skærmkanten. Den vokser ikke på mobil | [Dig], loftet er [Forslag] |
| Første cirkel slipper | 50 px efter hero'en slipper | [Dig] |
| Afstand mellem cirklerne i en række | 48 px scroll | [Dig] |
| Kurvens blødhed | 3 | [Dig] |
| Tyngde | 0,5 | [Dig] |
| Cirklen lander, når pladsen er ved | 95 % af skærmhøjden (var 80 %, ændret 26. november) | [Dig] |
| Cirklens størrelse ved landing | 200 px, højst kortets mindste side | [Dig] |
| Kortet begynder at vokse ved | 115 % (var 100 %) | [Dig] |
| Kortet er færdigt ved | 85 %. Først 40 %, så 60 %, så 70 %: info-panelet skal komme, mens kortet er langt nede på skærmen, og række 1 skal stadig ses, når række 2 er færdig (ændret 26. november). Skal være under landingen på 95 % | [Dig] |
| Bredden fører højden | 0,14 | [Dig] |
| Lenis lerp | 0,2 | [Dig] |
| Eftergang | 300 ms | [Dig] |

Procenterne er, hvor kortets midte står på skærmen, regnet fra toppen.

### De to første cirkler nederst i kastet: udskudt

Uden styring kan række 1's cirkler sidde øverst på ringen, når hero'en slipper. Så trækkes de ud af skærmen, og der er tomt nedenunder i et halvt sekund.

Forslaget var at styre ringen, så de to er nederst, når de slipper. Det blev taget ud under planlægningen den 26. november. Styringen skal forudsige ringens vinkel ved slip, men loftet på 0,7 omgange/s æder netop den fart, den regner med.
- I en simulering ramte den 0° uden loftet, men 21° ved siden af med det.
- Med dine tal er loftet i spil ved næsten al scroll.

Vurderes igen, når overgangen kører på den rigtige side.

### Formlerne fra prototypen

`H` er hero'ens højde, `s` er udglattet scroll, og `inOut(t, n)` er `t < ½ ? ½(2t)ⁿ : 1 − ½(2(1−t))ⁿ`.

- **Udglatning:** `s += (scroll − s) · (1 − e^(−dt/0,3 s))`. `dt` kommer fra skærmens tidsstempler, se Teknik.
- **Ringen:** `R = 0,85·H + 50`, `x = s / R`, `wind = x < 1 ? x² : 1 + 2(x − 1)`.
  - Hver frame: `vinkel += dt · (2π/60) · (1 + 6·clamp(x)²) + L · tanh(skub / L)`, hvor `skub = 2π · 1,25 · Δwind` og `L = 2π · 0,7 · dt`.
  - Ringens størrelse: `mix(1, 1,2, inOut(clamp(x), 2))`, med loftet ovenfor.
  - Ringens midte på siden: `min(scroll, 0,85·H) + H/2`. Her bruges rå scroll, fordi hero'en er sticky.
  - Sætningens opacitet: `1 − 1,6x`.
- **Kastet:** `F = (række 1's midte − 0,8·H) − R`, mindst 200 px.
  - Hver cirkel starter ved `kortets midte − 0,8·H − F + kolonne · 48`.
  - `p = clamp((s − start) / F)`, `ex = inOut(p, 3)`, `ey = inOut(p^1,5, 3)`.
  - Positionen er `ringpunkt · (1 − e) + kortets midte · e` for hver akse.
  - Diameteren er `mix(størrelse · dybde, 200, ex)`.
- **Landingen:** `g = clamp((s − (kortets midte − 1,15·H)) / (0,3·H))`.
  - `gw = inOut(clamp(g / 0,86), 2)` og `gh = inOut(clamp((g − 0,14) / 0,86), 2)`.
  - Bredden er `mix(d, kortbredde, gw)`, højden `mix(d, korthøjde, gh)`, og hjørnet `mix(min(b, h)/2, 28, gh)`.
- **Artwork:** et billede skaleres til `max(b, h) / max(kortbredde, korthøjde)`. En mockup skaleres fra 0,15 (browser) eller 0,2 (telefon) gange `d/100` op til sin størrelse i kortet.

### Bremse på hurtigt scroll [Dig]

- Mus og trackpad kan højst flytte siden 1500 px/s, fra toppen til række 1 er færdig.
  - Hver scroll-hændelse må bruge af et budget, der fyldes med 1500 px pr. sekund og højst rummer 150 px.
  - Hændelsen skaleres blødt med `budget · tanh(delta / budget)`.
- Uden for den zone er scroll frit.
- Tastatur, scrollbar og touch bremses ikke **[Forslag]**. Lenis kan tage over på touch, men det føles normalt dårligere på iPhone. NN/g anbefaler også at lade være på mobil, se nedenfor.

**Hvad andre skriver:**
- [NN/g, "Scrolljacking 101"](https://www.nngroup.com/articles/scrolljacking-101/) (Sara Paul, august 2023) er en brugertest af sites som Apple, BBC og Crypto.com.
  - De fleste deltagere blev mindst lidt desorienterede, især når forløbet var langt, når der skulle læses tekst undervejs, og når de havde en opgave i stedet for bare at kigge rundt.
  - Det blev bedst tolereret, når det var kort og afslørede relevant indhold trin for trin.
  - De anbefaler at undgå det på mobil, at have fast navigation som udvej og at teste farten med brugere.
- [GSAP-forummet](https://gsap.com/community/forums/topic/32882-i-want-to-slow-down-my-scrubbed-scrolltrigger-animation-without-adjusting-the-height-of-the-sections/) (GSAP's egen administrator-konto, juni 2022): brugere bliver "very annoyed", når browseren ikke flytter sig så hurtigt, som de beder om. Hans løsning er at gøre sektionen længere i stedet.
- WCAG har ingen regel, der nævner det direkte. 2.3.3 (AAA) handler om bevægelse udløst af scroll.

**Det taler for vores udgave:** zonen er kort, der er ingen tekst at læse undervejs, den viser projekterne trin for trin, normal fart bremses ikke, mobil er fri, og logo, menu og kontakt-pille står fast. **Det taler imod:** den, der vil hurtigt ned, mærker modstand. Få 2-3 personer til at prøve den, før den går live **[Forslag, som NN/g]**.

### Opførsel

- **`/#projects`** lander der, hvor række 1 er færdig, ikke ved sektionens top. Ellers står kortene halvt udfoldet.
- **Hover på ringen:** bremsen virker kun, mens siden er scrollet helt til toppen. Navnene under cirklerne og mobilens titel ved bunden skjules, når man scroller.
- **Introen** er uændret. Overgangen starter fra den fart, ringen har.
- **Indlæsning midt på siden:** alt beregnes ud fra scroll, så kortene står rigtigt med det samme.
- **Tastatur:** kortene er almindelige links i griddet og kan altid nås. Mens et kort er i ringen, er det usynligt, men ikke `visibility: hidden`. Fokus scroller det frem, og så lander det.
- **Reduced motion:** hero'en står ikke fast, ringen står stille som i dag, kortene står færdige, og Lenis glatter ikke scroll. Bremsen er slået fra.
- **Uden JavaScript:** kortene vises færdige, og ringen står, som CSS'en tegner den.

## Teknik

**Nye pakker:** `lenis`. Ikke andre.

### Overvejede måder

1. **Én egen løkke til ring og kort (valgt af dig).** Én `requestAnimationFrame`-løkke driver Lenis, ringen og kortene med skærmens tidsstempler. GSAP styrer stadig hover-bremsen og introen ved at tweene et fart-tal, som løkken læser.
   - Målt i prototypen: de største hop i størrelse var 2,6 px pr. frame mod 10-15 px med GSAP's ticker, som bruger `Date.now()`.
2. **GSAP ScrollTrigger.** Følger briefens "Lenis synced with ScrollTrigger" ordret og regner start og slut om ved resize. Men den kører på GSAP's ur. Og fordi kortene følger en ring, der drejer, skal de alligevel tegnes i en egen `onUpdate`. ScrollTrigger kan stadig kobles på senere sektioner.
3. **Ren CSS (scroll-drevne animationer).** Fravalgt, fordi den ikke kan følge en ring, der drejer.

### Hurtigt scroll, overvejet i prototypen

Målt med et hårdt trackpad-ryk på ca. 3000 px:

| | Resultat |
|---|---|
| A: animationen må højst gå så hurtigt | Siden stod tom længere (ca. 1,1 s mod 0,75 s). Fravalgt |
| **B: scrollet bremses (valgt af dig)** | Rykket flytter siden 697 px i stedet for 3080 |
| C: et hurtigt ryk gribes og afspiller overgangen i eget tempo til Projects | Hele forløbet vises på ca. 2 s. Fravalgt af dig |
| Loft over eftergangen | Sparede højst 0,3 s, men gjorde cirklerne 2-3 gange hurtigere. Fravalgt |

### Sådan skrives det

- **Det rigtige kort flyver.** Kortet ligger i griddet og trækkes op i ringen med `transform`. Et `clip-path: inset(... round r)` gør det rundt, og artwork skaleres indeni. Ringens cirkel vises, til kastet starter, og derefter kortet. Skiftet kan ikke ses: på nærbilleder ved 2× er de ens.
- **Kun `transform`, `clip-path` og `opacity` pr. frame.** Ingen layout. Positioner måles ved resize, når skrifterne er hentet, og når griddet ændrer størrelse. Prototypen brugte ca. 1,1-1,4 ms pr. frame i alt.
- **Kortet tegnes i fuld størrelse og skaleres ned**, så det er skarpt, når det lander. Landede kort skrives ikke igen.
- **Hero'en** ligger i et spor, der er `100svh + 85 %` højt, og er `sticky` i det. `overflow-clip` flyttes fra hero'en til `main` som `overflow-x: clip`, så cirklerne kan forlade hero'en, og ringen stadig må gå ud over kanten på mobil.
- **Bremsen** ligger i Lenis' `virtualScroll`. Lenis har ingen indbygget topfart.
- Ring og kort ligger i hver sin sektion, men styres af den samme løkke. Hvordan løkken finder dem, er overladt til byggeren.

### Filer

- `data/projects.ts`: 9 projekter. Nye felter: artwork (billede, browser eller telefon) og metadata-linjen. `color` bliver kortets baggrund.
- `components/organisms/orbit.tsx`: 9 pladser, én pr. projekt. Gentagelser og den skjulte 9. cirkel på mobil forsvinder.
- `components/organisms/hero.tsx`: spor og sticky.
- `hooks/use-orbit.ts`: skrives om til den fælles løkke. Intro, hover-bremse og mobilens titel bevares.
- `lib/orbit.ts` og `lib/orbit.test.mjs`: formlerne fra prototypen med tests. Mindst: kortet står på ringpunktet ved `p = 0` og fyldt ud ved `g = 1`, kurverne starter og slutter blødt, farten har sit loft, og bremsen holder sig under 1500 px/s.
- Nye: Projects-sektionen (organism), kortet (molecule) og browser- og telefon-mockuppen (atom), som både cirkel og kort bruger.
- `app/page.tsx`, `app/globals.css`, `package.json` og CLAUDE.md.

Overladt til byggeren: navne på komponenter og hooks, hvordan løkken finder ring og kort, og tablet-kolonner.

## Færdigt når

- `npm run build`, `npm run lint` og `npm test` består.
- Med dine tal ser forløbet ud som i prototypen ved 1440 × 900 og 390 × 844.
- Ingen frames over 2 ms main-thread-arbejde fra overgangen i Chrome. Ingen hop over 3 px pr. frame i en jævn scroll.
- `/#projects`, scroll op, tastatur og reduced motion er prøvet.
- Ingen cirkel og intet kort bliver klippet af skærmkanten på desktop ved 1024, 1440 og 1920 px.
- Chrome og Firefox er prøvet. Safari og en rigtig telefon mangler.

## Mangler fra dig

1. Større billeder af C.C. Design og 9t7 til kortene. Det største kort er 920 × 560 px, altså 1840 × 1120 ved 2×. De nuværende er 480 × 480 og bliver slørede.
2. År og teknologier til metadata-linjen for de to rigtige projekter.
3. Figma med 9 kort, hvis Figma fortsat skal være facit.

## Rækkefølge

1. Data og Projects-sektionen uden animation. Her kigger du.
2. Lenis, den fælles løkke, og ringen flyttet over i den uden ændringer, man kan se.
3. Overgangen med dine tal. Her kigger du.
4. Bremsen, `/#projects`, reduced motion og test i browserne. Her kigger du.
