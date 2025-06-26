import { useParams, useNavigate } from 'react-router-dom';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const sampleText = `The quick brown fox jumps over the lazy dog. Typing speed tests help improve accuracy and speed. Just keep practicing every single day to get better at it.`;

const socket = io('https://vr-typing-server.onrender.com');

function TypingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');
  const [opponentIndex, setOpponentIndex] = useState(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const inputRef = useRef(null);

  useEffect(() => {
    socket.emit('join-room', roomId);

    socket.on('both-players-joined', () => {
      setIsWaiting(false);
      startCountdown();
    });

    socket.on('opponent-progress', (index) => {
      setOpponentIndex(index);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const startCountdown = () => {
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        setIsTypingActive(true);
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
        setIsTypingActive(false);
        navigate('/results', {
          state: {
            userInput,
            sampleText,
            opponentIndex,
          },
        });
      }
    }, 1000);
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setUserInput(value);
    socket.emit('progress', { roomId, index: value.length });
  };

  return (
    <div className="app">
      <h2>Room ID: {roomId}</h2>

      {isWaiting ? (
        <h3>Waiting for opponent to join...</h3>
      ) : !isTypingActive ? (
        <h1>{countdown > 0 ? `Starting in ${countdown}...` : 'GO!'}</h1>
      ) : (
        <>
          <h4>Time Left: {timeLeft}s</h4>
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
        </>
      )}
    </div>
  );
}

export default TypingRoom;
