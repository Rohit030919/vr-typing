import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';

function calculateStats(userInput, sampleText) {
  const wordsTyped = userInput.trim().split(' ').length;
  const totalChars = userInput.length;
  const correctChars = userInput.split('').filter((c, i) => c === sampleText[i]).length;
  const accuracy = ((correctChars / totalChars) * 100).toFixed(1);
  const wpm = Math.round((wordsTyped / 60) * 60);
  return { wpm, accuracy };
}

function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return <div className="app">No result found</div>;
  }

  const { userInput, sampleText, opponentIndex } = state;
  const { wpm, accuracy } = calculateStats(userInput, sampleText);

  const opponentWPM = Math.round((opponentIndex / 5) / 1); // rough estimate

  const winner =
    wpm > opponentWPM
      ? 'You Win! 🎉'
      : wpm < opponentWPM
      ? 'Opponent Wins 😔'
      : 'It\'s a Tie!';

  return (
    <div className="app">
      <h1>Results</h1>
      <h3>{winner}</h3>
      <div style={{ marginTop: '20px', fontSize: '18px' }}>
        <p><strong>Your WPM:</strong> {wpm}</p>
        <p><strong>Your Accuracy:</strong> {accuracy}%</p>
        <p><strong>Opponent Progress:</strong> {opponentIndex} characters</p>
        <p><strong>Opponent WPM (approx):</strong> {opponentWPM}</p>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
        <button onClick={() => navigate('/')} className="create-btn">Exit</button>
        <button onClick={() => window.location.reload()} className="join-btn">Play Again</button>
      </div>
    </div>
  );
}

export default Result;
