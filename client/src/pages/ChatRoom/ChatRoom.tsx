import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RoomHeader from "../../components/RoomHeader/RoomHeader";
import TextArea from "../../components/TextArea/TextArea";
import { SocketContext } from "../../context/socketProvider";
import styles from "./ChatRoom.module.css";
import type { Message } from "../../types/message";
import { useRoomMessage } from "../../api/roomMessage/useRoomMessage";

const ChatRoom = () => {
  const { socket } = useContext(SocketContext);
  const [message, setMessage] = useState("");
  const { getMessageByRoomId, postMessage } = useRoomMessage();

  const localStoragePlayer = JSON.parse(
    localStorage.getItem("player") || '{"username":"Anonyme"}',
  );

  const { roomId } = useParams();

  const [messages, setMessages] = useState<Message[]>([]);

  const [currentDefinition, setCurrentDefinition] = useState("");

  useEffect(() => {
    getMessageByRoomId(roomId || "")
      .then((data) => {
        if (data) {
          setMessages(data);
        }
      })
      .catch((err: Error) => {
        console.error("Error fetching messages:", err);
      });
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("newMessage", handleNewMessage);

    socket.on("room:newWordReady", (data: { definition: string }) => {
      console.log("New word ready:", data.definition);

      if (localStorage.getItem("currentDefinition")) {
        localStorage.removeItem("currentDefinition");
      }
      localStorage.setItem("currentDefinition", data.definition);

      setCurrentDefinition(data.definition);
    });

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, currentDefinition]);

  const sendMessage = () => {
    postMessage(roomId || "", localStoragePlayer.id, message);
  };

  return (
    <div className={styles.chatRoomContainer}>
      <div className="header">
        <RoomHeader definition={currentDefinition} />
      </div>
      <div className={styles.messagesContainer}>
        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={
              message.senderId === localStoragePlayer.id
                ? styles.myMessage
                : styles.otherMessage
            }
          >
            {message.content}
          </div>
        ))}
      </div>
      <div className={styles.inputContainer}>
        <TextArea setMessage={setMessage} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;
