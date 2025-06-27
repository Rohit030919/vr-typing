import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import TypingRoom from './TypingRoom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<TypingRoom />} />
    </Routes>
  );
}

export default App;