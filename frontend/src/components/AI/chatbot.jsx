import { useState, useEffect, useRef } from 'react';

import ChatbotIcon from "./ChatbotIcon";
import "./chatbot.css";
import ChartForm from "./ChartForm";
import ChatMessage from "./ChatMessage";
import { companyInfo } from './companyInfo';

function Chatbot() {
 const [chatHistory, setChatHistory] = useState([
    { hideInChat: true, role: "model", text: JSON.stringify(companyInfo) },
    { role: "model", text: "👋 Hey there! Welcome to Smart Canteen Chat Assistant.\\nAsk me about menus, orders, bulk orders, or how to use the system!" }, 
  ]);

  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {

    //helper function to update chat history
    const updateHistory= (text,isError=false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Typing..." && !msg.isTyping), 
        { role: "model", text , isError}
      ]);
    }

    //Format the chat history for the API request
    history = history.map(({ role, text }) => ({role, parts: [{ text }]}));

    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      // FALLBACK MOCK MODE - Works without API key!
      console.log('Using mock mode (add API key to .env for real Gemini AI)');
      setTimeout(() => {
        const lastUserMsg = history[history.length - 1]?.parts[0].text.toLowerCase() || '';
        let response = "Smart Canteen Assistant here! Add your Gemini API key to frontend/.env for real AI responses. Meanwhile:\\n";
        
        if (lastUserMsg.includes('menu') || lastUserMsg.includes('canteen')) {
          response = `Our canteens:\\n${companyInfo.canteens.map(c => `• ${c.name}: ${c.description}`).join('\\n')}\\n\\nWhat would you like to order?`;
        } else if (lastUserMsg.includes('order') || lastUserMsg.includes('buy')) {
          response = `To order:\\n1. Browse menus on home page\\n2. Use bulk-order for groups\\n3. Generate token for pickup\\n4. Scan QR at counter!`;
        } else if (lastUserMsg.includes('bulk') || lastUserMsg.includes('group')) {
          response = `${companyInfo.features.bulkOrder}\\nGo to /bulk-order page to start!`;
        } else if (lastUserMsg.includes('subscription') || lastUserMsg.includes('sub')) {
          response = `${companyInfo.features.subscription}\\nCheck /subscription page.`;
        } else if (lastUserMsg.includes('token')) {
          response = `Tokens are QR codes for quick pickup. Generate at /tokens after ordering.`;
        } else if (lastUserMsg.includes('help') || lastUserMsg.includes('how')) {
          response = companyInfo.howItWorks.join('\\n');
        } else {
          response += `Try asking about 'menu', 'order', 'bulk', or 'help'!`;
        }
        
        updateHistory(response);
      }, 1200); // Longer delay for realism
      return;
    }

    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({contents: history})
    };
    
    try{
      const response = await fetch(apiUrl, requestOptions);
      const data = await response.json();
      if(!response.ok) throw new Error(data.error?.message || data.error || "Failed to fetch response");
      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\\*\\*|__|\*/g, '').trim();
      updateHistory(apiResponseText);
    }catch (error) {
      updateHistory(`Sorry, API error: ${error.message}. Check console or use mock mode.`,true);
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
        <span className="material-symbols-rounded close-icon">close</span>
      </button>
      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Smart Canteen Assistant</h2>
          </div>
          <button onClick={()=> setShowChatbot(prev => !prev)} 
          className="material-symbols-rounded">close</button>
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
