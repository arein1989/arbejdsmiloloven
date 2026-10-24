/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { knowledgeUrl, NO_KNOWLEDGE, parseArticle, validateKnowledgeAnswer, type KnowledgeSource } from "./knowledge-sources.server";

const url = "https://nfa.dk/forskning/psykisk-arbejdsmiljoe";
const source: KnowledgeSource = { source: "NFA", url, title: "Psykisk arbejdsmiljø", text: "Et godt psykisk arbejdsmiljø er vigtigt for medarbejdernes trivsel og sundhed." };
const answer = `NFA [Kilde](${url})\n“${source.text}”`;
describe("Bot 3 bruger kun læste AT-, NFA- og BFA-kilder", () => {
  test("De tre tilladte kilder kan godkendes", () => {
    expect(knowledgeUrl("https://at.dk/arbejdsmiljoe/loeft/")).toBe("https://at.dk/arbejdsmiljoe/loeft/");
    expect(knowledgeUrl(url)).toBe(url);
    expect(knowledgeUrl("https://www.godtarbejdsmiljo.dk/trivsel/stress")).toBe("https://www.godtarbejdsmiljo.dk/trivsel/stress");
  });
  test("Andre kilder og vildledende værtsnavne afvises", () => {
    expect(knowledgeUrl("https://at.dk.evil.example/artikel")).toBeNull();
    expect(knowledgeUrl("https://bfa-web.dk/artikel")).toBeNull();
    expect(knowledgeUrl("http://nfa.dk/artikel")).toBeNull();
  });
  test("Forsider og søgeresultater er ikke konkrete artikler", () => {
    expect(knowledgeUrl("https://at.dk/")).toBeNull();
    expect(knowledgeUrl("https://nfa.dk/soeg?q=stress")).toBeNull();
    expect(knowledgeUrl("https://www.godtarbejdsmiljo.dk/soegeresultat?q=stress")).toBeNull();
  });
  test("Ingen kilder giver ingen opdigtet opsummering", () => {
    expect(validateKnowledgeAnswer("Opdigtet råd", [], [])).toBe(NO_KNOWLEDGE);
  });
  test("Kun et faktisk hentet link vises", () => {
    expect(validateKnowledgeAnswer(answer.replace(url, "https://nfa.dk/opdigtet"), [source], [])).not.toContain("https://nfa.dk/opdigtet");
    expect(validateKnowledgeAnswer(answer, [source], [])).toContain(url);
  });
  test("Et opdigtet citat må ikke udgives som kildens indhold", () => {
    expect(validateKnowledgeAnswer(`NFA [Kilde](${url}) “Alle ansatte skal have præcis 30 minutters pause.”`, [source], [])).not.toContain("30 minutters");
  });
  test("Maksimalt tre kilder i et svar", () => {
    const sources = Array.from({ length: 4 }, (_, i) => ({ ...source, url: `${url}/${i}` }));
    expect(validateKnowledgeAnswer(sources.map(s => `[Kilde](${s.url}) “${s.text}”`).join("\n"), sources, [])).not.toContain(sources[3].url);
  });
  test("Artikellæsning udelader navigation og sidefod", () => {
    const parsed = parseArticle(`<main><h1>Trivsel</h1><p>${source.text.repeat(5)}</p></main><footer>Uvedkommende sidefod</footer>`, url);
    expect(parsed?.title).toBe("Trivsel");
    expect(parsed?.text).not.toContain("Uvedkommende sidefod");
  });
});