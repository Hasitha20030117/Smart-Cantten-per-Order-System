import React, { useRef, useState, useEffect } from "react";

const ChartForm = ({ chatHistory, setChatHistory, generateBotResponse, isLoading, quotaError, cooldownTime }) => {
  const inputRef = useRef();
  const [inputValue, setInputValue] = useState("");
  const maxChars = 500;

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const userMessage = inputRef.current.value.trim();
    
    // Prevent sending if loading, cooldown active, or no message
    if (!userMessage || isLoading || cooldownTime > 0) {
      return;
    }

    // Add user message to chat
    setChatHistory((history) => [
      ...history,
      { role: "user", text: userMessage, timestamp: new Date() }
    ]);

    setInputValue("");
    inputRef.current.value = "";

    // Generate bot response with delay
    setTimeout(() => {
      generateBotResponse([
        ...chatHistory,
        { role: "user", text: `using the details provide above, please address this query: ${userMessage}` }
      ]);
    }, 500);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' && !e.shiftKey) && !isLoading && cooldownTime === 0) {
      e.preventDefault();
      if (inputRef.current.value.trim()) {
        handleFormSubmit(e);
      }
    }
  };

  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const charsRemaining = maxChars - inputValue.length;
  const isDisabled = isLoading || cooldownTime > 0;
  const isSendDisabled = isLoading || cooldownTime > 0 || !inputValue.trim();

  return (
    <form onSubmit={handleFormSubmit} className="chat-form">
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
          className="message-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          maxLength={maxChars}
        />
        <span className="char-count" title={`${charsRemaining} characters remaining`}>
          {charsRemaining < 50 && charsRemaining}
        </span>
      </div>
      <button 
        type="submit"
        className="send-btn"
        disabled={isSendDisabled}
        title="Send message (Enter)"
      >
        <span className="material-symbols-rounded">
          {isLoading ? 'schedule' : 'send'}
        </span>
      </button>
    </form>
  );
};

export default ChartForm;