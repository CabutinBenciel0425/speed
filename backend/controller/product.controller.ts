import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import {
  createNewProduct,
  getProductFavoritesService,
  getProductsService,
  toggleProductFavoriteService,
  updateProductDetails,
} from "../services/product.service.js";
import type {
  ProductInput,
  UpdateProductInput,
} from "../schemas/product.schema.js";
import Product from "../models/product.model.js";
import { DEFAULT_PRODUCT_IMAGE } from "../config/constants.js";
import cloudinary from "../config/cloudinary.js";
import { extractPublicIdFromUrl } from "../utils/extractPublicIdFromUrl.js";
import Merchant from "../models/merchant.model.js";
import ProductFavorite from "../models/productFavorite.model.js";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const requireOwnedMerchant = async (userId: string, merchantId: string) => {
  const merchant = await Merchant.findOne({ _id: merchantId, owner: userId });
  if (!merchant) throw new NotFoundError("Merchant");
};

const requireOwnedProduct = async (
  userId: string,
  merchantId: string,
  productId: string,
) => {
  await requireOwnedMerchant(userId, merchantId);
  const product = await Product.findOne({
    _id: productId,
    merchant: merchantId,
  });
  if (!product) throw new NotFoundError("Product");
  return product;
};

export const addProduct = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const merchantId = getParam(req.params.merchantId);
  const payload: ProductInput = req.body;
  const image = req.file;

  if (!user) {
    throw new NotFoundError("User");
  }

  if (!merchantId) {
    throw new NotFoundError("Merchant is undefined or");
  }

  await requireOwnedMerchant(user._id.toString(), merchantId);

  const newProduct = await createNewProduct(merchantId, payload, image);

  await newProduct.populate("merchant", "_id merchantName logo");

  res.status(201).json({
    success: true,
    data: newProduct,
  });
});

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const productId = getParam(req.params.id);
    const merchantId = getParam(req.params.merchantId);
    const payload: UpdateProductInput = req.body;
    const image = req.file;

    if (!user) {
      throw new NotFoundError("User");
    }

    if (!productId) {
      throw new NotFoundError("Merchant is undefined or");
    }
    if (!merchantId) throw new NotFoundError("Merchant");

    await requireOwnedProduct(user._id.toString(), merchantId, productId);

    const updatedProduct = await updateProductDetails(
      productId,
      payload,
      image,
    );

    await updatedProduct.populate("merchant", "_id merchantName logo");

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  },
);

export const toggleAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("User not authenticated");
    const merchantId = getParam(req.params.merchantId);
    const productId = getParam(req.params.id);
    if (!merchantId || !productId) throw new NotFoundError("Product");
    const product = await requireOwnedProduct(
      req.user._id.toString(),
      merchantId,
      productId,
    );

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
    if (!req.user) throw new UnauthorizedError("User not authenticated");
    const merchantId = getParam(req.params.merchantId);
    const productId = getParam(req.params.id);
    if (!merchantId || !productId) throw new NotFoundError("Product");
    const product = await requireOwnedProduct(
      req.user._id.toString(),
      merchantId,
      productId,
    );

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
    if (!req.user) throw new UnauthorizedError("User not authenticated");
    const merchantId = getParam(req.params.merchantId);
    const productId = getParam(req.params.id);
    if (!merchantId || !productId) throw new NotFoundError("Product");
    const product = await requireOwnedProduct(
      req.user._id.toString(),
      merchantId,
      productId,
    );
    await Product.findByIdAndDelete(product._id);

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
  const { docs, total, queryData } = await getProductsService(req.query);

  res.status(200).json({
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

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const product = await Product.findById(productId).populate(
    "merchant",
    "_id merchantName logo",
  );

  if (!product) {
    throw new NotFoundError("Product");
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

export const getRandomFromMerchant = asyncHandler(
  async (req: Request, res: Response) => {
    const ids: string[] = req.body.productIds;
    const merchantId: string = req.body.merchantId;
    const limit = Number(req.query.limit) || 5;

    if (!Array.isArray(ids)) {
      throw new ConflictError("productIds must be an array");
    }

    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      throw new NotFoundError("Merchant");
    }

    const excludeIds = ids.map((id: string) => new mongoose.Types.ObjectId(id));

    const randomProductsFromMerchant = await Product.aggregate([
      { $match: { _id: { $nin: excludeIds }, merchant: merchant._id } },
      { $sample: { size: limit } },
    ]);

    res.status(200).json({
      success: true,
      data: randomProductsFromMerchant,
    });
  },
);

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

    const { isFavorite } = await toggleProductFavoriteService(user, productId);

    res.status(200).json({
      success: true,
      isFavorite,
    });
  },
);

export const getProductFavorites = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("User not authorized");
    }

    const { docs, total, queryData } = await getProductFavoritesService(
      req.query,
      user._id.toString(),
    );

    res.status(200).json({
      success: true,
      data: {
        products: docs,
        pagination: {
          total,
          page: queryData.page,
          limit: queryData.limit,
          pages: Math.ceil(total / queryData.limit),
        },
      },
    });
  },
);

export const getFeaturedProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const featuredProducts = await Product.find({
      isFeatured: true,
      isAvailable: true,
    })
      .select("-merchantLocation")
      .sort({ totalSold: -1, createdAt: -1 })
      .limit(12);
    res.status(200).json({
      success: true,
      data: featuredProducts,
    });
  },
);

export const getProductFavoriteStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const productId = req.params.productId as string;

    if (!user) {
      throw new UnauthorizedError("User not authorized");
    }

    const productFavoriteStatus = await ProductFavorite.findOne({
      user: user._id,
      product: productId,
    });

    res.status(200).json({
      success: true,
      data: {
        isFavorite: !!productFavoriteStatus,
      },
    });
  },
);
