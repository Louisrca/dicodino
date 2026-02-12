import { Router } from "express";
import {
  getLobbyInformationById,
  getMessageByRoomId,
  getUserInformationById,
  sendMessage,
} from "../controllers/gameControllers.ts";
import { createRoom } from "../controllers/room/createRoomControllers.ts";
import { joinRoomController } from "../controllers/room/joinRoomController.ts";

const router = Router();

router.post("/room/create", createRoom);
router.post("/room/join", joinRoomController);
router.post("/room/:id/message/:senderId", sendMessage);
router.get("/room/message/:id", getMessageByRoomId);
router.get("/lobby/:id", getLobbyInformationById);
router.get("/user/:id", getUserInformationById);

export { router as gameRoutes };
