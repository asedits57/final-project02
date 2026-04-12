import { describe, expect, it } from "vitest";

import { answerMatchesQuestion, answersMatch } from "../src/utils/scoring";

describe("scoring helpers", () => {
  it("matches direct primitive answers", () => {
    expect(answersMatch("Paris", "paris")).toBe(true);
    expect(answersMatch(true, "true")).toBe(true);
  });

  it("treats numeric multiple-choice answers as option indexes when question options exist", () => {
    expect(
      answerMatchesQuestion(
        {
          correctAnswer: 1,
          options: ["Alpha", "Bravo", "Charlie"],
        },
        "Bravo",
      ),
    ).toBe(true);
  });

  it("treats numeric-string multiple-choice answers as option indexes when question options exist", () => {
    expect(
      answerMatchesQuestion(
        {
          correctAnswer: "2",
          options: ["Alpha", "Bravo", "Charlie"],
        },
        "Charlie",
      ),
    ).toBe(true);
  });
});
