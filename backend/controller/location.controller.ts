import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const PSGC_BASE = "https://psgc.cloud/api/v2";

const proxyLocationRequest = async (path: string, res: Response) => {
  const response = await fetch(`${PSGC_BASE}${path}`, {
    signal: AbortSignal.timeout(12_000),
    headers: { Accept: "application/json" },
  });
  const payload: unknown = await response.json();
  if (!response.ok) {
    throw new ApiError(
      response.status,
      "Location data provider rejected the request",
    );
  }
  res.status(200).json(payload);
};

export const getRegions = asyncHandler(async (_req: Request, res: Response) => {
  await proxyLocationRequest("/regions", res);
});

export const getProvincesByRegion = asyncHandler(
  async (req: Request, res: Response) => {
    await proxyLocationRequest(
      `/regions/${encodeURIComponent(String(req.params.regionCode))}/provinces`,
      res,
    );
  },
);

export const getCitiesByRegion = asyncHandler(
  async (req: Request, res: Response) => {
    await proxyLocationRequest(
      `/regions/${encodeURIComponent(String(req.params.regionCode))}/cities-municipalities`,
      res,
    );
  },
);

export const getCitiesByProvince = asyncHandler(
  async (req: Request, res: Response) => {
    await proxyLocationRequest(
      `/provinces/${encodeURIComponent(String(req.params.provinceCode))}/cities-municipalities`,
      res,
    );
  },
);

export const getBarangays = asyncHandler(
  async (req: Request, res: Response) => {
    await proxyLocationRequest(
      `/cities-municipalities/${encodeURIComponent(String(req.params.cityCode))}/barangays`,
      res,
    );
  },
);
