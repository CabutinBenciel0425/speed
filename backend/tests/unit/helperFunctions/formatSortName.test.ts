import { describe, expect, test } from "vitest";
import { formatSortName } from "../../../utils/formatSortName";

describe("formatting sort names", () => {
  test("throws if the sort name is not valid", () => {
    expect(() => formatSortName("bad field", "product")).toThrow(
      /Invalid sort field/,
    );
  });

  test("throws if the prefix is not valid", () => {
    expect(() => formatSortName("name", "bad prefix")).toThrow(
      /Invalid prefix/,
    );
  });

  test("throws if the symbol is other than '-'", () => {
    expect(() => formatSortName("+merchantName", "merchant")).toThrow(
      /only '-'/,
    );
  });

  test("returns a valid sort variable", () => {
    expect(formatSortName("name", "product")).toBe("product.name");
    expect(formatSortName("-name", "product")).toBe("-product.name");
  });
});
