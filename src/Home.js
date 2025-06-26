import { useNavigate } from 'react-router-dom';
import './App.css';

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

function Home() {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="app">
      <h1>vr typing</h1>
      <button onClick={handleCreateRoom} className="create-btn">
        Create Room
      </button>
    </div>
  );
}

export default Home;
