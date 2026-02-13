import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import RoomHeader from "../../components/RoomHeader/RoomHeader";
import TextArea from "../../components/TextArea/TextArea";
import { SocketContext } from "../../context/socketProvider";
import styles from "./ChatRoom.module.css";
import type { Message } from "../../types/message";
import { useRoomMessage } from "../../api/roomMessage/useRoomMessage";

const MAX_ROUNDS = 5;

const ChatRoom = () => {
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const [message, setMessage] = useState("");
  const { getMessageByRoomId, postMessage } = useRoomMessage();
  const [round, setRound] = useState(1);

  const localStoragePlayer = JSON.parse(
    localStorage.getItem("player") || '{"username":"Anonyme"}',
  );

  const { roomId } = useParams();
  const location = useLocation();
  const definitionFromNav = (location.state as { definition?: string } | null)
    ?.definition;

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentDefinition, setCurrentDefinition] = useState(
    () => definitionFromNav || localStorage.getItem("currentDefinition") || "",
  );

  useEffect(() => {
    if (definitionFromNav) {
      localStorage.setItem("currentDefinition", definitionFromNav);
    }
  }, [definitionFromNav]);

  useEffect(() => {
    const id = roomId || "";
    if (!id) return;
    let cancelled = false;
    getMessageByRoomId(id)
      .then((data) => {
        if (!cancelled && data) setMessages(data);
      })
      .catch((err: Error) => {
        if (!cancelled) console.error("Error fetching messages:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleNewWordReady = (data: { definition: string }) => {
      localStorage.setItem("currentDefinition", data.definition);
      setCurrentDefinition(data.definition);
    };

    const handleCorrectAnswer = (data: { username: string }) => {
      if (data.username) {
        alert(`${data.username} a trouvé la bonne réponse ! +1 point`);
      }
      setRound((r) => {
        const next = r + 1;
        if (next > MAX_ROUNDS) {
          alert("Partie terminée ! 5 rounds gagnés.");
          navigate(`/score/${roomId}`);
        }
        return next;
      });
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("room:newWordReady", handleNewWordReady);
    socket.on("room:correctAnswer", handleCorrectAnswer);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("room:newWordReady", handleNewWordReady);
      socket.off("room:correctAnswer", handleCorrectAnswer);
    };
  }, [socket, navigate]);

  const sendMessage = () => {
    postMessage(roomId || "", localStoragePlayer.id, message);
  };

  return (
    <div className={styles.chatRoomContainer}>
      <div className={styles.headerWrapper}>
        <RoomHeader definition={currentDefinition} round={round} />
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
        <TextArea
          setMessage={setMessage}
          className={styles.textAreaWrapper}
          inputClassName={styles.chatTextArea}
          placeholder="Écris ton message…"
          rows={2}
        />
        <button type="button" className={styles.sendButton} onClick={sendMessage}>
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
