import { Route, Routes } from "react-router-dom";
import ChatRoom from "./pages/ChatRoom";
import "./App.css";

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ChatRoom />} />
      </Routes>
    </div>
  );
};

export default App;
