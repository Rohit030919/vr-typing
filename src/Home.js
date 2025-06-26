import { useNavigate } from 'react-router-dom';
import './App.css';
import { useState } from 'react';

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

function Home() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleCreateRoom = () => {
    if (playerName.trim().length === 0) {
      alert('Please enter your name');
      return;
    }
    const roomId = generateRoomId();
    navigate(`/room/${roomId}`, { state: { playerName: playerName.trim() } });
  };

  const handleJoinRoom = () => {
    if (playerName.trim().length === 0) {
      alert('Please enter your name');
      return;
    }
    if (joinCode.trim().length === 0) {
      alert('Please enter a room code');
      return;
    }
    navigate(`/room/${joinCode.trim()}`, { state: { playerName: playerName.trim() } });
  };

  return (
    <div className="app">
      <div className="home-container">
        <div className="header">
          <h1 className="title">⚡ VR Typing Challenge</h1>
          <p className="subtitle">Test your typing speed against friends in real-time!</p>
        </div>

        <div className="form-container">
          <div className="input-group">
            <label htmlFor="playerName">Your Name</label>
            <input
              id="playerName"
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="name-input"
              maxLength={20}
            />
          </div>

          <div className="actions-container">
            <button 
              onClick={handleCreateRoom} 
              className="create-btn"
              disabled={!playerName.trim()}
            >
              🎮 Create Room
            </button>
            
            <div className="join-section">
              <div className="input-group">
                <label htmlFor="roomCode">Room Code</label>
                <input
                  id="roomCode"
                  type="text"
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="room-input"
                  maxLength={6}
                />
              </div>
              <button 
                onClick={handleJoinRoom} 
                className="join-btn"
                disabled={!playerName.trim() || !joinCode.trim()}
              >
                🚀 Join Room
              </button>
            </div>
          </div>
        </div>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Real-time multiplayer</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span>Live WPM tracking</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span>Accuracy measurement</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;