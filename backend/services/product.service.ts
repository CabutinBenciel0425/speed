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
import { formatSortName } from "../utils/formatSortName.js";
import { imageUpload } from "../utils/imageUpload.js";
import mongoose, { Types } from "mongoose";
import type { PreparedOrderDataType } from "./order.service.js";
import type { IOrder } from "../models/order.model.js";
import { type PipelineStage } from "mongoose";

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
    merchantName: existingMerchant.merchantName,
    merchantLogo: existingMerchant.logo,
    merchantLocation: existingMerchant.address.location,
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

  if (payload.category !== undefined) {
    product.category = new Types.ObjectId(payload.category.toString());
  }

  if (payload.name !== undefined) {
    product.name = payload.name;
  }

  if (payload.description !== undefined) {
    product.description = payload.description;
  }

  if (payload.price !== undefined) {
    product.price = payload.price;
  }

  if (payload.preparationTime !== undefined) {
    product.preparationTime = payload.preparationTime;
  }

  if (payload.ingredients !== undefined) {
    product.ingredients = payload.ingredients;
  }

  if (payload.tags !== undefined) {
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

export const getProductFavoritesService = async (
  query: any,
  userId: string,
) => {
  const queryData = buildQuery(query);

  const updatedSort = query.sort ? formatSortName(query.sort, "product") : "";

  const allowedSorts = [
    "product.price",
    "-product.price",
    "product.createdAt",
    "-product.createdAt",
    "product.name",
    "-product.name",
  ];

  const sort = allowedSorts.includes(updatedSort)
    ? updatedSort
    : "-product.createdAt";

  const productMatch: any = {};

  if (queryData.filter.price) {
    productMatch["product.price"] = queryData.filter.price;
  }

  if (queryData.filter.preparationTime) {
    productMatch["product.preparationTime"] = queryData.filter.preparationTime;
  }

  if (queryData.filter.category) {
    productMatch["product.category"] = new mongoose.Types.ObjectId(
      queryData.filter.category,
    );
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const docs = await ProductFavorite.aggregate([
    { $match: { user: userObjectId } },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    ...(Object.keys(productMatch).length ? [{ $match: productMatch }] : []),
    {
      $sort: {
        [sort.replace("-", "")]: sort.startsWith("-") ? -1 : 1,
      },
    },
    { $skip: queryData.skip },
    { $limit: queryData.limit },
  ]);

  const totalAgg = await ProductFavorite.aggregate([
    { $match: { user: userObjectId } },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    ...(Object.keys(productMatch).length ? [{ $match: productMatch }] : []),
    { $count: "total" },
  ]);

  const total = totalAgg[0]?.total ?? 0;

  return { docs, total, queryData };
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

export const getFeaturedProductsService = async (query: any) => {
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

  const docs = await Product.find({
    ...queryData.filter,
    isFeatured: true,
    isAvailable: true,
  })
    .sort(sort)
    .select(queryData.select)
    .skip(queryData.skip)
    .limit(queryData.limit);

  const total = await Product.countDocuments(queryData.filter);

  return { docs, total, queryData };
};

export const getBestSellerProductsService = async (query: any) => {
  const queryData = buildQuery(query);

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(24, Math.max(1, Number(query.limit) || 12));
  const skip = (page - 1) * limit;

  const pipeline: PipelineStage[] = [
    {
      $match: {
        ...queryData.filter,
        isAvailable: true,
      },
    },
    {
      $sort: {
        totalSold: -1,
        createdAt: -1,
        _id: -1,
      },
    },
    {
      $group: {
        _id: "$merchant",
        topProducts: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        topProducts: { $slice: ["$topProducts", 2] },
      },
    },
    {
      $unwind: "$topProducts",
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$topProducts", { merchant: "$_id" }],
        },
      },
    },
    {
      $sort: {
        totalSold: -1,
        createdAt: -1,
        _id: -1,
      },
    },
  ];

  const [docs, countResult] = await Promise.all([
    Product.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
    Product.aggregate([...pipeline, { $count: "total" }]),
  ]);

  const total = countResult[0]?.total ?? 0;

  return {
    docs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};
