import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const sampleText = `The quick brown fox jumps over the lazy dog. Typing speed tests help improve accuracy and speed. Just keep practicing every single day to get better at it.`;

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

  const inputRef = useRef(null);
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
      socket.off('both-players-joined');
      socket.off('opponent-progress');
      socket.off('opponent-finished');
      socket.off('opponent-disconnected');
      socket.disconnect();
    };
  }, [roomId, playerName]);

  const startCountdown = () => {
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        setIsTypingActive(true);
        setStartTime(Date.now());
        inputRef.current?.focus();
        startTimer();
      }
    }, 1000);
  };

  const startTimer = () => {
    let time = 60;
    const timer = setInterval(() => {
      time--;
      setTimeLeft(time);
      if (time === 0) {
        clearInterval(timer);
        finishTyping();
      }
    }, 1000);
  };

  const finishTyping = () => {
    const finalEndTime = Date.now();
    setEndTime(finalEndTime);
    setIsTypingActive(false);
    
    const timeInMinutes = (finalEndTime - startTime) / (1000 * 60);
    const wordsTyped = userInput.trim().split(/\s+/).filter(Boolean).length;
    const userWPM = Math.round(wordsTyped / timeInMinutes);
    
    const attemptedLength = Math.min(userInput.length, sampleText.length);
    const correctChars = userInput
      .split('')
      .slice(0, attemptedLength)
      .filter((c, i) => c === sampleText[i])
      .length;
    const userAccuracy = attemptedLength > 0 ? 
      ((correctChars / attemptedLength) * 100).toFixed(1) : 0;

    const userData = {
      wpm: userWPM,
      accuracy: parseFloat(userAccuracy),
      name: playerName
    };

    socket.emit('user-finished', { roomId, userData });

    navigate('/results', {
      state: {
        userStats: userData,
        opponentStats: opponentData,
        playerName
      },
    });
  };

  const handleInput = (e) => {
    if (!isTypingActive) return;
    
    const value = e.target.value;
    setUserInput(value);
    socket.emit('progress', { roomId, index: value.length });

    if (value.length >= sampleText.length) {
      finishTyping();
    }
  };

  return (
    <div className="app">
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
          
          <div className="typing-box" onClick={() => inputRef.current.focus()}>
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
                <span key={idx} className={className}>
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