import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { buildQuery } from "../utils/buildQuery.js";
import {
  searchDropdownPublicService,
  searchPagePublicService,
} from "../services/search.service.js";

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
    const query = typeof req.query.query === "string" ? req.query.query : "";

    const { merchants, products } = await searchPagePublicService(query);

    res.status(200).json({
      success: true,
      data: {
        merchants: merchants,
        products: products,
      },
    });
  },
);
