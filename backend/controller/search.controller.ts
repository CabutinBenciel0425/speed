import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { buildQuery } from "../utils/buildQuery.js";
import { searchDropdownPublicService } from "../services/search.service.js";

export const searchDropdownPublic = asyncHandler(
  async (req: Request, res: Response) => {
    const query = typeof req.query.query === "string" ? req.query.query : "";

    const results = await searchDropdownPublicService(query);

    res.status(200).json({
      success: true,
      data: results,
    });
  },
);
