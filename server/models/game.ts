export interface Room {
  id: string;
  host: string;
  category: string;
  createdAt: Date;
  players: Players[];
}

export let rooms: Room[] = [];

export interface Players {
  id: string;
  roomId: string;
  username: string;
  connected: boolean;
  score: number;
}

export let players: Players[] = [];

export interface Round {
  id: string;
  winner: string | null;
  currentDefinition: string;
  currentAnswer: string;
}

export let rounds: Round[] = [];
