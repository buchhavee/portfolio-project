# Design: theme switch

Status: tal valgt af dig og bygget 25. november 2026.

Markering: **[Dig]** er noget, du har besluttet. **[Forslag]** er mit valg, som du kan rette.

## Formål

En knap i headeren, der skifter mellem lyst og mørkt tema, som på offmenu.design **[Dig]**. Det vigtigste er, at skiftet føles flydende.

**Må ikke ske:** blink ved indlæsning, dele af siden der skifter i utakt, hak i ringen. offmenus tegning og kode kopieres ikke.

## Knappen

- Til venstre for menuknappen, 44 px, samme højde. Den ligger oven på menukortet, når menuen er åben, og skifter farve sammen med prikkerne. **[Forslag, som offmenu]**
- Et klik på den lukker ikke menuen. **[Forslag]**
- Ikonet er en skive på 16 px. En skygge på 14 px glider lige ind fra øverste højre hjørne og gør den til en måne.
- Navn til skærmlæser: "Switch theme".

| | Værdi | |
|---|---|---|
| Hover | viser hele den modsatte tilstand på 650 ms | [Dig] |
| Ikon, når musen slipper, og på touch og tastatur | 1300 ms | [Dig] |
| Skyggens drejning | 0°, altså lige | [Dig] |
| Ikonets easing | CSS `ease-out` | [Dig] |
| Sidens farveskift | 550 ms, CSS `ease` | [Dig] |
| Klik, mens musen er over | ikonet vender, så det igen viser, hvad et klik giver | [Forslag, som offmenu] |

## Temaet

- Følger systemet, til man klikker. Derefter huskes valget i `localStorage`. **[Forslag]** offmenu starter altid lyst og glemmer valget.
- Et script i `<head>` sætter temaet, før siden males.
- Er lagring blokeret, virker knappen stadig, men valget glemmes ved genindlæsning.
- Reduced motion: farver og ikon skifter uden animation.

## Logo på mobil

Logo og to knapper kan ikke være der under 395 px. Logoet skaleres ned: 35 px ved 390, 33 ved 375, 31 ved 360, 26 ved 320. **[Forslag]** Det afløser 32 px under 360 px.

## Teknik

**Overvejede måder**
1. **Animér selve farvevariablerne (valgt).** Hver farve står én gang med `light-dark()` og registreres med `@property`. Alt skifter i takt, også det, der bygges senere. Målt: 1-2 ms ekstra pr. frame under skiftet, ingen tabte frames.
2. **Fade på hvert element**, som offmenu. Dele skifter let i utakt, og hver ny sektion skal huske det.
3. **View Transitions.** Fryser et billede af siden, så ringen ville stå dobbelt et øjeblik.

**Menuprikkernes farve** har i dag en forsinkelse på 350 ms, som passer til kortet, der lukker. Den ville også forsinke temaskiftet, så prikkerne var usynlige i ca. 0,6 s. Derfor animeres i stedet et tal, `--on-card`, fra 0 (siden) til 1 (kortet), og farven blandes ud fra det.

## Rækkefølge

1. `app/globals.css`: `light-dark()`, `@property`, `data-theme`, `dark:`-variant og `--on-card`
2. `app/layout.tsx`: scriptet i `<head>`
3. `components/atoms/theme-switch.tsx`, og ind i `menu.tsx`
4. `logo.tsx` og `header.tsx`: skalering på mobil

## Færdigt når

- `npm run build`, `npm run lint` og `npm test` består.
- Alle farver er de samme som før i begge temaer.
- Valget overlever genindlæsning uden blink, både i dev og build.
- Prikker og måne er synlige hele vejen gennem et skift, også med åben menu.
- Intet overlap i headeren på 320, 360, 375, 390 og 430 px.
- Chrome og Firefox er prøvet. Safari og en rigtig telefon mangler.

## Mangler fra dig

Figma har ingen switch. Den skal tegnes ind, hvis Figma fortsat er facit.
