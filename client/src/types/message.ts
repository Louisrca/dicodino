export type Message = {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; username: string };
  createdAt: string;
};
