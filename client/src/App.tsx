import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";

const App = () => {
  const socketRef = useRef<Socket>(null);
  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    socketRef.current.on("connect", () => {
      console.log("Connected to server with id:", socketRef.current?.id);
    });

    socketRef.current.on("join", (data) => {
      console.log("User joined:", data);
    });

    socketRef.current.on("definition", (data) => {
      console.log(data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Disconnected from server");
      }
    };
  }, []);

  return (
    <div className="App">
      <h1>DICODINO</h1>
      <h2>game setup</h2>
      <button onClick={() => socketRef.current?.emit("random-definition")}>
        generate random definition
      </button>
    </div>
  );
};

export default App;
