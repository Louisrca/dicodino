import { Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import SocketProvider from "./context/socketProvider";
import ChatRoom from "./pages/ChatRoom/ChatRoom";
import CreateRoom from "./pages/CreateRoom/CreateRoom";
import Home from "./pages/Home/Home";
import JoinRoom from "./pages/JoinRoom/JoinRoom";
import Lobby from "./pages/Lobby/Lobby";
function App() {
  return (
    <div className="App">
      <SocketProvider>
        <Header />
        <Routes>
          <Route path="/room" element={<ChatRoom />} />
          <Route path="/createRoom" element={<CreateRoom />} />
          <Route path="/joinRoom" element={<JoinRoom />} />
          <Route path="/lobby/:id" element={<Lobby />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </SocketProvider>
    </div>
  );
}

export default App;
