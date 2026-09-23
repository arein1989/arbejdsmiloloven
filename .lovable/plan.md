# Stil spørgsmål uden at uploade en PDF

I dag kræver Handlingsplan-siden en PDF, før man kan komme videre: knappen er slukket, og den hvide boks er kun tekst. Planen gør det muligt at skrive et spørgsmål med det samme.

## Det brugeren får

1. **Spørgsmålsfelt på velkomstskærmen**
   I den hvide boks kommer et skrivefelt med teksten "Spørg om APV, handlingsplaner eller rapporter …" og en send-knap. Skriver man et spørgsmål og trykker send, åbner samtalen, og assistenten svarer med det samme — uden upload.

2. **Upload bliver valgfrit**
   Uploader man en PDF, fungerer alt som i dag. Gør man ikke, blokerer intet længere. Den store knap skifter tekst efter situationen: "Upload din pdf først ……" kun når både felt og fil er tomme, ellers "Send mit spørgsmål" eller "Analysér den valgte PDF". Skriver man både spørgsmål og vælger fil, sendes begge dele i samme besked.

## Teknisk

- `src/components/PlanWelcome.tsx`: nyt kontrolleret `question`-state med textarea + send (Enter sender, Shift+Enter ny linje). Ved afsendelse oprettes tråden via `createThread`, spørgsmålet gemmes som pending, og der navigeres til `/chat/plan/$threadId`. `disabled`-logikken bliver `!file && !question.trim()`.
- `src/lib/pending-plan-file.ts`: tilføj `savePendingPlanQuestion` / `takePendingPlanQuestion` i samme IndexedDB-store (nøgle `question:<threadId>`).
- `src/routes/chat.$botId.$threadId.tsx`: den eksisterende pending-effekt udvides til også at hente en ventende tekst; fil og spørgsmål sendes i ét `sendMessage`-kald (standardtekst bruges kun, hvis der ingen spørgsmål er).

## Verificering

Playwright på `/chat/plan`: skriv et spørgsmål uden at vælge fil, send, og bekræft at samtalen åbner og assistenten svarer. Desktop og mobil.
