import RoomHeader from "../../components/RoomHeader/RoomHeader";
import TextArea from "../../components/TextArea/TextArea";
import styles from "./ChatRoom.module.css";

const messages = [
  { id: 1, text: "Hello, how are you?", user: "me" },
  { id: 2, text: "I'm good, thanks! How about you?", user: "other" },
  {
    id: 3,
    text: "Doing well, just working on a project. tets tetst test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test",
    user: "me",
  },
  {
    id: 3,
    text: "Doing well, just working on a project. tets tetst test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test",
    user: "me",
  },
  {
    id: 3,
    text: "Doing well, just working on a project. tets tetst test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test",
    user: "me",
  },
  {
    id: 3,
    text: "Doing well, just working on a project. tets tetst test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test",
    user: "me",
  },
  {
    id: 3,
    text: "Doing well, just working on a project. tets tetst test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test",
    user: "me",
  },
];



const ChatRoom = () => {

  return (
    <div className={styles.chatRoomContainer}>
      <div>
        <RoomHeader />
      </div>
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.user === "me" ? styles.myMessage : styles.otherMessage
            }
          >
            {message.text}
          </div>
        ))}
      </div>
      <div>
        <TextArea />
      </div>
    </div>
  );
};

export default ChatRoom;
