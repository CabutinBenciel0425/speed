import { describe, expect, test, vi } from "vitest";
import { imageUpload } from "../../../utils/imageUpload.js"; // 1. Import the actual function
import { EventEmitter } from "events";
import cloudinary from "../../../config/cloudinary";

vi.mock("../../../config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: vi.fn((_options: any, callback: any) => {
        const mockStream = new EventEmitter() as any;

        mockStream.write = vi.fn();
        mockStream.end = vi.fn();

        setTimeout(() => {
          callback(null, { secure_url: "https://example.com/test.jpg" });
          mockStream.emit("finish");
        }, 0);

        return mockStream;
      }) as any,
    },
  },
}));

describe("Image upload - cloudinary", () => {
  test("should upload and return URL", async () => {
    const fakeFile = {
      buffer: Buffer.from("fake image data"),
    } as Express.Multer.File;

    const result = await imageUpload(fakeFile, "merchant");

    expect(result).toBe("https://example.com/test.jpg");
  });

  test("should throw a custom error if cloudinary fails", async () => {
    const cloudinaryMock = vi.mocked(cloudinary.uploader.upload_stream) as any;

    cloudinaryMock.mockImplementationOnce((_options: any, callback: any) => {
      const mockStream = new EventEmitter() as any;
      mockStream.write = vi.fn();
      mockStream.end = vi.fn();

      setTimeout(() => {
        callback(new Error("Fake Network Error"), null);
        mockStream.emit("finish");
      }, 0);

      return mockStream;
    });

    const fakeFile = {
      buffer: Buffer.from("fake image data"),
    } as Express.Multer.File;

    await expect(imageUpload(fakeFile, "merchant")).rejects.toThrow(
      "Image cannot upload. Please try again.",
    );
  });
});
