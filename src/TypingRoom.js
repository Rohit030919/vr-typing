import { useParams } from 'react-router-dom';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const sampleText = `The quick brown fox jumps over the lazy dog. Typing speed tests help improve accuracy and speed. Just keep practicing every single day to get better at it.`;

const socket = io('https://vr-typing-server.onrender.com');

function TypingRoom() {
  const { roomId } = useParams();
  const [userInput, setUserInput] = useState('');
  const [opponentIndex, setOpponentIndex] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    socket.emit('join-room', roomId);

    socket.on('opponent-progress', (index) => {
      setOpponentIndex(index);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const handleInput = (e) => {
    const value = e.target.value;
    setUserInput(value);
    socket.emit('progress', { roomId, index: value.length });
  };

  return (
    <div className="app">
      <h2>Room ID: {roomId}</h2>

      <div className="typing-box" onClick={() => inputRef.current.focus()}>
        {sampleText.split('').map((char, idx) => {
          let className = '';
          if (idx < userInput.length) {
            className = char === userInput[idx] ? 'correct' : 'wrong';
          } else if (idx === userInput.length) {
            className = 'cursor';
          }

          // Opponent progress (light blue opacity)
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
      />
    </div>
  );
}

export default TypingRoom;
