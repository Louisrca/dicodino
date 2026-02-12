import { Router } from "express";
import {
  getLobbyInformationById,
  getMessageByRoomId,
  getUserInformationById,
  sendMessage,
} from "../controllers/gameControllers.ts";
import { createRoom } from "../controllers/room/createRoomControllers.ts";

const router = Router();

router.post("/room", createRoom);
router.post("/room/:id/message/:senderId", sendMessage);
router.get("/room/message/:id", getMessageByRoomId);
router.get("/lobby/:id", getLobbyInformationById);
router.get("/user/:id", getUserInformationById);

export { router as gameRoutes };
