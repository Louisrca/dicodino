import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function App() {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState('Déconnecté');
  const [pseudo, setPseudo] = useState('');
  const [category, setCategory] = useState('');
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    socketRef.current = io('http://localhost:8080');

    socketRef.current.on('connect', () => {
      setStatus('✅ Connecté');
      console.log('Connecté au serveur');
    });

    socketRef.current.on('disconnect', () => {
      setStatus('❌ Déconnecté');
    });

    socketRef.current.on('room:update', (data) => {
      console.log('Room update:', data);
      setMessage(`Room ${data.roomId}: ${data.players.join(', ')}`);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const createRoom = () => {
    if (!socketRef.current) return;

    socketRef.current.emit('room:create', pseudo, category, (response: { ok: boolean; roomId?: string; error?: string }) => {
      console.log('Réponse create:', response);
      if (response.ok) {
        setRoomId(response.roomId || '');
        setMessage(`Room créée: ${response.roomId}`);
      } else {
        setMessage(`Erreur: ${response.error}`);
      }
    });
  };

  const joinRoom = () => {
    if (!socketRef.current) return;

    socketRef.current.emit('room:join', pseudo, roomId, (response: { ok: boolean; roomId?: string; error?: string }) => {
      console.log('Réponse join:', response);
      if (response.ok) {
        setMessage(`Rejoint la room: ${response.roomId}`);
      } else {
        setMessage(`Erreur: ${response.error}`);
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
      
      <h2>Messages</h2>
      <p style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
        {message || 'Aucun message'}
      </p>
    </div>
  );
}

export default App;