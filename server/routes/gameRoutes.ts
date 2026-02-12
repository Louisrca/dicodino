import { Router } from "express";
import {
  getLobbyInformationById,
  getUserInformationById,
} from "../controllers/gameControllers.ts";
import { postMessage } from "../controllers/chat/postMessage.ts";
import { createRoom } from "../controllers/room/createRoomControllers.ts";
import { joinRoomController } from "../controllers/room/joinRoomController.ts";
import { getMessageByRoomId } from "../controllers/chat/getMessagesByRoomId.ts";

const router = Router();

router.post("/room/create", createRoom);
router.post("/room/join", joinRoomController);
router.post("/room/:id/message/:senderId", postMessage);
router.get("/room/message/:id", getMessageByRoomId);
router.get("/lobby/:id", getLobbyInformationById);
router.get("/user/:id", getUserInformationById);

export { router as gameRoutes };
