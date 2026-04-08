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
    { role: "model", text: "👋 Hey there!\nHow can I help you today?" }, 
  ]);

  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {

    //helper function to update chat history
    const updateHistory= (text,isError=false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."), 
        { role: "model", text , isError}
      ]);
    }

    //Format the chat history for the API request
    history = history.map(({ role, text }) => ({role, parts: [{ text }]}));

    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({contents: history})
    };
    
    try{
      //make the API call to generate a response
      if (!GEMINI_API_URL) {
        throw new Error("Gemini API URL is not configured.");
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
    chatBodyRef.current.scrollTo({top: chatBodyRef.current.scrollHeight, behavior: "smooth"});
  }, [chatHistory]);

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
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChartForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
