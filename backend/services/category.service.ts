import cloudinary from "../config/cloudinary.js";
import Category from "../models/category.model.js";
import type { CategoryUpdateInput } from "../schemas/category.schema.js";
import { NotFoundError } from "../utils/errors.js";
import { imageUpload } from "../utils/imageUpload.js";

export const createNewCategory = async (
  name: string,
  description: string,
  displayOrder: number,
  image: Express.Multer.File | undefined,
) => {
  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

  let cloudinaryImageUrl = "";

  if (image) {
    cloudinaryImageUrl = await imageUpload(image, "category");
  }

  const newCategory = new Category({
    name,
    slug,
    description,
    isActive: true,
    displayOrder,
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
    throw new NotFoundError("Category not found");
  }

  if (data.name) {
    category.name = data.name;
  }

  if (data.slug) {
    category.slug = data.slug;
  }

  if (data.description) {
    category.description = data.description;
  }

  if (data.displayOrder) {
    category.displayOrder = data.displayOrder;
  }

  if (image) {
    if (category.image) {
      const publicId = category.image.split("/").pop()?.split(".")[0];
      if (publicId) {
        const deletedPublicId = await cloudinary.uploader.destroy(
          `productImages/${publicId}`,
        );

        if (!deletedPublicId) {
          throw new NotFoundError("Error in deleting image in cloudinary");
        }
      }
    }
    const cloudinaryImageUrl = await imageUpload(image, "category");

    category.image = cloudinaryImageUrl;
  }

  await category.save();

  return category;
};
