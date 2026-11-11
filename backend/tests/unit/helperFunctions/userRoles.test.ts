import { describe, expect, test } from "vitest";
import { formatSortName } from "../../../utils/formatSortName";
import { normalizeUserRoles } from "../../../utils/userRoles";

describe("Normalizing user roles", () => {
  test("test old role conversion", () => {
    expect(normalizeUserRoles(["User"])).toEqual(["Customer"]);
  });
  test("test deduplication", () => {
    expect(normalizeUserRoles(["Customer", "Customer", "Admin"])).toEqual([
      "Customer",
      "Admin",
    ]);
  });
  test("test invalid filtering", () => {
    expect(normalizeUserRoles(["Customer", "SuperAdmin", "Hacker"])).toEqual([
      "Customer",
    ]);
  });

  test("test a mixed array", () => {
    expect(
      normalizeUserRoles(["User", "Customer", "Invalid", "Admin"]),
    ).toEqual(["Customer", "Admin"]);
  });
});
