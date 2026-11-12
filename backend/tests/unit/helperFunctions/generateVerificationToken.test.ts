import { describe, expect, test } from "vitest";
import { generateVerificationToken } from "../../../utils/generateVerificationToken";

describe("Generating verification token", () => {
  test("returns a string of the correct length", () => {
    const code = generateVerificationToken(6);
    expect(code.length).toEqual(6);
  });

  test("returns a different length if specified", () => {
    const code = generateVerificationToken(4);
    expect(code.length).toEqual(4);
  });

  test("only contains numeric characters", () => {
    const code = generateVerificationToken(6);
    expect(code).toMatch(/^[0-9]+$/);
  });

  test("testing the randomness", () => {
    const code1 = generateVerificationToken(6);
    const code2 = generateVerificationToken(6);
    expect(code1).not.toEqual(code2);
  });

  test("testing the error case", () => {
    expect(() => generateVerificationToken(0)).toThrow(
      "Provided token length is invalid",
    );
    expect(() => generateVerificationToken(-5)).toThrow(
      "Provided token length is invalid",
    );
  });
});
