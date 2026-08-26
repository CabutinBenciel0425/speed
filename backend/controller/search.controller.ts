import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { buildQuery } from "../utils/buildQuery.js";

export const searchDropdown = asyncHandler(
  async (req: Request, res: Response) => {
    const queryData = buildQuery(req.query);
  },
);
