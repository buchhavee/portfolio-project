# Design: hero og menu

Status: godkendt og bygget 25. november 2026.

Markering: **[Dig]** er noget, du har besluttet, eller som står i briefen eller Figma. **[Forslag]** er mit valg, som du kan rette.

## Formål

Hero'en er det første, recruiters og udviklere ser, når du søger praktik. Den skal vise dit navn, én sætning om dig og dine projekter, og den skal i sig selv vise, at du kan bygge bevægelse. Det vigtigste er, at animationen føles så naturlig og flydende som muligt **[Dig]**.

## Omfang

**Med:** farver og skrift fra Figma, logo, ring med cirkler, sætningen, menu og kontakt-pille. Lyst og mørkt tema.

**Ikke med:** Projects-griddet, About, footer, case-sider og overgangen fra cirkel til projektside. Lenis og Flip installeres først, når de bruges.

**Må ikke ske:** hak, hop eller brat stop i ringen. Cirkler, der løber fra musen. Kode, tekst eller billeder kopieret fra offmenu.

## Ringen

Referencen er prototypen `orbit-2.html`. Værdierne herunder er dem, den starter med.

| | Værdi | |
|---|---|---|
| Antal | 9 på desktop, 8 på mobil (højst 640 px bred) | [Dig] |
| Størrelse | 100 px, ens for alle | [Dig] |
| Størrelse på mobil | 72 px. Ringen må gå lidt ud over skærmens kant | [Dig] |
| Fart | konstant, 60 sekunder pr. omgang | [Dig] |
| Dybde | 1,15 nederst, 0,75 øverst og derfor 0,95 i siderne | [Dig] |
| Hover | cirklen vokser 22 %, navnet toner frem under den. Figma siger 12 % | [Dig] |
| Hover-tid | 600 ms. Figma siger 200 ms, men prototypen bruger 600 | [Forslag] |
| Opbremsning | 1,6 s til stop, når musen rammer en cirkel | [Dig] |
| Acceleration | 2,4 s tilbage til fuld fart | [Dig] |
| Intro | ringen fader ind over 1,5 s og falder fra 30× til normal fart over 3 s | [Forslag] |

**Ellipsens radius**
- Desktop, vandret: `max(27.8vw, min(330px, 50vw - 70px))`
- Desktop, lodret: `36.7 %` af hero-højden, men højst `50 %` minus 120 px. Hero'en er mindst 560 px høj
- Mobil, vandret: `45vw`
- Mobil, lodret: det samme som vandret, så ringen er rund, men højst `50 %` af hero-højden minus 153 px

Ved 1440 × 900 giver det Figmas 400 × 330 px. På lave skærme bliver ringen fladere, så det nederste navn ikke klippes.

**Opførsel**
- Hele ringen bremser, når musen eller tastaturfokus rammer en cirkel. En ny bevægelse starter altid fra den aktuelle fart.
- Cirklen glider 17 px, mens ringen bremser. Derfor starter hover kun på selve cirklen, men den holder fast i en usynlig kant på 24 px omkring den. Ellers slipper cirklen, når musen rammer de yderste 2-8 px.
- Navnet er 14 px uanset dybde og står 8 px under den forstørrede cirkel.
- På touch er der ingen hover. Et tryk åbner projektet.
- Introen afspilles én gang pr. sideindlæsning, ikke når man kommer tilbage til forsiden. `cacheComponents` skjuler siden i stedet for at fjerne den og kører effekter igen, så det skal håndteres.
- Ring og sætning er skjult fra første frame, men kun når JavaScript er slået til, og reduced motion er slået fra.

**Projekter**
- To projekter i datafilen indtil videre: C.C. Design A/S og 9t7, begge redesign af website. Billederne er beskårne udsnit af skærmbilleder. **[Dig]**
- Ringen gentager listen, til den er fuld. Gentagelserne springes over af tastatur og skærmlæser. **[Forslag]**
- Datafilen har `slug`, `title`, `type`, `image` og `color` (vises, til billedet er hentet). Resten af briefens felter kommer med det trin, der viser dem. **[Forslag]**
- Mobil: når en cirkel passerer bunden, vises projektets titel i 3 sekunder, midt på skærmen under cirklen. Den følger ikke cirklen. **[Dig]** De 3 sekunder er omregnet til en vinkel (9° på hver side af bunden), så titlen følger ringens ur og ikke en timer.
- Cirklerne linker til `/projects/<slug>`, som giver 404, indtil case-siderne findes.

## Sætningen

- Desktop: "Frontend student building thoughtful, fast and playful web experiences." 24 px, medium, højst 416 px bred (40 % af skærmen på tablet).
- Mobil: uden ", fast and playful". 16 px, medium.
- Ordene stiger op bag hver sin maske: 600 ms, 30 ms mellem ordene, start efter 500 ms. Masken har luft, så g, p og y ikke klippes.

## Menuen

Indhold og udseende er fra Figma **[Dig]**, og bevægelsen følger offmenu **[Dig]**.

**Udseende:** Knap på 44 px med 3 × 3 prikker på 5 px. Kortet er 300 px bredt, 24 px luft, 28 px hjørner, 16 px fra kanten. På mobil fylder kortet skærmen minus 8 px i hver side, og siden bag dæmpes. Kortet bruger `bg/inverse`, så det er mørkt i lyst tema og hvidt i mørkt tema.

**Indhold:** Projects, About, Contact. Derunder "Elsewhere": GitHub, LinkedIn, Resume (PDF).

**Links:** Projects går til `/#projects` og About til `/about`, som begge først virker, når de er bygget. Contact åbner en mail, indtil footeren findes, og går derefter til den. **[Forslag]**

**Bevægelse**
1. Hover på knappen: en bølge går diagonalt hen over prikkerne, 60 ms pr. trin. Hjørnerne bliver svage, så prikkerne danner et plus.
2. Åbning: samme bølge, men kanterne bliver svage (25 %), så prikkerne danner et X.
3. Kortet vokser fra knappen: bredden fører, højden følger 0,1 s efter, i alt 0,6 s. Lukker på 0,5 s.
4. Links toner ind ét ad gangen med 40 ms mellemrum. Det er fra Figma; offmenu toner hele indholdet ind på én gang. **[Forslag]**
5. Når musen er på et link, dæmpes de andre til 50 %.

**Lukker ved** klik udenfor, Escape, klik på et link eller efter 1000 px scroll. Escape sender fokus tilbage til knappen. Knappen har navn og `aria-expanded`, og lukkede links kan ikke nås med tastatur.

Menuen åbner kun, når man trykker på knappen. **[Dig]**

## Logo og kontakt-pille

- Logo: "mads buchhave.", 36 px, medium, øverst til venstre. Det linker til forsiden og bliver lidt mindre på skærme under 360 px.
- Pille: "Let's talk" uden prik, nederst til venstre. Folder sig ud på hover som menuen og viser Email og Phone. Touch og tastatur trykker på den. **[Dig]** Knappens kanter står stille, mens kortet vokser opad.
- Logo, menu og pille ligger fast på skærmen og findes på alle sider. **[Forslag, som offmenu]**

## Farver og tema

Semantiske tokens med Figmas CSS-navne. Temaet følger systemet, til man bruger knappen, se `2026-11-25-theme-switch-design.md`.

| Token | Lys | Mørk |
|---|---|---|
| `--color-bg-page` | `#fdfdfc` | `#0a0a08` |
| `--color-bg-surface` | `#ffffff` | `#12110d` |
| `--color-bg-muted` | `#ededea` | `#2a2925` |
| `--color-bg-inverse` | `#12110d` | `#ffffff` |
| `--color-text-primary` | `#12110d` | `#fdfdfc` |
| `--color-text-secondary` | `#6e6e67` | `#a3a39c` |
| `--color-text-inverse` | `#fdfdfc` | `#12110d` |
| `--color-text-inverse-secondary` | `#a3a39c` | `#6e6e67` |
| `--color-text-display-faded` | `#ededea` | `#2a2925` |
| `--color-text-on-accent` | `#ffffff` | `#ffffff` |
| `--color-border-default` | `#deded9` | `#2a2925` |
| `--color-border-inverse` | `#2a2925` | `#deded9` |
| `--color-accent-default` | `#3355ff` | `#5c78ff` |
| `--color-accent-hover` | `#2240e0` | `#3355ff` |

Skriften er Manrope gennem `next/font/google`, så ingen fontfiler lægges i repo'et.

## Reduced motion

Ringen står stille, men beholder dybden. Sætningen vises med det samme. Hover og menu skifter uden animation.

## Teknik

Nye pakker: `gsap` og `@gsap/react`. Ikke andre.

**Overvejede måder**
1. **GSAP med ét fælles ur (valgt af dig).** Blød opbremsning og intro er ændringer af urets fart. Det kører på hovedtråden, men koster omkring 1 ms pr. frame.
2. **Ren CSS.** Mest robust mod hak, men hover-pausen bliver et brat stop, og ellipsen kræver flere lag.

**Sådan skrives positionen**
- Hver cirkel får sin egen `transform` hver frame. Én fælles CSS-variabel på ringen kostede knap tre gange så meget style-arbejde.
- Navnets størrelse udlignes kun på den cirkel, der er hover på. At gøre det for alle hver frame fordoblede prisen.
- Hover ligger på et indre element, så den ikke rører positionen.
- Ellipsens mål ligger i CSS, så ringen står rigtigt uden JavaScript.

- Links i ringen skal have `text-decoration: none`. Tailwinds standard er `inherit`, og den får browseren til at genberegne alle links i hver frame (2,9 ms mod 0,4 ms).

**Opbygning**

Let udgave af atomic design. Niveauerne svarer til Figmas komponenter, og `app/` fungerer som templates og pages.

- `components/atoms`: `logo`, `menu-dots`, `hero-sentence`. Én ting, der ikke giver mening at dele. Importerer ingen andre komponenter.
- `components/molecules`: `project-circle`, `menu-card`, `contact-pill`. Få dele, der løser én opgave sammen. Må importere atoms.
- `components/organisms`: `header`, `menu`, `hero`, `orbit`. En hel del af siden. Må importere molecules, atoms og andre organisms.
- `hooks/use-orbit.ts`: ringens bevægelse
- `hooks/use-unfold.ts`: kort, der folder sig ud fra en knap. Bruges af menuen og pillen
- `lib/orbit.ts` med `lib/orbit.test.mjs`: position og dybde, testet med Nodes indbyggede testkører
- `lib/gsap.ts`: GSAP og plugins, samlet ét sted
- `data/projects.ts` og `data/site.ts`: indhold, mail, telefon og links, hvert ét sted

En komponent er en serverkomponent, medmindre den har tilstand eller animation.

Overlades til byggeren: komponenternes indre opdeling, klassenavne og præcis easing i menuen.

## Færdigt når

- `npm run build`, `npm run lint` og testen består.
- Dybden måler 1,15, 0,95 og 0,75, og omgangen går rundt uden hop.
- Ingen cirkler rammer hinanden eller sætningen på 360, 390, 641, 768, 1024, 1440 og 1920 px bredde.
- Menuen kan betjenes helt med tastatur.
- Begge temaer og reduced motion er set i browseren.
- Firefox er prøvet. Safari og en rigtig telefon mangler.

## Mangler fra dig

1. En CV-fil. Links uden adresse vises ikke.
2. Figma skal opdateres, hvis den fortsat skal være facit: cirkler på 100 px, forstørrelse på 22 %, hover-tid på 600 ms, pillen uden prik og den runde ring på mobil.

## Rækkefølge

1. Tokens, skrift og datafiler
2. Ring og sætning. Her kigger du.
3. Logo, menu og pille. Her kigger du igen.
