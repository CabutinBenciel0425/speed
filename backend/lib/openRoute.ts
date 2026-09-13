import axios from "axios";
import { OPENROUTE_API_KEY } from "../config/envVars.js";

if (!OPENROUTE_API_KEY) {
  throw new Error("OPENROUTE_API_KEY is required in environment variables");
}

const openRoute = axios.create({
  baseURL: "https://api.heigit.org/openrouteservice",
  headers: {
    Authorization: OPENROUTE_API_KEY,
    "Content-Type": "application/json",
  },
});

export default openRoute;
