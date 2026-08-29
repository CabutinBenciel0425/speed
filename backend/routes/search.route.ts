import { Router } from "express";
import {
  searchDropdownPublic,
  searchPagePublic,
} from "../controller/search.controller.js";

const searchRouter = Router();

searchRouter.get("/suggest/public", searchDropdownPublic);
searchRouter.get("/public", searchPagePublic);

export default searchRouter;
