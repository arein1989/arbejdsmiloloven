# Plan: Robot-størrelse og tekst-alignering som billedet (PlanWelcome)

## Hvad brugeren vil have
Velkomstsektionen på /chat/plan skal se ud som det uploadede billede:
- Robotten står til venstre og er stor (fylder næsten hele højden af sektionen).
- Teksten står til højre for robotten, lodret centreret, og er **centreret** i sin egen blok – ikke venstrejusteret.
- Titlen brydes i tre linjer som på billedet:
  1. "Velkommen !"
  2. "Handlingsplan – Din AI-assistent til"
  3. "APV og rapporter"

## Ændringer (kun `src/components/PlanWelcome.tsx`)

1. **Robotten større** ( behold responsiv skalering ):
   - Fra `h-[280px] w-[280px] sm:h-[344px] sm:w-[344px] lg:h-[408px] lg:w-[408px]`
   - Til `h-[300px] w-[300px] sm:h-[380px] sm:w-[380px] lg:h-[460px] lg:w-[460px]`
2. **Tekst-alignering**:
   - Tekstblokken: `text-center` på alle skærmstørrelser (fjern `md:text-left`).
   - Grid'et beholdes (`items-center`, robot i venstre kolonne, tekst i højre) så det matcher billedets opstilling.
3. **Linjeskift som billedet**:
   - "Velkommen&nbsp;!" + linjeskift + "Handlingsplan – Din AI-assistent til" + linjeskift + "APV og rapporter".
   - Linjeskift efter "til" sættes synligt fra `sm:` og opefter (på mobil ombryder teksten naturligt i stedet, så den ikke flyder ud over skærmen).

## Ikke berørt
- Guide-boksene, upload-boks, chatbot-boks, knapper og farver ændres ikke.

## Verificering
- Playwright på desktop (1280px) og mobil (390px): robot til venstre, tre-linjers centreret titel til højre, ingen layoutfejl i konsollen.
