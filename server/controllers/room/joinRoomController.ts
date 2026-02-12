import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import { io } from "../../index.ts";
import { formalizeUsername, getOrCreatePlayer, isValidUsername, MAX_PLAYERS, roomUpdate, trimString, updatePlayer } from "../../utils/utils.ts";

export const joinRoomController = async (req: Request, res: Response) => {
    const { username, roomId } = req.body;

    const u = trimString(username);
    const r = trimString(roomId);

    if (!r) {
        throw new Error("Invalid room ID");
    }
    if (!isValidUsername(u)) {
        throw new Error("Invalid username");
    }

    try {
        await prisma.player.updateMany({
            where: { username: u },
            data: { socketId: null, connected: false },
        });

        const room = await prisma.room.findUnique({
            where: { id: r },
            include: { players: { where: { connected: true } } },
        });

        if(!room) {
            console.log(`Failed to create room for ${u}`);
            return res
                .status(500)
                .json({ ok: false, error: "Failed to create room" });
        }

        if(room.players.length >= MAX_PLAYERS) {
            console.log(`Room ${r} is full`);
            return res
                .status(400)
                .json({ ok: false, error: "Room is full" });
        }

        const usernameTaken = room.players.some((p) => formalizeUsername(p.username) === formalizeUsername(u));

        if(usernameTaken) {
            console.log(`Username ${u} already taken in room ${r}`);
            return res
                .status(400)
                .json({ ok: false, error: "Username already taken" });
        }

        const player = await getOrCreatePlayer(u);

        if(player.connected && player.roomId && player.roomId !== r) {
            return res.status(400).json({
                ok: false,
                error: "Player already in another room"
            });
        }

        const updatedPlayer = await updatePlayer(player.id, {
            username: u,
            roomId: r,
            connected: true,
            score: 0,
        });

        if(!updatedPlayer) {
            console.log(`Failed to update player ${u} with room ${r}`);
            return res
                .status(500)
                .json({ ok: false, error: "Failed to join room" });
        }

        await roomUpdate(r, io);

        console.log(`${u} joined room ${r}`);
        
        res.status(200).json({
            ok: true,
            roomId: r,
            player: { id: player.id, username: player.username },
        });
    } catch (error) {
        console.error("Error joining room:", error);
        return res.status(500).json({ ok: false, error: "Server error" });
    }
}