import { describe, expect, test, vi } from "vitest";
import { folderPathIdentifier } from "../../../utils/forlderPathIdentifier";

describe("Identify the folder path - cloudinary", () => {
  test("returns /images if parameter is not recognized as valid", () => {
    const parameter = "this-is-not-a-valid-parameter";
    expect(folderPathIdentifier(parameter)).toBe("/images");
  });

  test("returns the /images/driver folder path", () => {
    const parameter = "driver";
    expect(folderPathIdentifier(parameter)).toBe("/images/driver");
  });

  test("returns the /images/customer folder path", () => {
    const parameter = "customer";
    expect(folderPathIdentifier(parameter)).toBe("/images/customer");
  });
});
