import React, { useState, useEffect } from 'react';
import {
  X, Play, FileText, CheckCircle, Clock, Star, Users,
  Shield, Globe, Award, Sparkles, Lock, ArrowRight, Video
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CourseDetailModal = ({ courseId, onClose, onEnroll, onEnterClassroom, onAuthRequired }) => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLesson, setPreviewLesson] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.getCourse(courseId);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Fetch course detail failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [courseId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || !data.course) return null;

  const { course, lessons, isEnrolled } = data;
  const discountPercent = course.discountPrice
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (isEnrolled) {
      onEnterClassroom(course.id);
    } else {
      onEnroll(course);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {course.category}
            </span>
            <span className="text-xs text-slate-400">• {course.level}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          {/* Hero Row: Details & Pricing Box */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {course.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {course.subtitle}
              </p>

              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 pt-1">
                <div className="flex items-center space-x-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{course.rating || 4.9}</span>
                  <span className="text-slate-500 font-normal">({course.reviewsCount || 120} ratings)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.enrolledCount || 850}+ Students</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>{course.language || 'English'}</span>
                </div>
              </div>

              {/* Hashtag chips */}
              {course.hashtags && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {course.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Card */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl">
              <div>
                <div className="relative rounded-xl overflow-hidden aspect-video mb-4 border border-slate-800">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
                      <Play className="w-6 h-6 fill-white" />
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline space-x-3 mb-2">
                  <span className="text-3xl font-extrabold text-white">
                    ₹{course.discountPrice || course.price}
                  </span>
                  {course.discountPrice && course.discountPrice < course.price && (
                    <>
                      <span className="text-base text-slate-500 line-through">₹{course.price}</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mb-6 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Instant access upon dynamic QR code payment</span>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleEnrollClick}
                  className={`w-full py-3.5 px-4 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 ${
                    isEnrolled
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  {isEnrolled ? (
                    <>
                      <span>Enter Classroom</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Enroll with UPI QR Code</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Lifetime access • Protected in-browser viewing
                </p>
              </div>
            </div>
          </div>

          {/* Key Course Features */}
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Course Inclusions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
              {(course.features || []).map((feat, i) => (
                <div key={i} className="flex items-center space-x-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Course Curriculum</h2>
                <p className="text-xs text-slate-400">{lessons.length} lectures & study documents</p>
              </div>
              <div className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
                Protected In-Browser Access
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-slate-900/60 transition-colors">
                  <div className="flex items-center space-x-3 min-w-0 pr-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {lesson.type === 'video' ? (
                        <Video className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500 font-mono">#{idx + 1}</span>
                        <h4 className="text-sm font-semibold text-white line-clamp-1">{lesson.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{lesson.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {lesson.isFreePreview ? (
                      <button
                        onClick={() => {
                          if (isEnrolled) {
                            onEnterClassroom(course.id);
                          } else {
                            // Can watch sample preview
                            onEnterClassroom(course.id);
                          }
                        }}
                        className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3 fill-indigo-300" />
                        <span>Free Preview</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Enrolled Only</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">About this Course</h2>
            <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {course.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
