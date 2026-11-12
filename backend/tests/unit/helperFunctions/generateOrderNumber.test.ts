import { describe, expect, test } from "vitest";
import { generateOrderNumber } from "../../../utils/generateOrderNumber";

describe("Generating order number", () => {
  test("returns a string with a correct format", () => {
    const orderNumber = generateOrderNumber();
    const currentYear = new Date().getFullYear();

    expect(orderNumber.startsWith(`SPD-${currentYear}-`)).toBe(true);

    expect(orderNumber.length).toBe(15);
  });

  test("uses the provided length parameter", () => {
    const orderNumberLength = 10;
    const orderNumber = generateOrderNumber(orderNumberLength);

    expect(orderNumber.length).toBe(19);
  });

  test("only contains valid character in the random code", () => {
    const orderNumber = generateOrderNumber();
    const codePart = orderNumber.split("-")[2];

    const validCharsRegex = /^[A-Z0-9]+$/;
    expect(validCharsRegex.test(codePart)).toBe(true);
  });

  test("generate unique codes", () => {
    const orderNumber1 = generateOrderNumber();
    const orderNumber2 = generateOrderNumber();

    expect(orderNumber1).not.toBe(orderNumber2);
  });
});
