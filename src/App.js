import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import TypingRoom from './TypingRoom';
import Result from './Result';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<TypingRoom />} />
      <Route path="/results" element={<Result />} />

    </Routes>
  );
}

export default App;
