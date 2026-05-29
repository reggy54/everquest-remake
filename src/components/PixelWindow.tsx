import React from 'react';

interface PixelWindowProps {
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function PixelWindow({ title, children, onClose, className = '' }: PixelWindowProps) {
  return (
    <div className={`relative flex flex-col text-white w-full h-full bg-leather border-metal drop-shadow-2xl ${className}`}>
      
      {/* Title Bar (Metal style) */}
      {title && (
        <div className="bg-[#1a1a1a] p-3 flex justify-between items-center border-b border-[#333] shadow-[0_4px_10px_rgba(0,0,0,0.8)] relative z-10" style={{ backgroundImage: 'linear-gradient(to bottom, #3f4c6b, #1f2736)' }}>
          {/* Rivets */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2 w-2 h-2 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.3)] border border-[#000]"></div>
          <div className="absolute top-1/2 -translate-y-1/2 right-2 w-2 h-2 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.3)] border border-[#000]"></div>
          
          <h2 className="m-0 font-bold text-amber-500 uppercase text-sm md:text-base tracking-widest pl-4 drop-shadow-[2px_2px_0_#000]">
            {title}
          </h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="mr-3 bg-[#8b0000] border border-[#222] text-white font-bold w-6 h-6 flex items-center justify-center cursor-pointer shadow-[inset_0_0_5px_#000] hover:bg-[#aa0000] transition-colors relative z-20"
            >
              X
            </button>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden p-2 md:p-3 relative w-full h-full bg-[rgba(0,0,0,0.2)]">
        {children}
      </div>
    </div>
  );
}
