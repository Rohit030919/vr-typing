import { useNavigate } from 'react-router-dom';
import './App.css';
import { useState } from 'react';

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

function Home() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = () => {
    if (joinCode.trim().length > 0) {
      navigate(`/room/${joinCode.trim()}`);
    } else {
      alert('Please enter a room code');
    }
  };

  return (
    <div className="app">
      <h1>vr typing</h1>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        <button onClick={handleCreateRoom} className="create-btn">
          Create Room
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="room-input"
          />
          <button onClick={handleJoinRoom} className="join-btn">
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
