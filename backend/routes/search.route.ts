import { Router } from "express";
import { searchDropdownPublic } from "../controller/search.controller.js";

const searchRouter = Router();

searchRouter.get("/suggest/public", searchDropdownPublic);

export default searchRouter;
