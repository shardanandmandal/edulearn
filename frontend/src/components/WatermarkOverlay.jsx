import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const WatermarkOverlay = () => {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const identity = user ? `${user.email} (${user.id})` : 'Protected Preview Session';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-20">
      {/* 1. Subtle tiled micro-watermarks across the canvas */}
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-16 p-6 opacity-[0.045] text-slate-100 font-mono text-xs rotate-[-18deg]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-4">
            <span className="font-bold tracking-widest">{identity}</span>
            <span className="text-[10px] tracking-wider">{timeStr} • NO DOWNLOAD</span>
          </div>
        ))}
      </div>

      {/* 2. Dynamic floating visible watermark drifting slowly across viewport */}
      <div className="floating-watermark absolute top-12 left-12 bg-slate-950/60 backdrop-blur-md border border-slate-700/50 text-slate-300 px-3 py-1.5 rounded-full text-xs font-mono shadow-2xl flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="font-medium text-slate-200">{identity}</span>
        <span className="text-slate-400 text-[10px]">| {timeStr}</span>
      </div>
    </div>
  );
};
