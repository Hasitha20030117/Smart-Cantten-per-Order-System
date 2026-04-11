import React, { useState } from 'react';
import ChatbotIcon from './ChatbotIcon';

const ChatMessage = ({ chat }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(chat.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const isBot = chat.role === 'model';

  return (
    !chat.hideInChat && (
      <div className={`message ${isBot ? 'bot' : 'user'}-message ${chat.isError ? 'error' : ''}`}>
        {isBot && <ChatbotIcon />}
        <div className="message-wrapper">
          <p className="message-text">{chat.text}</p>
          <div className="message-meta">
            {chat.timestamp && <span className="message-time">{formatTime(chat.timestamp)}</span>}
            {isBot && !chat.isError && (
              <button 
                onClick={handleCopy}
                className="copy-btn"
                title="Copy message"
              >
                <span className="material-symbols-rounded">
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default ChatMessage;