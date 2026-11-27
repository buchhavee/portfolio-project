# Design: case-sider og overgangen fra cirkel eller kort til cover

Status: udkast 27. november 2026. Venter på din godkendelse. Ikke bygget endnu.

Markering: **[Dig]** er noget, du har besluttet, eller som står i briefen eller Figma. **[Forslag]** er mit valg, som du kan rette. **[Bygger]** er overladt til den, der bygger det.

## Formål

Case-siderne viser recruiters og udviklere, hvad du har designet og bygget **[Dig, briefen]**. Når man klikker på et projekt, vokser det samme billede op og bliver til case-sidens cover, ligesom på offmenu.design **[Dig]**. Overgangen viser, at det er det samme projekt, man går ind i, og den viser i sig selv, at du kan bygge bevægelse. Det vigtigste er, at den føles naturlig og flydende **[Dig]**.

## Omfang

**Med i dette skridt [Forslag]:**
- Ruten `/projects/[slug]` for alle 9 projekter
- Cover og titel
- Introduction og Details med tech-tags
- "What I did"
- Overgangen fra cirklerne i ringen og kortene i griddet

**Næste skridt [Forslag]:** kapitlerne (The problem, Design, Build med kodeudsnit, Result med knapper), "Want to see more?" med samme overgang og den rigtige tekst til projekterne.

**Ikke med:**
- Overgangen spiller ikke baglæns, når man går tilbage **[Forslag]**.
- Ingen animation, når en case-side åbnes direkte fra et link **[Forslag]**.
- Ingen særskilt 404-side **[Forslag]**. Next' standardside bruges, indtil briefens 404 bygges.

**Må ikke ske:**
- Billedet hopper, bliver strakt eller bliver sløret, når det lander.
- Man ser forsiden springe til toppen, eller case-siden dukke op, før dækket er lukket.
- Kopien slipper coveret, hvis man scroller under overgangen **[Dig]**.
- Cmd-, ctrl- og midterklik holder op med at åbne i en ny fane, eller tastaturet mister linket.

## Case-siden

Figma: desktop 17:643, mobil 17:846, i "06 Hi-fi design".

### Cover og titel

Afviger fra briefen og Figma desktop, hvor titlen står inde i coveret. Grunden er, at dine billeder er fotos, og en mørk titel forsvinder på de mørke. Valgt i skitserne som C **[Dig]**.

| | Desktop (768 px og op) | Mobil | |
|---|---|---|---|
| Top | 96 px, under logoet | 72 px, under headeren | [Dig] |
| Sider | 24 px | 16 px | [Dig, Figma] |
| Højde | `max(320px, 100svh - 340px)`, altså 560 px ved 900 px høj skærm | 480 px | [Forslag, fra skitsen; mobil fra Figma] |
| Hjørner | 28 px (`--radius-xl`), samme som kortene | samme | [Forslag] |
| Indhold | billedet med `object-fit: cover`. Pladsholder-projekter: projektets farve med mockup i midten, som i Figma | samme | [Dig, Figma] |
| Titel | under coveret, 28 px luft, `text-display-l` (6rem), mørk | `text-h1` (3.5rem), 16 px luft | [Dig, C] |

Ved 1440 × 900 slutter titlen ca. 780 px nede, og kontakt-pillen starter ved 819. Ved 1280 × 720 slutter titlen ved ca. 600, og pillen starter ved 639. **[Bygger]** tjekker, at de ikke rører hinanden på lave skærme.

### Introduction og Details (Figma 17:652, mobil 17:853 og 17:856)

- Desktop: Introduction til venstre (620 px bred, 112 px fra kanten) og Details til højre (468 px bred, 112 px fra højre kant), 128 px under titlen. Mobil: under hinanden.
- Details er en liste med rækkerne Project, Type, Timeframe, Role, Live site og Code og tech-tags under. Rækker uden værdi udelades, ligesom `metaLine` gør i dag **[Forslag]**.
- Tag-komponenten findes i Figma (05 Komponenter), men ikke i koden endnu. Den bliver et nyt atom **[Bygger]**.

### What I did (Figma 17:683, mobil 17:878)

En nummereret liste med en række pr. ting (70 px høj på desktop) og en streg imellem. Nummeret står til højre.

### Data

- `Project` i `data/projects.ts` får nye felter, som alle er valgfrie: `intro`, `role`, `period`, `live`, `code` og `did` (liste) **[Forslag]**.
- Pladsholderteksten fra Figma ligger i datafilen og ikke i komponenten, så det er tydeligt, hvad der skal skiftes ud **[Forslag]**. Om det sker med ét fælles pladsholder-objekt, er **[Bygger]**s valg.
- Ruten bruger `generateStaticParams` ud fra `projects` og `dynamicParams = false`, så en ukendt slug giver 404 **[Forslag]**.
- Header, menu, kontakt-pille og footer kommer fra layoutet som på de andre sider.

## Overgangen

### Hvor den starter

Fra cirklerne i ringen (`ProjectCircle`) og kortene i griddet (`ProjectCard`) **[Dig]**. Senere også fra kortene under "Want to see more?" **[Forslag, næste skridt]**.

### Tallene

Fundet i prototypen (`.superpowers/brainstorm/…/content/transition.html`) **[Dig]**:

| | Værdi |
|---|---|
| Vækst | 1 s, `power3.out` |
| Dække ind (forsiden toner til sidens baggrundsfarve) | 0,3 s, `power1.out`, fra klikket |
| Dække ud | 0,4 s, `power1.inOut`, fra landingen |
| Titel | glider 36 px op og toner frem over 1,2 s, `power3.out`, fra landingen |
| Hjørner | cirklen: halvdelen af dens bredde i px ned til 28 px. Kortet: 28 px hele vejen **[Forslag]** |

### Forløbet

1. **Klik.** Et almindeligt venstreklik eller Enter på linket starter overgangen. Cmd-, ctrl-, shift- og midterklik er almindelige links **[Forslag]**. Hvis `RESPECT_REDUCED_MOTION` slås til igen, er linket også almindeligt under reduced motion.
2. **Kopien.** Kildens synlige billede måles, også hvis det er forstørret af hover. En kopi med samme billede eller mockup og projektets farve lægges i et fast lag samme sted. Laget ligger over siden, men under logo, menu og kontakt-pille. Kilden skjules.
3. **Dække og vækst.** Dækket toner ind, og kopien begynder at vokse mod coverets plads med det samme.
4. **Sideskift.** Når dækket er lukket efter 0,3 s, skifter routeren side, og Next scroller den nye side til toppen. Lenis følger med (`scrollToY(0)`), når coveret er sat ind. Begge dele sker bag dækket. Forsiden scrolles ikke før skiftet, for så ville tilbage-knappen lande i toppen.
5. **Coveret overtager.** Når case-sidens cover er sat ind, følger kopien coverets rigtige placering i hver frame. Så slipper den ikke, hvis man scroller **[Dig]**.
6. **Landing.** Landingen er, når væksten er færdig, og coveret er på plads. Dækket toner ud, og titlen glider op. Når dækket er væk, fjernes kopien, og kilden vises igen. Siden under er skjult på det tidspunkt.
7. **Hvis siden ikke kommer.** Er coveret ikke kommet efter 2 s (som offmenu), toner dækket og kopien ud, og siden skifter uden landing **[Forslag]**.

### Coverets plads, før siden findes

Laget har et usynligt element med de samme klasser som coveret, og det måles ved klikket **[Forslag]**. Så kan væksten starte med det samme, som i prototypen. Når det rigtige cover er sat ind, overtager dets placering. Den anden mulighed er at vente på coveret, som offmenu gør, men så står billedet stille i mindst 0,3 s efter klikket.

### Skarphed og pladsholdere

- Cirklen har hentet en udgave på 140 px og kortet en på 66vw. Kopien viser med det samme det billede, kilden allerede har, og lægger coverets store udgave ovenpå, når den er hentet **[Forslag]**. Om den store udgave hentes allerede ved hover eller fokus, er **[Bygger]**s valg.
- Mockups (browser og telefon) skal skalere jævnt i kopien og ikke hoppe ved containerens brudpunkter **[Bygger]**.

### Prefetch

`prefetch={false}` fjernes fra cirklen og kortet, så case-siden er hentet, før man klikker **[Forslag]**. Siderne er statiske, så det er billigt.

### Afbrydelser og tilbage

- Klik under en overgang ignoreres.
- Trykker man tilbage midt i en overgang, fjernes laget med det samme, og kilden vises igen **[Forslag]**.
- Tilbage fra case-siden lander på forsiden, hvor man var. `cacheComponents` gemmer forsiden og kører dens effekter igen. Ringen, flyvningen fra ring til grid og scrollpositionen skal være som før **[Bygger]** (se `2026-11-25-hero-design.md` om `cacheComponents`).

### Mobil og tema

- Det samme forløb på touch. Ringen drejer med fuld fart, når man trykker, og kilden måles i det øjeblik.
- Dækket bruger `--color-bg-page`, så det virker i både lyst og mørkt tema.

## Tilgange

| | Hvordan | Fordele | Ulemper |
|---|---|---|---|
| **A: eget lag + GSAP (valgt)** | Et lag i layoutet, der bliver liggende, mens man skifter side. Kilden sender billede og position til laget, og GSAP lader kopien vokse til coveret. | Det er præcis det, der blev mærket og justeret i prototypen. Det virker ens i alle browsere. Cirklens hjørner glider jævnt, og GSAP er installeret. | Det er mest egen kode, ca. 150 linjer, og tilbage-knappen, Lenis og prefetch skal håndteres. |
| B: React `<ViewTransition>` | Kilde og cover får samme navn, og browseren morpher. | Klart mindst kode. | Browseren animerer skærmbilleder, så en cirkel strækkes i stedet for at blive beskåret. Hjørnerne glider ikke rigtigt. Effekten springes over, hvis siden ikke er klar, og i ældre Safari. |
| C: GSAP Flip | Flip mellem kilden og coveret på tværs af sideskiftet. | Står i briefen. | Skal alligevel have dækket fra A, og cirklens hjørner kræver ekstra arbejde. Valgt fra. |

Du valgte A 27. november 2026 **[Dig]**.

## Overladt til byggeren

- Præcise klasser og tokens fra Figma (`get_design_context` på 17:644, 17:652, 17:683, 17:846 og Tag-komponenten).
- Hvordan kilderne og laget taler sammen. Det enkleste, der virker, vælges. Den fælles frame-løkke `onFrame` i `lib/frame.ts` bruges til at følge coveret.
- En lille test af den rene beregning (position, størrelse og hjørner undervejs) med `node --test` ligesom de andre i `lib/`.
- Tjek i Chrome, Firefox og Safari og på en telefon: klik på en cirkel, der bremser, tryk på en cirkel, der drejer, kort i griddet, scroll under overgangen, tilbage midt i og efter, cmd-klik, mørkt tema og et pladsholder-projekt.
- Når designet er godkendt, tilføjes en linje under "Decisions after the brief" i `CLAUDE.md`, så titlen under coveret står der.
