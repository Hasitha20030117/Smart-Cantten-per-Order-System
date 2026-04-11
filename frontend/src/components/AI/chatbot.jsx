import { useState, useEffect, useRef } from 'react';

import ChatbotIcon from "./ChatbotIcon";
import "./chatbot.css";
import ChartForm from "./ChartForm";
import ChatMessage from "./ChatMessage";
import { companyInfo } from './companyInfo';
import { GEMINI_API_URL } from "../../lib/axios";

function Chatbot() {
 const [chatHistory, setChatHistory] = useState([
    { hideInChat: true, role: "model", text: JSON.stringify(companyInfo) },
    { role: "model", text: "👋 Hey there!\nHow can I help you today?", timestamp: new Date() }, 
  ]);

  const [showChatbot, setShowChatbot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quotaError, setQuotaError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const chatBodyRef = useRef();
  const retryTimeoutRef = useRef(null);
  const cooldownIntervalRef = useRef(null);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      cooldownIntervalRef.current = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setQuotaError(false);
            clearInterval(cooldownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cooldownIntervalRef.current);
  }, [cooldownTime]);

  const generateBotResponse = async (history) => {
    // Check cooldown - silent, no alert
    if (cooldownTime > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setQuotaError(false);

    // Helper function to update chat history
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."), 
        { role: "model", text, isError, timestamp: new Date() }
      ]);
      setIsLoading(false);
    }

    // Format the chat history for the API request
    const formattedHistory = history.map(({ role, text }) => ({role, parts: [{ text }]}));

    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({contents: formattedHistory})
    };
    
    try {
      if (!GEMINI_API_URL) {
        throw new Error("API configuration missing");
      }

      const response = await fetch(GEMINI_API_URL, requestOptions);
      const data = await response.json();

      // Check for quota exceeded error
      if (response.status === 429 || data?.error?.message?.includes('quota') || data?.error?.message?.includes('Quota')) {
        setQuotaError(true);
        setRetryCount(0);
        const cooldown = Math.min(120, 30 * Math.pow(2, Math.min(retryCount, 2)));
        setCooldownTime(cooldown);
        
        updateHistory(
          `I'm experiencing high volume right now. Please try again in a moment. 😊`,
          false
        );
        return;
      }

      if(!response.ok) {
        throw new Error(data?.error?.message || "Service error");
      }

      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*|__|\*/g, '')
        .trim();
      
      // Reset retry count on success
      setRetryCount(0);
      updateHistory(apiResponseText);

    } catch (error) {
      console.error("Chatbot Error:", error);
      
      // Check if it's a network/quota error
      if (error.message.includes('quota') || error.message.includes('429')) {
        setQuotaError(true);
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        const cooldown = 60 + (newRetryCount * 30);
        setCooldownTime(Math.min(cooldown, 180));
        
        updateHistory(
          `Sorry, I'm a bit overwhelmed right now. Let me catch my breath and try that again! 🧠`,
          false
        );
      } else if (error.message.includes('API configuration')) {
        updateHistory(
          `Hmm, I'm not properly set up at the moment. Try asking about our menu or services! 📋`,
          false
        );
      } else {
        updateHistory(
          `I didn't quite catch that. Could you rephrase? 🤔`,
          false
        );
      }
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };
  }, []);

  // Auto-scroll to the bottom of the chat body when new messages are added
  useEffect(() => {
    if (chatBodyRef.current) {
      setTimeout(() => {
        chatBodyRef.current.scrollTo({top: chatBodyRef.current.scrollHeight, behavior: "smooth"});
      }, 100);
    }
  }, [chatHistory, isLoading]);

  const handleClearChat = () => {
    if (window.confirm("Clear all messages?")) {
      setChatHistory([
        { hideInChat: true, role: "model", text: JSON.stringify(companyInfo) },
        { role: "model", text: "👋 Hey there!\nHow can I help you today?", timestamp: new Date() }, 
      ]);
      setRetryCount(0);
      setCooldownTime(0);
      setQuotaError(false);
    }
  };

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ''}`}>
      <button onClick={()=> setShowChatbot(prev => !prev)} id="chatbot-toggler" title="Open Chat">
        <span className="material-symbols-rounded">chat</span>
        <span className="material-symbols-rounded">close</span>
      </button>
      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="header-info">
            <ChatbotIcon />
            <div>
              <h2 className="logo-text">Smart Canteen AI</h2>
              <p className="header-status">Always here to help 💬</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={handleClearChat}
              className="material-symbols-rounded header-btn"
              title="Clear chat"
            >
              delete_outline
            </button>
            <button 
              onClick={()=> setShowChatbot(prev => !prev)} 
              className="material-symbols-rounded header-btn"
              title="Close"
            >
              close
            </button>
          </div>
        </div>

        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
          {isLoading && (
            <div className="message bot-message">
              <ChatbotIcon />
              <div className="message-text typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChartForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
            isLoading={isLoading || cooldownTime > 0}
            quotaError={quotaError}
            cooldownTime={cooldownTime}
          />
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
