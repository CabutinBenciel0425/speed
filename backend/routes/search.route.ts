import { Router } from "express";
import { searchDropdown } from "../controller/search.controller.js";

const searchRouter = Router();

searchRouter.post("/suggest", searchDropdown);

export default searchRouter;
