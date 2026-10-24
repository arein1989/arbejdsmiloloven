# Project decisions

- Verify legal sources for the first three chatbots through Retsinformation XML on every request and validate generated citations before displaying or persisting text, so historical or unverifiable sources fail closed without changing the existing model.
- Keep bot 1's response guidance in its bot configuration and use a bot-scoped structured fallback after failed citation validation, so legal safeguards do not erase its practical response format or change other bots.
- Keep bot 2's rule-only guidance in its bot configuration and its failed-validation response in the same four-field format, so uncertainty never turns the rule finder into an advice or planning assistant.
- For bot 3, discover and fetch allowlisted AT/NFA/BFA articles per request and buffer answers until source URLs and quoted evidence are checked; use Retsinformation only to verify legal references from those articles, so model memory is not presented as sourced research.

- Keep the plan assistant's legal-analysis instructions in its bot configuration, so the existing chat transport applies the same guidance to uploaded documents and follow-up questions.
- Generate the plan report in the browser from assistant answers with bundled Unicode fonts and the existing site logo, so Danish text and branding remain portable without a separate document service.