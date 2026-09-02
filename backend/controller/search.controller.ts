import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { buildQuery } from "../utils/buildQuery.js";
import { searchDropdownPublicService } from "../services/search.service.js";
import { getProducts } from "./product.controller.js";
import { getProductsService } from "../services/product.service.js";
import { getMerchantsService } from "../services/merchant.service.js";

export const searchDropdownPublic = asyncHandler(
  async (req: Request, res: Response) => {
    const query = typeof req.query.query === "string" ? req.query.query : "";

    const { merchants, products } = await searchDropdownPublicService(query);

    res.status(200).json({
      success: true,
      data: {
        merchants: merchants,
        products: products,
      },
    });
  },
);

export const searchPagePublic = asyncHandler(
  async (req: Request, res: Response) => {
    const [
      { docs: productDocs, total: totalProducts, queryData: queryDataProducts },
      {
        limitedDocs: merchantDocs,
        total: totalMerchants,
        queryData: queryDataMerchants,
      },
    ] = await Promise.all([
      getProductsService(req.query),
      getMerchantsService(req.query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products: {
          products: productDocs,
          pagination: {
            total: totalProducts,
            page: queryDataProducts.page,
            limit: queryDataProducts.limit,
            pages: Math.ceil(totalProducts / queryDataProducts.limit),
          },
        },
        merchants: {
          merchants: merchantDocs,
          pagination: {
            total: totalMerchants,
            page: queryDataMerchants.page,
            limit: queryDataMerchants.limit,
            pages: Math.ceil(totalMerchants / queryDataMerchants.limit),
          },
        },
      },
    });
  },
);
