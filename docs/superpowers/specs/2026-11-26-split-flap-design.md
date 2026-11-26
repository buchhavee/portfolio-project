# Design: split-flap hover

Status: tilgang og tal valgt af dig 26. november 2026. Ikke bygget endnu.

Markering: **[Dig]** er noget, du har besluttet. **[Forslag]** er mit valg, som du kan rette.

## Formål

En hover-effekt, hvor bogstaverne klapper som på en lufthavnstavle og lander på sig selv igen **[Dig]**. Den skal være let at genbruge og koste så lidt som muligt **[Dig]**.

**Må ikke ske:** navnet ændrer bredde, mens det flipper. Rester af gamle bogstaver bliver stående, fx halen på et g. Tegn som "." flipper.

## Hvor

| Sted | Tekst | |
|---|---|---|
| Logoet | "mads buchhave." | [Dig] |
| Menuens hovedlinks | Projects, About, Contact | [Dig] |
| Kontaktpillen | "Let's talk" | [Dig] |
| Kontaktkortet i pillen | overskrifterne "Email" og "Phone". Selve adressen og nummeret står stille. Hover på hele linket starter det. | [Dig, rettet efter test 26. november] |

## Effekten

Tallene er fundet i prototypen **[Dig]**:

| | Værdi |
|---|---|
| Stil | flaps: øverste halvdel klapper ned, ny nederste halvdel lander |
| Flips per bogstav | 3 |
| Tid per bogstav | 700 ms |
| Forskydning mellem bogstaver | 75 ms, fra venstre |
| Kurve | ease-out, styrke 3, svarer til GSAP `power2.out` |
| Tegn undervejs | tilfældige, fra bogstavets egen gruppe: små bogstaver, store bogstaver eller tal |
| Bredde | hvert bogstav beholder sin egen bredde |
| Perspektiv | 7.5em |
| Delelinje | 58 % fra toppen |
| Flapper | gennemsigtige, ingen baggrund |

Regler:

- Kun bogstaver og tal flipper. Alt andet står stille og bruger ikke en plads i forskydningen **[Dig]**.
- Et bogstavs forløb er én sammenhængende drejning på 180° per flip, styret af én kurve, så det glider ind uden stop undervejs.
- Det nye bogstavs top kommer frem lige over den faldende flap. Det gamle bogstavs bund forsvinder, i takt med at den nye dækker den. Når cellen er dækket, forsvinder det gamle bogstav helt, også en hale under linjen.
- I hvile er hvert bogstav ét helt tegn, så der ikke er en synlig delelinje.
- Effekten starter, når musen går ind over linket eller knappen, eller når den får fokus med tastaturet. Den starter ikke ved touch, ligesom kontaktpillen kun åbner på hover med en mus **[Forslag]**.
- Ny hover, mens effekten kører, gør ingenting **[Forslag]**.
- En skærmlæser læser hele ordet. Bogstavboksene er skjult for den.
- Reduced motion følger `STILL` i `lib/motion.ts` ligesom resten af siden. Den ignoreres indtil videre **[Dig, 26. november]**.

## Tilgange

- **GSAP styrer forløbet. Valgt [Dig].** Ét `gsap.to` over bogstaverne med `stagger` og `power2.out`. `useGSAP` rydder op, og det følger mønsteret fra `useUnfold`, der animerer tal og tegner i `onUpdate`. Det kører på GSAP's eget ur ligesom menukortet, ikke på `lib/frame.ts` som Lenis og ringen. Det betyder ikke noget her, fordi effekten ikke er bundet til scroll.
- **Egen requestAnimationFrame-løkke som i prototypen.** Fravalgt: et ekstra ur ved siden af GSAP, og vi skriver selv kurver og oprydning.
- **Brikker i React Bits' stil.** Prøvet i prototype 2 og fravalgt af dig.

## Teknik [Forslag]

- `components/atoms/flap-text.tsx`: en client-komponent, som lægges om teksten inde i det link eller den knap, der allerede findes, fx `<FlapText text="mads buchhave." />`. Den lytter på nærmeste `a` eller `button`.
- `lib/flap.ts`: rene funktioner til et tegns sekvens og til, hvor meget af en halvdel flappen dækker i perspektiv. De testes i `lib/flap.test.mjs` med `npm test`, ligesom `lib/orbit.ts`.
- CSS til halvdelene ligger i `app/globals.css` under `@layer components`.
- Kun bogstaver og tal får de fem spans, mens andre tegn forbliver almindelig tekst.
- Logoet på mobil: forholdet 7.41 mellem bredde og skriftstørrelse i `logo.tsx` skal måles igen, fordi kerning går tabt, når bogstaverne deles op.

## Overladt til den, der bygger

Den præcise JSX-struktur, navne på klasser og hvordan linjehøjden læses til perspektivberegningen.
