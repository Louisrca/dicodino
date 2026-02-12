export type Player = {
  id: string;
  username: string;
  roomId?: string;
  score?: number;
  connected?: boolean;
  isHost?: boolean;
};
