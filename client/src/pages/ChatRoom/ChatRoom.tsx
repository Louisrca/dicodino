import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RoomHeader from "../../components/RoomHeader/RoomHeader";
import TextArea from "../../components/TextArea/TextArea";
import { SocketContext } from "../../context/socketProvider";
import styles from "./ChatRoom.module.css";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; username: string };
  createdAt: string;
}

const ChatRoom = () => {
  const { socket } = useContext(SocketContext);
  const [message, setMessage] = useState("");

  const localStoragePlayer = JSON.parse(
    localStorage.getItem("player") || '{"username":"Anonyme"}',
  );

  const { roomId } = useParams();

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetch(`http://localhost:8081/api/dicodino/room/message/${roomId}`)
      .then((res) => res.json())
      .then((data: Message[]) => {
        setMessages(data);
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
      });
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: Message) => {
      console.log("🚀 ~ handleNewMessage ~ data:", data);
      setMessages((prev) => [...prev, data]);
    };

    socket.on("newMessage", handleNewMessage);

    socket.on("room:newWordReady", (data) => {
      console.log("New word ready:", data.definition);

      if (localStorage.getItem("currentDefinition")) {
        localStorage.removeItem("currentDefinition");
      }
      localStorage.setItem("currentDefinition", data.definition);
    });

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  const sendMessage = async () => {
    await fetch(
      `http://localhost:8081/api/dicodino/room/${roomId}/message/${localStoragePlayer.id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Message sent:", data);
        setMessage("");
      })
      .catch((err) => {
        console.error("Error sending message:", err);
      });
  };

  return (
    <div className={styles.chatRoomContainer}>
      <div className="header">
        <RoomHeader
          definition={localStorage.getItem("currentDefinition") || ""}
        />
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
