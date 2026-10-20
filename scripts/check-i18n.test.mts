import { describe, expect, it } from "vitest";
import { compareCatalogues, icuArguments } from "./check-i18n.mts";

describe("icuArguments", () => {
  it("reads simple and plural arguments, ignoring text inside branches", () => {
    expect([...icuArguments("Hi {name}")]).toEqual(["name"]);
    expect([
      ...icuArguments("{count, plural, one {# member} other {# members}}"),
    ]).toEqual(["count"]);
    expect(icuArguments("no args").size).toBe(0);
  });
});

describe("compareCatalogues", () => {
  const en = { home: { title: "Hampa", greet: "Hi {name}" } };

  it("passes identical key sets", () => {
    expect(
      compareCatalogues(
        en,
        { home: { title: "همپا", greet: "سلام {name}" } },
        "fa",
      ),
    ).toEqual([]);
  });

  it("reports missing, extra and non-string keys", () => {
    const problems = compareCatalogues(
      en,
      { home: { title: { nested: "x" } }, other: "y" },
      "de",
    );
    expect(problems).toContain('de: missing "home.greet"');
    expect(problems).toContain('de: missing "home.title"');
    expect(problems).toContain('de: extra "other"');
  });

  it("reports mismatched ICU arguments", () => {
    const problems = compareCatalogues(
      en,
      { home: { title: "Hampa", greet: "Hallo {nam}" } },
      "de",
    );
    expect(problems).toEqual([
      'de: "home.greet" has arguments {nam}, expected {name}',
    ]);
  });
});
