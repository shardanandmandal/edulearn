import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, RotateCcw,
  CheckCircle, Circle, BookOpen, Video, FileText, ChevronRight,
  ShieldAlert, ArrowLeft, ZoomIn, ZoomOut, MessageSquare,
  Sparkles, Lock, FastForward, Clock
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { WatermarkOverlay } from './WatermarkOverlay';

export const Classroom = ({ courseId, onBack }) => {
  const { user, token } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Video Player state
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Document Reader state
  const [docContent, setDocContent] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [docZoom, setDocZoom] = useState(100);
  const [activeTab, setActiveTab] = useState('player'); // 'player', 'notes', 'qa'

  // Security Toast
  const [securityWarning, setSecurityWarning] = useState(null);

  // Questions tab state
  const [questions, setQuestions] = useState([
    { id: 1, author: 'Rahul V.', text: 'Does this architecture scale horizontally across Docker swarms?', time: '2 hours ago', reply: 'Prof. Aryan: Yes! Stateless token auth allows seamless replication behind Nginx load balancers.' }
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  // Fetch course & syllabus
  useEffect(() => {
    const fetchClassroom = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getCourseClassroom(courseId);
        if (res.success) {
          setCourse(res.course);
          setLessons(res.lessons || []);
          setCompletedLessonIds(res.enrollment?.completedLessons || []);
          if (res.lessons && res.lessons.length > 0) {
            setActiveLesson(res.lessons[0]);
          }
        } else {
          setError(res.message || 'Unable to access classroom.');
        }
      } catch (err) {
        setError('Failed to connect to classroom service.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();
  }, [courseId]);

  // Anti-Piracy Key & Context Event Interceptor
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent Print (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerSecurityToast('Printing is strictly disabled for licensed class material.');
      }
      // Prevent Save Page (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        triggerSecurityToast('Saving raw content is restricted. You can read online anytime!');
      }
      // Prevent Developer tools (F12, Ctrl+Shift+I)
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
        e.preventDefault();
        triggerSecurityToast('Inspection tools are disabled in the secure learner portal.');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerSecurityToast('Right click is disabled to protect instructor content.');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const triggerSecurityToast = (msg) => {
    setSecurityWarning(msg);
    setTimeout(() => {
      setSecurityWarning(null);
    }, 4000);
  };

  // Fetch document if active lesson requires it
  useEffect(() => {
    if (activeLesson && (activeLesson.type === 'document' || activeLesson.type === 'video_document')) {
      if (activeLesson.documentContent) {
        setDocContent(activeLesson.documentContent);
      } else {
        setDocLoading(true);
        api.getDocumentContent(courseId, activeLesson.id)
          .then(res => {
            if (res.success) {
              setDocContent(res.content);
            }
          })
          .catch(err => console.error(err))
          .finally(() => setDocLoading(false));
      }
    }
  }, [activeLesson, courseId]);

  // Toggle lesson complete
  const handleToggleComplete = async (lessonId) => {
    try {
      const res = await api.toggleLessonProgress(courseId, lessonId);
      if (res.success && res.enrollment) {
        setCompletedLessonIds(res.enrollment.completedLessons || []);
      }
    } catch (err) {
      console.error('Progress update error:', err);
    }
  };

  // Video Player Controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('video-player-container');
    if (!document.fullscreenElement) {
      container?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMovePlayer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  const handlePostQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQuestions([
      {
        id: Date.now(),
        author: user?.name || 'You',
        text: newQuestion.trim(),
        time: 'Just now',
        reply: 'Thank you for your question! Instructor reviews doubts daily.'
      },
      ...questions
    ]);
    setNewQuestion('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-slate-300">Decrypting & Loading Classroom Stream...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Classroom Restricted</h2>
        <p className="text-slate-400 max-w-md mb-6">{error}</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Course Details</span>
        </button>
      </div>
    );
  }

  // Calculate completion percentage
  const progressPercent = lessons.length > 0 ? Math.round((completedLessonIds.length / lessons.length) * 100) : 0;

  // Stream URL with authenticated token
  const videoStreamUrl = activeLesson
    ? `/api/content/stream/video/${courseId}/${activeLesson.id}?token=${encodeURIComponent(token || '')}`
    : '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Classroom Bar */}
      <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center space-x-1.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-white line-clamp-1">{course?.title}</h1>
            <p className="text-xs text-slate-400 line-clamp-1">{activeLesson?.title}</p>
          </div>
        </div>

        {/* Security & Progress pill */}
        <div className="flex items-center space-x-4">
          {/* Protected Content Indicator */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Anti-Theft DRM Protected</span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400">Course Progress</span>
              <span className="text-xs font-bold text-indigo-400 ml-1.5">{progressPercent}%</span>
            </div>
            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Security Toast Warning */}
      {securityWarning && (
        <div className="fixed top-20 right-6 z-50 bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-bounce">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-xs font-medium">{securityWarning}</p>
        </div>
      )}

      {/* Main Classroom Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left & Center Stage: Video / Document Viewer */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
          {/* Main Media Player Container */}
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
            {activeLesson && (activeLesson.type === 'video' || activeLesson.type === 'video_document') && (
              <div
                id="video-player-container"
                onMouseMove={handleMouseMovePlayer}
                onMouseLeave={() => isPlaying && setShowControls(false)}
                className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 group"
              >
                {/* Anti-Download Watermark Layer */}
                <WatermarkOverlay />

                {/* HTML5 Protected Video Element */}
                <video
                  ref={videoRef}
                  src={videoStreamUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => {
                    setIsPlaying(false);
                    if (activeLesson && !completedLessonIds.includes(activeLesson.id)) {
                      handleToggleComplete(activeLesson.id);
                    }
                  }}
                  controlsList="nodownload noplaybackrate"
                  disablePictureInPicture
                  playsInline
                  className="w-full h-full object-contain pointer-events-auto"
                  onClick={togglePlay}
                />

                {/* Custom Video Controls Bar */}
                <div
                  className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-6 transition-opacity duration-300 z-30 ${
                    showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Progress Slider */}
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-slate-700/80 accent-indigo-500 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-200">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {/* Play / Pause */}
                      <button
                        onClick={togglePlay}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors shadow-md"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                      </button>

                      {/* Rewind 10s */}
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                          }
                        }}
                        className="p-1.5 hover:text-indigo-400 transition-colors"
                        title="Rewind 10s"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* Fast Forward 10s */}
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
                          }
                        }}
                        className="p-1.5 hover:text-indigo-400 transition-colors"
                        title="Forward 10s"
                      >
                        <FastForward className="w-4 h-4" />
                      </button>

                      {/* Volume Slider */}
                      <div className="flex items-center space-x-2">
                        <button onClick={toggleMute} className="hover:text-indigo-400 transition-colors">
                          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-14 sm:w-20 h-1 bg-slate-700 accent-indigo-500 rounded-lg cursor-pointer hidden sm:block"
                        />
                      </div>

                      {/* Timestamps */}
                      <div className="font-mono text-xs text-slate-300">
                        <span>{formatTime(currentTime)}</span>
                        <span className="mx-1 text-slate-500">/</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Playback speed selector */}
                      <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-xs font-mono">
                        {[1, 1.25, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`px-1.5 py-0.5 rounded transition-colors ${
                              playbackSpeed === speed ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 hover:text-indigo-400 transition-colors"
                        title="Fullscreen"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Lesson View (When type is 'document') */}
            {activeLesson && activeLesson.type === 'document' && (
              <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden protected-content">
                {/* Dual-layer watermark */}
                <WatermarkOverlay />

                {/* Document Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{activeLesson.title}</h2>
                      <p className="text-xs text-slate-400">{activeLesson.sectionTitle} • {activeLesson.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs">
                      <button
                        onClick={() => setDocZoom(Math.max(80, docZoom - 10))}
                        className="p-1 hover:text-indigo-400 text-slate-400"
                        title="Zoom out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-slate-300 px-1">{docZoom}%</span>
                      <button
                        onClick={() => setDocZoom(Math.min(160, docZoom + 10))}
                        className="p-1 hover:text-indigo-400 text-slate-400"
                        title="Zoom in"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleComplete(activeLesson.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                        completedLessonIds.includes(activeLesson.id)
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{completedLessonIds.includes(activeLesson.id) ? 'Completed' : 'Mark as Read'}</span>
                    </button>
                  </div>
                </div>

                {/* Document Body (Protected, rendered in-browser) */}
                <div
                  className="mt-8 text-slate-300 space-y-4 font-sans leading-relaxed transition-all"
                  style={{ fontSize: `${(docZoom / 100) * 1}rem` }}
                >
                  {docLoading ? (
                    <div className="py-20 text-center text-slate-500">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-xs">Loading protected material...</p>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none space-y-4">
                      {docContent.split('\n\n').map((paragraph, index) => {
                        if (paragraph.startsWith('# ')) {
                          return <h1 key={index} className="text-2xl sm:text-3xl font-extrabold text-white mt-6 mb-3">{paragraph.replace('# ', '')}</h1>;
                        }
                        if (paragraph.startsWith('## ')) {
                          return <h2 key={index} className="text-xl sm:text-2xl font-bold text-indigo-300 mt-5 mb-2">{paragraph.replace('## ', '')}</h2>;
                        }
                        if (paragraph.startsWith('### ')) {
                          return <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
                        }
                        if (paragraph.startsWith('> ')) {
                          return (
                            <blockquote key={index} className="border-l-4 border-indigo-500 pl-4 py-2 italic bg-indigo-500/5 rounded-r-lg text-indigo-200">
                              {paragraph.replace('> ', '')}
                            </blockquote>
                          );
                        }
                        if (paragraph.startsWith('```')) {
                          const codeText = paragraph.replace(/```[a-z]*\n?/g, '');
                          return (
                            <pre key={index} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto my-3">
                              <code>{codeText}</code>
                            </pre>
                          );
                        }
                        return <p key={index} className="text-slate-300 leading-relaxed">{paragraph}</p>;
                      })}
                    </div>
                  )}
                </div>

                {/* Footer Notice */}
                <div className="mt-12 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Protected by EduLearn Content Shield • In-Portal Document Access Only</span>
                  <span>Viewer: {user?.email}</span>
                </div>
              </div>
            )}
          </div>

          {/* Lower Tabs & Discussion Section */}
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-12">
            {/* Tab navigation */}
            <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
              <button
                onClick={() => setActiveTab('player')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'player' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Lesson Overview
              </button>

              {activeLesson && activeLesson.type === 'video_document' && (
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'notes' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Accompanying Notes</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('qa')}
                className={`pb-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'qa' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Q&A & Discussion ({questions.length})</span>
              </button>
            </div>

            {/* Tab contents */}
            <div className="py-6">
              {activeTab === 'player' && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{activeLesson?.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center space-x-2">
                        <span>{activeLesson?.sectionTitle}</span>
                        <span>•</span>
                        <span>{activeLesson?.duration}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleComplete(activeLesson.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                        completedLessonIds.includes(activeLesson?.id)
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{completedLessonIds.includes(activeLesson?.id) ? 'Completed' : 'Mark Lesson Complete'}</span>
                    </button>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed">{activeLesson?.summary || 'No summary provided for this lecture.'}</p>

                  {/* Course Hashtags */}
                  {course?.hashtags && course.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {course.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 protected-content">
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                    {docContent || 'Loading notes...'}
                  </div>
                </div>
              )}

              {activeTab === 'qa' && (
                <div className="space-y-6">
                  {/* Ask Question Form */}
                  <form onSubmit={handlePostQuestion} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <label className="block text-xs font-medium text-slate-400 mb-2">Ask a question about this lecture:</label>
                    <textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Type your question or doubt here..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors"
                      >
                        Submit Question
                      </button>
                    </div>
                  </form>

                  {/* Question list */}
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <div key={q.id} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-400">{q.author}</span>
                          <span className="text-slate-500">{q.time}</span>
                        </div>
                        <p className="text-sm text-slate-200">{q.text}</p>
                        {q.reply && (
                          <div className="mt-3 bg-slate-950/80 p-3 rounded-lg border-l-2 border-emerald-500 text-xs text-emerald-300">
                            {q.reply}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Syllabus & Lesson Navigator */}
        <aside className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 h-auto lg:h-[calc(100vh-4rem)]">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">Course Curriculum</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {completedLessonIds.length} of {lessons.length} lectures completed
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {lessons.map((lesson, idx) => {
              const isActive = activeLesson?.id === lesson.id;
              const isCompleted = completedLessonIds.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-all hover:bg-slate-800/60 ${
                    isActive ? 'bg-indigo-950/40 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  {/* Complete checkbox button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(lesson.id);
                    }}
                    className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {lesson.type === 'video' && <Video className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      {lesson.type === 'document' && <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      {lesson.type === 'video_document' && <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        {lesson.type}
                      </span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-[11px] text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1 inline" />
                        {lesson.duration}
                      </span>
                    </div>

                    <h4 className={`text-xs font-semibold leading-tight line-clamp-2 ${
                      isActive ? 'text-indigo-300' : isCompleted ? 'text-slate-400' : 'text-slate-200'
                    }`}>
                      {lesson.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
