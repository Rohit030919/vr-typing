import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const sampleText = `Technology is evolving faster than ever, and with it comes an entirely new way of interacting with the world. From smartphones to self-driving cars, artificial intelligence to quantum computing, the innovations of today were science fiction just a few decades ago. In this ever-changing digital landscape, the ability to adapt is no longer optional—it's a necessity. Communication, creativity, and critical thinking are now more valuable than raw knowledge, and the skill of typing quickly and accurately is at the core of most modern workflows. Whether you're writing code, composing an email, chatting with a friend, or building your next great idea, your keyboard becomes your connection to progress. As remote work, digital learning, and online collaboration grow, the demand for tech fluency increases. No longer is typing just a skill for office workers—it's essential for gamers, students, creators, and professionals alike. It's not just about speed; accuracy and endurance matter just as much. The rhythm of your fingers can reflect the rhythm of your thoughts. Mistakes are normal—what counts is how quickly you recover and keep going. That's why consistent practice is the secret to growth. Even small improvements each day add up to real mastery. So sit up straight, focus your mind, and take a deep breath. You're not just pressing keys—you're translating thoughts into action, ideas into impact. Every keystroke is a step forward. Keep typing, keep improving, and remember: greatness begins with consistency and belief in yourself.`;

const socket = io('https://vr-typing-server.onrender.com');

function TypingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [userInput, setUserInput] = useState('');
  const [opponentIndex, setOpponentIndex] = useState(null);
  const [opponentData, setOpponentData] = useState(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState(null);

  const inputRef = useRef(null);
  const currentCharRef = useRef(null);
  const typingBoxRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  
  const playerName = location.state?.playerName || 'Anonymous';

  useEffect(() => {
    socket.emit('join-room', { roomId, playerName });

    socket.on('both-players-joined', () => {
      setIsWaiting(false);
      startCountdown();
    });

    socket.on('opponent-progress', (data) => {
      setOpponentIndex(data.index);
    });

    socket.on('opponent-finished', (data) => {
      setOpponentData(data);
    });

    socket.on('opponent-disconnected', () => {
      setOpponentData(null);
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      socket.disconnect();
    };
  }, [roomId, playerName]);

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownRef.current);
        setIsTypingActive(true);
        setStartTime(Date.now());
        inputRef.current?.focus();
        startTimer();
      }
    }, 1000);
  };

  const startTimer = () => {
    let time = 60;
    setTimeLeft(time);
    
    timerRef.current = setInterval(() => {
      time--;
      setTimeLeft(time);
      if (time === 0) {
        clearInterval(timerRef.current);
        finishTyping();
      }
    }, 1000);
  };

  const finishTyping = () => {
    const finalEndTime = Date.now();
    const timeElapsedInSeconds = (finalEndTime - startTime) / 1000;
    
    // Minimum test time of 5 seconds to prevent false results
    if (timeElapsedInSeconds < 5) {
      alert('Test too short! Minimum 5 seconds required');
      return;
    }

    const timeElapsedInMinutes = timeElapsedInSeconds / 60;
    const attemptedLength = Math.min(userInput.length, sampleText.length);
    
    // Count correct characters (ignores extra typed characters)
    const correctChars = Array.from(userInput)
      .slice(0, attemptedLength)
      .reduce((acc, char, i) => char === sampleText[i] ? acc + 1 : acc, 0);

    // Standard WPM calculation (5 chars = 1 word)
    const userWPM = Math.max(0, Math.round((correctChars / 5) / timeElapsedInMinutes));
    const userAccuracy = attemptedLength > 0 
      ? Math.max(0, Math.min(100, Math.round((correctChars / attemptedLength) * 100)))
      : 0;

    const userData = {
      wpm: userWPM,
      accuracy: userAccuracy,
      name: playerName,
      socketId: socket.id // Add socket ID for tracking
    };

    setFinalStats({
      userStats: userData,
      opponentStats: opponentData
    });
    setShowResults(true);

    // Only emit if we have valid results
    if (userWPM > 0) {
      socket.emit('user-finished', { 
        roomId, 
        userData 
      });
    }
  };

  const handleInput = (e) => {
    if (!isTypingActive) return;

    const value = e.target.value;
    setUserInput(value);
    socket.emit('progress', { roomId, index: value.length });

    if (value.length >= sampleText.length) {
      finishTyping();
    }

    if (currentCharRef.current && typingBoxRef.current) {
      const cursorOffsetTop = currentCharRef.current.offsetTop;
      const boxScrollTop = typingBoxRef.current.scrollTop;
      const boxHeight = typingBoxRef.current.clientHeight;

      if (
        cursorOffsetTop < boxScrollTop || 
        cursorOffsetTop >= boxScrollTop + boxHeight
      ) {
        typingBoxRef.current.scrollTop = cursorOffsetTop - boxHeight / 2;
      }
    }
  };

  const handlePlayAgain = () => {
    setUserInput('');
    setOpponentIndex(null);
    setOpponentData(null);
    setIsWaiting(true);
    setCountdown(3);
    setIsTypingActive(false);
    setTimeLeft(60);
    setStartTime(null);
    setEndTime(null);
    setShowResults(false);
    setFinalStats(null);
    
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${newRoomId}`, { 
      state: { playerName } 
    });
  };

  const handleRematch = () => {
    setUserInput('');
    setOpponentIndex(null);
    setOpponentData(null);
    setIsWaiting(true);
    setCountdown(3);
    setIsTypingActive(false);
    setTimeLeft(60);
    setStartTime(null);
    setEndTime(null);
    setShowResults(false);
    setFinalStats(null);
    
    socket.emit('join-room', { roomId, playerName });
  };

  const determineWinner = () => {
    if (!finalStats.opponentStats) {
      return { winner: 'Opponent Left', icon: '🤷‍♂️' };
    }
    if (finalStats.userStats.wpm > finalStats.opponentStats.wpm) {
      return { winner: 'You Win!', icon: '🎉' };
    }
    if (finalStats.userStats.wpm < finalStats.opponentStats.wpm) {
      return { winner: 'You Lose', icon: '😔' };
    }
    return { winner: "It's a Tie!", icon: '🤝' };
  };

  return (
    <div className="app">
      {/* Results Popup */}
      {showResults && (
        <div className="results-popup">
          <div className="results-content">
            <h2>Game Results</h2>
            
            <div className="winner-display">
              <span className="winner-icon">{determineWinner().icon}</span>
              <h3>{determineWinner().winner}</h3>
            </div>

            <div className="stats-grid">
              <div className="player-stats">
                <h4>You</h4>
                <p>WPM: {finalStats.userStats.wpm}</p>
                <p>Accuracy: {finalStats.userStats.accuracy}%</p>
              </div>
              
              <div className="vs">VS</div>
              
              <div className="opponent-stats">
                <h4>Opponent</h4>
                {finalStats.opponentStats ? (
                  <>
                    <p>WPM: {finalStats.opponentStats.wpm}</p>
                    <p>Accuracy: {finalStats.opponentStats.accuracy}%</p>
                  </>
                ) : (
                  <p>Disconnected</p>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={handleRematch} className="rematch-btn">
                🔄 Rematch
              </button>
              <button onClick={handlePlayAgain} className="new-game-btn">
                🎮 New Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your existing JSX remains the same */}
      <div className="room-header">
        <h2>Room: {roomId}</h2>
        <p>Player: {playerName}</p>
      </div>

      {isWaiting ? (
        <div className="waiting-screen">
          <div className="spinner"></div>
          <h3>Waiting for opponent to join...</h3>
          <p>Share this room code: <strong>{roomId}</strong></p>
        </div>
      ) : !isTypingActive && countdown > 0 ? (
        <div className="countdown-screen">
          <h1 className="countdown-number">{countdown}</h1>
          <p>Get ready to type!</p>
        </div>
      ) : !isTypingActive && countdown === 0 ? (
        <div className="countdown-screen">
          <h1 className="go-text">GO!</h1>
        </div>
      ) : (
        <div className="typing-section">
          <div className="game-info">
            <div className="timer">Time: {timeLeft}s</div>
            <div className="progress">Progress: {userInput.length}/{sampleText.length}</div>
          </div>
          
          <div 
            className="typing-box" 
            ref={typingBoxRef}
            onClick={() => inputRef.current?.focus()}
          >
            {sampleText.split('').map((char, idx) => {
              let className = '';
              if (idx < userInput.length) {
                className = char === userInput[idx] ? 'correct' : 'wrong';
              } else if (idx === userInput.length) {
                className = 'cursor';
              }

              if (opponentIndex !== null && idx < opponentIndex && idx >= userInput.length) {
                className = 'opponent';
              }

              return (
                <span
                  key={idx}
                  className={className}
                  ref={idx === userInput.length ? currentCharRef : null}
                >
                  {char}
                </span>
              );
            })}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInput}
            className="hidden-input"
            maxLength={sampleText.length}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            disabled={!isTypingActive}
          />
        </div>
      )}
    </div>
  );
}

export default TypingRoom;