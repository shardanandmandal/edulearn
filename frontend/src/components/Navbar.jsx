import React, { useState } from 'react';
import {
  GraduationCap, Search, BookOpen, Shield, User,
  LogOut, LogIn, UserPlus, CheckCircle, Sparkles, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({
  searchQuery,
  onSearchChange,
  currentView,
  onNavigate,
  onOpenAuth
}) => {
  const { user, isAuthenticated, isAdmin, logout, demoLogin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-3 group text-left"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight flex items-center space-x-1">
                  <span>Edu</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Learn</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block -mt-1">
                  Classroom Hub
                </span>
              </div>
            </button>

            {/* Navigation links (Desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  currentView === 'home' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Courses
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                    currentView === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>My Learning</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                    currentView === 'admin' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Instructor Studio</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Bar in Navbar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search lectures, topics, or hashtags (e.g. #Python)..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Mode Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Role Switcher</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Switch Active Session
                  </div>
                  <button
                    onClick={() => {
                      demoLogin('student');
                      setShowDemoMenu(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Login as Demo Student</span>
                    {user?.role === 'student' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => {
                      demoLogin('admin');
                      setShowDemoMenu(false);
                      onNavigate('admin');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-indigo-300 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Login as Admin / Instructor</span>
                    {user?.role === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* User Profile or Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2.5 p-1.5 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-950 object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{user?.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 text-xs border-b border-slate-800">
                      <p className="font-bold text-white line-clamp-1">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl transition-colors flex items-center space-x-2"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>My Learning Profile</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-indigo-300 hover:bg-slate-800 rounded-xl transition-colors flex items-center space-x-2"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Instructor Studio</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        onNavigate('home');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-slate-800 rounded-xl transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/30"
                >
                  Create Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
