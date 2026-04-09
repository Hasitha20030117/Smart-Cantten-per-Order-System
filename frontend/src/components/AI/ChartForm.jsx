import React, { useRef } from "react";

const ChartForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";

    // Update chat history with user message
    setChatHistory((history) => [...history, { role: "user", text: userMessage }]);

    // Simulate bot response after a delay
    setTimeout(() => {
      // Add a thinking message to the chat history
      setChatHistory((history) => [
        ...history,
        { role: "model", text: "Typing..." },
      ]);

      // Call the function to generate bot response with the current chat history
      generateBotResponse([...chatHistory, { role: "user", text: `using the details provide above, please address this query: ${userMessage} `}]);
    }, 600);
  };

  return (\n    <form onSubmit={handleFormSubmit} className="chat-form flex gap-2">\n      <input\n        ref={inputRef}\n        type="text"\n        placeholder="Ask about menus, orders, bulk..."\n        className="flex-1 px-4 py-3 rounded-2xl border-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/50 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 border-slate-200 dark:border-slate-600 shadow-inner transition-all duration-200"\n        required\n      />\n      <button \n        type="submit"\n        className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 dark:from-orange-600 dark:to-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-lg font-bold"\n        disabled={!inputRef.current?.value.trim()}\n      >\n        <span className="material-symbols-rounded">send</span>\n      </button>\n    </form>\n  );
};

export default ChartForm;