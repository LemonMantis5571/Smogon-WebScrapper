import { Router } from "express";
import { getSmFirstSample } from "../controllers/pokemon.js";

const router = Router();

router.get("/api/smogon/:pokemon", getSmFirstSample);

export default router;
