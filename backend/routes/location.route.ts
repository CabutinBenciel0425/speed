import { Router } from "express";
import {
  getBarangays,
  getCitiesByProvince,
  getCitiesByRegion,
  getProvincesByRegion,
  getRegions,
} from "../controller/location.controller.js";

const locationRouter = Router();

locationRouter.get("/regions", getRegions);
locationRouter.get("/regions/:regionCode/provinces", getProvincesByRegion);
locationRouter.get(
  "/regions/:regionCode/cities-municipalities",
  getCitiesByRegion,
);
locationRouter.get(
  "/provinces/:provinceCode/cities-municipalities",
  getCitiesByProvince,
);
locationRouter.get("/cities-municipalities/:cityCode/barangays", getBarangays);

export default locationRouter;
