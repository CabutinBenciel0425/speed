import cloudinary from "../config/cloudinary.js";
import { DEFAULT_PRODUCT_IMAGE } from "../config/constants.js";
import Merchant from "../models/merchant.model.js";
import Product from "../models/product.model.js";
import ProductFavorite from "../models/productFavorite.model.js";
import type { IUser } from "../models/user.model.js";
import type {
  ProductInput,
  UpdateProductInput,
} from "../schemas/product.schema.js";
import { ApiError } from "../utils/apiError.js";
import { buildQuery } from "../utils/buildQuery.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";
import { imageUpload } from "../utils/imageUpload.js";
import { Types } from "mongoose";

export const createNewProduct = async (
  merchantId: string,
  payload: ProductInput,
  image: Express.Multer.File | undefined,
) => {
  const existingMerchant = await Merchant.findById(merchantId);

  if (!existingMerchant) {
    throw new NotFoundError("Merchant");
  }

  if (
    existingMerchant.status === "Rejected" ||
    existingMerchant.status === "Suspended"
  ) {
    throw new ConflictError(
      "Cannot add product to this merchant due to current merchant's status",
    );
  }
  const existingProduct = await Product.findOne({
    merchant: merchantId,
    name: payload.name,
  });

  if (existingProduct) {
    throw new ConflictError("Product name is taken");
  }

  let cloudinaryImageUrl = "";

  if (image) {
    cloudinaryImageUrl = await imageUpload(image, "product");
  }

  const newProduct = new Product({
    merchant: existingMerchant._id,
    category: payload.category,
    name: payload.name,
    image: cloudinaryImageUrl,
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

export const updateProductDetails = async (
  productId: string,
  payload: UpdateProductInput,
  image: Express.Multer.File | undefined,
) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (payload.category) {
    product.category = new Types.ObjectId(payload.category.toString());
  }

  if (payload.name) {
    product.name = payload.name;
  }

  if (payload.description) {
    product.description = payload.description;
  }

  if (payload.price) {
    product.price = payload.price;
  }

  if (payload.preparationTime) {
    product.preparationTime = payload.preparationTime;
  }

  if (payload.ingredients) {
    product.ingredients = payload.ingredients;
  }

  if (payload.tags) {
    product.tags = payload.tags;
  }

  if (image) {
    if (product.image && product.image !== DEFAULT_PRODUCT_IMAGE) {
      const publicId = extractPublicIdFromUrl(product.image);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok") {
          console.warn(
            `Cloudinary cleanup failed for ${publicId}: ${result.result}`,
          );
        }
      }
    }
    const cloudinaryImageUrl = await imageUpload(image, "product");

    product.image = cloudinaryImageUrl;
  }

  await product.save();

  return product;
};

export const toggleProductFavoriteService = async (
  user: IUser,
  productId: string,
) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product");
  }

  const favoriteExist = await ProductFavorite.findOne({
    user: user._id,
    product: product._id,
  });

  if (favoriteExist) {
    await ProductFavorite.findByIdAndDelete(favoriteExist._id);

    return { isFavorite: false };
  }

  const newProduct = await ProductFavorite.create({
    user: user._id,
    product: product._id,
  });

  return { isFavorite: true };
};

export const deleteProductFavoriteService = async (
  userId: string,
  productId: string,
) => {
  const result = await ProductFavorite.findOneAndDelete({
    user: userId,
    product: productId,
  });

  if (!result) {
    throw new ApiError(500, "Unable to delete favorite product");
  }

  return "Product successfully removed as favorite";
};

export const getProductFavoritesService = async (user: IUser) => {
  const favorites = await ProductFavorite.find({ user: user._id }).populate(
    "product",
  );

  if (favorites.length === 0) {
    return [];
  }

  return favorites;
};

export const getProductsService = async (query: any) => {
  const queryData = buildQuery(query);

  const allowedSorts = [
    "price",
    "-price",
    "createdAt",
    "-createdAt",
    "name",
    "-name",
  ];

  const sort = allowedSorts.includes(queryData.sort)
    ? queryData.sort
    : "-createdAt";

  if (queryData.search) {
    queryData.filter.$or = [
      {
        name: {
          $regex: queryData.search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: queryData.search,
          $options: "i",
        },
      },
    ];
  }

  const docs = await Product.find(queryData.filter)
    .sort(sort)
    .select(queryData.select)
    .skip(queryData.skip)
    .limit(queryData.limit);

  const total = await Product.countDocuments(queryData.filter);

  return { docs, total, queryData };
};
