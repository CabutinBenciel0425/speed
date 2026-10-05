import cloudinary from "../config/cloudinary.js";
import Category, { type ICategory } from "../models/category.model.js";
import type { CategoryUpdateInput } from "../schemas/category.schema.js";
import { NotFoundError } from "../utils/errors.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";
import { imageUpload } from "../utils/imageUpload.js";

export const createNewCategory = async (
  name: string,
  description: string,
  displayOrder: number | undefined,
  image: Express.Multer.File | undefined,
) => {
  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

  let cloudinaryImageUrl = "";

  if (image) {
    cloudinaryImageUrl = await imageUpload(image, "category");
  }

  const nextOrder = displayOrder ?? ((await Category.findOne().sort({ displayOrder: -1 }).select("displayOrder"))?.displayOrder ?? -1) + 1;

  const newCategory = new Category({
    name,
    slug,
    description,
    isActive: true,
    displayOrder: nextOrder,
    image:
      cloudinaryImageUrl ||
      "https://res.cloudinary.com/dwqlvkvup/image/upload/v1784387940/default-category_fbl4h0.png",
  });

  await newCategory.save();

  return newCategory;
};

export const updateDetailsCategory = async (
  data: CategoryUpdateInput,
  image: Express.Multer.File | undefined,
  categoryId: string,
) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new NotFoundError("Category");
  }

  if (data.name) {
    category.name = data.name;
    if (!data.slug) category.slug = data.name.toLowerCase().trim().replace(/\s+/g, "-");
  }

  if (data.slug) {
    category.slug = data.slug;
  }

  if (data.description !== undefined) {
    category.description = data.description;
  }

  if (data.displayOrder !== undefined) {
    category.displayOrder = data.displayOrder;
  }

  if (image) {
    if (category.image) {
      const publicId = extractPublicIdFromUrl(category.image);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok") {
          console.warn(
            `Cloudinary cleanup failed for ${publicId}: ${result.result}`,
          );
        }
      }
    }
    const cloudinaryImageUrl = await imageUpload(image, "category");

    category.image = cloudinaryImageUrl;
  }

  await category.save();

  return category;
};
