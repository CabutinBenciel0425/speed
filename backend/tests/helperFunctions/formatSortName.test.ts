import { describe, expect, test } from "vitest";
import { extractPublicIdFromUrl } from "../../utils/extractPublicIdFromUrl";
import { formatSortName } from "../../utils/formatSortName";

describe("formatting sort names", () => {
  test("returns error if sort name is not valid", () => {
    const prefix = "product";
    const sortName = "invalid";
    expect(formatSortName(sortName, prefix)).toBe("product.invalid");
  });

  test("returns error if prefix is not valid", () => {
    const sortName = "name";
    const prefix = "invalid";
    expect(formatSortName(sortName, prefix)).toBe("invalid.name");
  });

  test("returns error if the symbol is other than '-'", () => {
    const sortName = "+merchantName";
    const prefix = "merchant";
    expect(formatSortName(sortName, prefix)).toBe("merchant.+merchantName");
  });

  test("returns a valid sort variable", () => {
    const sortName = "name";
    const prefix = "product";
    expect(formatSortName(sortName, prefix)).toBe("product.name");
  });
});
