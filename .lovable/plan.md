## Plan: Opdater 2026-kassen i "De seneste lovændringer"

### Baggrund
Den orange kasse for 2026 viser i dag en lang H3-titel:  
"– ændringer i lov nr. 1624 og lov nr. 302 (bl.a. nye regler om asbest, bødeniveau og anmeldelse af arbejdsulykker)"

Brugeren ønsker en kortere H3-titel og en separat beskrivelse, der vises, når plus-ikonet trykkes.

### Valgt titel
**"2026 – lovændringer"**

### Ændringer
1. **Databaseopdatering**  
   Opdater `short_name` for 2026-posten i `law_changes` til "2026 – lovændringer".

2. **Beskrivelsestekst**  
   Tilføj/udskift `reason` for 2026-posten med en kort beskrivelse, fx:  
   "I 2026 blev arbejdsmiljøloven ændret med nye regler om asbest, bødeniveau og anmeldelse af arbejdsulykker. Ændringerne er beskrevet i lov nr. 1624 og lov nr. 302."

3. **Link**  
   Bevare link til retsinformation.dk (allerede i data), så "Læs hele ændringen" stadig fungerer.

4. **Frontend**  
   Ingen kodeændringer nødvendigt – frontend viser allerede `short_name` som H3 og `reason` i udvidet indhold.

### Verifikation
- Genindlæs /chat/regler og bekræft, at 2026-kassen viser "2026 – lovændringer".
- Tryk på plus-ikonet og bekræft, at beskrivelsen vises med link.