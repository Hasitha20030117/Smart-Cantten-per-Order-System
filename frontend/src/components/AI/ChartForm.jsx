import React, { useRef, useState, useEffect } from "react";
import { Send } from "lucide-react";

const ChartForm = ({ chatHistory, setChatHistory, generateBotResponse, isLoading, cooldownTime }) => {
  const inputRef = useRef();
  const [inputValue, setInputValue] = useState("");

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const userMessage = inputValue.trim();
    
    if (!userMessage || isLoading || cooldownTime > 0) return;

    setChatHistory((history) => [
      ...history,
      { role: "user", text: userMessage, timestamp: new Date() }
    ]);

    setInputValue("");
    if (inputRef.current) inputRef.current.value = "";

    setTimeout(() => {
      generateBotResponse([
        ...chatHistory,
        { role: "user", text: `using the details provide above, please address this query: ${userMessage}` }
      ]);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      if (inputValue.trim()) {
        handleFormSubmit(e);
      }
    }
  };

  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const isSendDisabled = isLoading || cooldownTime > 0 || !inputValue.trim();

  return (
    <form onSubmit={handleFormSubmit} className="relative flex items-center w-full group">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isLoading ? "Please wait..." : "Type your message..."}
        disabled={isLoading || cooldownTime > 0}
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-[14.5px] rounded-full pl-5 pr-14 py-3.5 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all duration-300 disabled:opacity-60 disabled:bg-slate-100 placeholder:text-slate-400"
      />
      <button 
        type="submit"
        disabled={isSendDisabled}
        className={`absolute right-1.5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
          ${isSendDisabled 
            ? 'bg-transparent text-slate-300 cursor-not-allowed' 
            : 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md hover:shadow-lg transform hover:scale-105 hover:-translate-y-0.5 active:scale-95'
          }
        `}
      >
        <Send size={18} className={isSendDisabled ? '' : 'translate-x-[1px] translate-y-[-1px]'} strokeWidth={2.5} />
      </button>
    </form>
  );
};

export default ChartForm;