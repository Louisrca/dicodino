import { Router } from "express";
import { postMessage } from "../controllers/chat/postMessage.ts";
import { createRoom } from "../controllers/room/createRoomControllers.ts";
import { joinRoomController } from "../controllers/room/joinRoomController.ts";
import { getMessageByRoomId } from "../controllers/chat/getMessagesByRoomId.ts";
import { StartGameControllers } from "../controllers/lobby/startGameControllers.ts";
import { getLobbyInformationById } from "../controllers/lobby/lobbyInfoControllers.ts";
import { createUser } from "../controllers/user/createUser.ts";
import { roundController } from "../controllers/round/roundController.ts";

const router = Router();

router.post("/room/create", createRoom);
router.post("/room/join", joinRoomController);
router.post("/room/:id/message/:senderId", postMessage);
router.post("/lobby/:id/start", StartGameControllers);
router.post("/user/createUser", createUser);

router.get("/room/:id/round/results", roundController);
router.get("/room/message/:id", getMessageByRoomId);
router.get("/lobby/:id", getLobbyInformationById);
export { router as gameRoutes };
