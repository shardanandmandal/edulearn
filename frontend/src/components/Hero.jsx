import React from 'react';
import {
  ShieldCheck, QrCode, BookOpen, Sparkles, Play, Search, CheckCircle2
} from 'lucide-react';

export const Hero = ({ selectedTag, onSelectTag, onSearch, searchQuery }) => {
  const popularHashtags = [
    '#FullStack',
    '#ReactJS',
    '#Python',
    '#DSA',
    '#GenAI',
    '#WebDev',
    '#Algorithms'
  ];

  return (
    <div className="relative overflow-hidden pt-8 pb-14 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950 border-b border-slate-800/80">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Protected Classroom Learning Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Master Skills With{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
            Protected Class Videos
          </span>{' '}
          & Lecture Notes
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          High-definition streamable video lectures and in-browser study documents. Students can view online with zero download risk, and unlock instant access via dynamic QR code payments.
        </p>

        {/* Search Bar on Mobile / Hero */}
        <div className="max-w-xl mx-auto pt-2">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by topic, lesson name, or hashtag..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 shadow-2xl focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Popular Hashtags */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium mr-1">Trending Topics:</span>
          {popularHashtags.map((tag) => {
            const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => onSelectTag(isSelected ? '' : tag)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* 3 Core Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto pt-8 text-left">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Strict Anti-Download Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Videos & notes are viewable only in-browser. Dynamic session watermarking & right-click protection deter unauthorized distribution.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Instant Dynamic QR Payment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students scan the dynamic UPI QR code on Google Pay, PhonePe, or Paytm and get access right after payment verification.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Interactive In-Browser Reader</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Read lecture slides, formula sheets, and code cheat-sheets directly with zoom controls, dark mode, and discussion boards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
