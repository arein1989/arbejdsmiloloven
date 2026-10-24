/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { lawUrl, parseLawXml, validateAnswer } from "./law-verification.server";

const fixture = (status: string) =>
  `<Dokument><Meta><Status>${status}</Status><DocumentTitle>Bekendtgørelse</DocumentTitle><EndDate>2026-06-30</EndDate></Meta><Kapitel><Paragraf><Explicatus>§ 21</Explicatus><Stk><Linea><Char>Arbejdslokaler skal være forsvarlige.</Char></Linea></Stk></Paragraf></Kapitel></Dokument>`;
const url = "https://www.retsinformation.dk/eli/lta/2026/607";

describe("kun gældende og kontrollerede lovhenvisninger", () => {
  test("Valid er gældende; EndDate er ikke ophævelsesbevis", () => {
    expect(parseLawXml(fixture("Valid"), url, "2026-10-24").status).toBe("current");
  });
  test("Historiske dokumenter må ikke vises som gældende", () => {
    const law = parseLawXml(fixture("Historic"), url, "2026-10-24");
    expect(validateAnswer(`[Kilde](${url}#P21)`, [law])).not.toContain(url);
  });
  test("Manglende eller ugyldig status godkendes aldrig", () => {
    expect(parseLawXml(fixture(""), url, "2026-10-24").status).toBe("unknown");
    expect(parseLawXml("<html>Fejl</html>", url, "2026-10-24").status).toBe("unknown");
  });
  test("Eksisterende paragraf med tekst kan citeres direkte", () => {
    const law = parseLawXml(fixture("Valid"), url, "2026-10-24");
    expect(law.paragraphs["21"]).toContain("Arbejdslokaler skal være forsvarlige.");
    expect(validateAnswer(`Arbejdslokaler skal være forsvarlige. [§ 21](${url}#P21)`, [law])).toContain(`${url}#P21`);
  });
  test("Opdigtede paragrafankre fjernes sammen med den ukontrollerede vurdering", () => {
    const law = parseLawXml(fixture("Valid"), url, "2026-10-24");
    expect(validateAnswer(`[§ 999](${url}#P999)`, [law])).not.toContain("#P999");
  });
  test("Ukontrollerede dokumenter fjernes", () => {
    expect(validateAnswer(`[Kilde](${url})`, [])).not.toContain(url);
  });
  test("Paragrafforklaring uden dokumenteret ordlyd erstattes af kildeteksten", () => {
    const law = parseLawXml(fixture("Valid"), url, "2026-10-24");
    const answer = validateAnswer(`§ 21 kræver 12 m³ luft. [§ 21](${url}#P21)`, [law]);
    expect(answer).not.toContain("12 m³");
    expect(answer).toContain("Arbejdslokaler skal være forsvarlige.");
  });
  test("Kun officielle HTTPS dokumentadresser kan hentes", () => {
    expect(lawUrl("https://retsinformation.dk.evil.example/eli/lta/2026/607")).toBeNull();
    expect(lawUrl("https://localhost/eli/lta/2026/607")).toBeNull();
    expect(lawUrl("https://retsinformation.dk/eli/lta/2026/607#P21")).toBe(url);
  });
});
