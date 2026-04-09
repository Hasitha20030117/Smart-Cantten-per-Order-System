import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

import ChatbotIcon from "./ChatbotIcon";
import "./chatbot.css";
import ChartForm from "./ChartForm";
import ChatMessage from "./ChatMessage";
import { companyInfo } from './companyInfo';

function Chatbot() {
  const { darkMode } = useTheme();
  const [chatHistory, setChatHistory] = useState([
    { hideInChat: true, role: "model", text: JSON.stringify(companyInfo) },
    { role: "model", text: "👋 Hey there! Welcome to Smart Canteen Chat Assistant.\\nAsk me about menus, orders, bulk orders, or how to use the system!" }, 
  ]);

  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {

    //helper function to update chat history
    const updateHistory = (text,isError=false) => {
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
      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\\\\*\\\\*|__|\*/g, '').trim();
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
    <>
      {/* Toggle Button */}
      <button 
        onClick={()=> setShowChatbot(prev => !prev)} 
        className={`chatbot-toggler fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-xl z-[100] border-4 ${
          darkMode 
            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-slate-100 border-slate-900/50 shadow-slate-900/50 hover:shadow-orange-500/50' 
            : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-white/30 shadow-orange-500/30 hover:shadow-orange-400/50'
        }`}
        title="Chat Assistant"
      >
        <span className={`material-symbols-rounded transition-all ${showChatbot ? 'opacity-0 rotate-90 -mr-1' : 'opacity-100'}`}>chat</span>
        <span className={`material-symbols-rounded absolute transition-all ${showChatbot ? 'opacity-100 rotate-90' : 'opacity-0'}`}>close</span>
      </button>
      
      {/* Chat Popup */}
      <div className={`chatbot-container fixed bottom-24 right-6 w-96 rounded-3xl overflow-hidden transition-all duration-300 shadow-2xl z-[99] border backdrop-blur-lg ${
        showChatbot 
          ? 'scale-100 opacity-100 translate-x-0' 
          : 'scale-90 opacity-0 translate-x-10 pointer-events-none'
      } ${darkMode ? 'bg-slate-900/95 border-slate-700/50 shadow-slate-900/50' : 'bg-white/95 border-slate-200/50 shadow-black/20'}`}>
        
        {/* Header */}
        <div className="chatbot-header flex items-center justify-between p-5 bg-gradient-to-r from-orange-500 to-yellow-500 dark:from-orange-600 dark:to-amber-600 shadow-lg border-b border-orange-400/30">
          <div className="header-info flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full p-2.5 flex-shrink-0 shadow-lg ${
              darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-orange-500 to-yellow-500'
            }`}>
              <ChatbotIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Smart Canteen Assistant</h2>
              <p className={`text-xs mt-0.5 font-medium ${darkMode ? 'text-slate-400' : 'text-orange-700 dark:text-orange-400'}`}>
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
          </div>
          <button 
            onClick={()=> setShowChatbot(false)} 
            className="w-10 h-10 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-xl text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg transition-all duration-200 ml-2"
            title="Close chat"
          >
            close
          </button>
        </div>

        {/* Body */}
        <div ref={chatBodyRef} className="chat-body flex flex-col gap-4 h-96 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400/60 dark:scrollbar-thumb-slate-600/60 scrollbar-track-slate-100/50 dark:scrollbar-track-slate-900/50">
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} darkMode={darkMode} />
          ))}
        </div>

        {/* Footer */}
        <div className="chat-footer p-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50">
          <ChartForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </>
  );
}

export default Chatbot;

