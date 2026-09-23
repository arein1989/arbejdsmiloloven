# Handlingsplan-assistenten skal svare rigtigt

I dag kan man kun komme videre på Handlingsplan-siden ved at uploade en PDF. Teksten i den hvide boks er statisk, og knappen er slukket, indtil en fil er valgt. Efter den første analyse "glemmer" assistenten desuden selve PDF'en, så opfølgende spørgsmål besvares uden at kigge i dokumentet igen.

Planen gør assistenten til en rigtig samtalepartner om APV og rapporter.

## Det brugeren får

1. **Spørgsmålsfelt på velkomstskærmen**
   Under den hvide boks kommer et skrivefelt: "Spørg om APV, handlingsplaner eller rapporter …". Man kan skrive et spørgsmål og sende det med det samme — helt uden at uploade noget. Samtalen åbner, og assistenten svarer.

2. **Upload bliver valgfrit, ikke et krav**
   Uploader man en PDF, analyseres den som i dag. Gør man ikke, kan man stadig spørge frit. Knappen "Upload din pdf først ……" bliver kun vist, når feltet er tomt og der ikke er valgt en fil.

3. **Assistenten husker PDF'en gennem hele samtalen**
   Teksten fra den uploadede PDF gemmes på samtalen, så alle opfølgende spørgsmål — også efter at siden er genindlæst — besvares med dokumentet som grundlag. I dag forsvinder det efter første svar.

4. **Skarpere svar om APV og rapporter**
   Assistentens instruks udvides, så den kender APV-processen (kortlægning, vurdering, prioritering, handlingsplan, opfølgning), svarer konkret på spørgsmål om rapporter og altid henviser til lovgrundlag med paragraf og link.

## Teknisk

- `src/components/PlanWelcome.tsx`: nyt kontrolleret tekstfelt + send-handling. Ved afsendelse oprettes en tråd via `createThread`, spørgsmålet gemmes som "pending question" (samme mønster som `pending-plan-file.ts`, ny nøgle i samme IndexedDB-store), og der navigeres til `/chat/plan/$threadId`. Knappetekst/disabled-logik afhænger nu af `file || question.trim()`.
- `src/lib/pending-plan-file.ts`: tilføj `savePendingPlanQuestion` / `takePendingPlanQuestion`.
- `src/routes/chat.$botId.$threadId.tsx`: den eksisterende pending-effekt udvides til også at sende en ventende tekstbesked (fil og/eller spørgsmål i én `sendMessage`).
- PDF-hukommelse: i `src/routes/api/chat.ts` udtrækkes tekst fra en indkommende PDF-fildel og gemmes én gang på tråden (ny `document_text`-kolonne på `threads` via migration, med GRANT som eksisterende tabeller). Ved hver efterfølgende forespørgsel hentes teksten og lægges ind som ekstra system-kontekst, så modellen altid har dokumentet. Udtrækning sker med et Worker-kompatibelt, rent JS-bibliotek (`unpdf`); slår udtrækningen fejl, fortsætter samtalen uden dokumenttekst i stedet for at fejle.
- `src/lib/bots.ts`: udvidet `system`-prompt for `plan`-botten (APV-faser, rapportstruktur, lovhenvisninger, opklarende spørgsmål).
- Fejl fra AI-kaldet vises i samtalen i stedet for at forsvinde i konsollen.

## Verificering

Playwright på `/chat/plan`: stil et spørgsmål uden upload og bekræft at der kommer et svar; upload derefter en PDF, stil et opfølgende spørgsmål, genindlæs siden og bekræft at assistenten stadig refererer til dokumentet.
