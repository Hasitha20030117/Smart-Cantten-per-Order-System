import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Sparkles, Send, Bot } from 'lucide-react';
import ChartForm from "./ChartForm";
import ChatMessage from "./ChatMessage";
import { companyInfo } from './companyInfo';
import { GEMINI_API_URL } from "../../lib/axios";

function Chatbot() {
  const [chatHistory, setChatHistory] = useState([
    { hideInChat: true, role: "model", text: JSON.stringify(companyInfo) },
    { role: "model", text: "👋 Hey there! Welcome to Smart Canteen.\nHow can I help you today?" }, 
  ]);

  const [showChatbot, setShowChatbot] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {
    setIsTyping(true);
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."), 
        { role: "model", text, isError }
      ]);
      setIsTyping(false);
    }

    const formattedHistory = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: formattedHistory })
    };
    
    try {
      if (!GEMINI_API_URL) throw new Error("API configuration missing.");
      const response = await fetch(GEMINI_API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to fetch response");
      
      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*|__|\*/g, '').trim();
      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory("Sorry, I'm having trouble connecting right now. Please try again later.", true);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chatHistory, isTyping, showChatbot]);

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setShowChatbot(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 z-50 flex items-center justify-center
          ${showChatbot ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 hover:scale-110 hover:shadow-orange-500/30'}
          bg-gradient-to-r from-orange-500 to-amber-500 text-white`}
      >
        <MessageCircle size={28} className="animate-pulse" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] flex flex-col z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform origin-bottom-right overflow-hidden border border-gray-200/60
          ${showChatbot ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 flex items-center justify-between text-white shadow-md relative overflow-hidden shrink-0">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight flex items-center gap-1.5 drop-shadow-sm">
                Smart Assistant <Sparkles size={14} className="text-yellow-200" />
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-orange-50 font-medium tracking-wide">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse"></span>
                Online & ready to help
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowChatbot(false)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors relative z-10 backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Body */}
        <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/80 relative scroll-smooth">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 flex flex-col space-y-5">
            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-2.5 transition-opacity duration-300">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                   <Bot size={16} />
                 </div>
                 <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 relative z-10 shrink-0">
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
