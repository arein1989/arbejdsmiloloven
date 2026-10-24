# Project decisions

- Verify legal sources for the first three chatbots through Retsinformation XML on every request and validate generated citations before displaying or persisting text, so historical or unverifiable sources fail closed without changing the existing model.

- Keep the plan assistant's legal-analysis instructions in its bot configuration, so the existing chat transport applies the same guidance to uploaded documents and follow-up questions.
- Generate the plan report in the browser from assistant answers with bundled Unicode fonts and the existing site logo, so Danish text and branding remain portable without a separate document service.