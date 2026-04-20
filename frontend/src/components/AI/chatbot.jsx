import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

import ChatbotIcon from "./ChatbotIcon";
import "./chatbot.css";
import ChartForm from "./ChartForm";
import ChatMessage from "./ChatMessage";
import { companyInfo } from './companyInfo';
import { GEMINI_API_URL } from "../../lib/axios";

function Chatbot() {
  const { darkMode } = useTheme();
  const [chatHistory, setChatHistory] = useState([
    { hideInChat: true, role: "model", text: JSON.stringify(companyInfo) },
    { role: "model", text: "👋 Hey there!\nHow can I help you today?" }, 
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

    //helper function to update chat history
    const updateHistory= (text,isError=false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."), 
        { role: "model", text , isError}
      ]);
      setIsLoading(false);
    }

    //Format the chat history for the API request
    history = history.map(({ role, text }) => ({role, parts: [{ text }]}));

    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({contents: formattedHistory})
    };
    
    try{
      //make the API call to generate a response
      if (!GEMINI_API_URL) {
        throw new Error("API configuration missing");
      }

      const response = await fetch(GEMINI_API_URL, requestOptions);
      const data = await response.json();
      if(!response.ok) throw new Error(data.error.message || "Failed to fetch response");
      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*|__|\*/g, '').trim();
      updateHistory(apiResponseText);

        }catch (error) {
      updateHistory(error.message ,true);
  }

  };
  //Automatically scroll to the bottom of the chat body when new messages are added
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
      <button onClick={()=> setShowChatbot(prev => !prev)} id="chatbot-toggler">
        <span className="material-symbols-rounded">chat</span>
         <span className="material-symbols-rounded">Close</span>
      </button>
      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button onClick={()=> setShowChatbot(prev => !prev)} 
          className="material-symbols-rounded">Close</button>
        </div>
        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} darkMode={darkMode} />
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
