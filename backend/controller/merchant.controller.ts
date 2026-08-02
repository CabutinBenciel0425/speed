import { type QueryFilter, Types } from "mongoose";
import Merchant, { type IMerchant } from "../models/merchant.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { buildQuery } from "../utils/buildQuery.js";
import { NotFoundError } from "../utils/errors.js";
import {
  getMerchantProductsService,
  getMerchantsService,
  updateMerchantProfileService,
} from "../services/merchant.service.js";
import type { merchantUpdateInput } from "../schemas/merchant.schema.js";

export const getMerchants = asyncHandler(
  async (req: Request, res: Response) => {
    const { limitedDocs, total, queryData } = await getMerchantsService(
      req.query,
    );

    res.json({
      success: true,
      data: limitedDocs,
      pagination: {
        total,
        page: queryData.page,
        limit: queryData.limit,
        pages: Math.ceil(total / queryData.limit),
      },
    });
  },
);

export const getMerchantDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const merchantId = req.params.merchantId;

    if (!merchantId) {
      throw new NotFoundError("Merchant id");
    }

    const merchant = await Merchant.findById(merchantId).populate("owner");

    if (!merchant) {
      throw new NotFoundError("Merchant");
    }

    res.status(200).json({
      success: true,
      data: {
        id: merchant._id,
        name: merchant.merchantName,
        description: merchant.description || null,
        logo: merchant.logo || null,
        banner: merchant.banner || null,
        address: merchant.address,
        operatingHours: merchant.operatingHours,
        ratingCount: merchant.ratingCount,
        averageRating: merchant.averageRating,
      },
    });
  },
);

export const getMerchantProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const merchantId = req.params.merchantId ? req.params.merchantId[0] : null;

    if (!merchantId) {
      throw new NotFoundError("Merchant Id");
    }

    const { docs, total, queryData } = await getMerchantProductsService(
      req.query,
      merchantId,
    );
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
  },
);

export const getMerchantProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const merchantId = req.params.merchantId;

    const merchant = await Merchant.findOne({
      owner: user._id,
      _id: merchantId,
    } as QueryFilter<IMerchant>).populate("owner");

    if (!merchant) {
      throw new NotFoundError("Merchant");
    }

    res.status(200).json({
      success: true,
      data: merchant,
    });
  },
);

export const updateMerchantProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const merchantId = req.params.merchantId as string;
    const payload: merchantUpdateInput = req.body;
    const files = (req.files ?? {}) as {
      logo?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    };
    const logo = files.logo?.[0];
    const banner = files.banner?.[0];
    const updatedMerchant = await updateMerchantProfileService(
      user,
      merchantId,
      payload,
      logo,
      banner,
    );

    res.status(200).json({
      success: true,
      data: updatedMerchant,
    });
  },
);
