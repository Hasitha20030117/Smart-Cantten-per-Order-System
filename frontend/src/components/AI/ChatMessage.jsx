import React from 'react';
import { Bot, User } from 'lucide-react';

const ChatMessage = ({ chat }) => {
  if (chat.hideInChat) return null;

  const isModel = chat.role === 'model';

  return (
    <div className={`flex w-full items-end gap-2.5 transition-all duration-300 transform opacity-100 translate-y-0 ${isModel ? 'justify-start' : 'justify-end'}`}>
      
      {/* Bot Avatar */}
      {isModel && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm border border-orange-200/50 z-10">
          <Bot size={15} strokeWidth={2.5} />
        </div>
      )}

      {/* Message Bubble */}
      <div 
        className={`max-w-[78%] px-4 py-3 rounded-2xl text-[14.5px] leading-[1.6] shadow-sm whitespace-pre-wrap relative z-0
          ${isModel 
            ? 'bg-white border border-gray-100 text-slate-700 rounded-bl-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)]' 
            : 'bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-br-sm shadow-[0_4px_15px_rgba(249,115,22,0.15)] font-medium'
          }
          ${chat.isError ? 'border-red-200 bg-red-50 text-red-600' : ''}
        `}
      >
        {chat.text}
      </div>

      {/* User Avatar */}
      {!isModel && (
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-sm border border-slate-200 z-10">
          <User size={15} strokeWidth={2.5} />
        </div>
      )}

    </div>
  );
};

export default ChatMessage;