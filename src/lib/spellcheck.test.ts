import { describe, expect, it } from "vitest";
import { findLocalSpellingIssues, mergeSpellingIssues } from "@lib/spellcheck";

describe("findLocalSpellingIssues", () => {
  it("flags obvious phonetic misspellings", () => {
    expect(findLocalSpellingIssues("gudu morning")).toEqual([
      { word: "gudu", suggestion: "good" },
    ]);
  });

  it("flags direct typos and keeps valid words alone", () => {
    expect(findLocalSpellingIssues("please chwck this")).toEqual([
      { word: "chwck", suggestion: "check" },
    ]);
  });
});

describe("mergeSpellingIssues", () => {
  it("deduplicates repeated suggestions", () => {
    expect(
      mergeSpellingIssues(
        [{ word: "gudu", suggestion: "good" }],
        [{ word: "gudu", suggestion: "good" }],
      ),
    ).toEqual([{ word: "gudu", suggestion: "good" }]);
  });
});
