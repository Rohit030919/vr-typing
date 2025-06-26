import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';

function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="app">
        <div className="error-screen">
          <h2>No result data found</h2>
          <button onClick={() => navigate('/')} className="create-btn">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { userStats, opponentStats, playerName } = state;
  
  // Determine winner
  let winner = '';
  let winnerIcon = '';
  
  if (!opponentStats) {
    winner = 'Opponent Left';
    winnerIcon = '🤷‍♂️';
  } else if (userStats.wpm > opponentStats.wpm) {
    winner = 'You Win!';
    winnerIcon = '🎉';
  } else if (userStats.wpm < opponentStats.wpm) {
    winner = 'You Lose';
    winnerIcon = '😔';
  } else {
    winner = "It's a Tie!";
    winnerIcon = '🤝';
  }

  const handlePlayAgain = () => {
    navigate('/', { state: { playerName } });
  };

  return (
    <div className="app">
      <div className="results-container">
        <div className="results-header">
          <h1>Results</h1>
          <div className="winner">
            <span className="winner-icon">{winnerIcon}</span>
            <h2>{winner}</h2>
          </div>
        </div>

        <div className="stats-container">
          <div className="player-stats your-stats">
            <h3>Your Stats</h3>
            <div className="stat-item">
              <span className="stat-label">WPM</span>
              <span className="stat-value">{userStats.wpm}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{userStats.accuracy}%</span>
            </div>
            <div className="player-name">{playerName}</div>
          </div>

          <div className="vs-divider">VS</div>

          <div className="player-stats opponent-stats">
            <h3>Opponent Stats</h3>
            {opponentStats ? (
              <>
                <div className="stat-item">
                  <span className="stat-label">WPM</span>
                  <span className="stat-value">{opponentStats.wpm}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Accuracy</span>
                  <span className="stat-value">{opponentStats.accuracy}%</span>
                </div>
                <div className="player-name">{opponentStats.name}</div>
              </>
            ) : (
              <div className="opponent-left">
                <p>Opponent disconnected</p>
              </div>
            )}
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate('/')} className="exit-btn">
            🏠 Exit to Home
          </button>
          <button onClick={handlePlayAgain} className="play-again-btn">
            🎮 Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default Result;