import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const sampleText = `Technology is evolving faster than ever, and with it comes an entirely new way of interacting with the world. From smartphones to self-driving cars, artificial intelligence to quantum computing, the innovations of today were science fiction just a few decades ago. In this ever-changing digital landscape, the ability to adapt is no longer optional—it’s a necessity. Communication, creativity, and critical thinking are now more valuable than raw knowledge, and the skill of typing quickly and accurately is at the core of most modern workflows. Whether you're writing code, composing an email, chatting with a friend, or building your next great idea, your keyboard becomes your connection to progress. As remote work, digital learning, and online collaboration grow, the demand for tech fluency increases. No longer is typing just a skill for office workers—it’s essential for gamers, students, creators, and professionals alike. It’s not just about speed; accuracy and endurance matter just as much. The rhythm of your fingers can reflect the rhythm of your thoughts. Mistakes are normal—what counts is how quickly you recover and keep going. That’s why consistent practice is the secret to growth. Even small improvements each day add up to real mastery. So sit up straight, focus your mind, and take a deep breath. You’re not just pressing keys—you’re translating thoughts into action, ideas into impact. Every keystroke is a step forward. Keep typing, keep improving, and remember: greatness begins with consistency and belief in yourself.`;

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
  const currentCharRef = useRef(null);
  const typingBoxRef = useRef(null);
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

  // Smart scroll to keep current character in view
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


  // Smart auto-scroll: Only scroll when cursor goes out of view


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

          <div 
            className="typing-box" 
            ref={typingBoxRef}
            onClick={() => inputRef.current.focus()}
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