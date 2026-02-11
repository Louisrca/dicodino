import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function App() {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState('Déconnecté');
  const [category, setCategory] = useState('');
  const [roomId, setRoomId] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    socketRef.current = io('http://localhost:8081');

    socketRef.current.on('connect', () => {
      setStatus('Connecté');
      console.log('✅ Connecté au serveur');
    });

    socketRef.current.on('disconnect', () => {
      setStatus('Déconnecté');
    });

    socketRef.current.on('room:update', (data: { roomId: string; players: string[], category: string }) => {
      console.log('📡 Room update:', data);
      setPlayers(data.players);
      setMessage(`Room ${data.roomId}: ${data.players.join(', ')}`);
      setCategory(data.category);
    });

    return () => {
      socketRef.current?.off('room:update');
      socketRef.current?.disconnect();
    };
  }, []);

  const createRoom = () => {
    if (!socketRef.current) return;

    socketRef.current.emit('room:create', pseudo, category, (response: { ok: boolean; roomId?: string; error?: string }) => {
      console.log('🛠️ Réponse create:', response);
      if (response.ok && response.roomId) {
        setRoomId(response.roomId);
        setMessage(`✅ Room créée: ${response.roomId}`);
        localStorage.setItem('roomId', response.roomId);
        localStorage.setItem('pseudo', pseudo);
      } else {
        setMessage(`❌ Erreur: ${response.error}`);
      }
    });
  };

  const joinRoom = () => {
    if (!socketRef.current) return;

    socketRef.current.emit('room:join', pseudo, roomId, (response: { ok: boolean; roomId?: string; error?: string }) => {
      console.log('🔁 Réponse join:', response);
      if (response.ok && response.roomId) {
        setMessage(`✅ Rejoint la room: ${response.roomId}`);
        localStorage.setItem('roomId', response.roomId);
        localStorage.setItem('pseudo', pseudo);
      } else {
        setMessage(`❌ Erreur: ${response.error}`);
      }
    });
  };

  const leaveRoom = () => {
    if (!socketRef.current) return;

    socketRef.current.emit('room:leave', roomId, (response: { ok: boolean; roomId?: string; error?: string }) => {
      console.log('🚪 Réponse leave:', response);
      if (response.ok) {
        setMessage(`🚶 Tu as quitté la room: ${response.roomId}`);
        setRoomId('');
        setCategory('');
        setPlayers([]);
        localStorage.removeItem('roomId');
        localStorage.removeItem('pseudo');
      } else {
        setMessage(`❌ Erreur: ${response.error}`);
      }
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Test Socket.IO</h1>
      <p>Status: {status}</p>
      
      <hr />
      
      <h2>Créer une room</h2>
      <input 
        placeholder="Pseudo" 
        value={pseudo} 
        onChange={(e) => setPseudo(e.target.value)} 
      />
      <input 
        placeholder="Catégorie" 
        value={category} 
        onChange={(e) => setCategory(e.target.value)} 
      />
      <button onClick={createRoom}>Créer</button>
      
      <hr />
      
      <h2>Rejoindre une room</h2>
      <input 
        placeholder="Pseudo" 
        value={pseudo} 
        onChange={(e) => setPseudo(e.target.value)} 
      />
      <input 
        placeholder="Room ID" 
        value={roomId} 
        onChange={(e) => setRoomId(e.target.value)} 
      />
      <button onClick={joinRoom}>Rejoindre</button>

      <hr />

      <h2>Lobby</h2>
      <p style={{ fontSize: '12px', color: '#888' }}>
        Room ID: {roomId}
      </p>
      <p style={{ fontSize: '12px', color: '#888' }}>
        Nombre de joueurs: {players.length}
      </p>
      <p style={{ fontSize: '12px', color: '#888' }}>
        Pseudos joueurs en cours: 
      </p>
      <ul>
        {players.map((playerPseudo, index) => (
          <li key={index} style={{ fontSize: '12px', color: playerPseudo === pseudo ? '#0f0' : '#000' }}>
            {playerPseudo} {playerPseudo === pseudo && '(vous)'}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: '12px', color: '#888' }}>
        Status: {status}
      </p>

      <hr />
      
      <h2>Messages</h2>
      <p style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
        {message || 'Aucun message'}
      </p>

      <button onClick={leaveRoom}>Quitter la room</button>
    </div>
  );
}

export default App;
