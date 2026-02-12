import { Router } from "express";
import { postMessage } from "../controllers/chat/postMessage.ts";
import { createRoom } from "../controllers/room/createRoomControllers.ts";
import { joinRoomController } from "../controllers/room/joinRoomController.ts";
import { getMessageByRoomId } from "../controllers/chat/getMessagesByRoomId.ts";
import { StartGameControllers } from "../controllers/lobby/startGameControllers.ts";
import { getLobbyInformationById } from "../controllers/lobby/lobbyInfoControllers.ts";

const router = Router();

router.post("/room/create", createRoom);
router.post("/room/join", joinRoomController);
router.post("/room/:id/message/:senderId", postMessage);
router.get("/room/message/:id", getMessageByRoomId);
router.get("/lobby/:id", getLobbyInformationById);
router.post("/lobby/:id/start", StartGameControllers);


export { router as gameRoutes };
