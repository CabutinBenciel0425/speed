import Product from "../models/product.model.js";
import type { ProductInput } from "../schemas/product.schema.js";
import { ConflictError } from "../utils/errors.js";

export const createNewProduct = async (
  merchantId: string,
  payload: ProductInput,
) => {
  const existingProduct = await Product.findOne({
    merchant: merchantId,
    name: payload.name,
  });

  if (existingProduct) {
    throw new ConflictError("Product name is taken");
  }

  const newProduct = new Product({
    merchant: merchantId,
    category: payload.category,
    name: payload.name,
    slug: payload.name.replace(/\s+/g, "-").toLowerCase(),
    description: payload.description,
    price: payload.price,
    preparationTime: payload.preparationTime,
    ingredients: payload.ingredients,
    tags: payload.tags,
    isAvailable: payload.isAvailable,
    isFeatured: payload.isFeatured,
  });

  await newProduct.save();

  return newProduct;
};
