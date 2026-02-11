import { Router } from "express";
import { createRoom } from "../controllers/gameControllers.ts";

const router = Router();

router.post("/room", createRoom);

export { router as gameRoutes };
