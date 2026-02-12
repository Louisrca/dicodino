import { Router } from "express";
import { getLobbyInformationById } from "../controllers/gameControllers.ts";
import { postMessage } from "../controllers/chat/postMessage.ts";
import { createRoom } from "../controllers/room/createRoomControllers.ts";
import { joinRoomController } from "../controllers/room/joinRoomController.ts";
import { getMessageByRoomId } from "../controllers/chat/getMessagesByRoomId.ts";
import { getUserInformation } from "../controllers/user/getUserInformation.ts";

const router = Router();

router.post("/room/create", createRoom);
router.post("/room/join", joinRoomController);
router.post("/room/:id/message/:senderId", postMessage);

router.get("/user/:id", getUserInformation);
router.get("/room/message/:id", getMessageByRoomId);
router.get("/lobby/:id", getLobbyInformationById);

export { router as gameRoutes };
