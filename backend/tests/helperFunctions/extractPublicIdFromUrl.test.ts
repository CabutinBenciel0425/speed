import { describe, expect, test } from "vitest";
import { extractPublicIdFromUrl } from "../../utils/extractPublicIdFromUrl";

describe("Extracting public id from url - cloudinary", () => {
  test("returns error if url is not valid", () => {
    const url = "this-is-not-a-valid-url";
    expect(extractPublicIdFromUrl(url)).toBeNull();
  });

  test("returns an id of the image from the url", () => {
    const url =
      "https://example.com/image/upload/v1791669135/images/merchant/products/this-is-the-sample-id.jpg";
    const result = extractPublicIdFromUrl(url);

    expect(result).toEqual("images/merchant/products/this-is-the-sample-id");
  });

  test("works with a Cloudinary URL that doesn't have a version number", () => {
    const url = "https://example.com/image/upload/images/products/my-image.png";
    const result = extractPublicIdFromUrl(url);

    expect(result).toBe("images/products/my-image");
  });
});
