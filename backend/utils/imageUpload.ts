import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

export const imageUpload = (
  file: Express.Multer.File,
  from: string,
): Promise<string> => {
  const folderPath =
    from === "customer"
      ? "images/customer/avatar"
      : from.includes("merchant")
        ? `images/${from}`
        : "images/driver/avatar";
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
      },
      (error, result) => {
        if (error) {
          return reject(new Error("Image cannot upload. Please try again."));
        }

        if (!result) {
          return reject(new Error("Cloudinary returned no result."));
        }

        resolve(result.secure_url);
      },
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};
