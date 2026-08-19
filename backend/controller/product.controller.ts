import type { QueryFilter } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../utils/errors.js";
import {
  createNewProduct,
  getProductFavoritesService,
  toggleProductFavoriteService,
  updateProductDetails,
} from "../services/product.service.js";
import type {
  ProductInput,
  UpdateProductInput,
} from "../schemas/product.schema.js";
import Product, { type IProduct } from "../models/product.model.js";
import { DEFAULT_PRODUCT_IMAGE } from "../config/constants.js";
import cloudinary from "../config/cloudinary.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";
import { buildQuery } from "../utils/buildQuery.js";

export const addProduct = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const merchantId = Array.isArray(req.params.merchantId)
    ? req.params.merchantId[0]
    : req.params.merchantId;
  const payload: ProductInput = req.body;
  const image = req.file;

  if (!user) {
    throw new NotFoundError("User");
  }

  if (!merchantId) {
    throw new NotFoundError("Merchant is undefined or");
  }

  const newProduct = await createNewProduct(merchantId, payload, image);

  await newProduct.populate("merchant");

  res.status(201).json({
    success: true,
    data: newProduct,
  });
});

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const payload: UpdateProductInput = req.body;
    const image = req.file;

    if (!user) {
      throw new NotFoundError("User");
    }

    if (!productId) {
      throw new NotFoundError("Merchant is undefined or");
    }

    const updatedProduct = await updateProductDetails(
      productId,
      payload,
      image,
    );

    await updatedProduct.populate("merchant");

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  },
);

export const toggleAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError("Product");
    }

    product.isAvailable = !product.isAvailable;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  },
);

export const toggleFeatured = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError("Product");
    }

    product.isFeatured = !product.isFeatured;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new NotFoundError("Product");
    }

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

    res.status(200).json({
      success: true,
      message: "Product sucessfully deleted",
    });
  },
);

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const queryData = buildQuery(req.query);

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

  res.json({
    success: true,
    data: docs,
    pagination: {
      total,
      page: queryData.page,
      limit: queryData.limit,
      pages: Math.ceil(total / queryData.limit),
    },
  });
});

export const toggleProductFavorite = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const productId = req.params.productId as string;

    if (!user) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (!productId) {
      throw new NotFoundError("Product id");
    }

    const productFavorite = await toggleProductFavoriteService(user, productId);

    res.status(200).json({
      success: true,
      data: productFavorite,
    });
  },
);

export const getProductFavorites = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("User not authorized");
    }

    const favorites = await getProductFavoritesService(user);

    res.status(200).json({
      success: true,
      data: favorites,
    });
  },
);

export const getFeaturedProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const featuredProducts = await Product.find({
      isFeatured: true,
      isAvailable: true,
    });
    res.json({
      success: true,
      data: featuredProducts,
    });
  },
);
