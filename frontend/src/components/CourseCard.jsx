import React from 'react';
import {
  Star, Users, Clock, Video, FileText, CheckCircle,
  ArrowRight, Sparkles, QrCode
} from 'lucide-react';

export const CourseCard = ({ course, onSelectCourse, onQuickBuy }) => {
  const discountPercent = course.discountPrice
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelectCourse(course.id)}
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Course Thumbnail & Floating Badges */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-slate-800">
              {course.category}
            </span>
            {course.enrolledCount > 1000 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950">
                Bestseller
              </span>
            )}
          </div>

          {/* Enrolled Badge */}
          {course.isEnrolled && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 shadow-lg">
              <CheckCircle className="w-3 h-3" />
              <span>Enrolled</span>
            </div>
          )}

          {/* Lecture / Document count pill */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-3 text-[11px] text-slate-300">
            <div className="flex items-center space-x-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-800">
              <Video className="w-3 h-3 text-indigo-400" />
              <span>{course.videoCount || 0} Videos</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-800">
              <FileText className="w-3 h-3 text-amber-400" />
              <span>{course.documentCount || 0} Docs</span>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-3">
          <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {course.subtitle}
          </p>

          {/* Rating & Social Proof */}
          <div className="flex items-center space-x-3 text-xs text-slate-400 pt-1">
            <div className="flex items-center space-x-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{course.rating || 4.9}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{course.enrolledCount || 100}+ students</span>
            </div>
          </div>

          {/* Hashtag tags */}
          {course.hashtags && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {course.hashtags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20"
                >
                  {tag}
                </span>
              ))}
              {course.hashtags.length > 3 && (
                <span className="text-[10px] text-slate-500 px-1 py-0.5">
                  +{course.hashtags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Action Bar */}
      <div className="p-5 pt-0 border-t border-slate-800/80 flex items-center justify-between mt-3">
        <div>
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-extrabold text-white">
              ₹{course.discountPrice || course.price}
            </span>
            {course.discountPrice && course.discountPrice < course.price && (
              <span className="text-xs text-slate-500 line-through">₹{course.price}</span>
            )}
          </div>
          {discountPercent > 0 && (
            <span className="text-[10px] font-bold text-emerald-400">
              {discountPercent}% OFF Special
            </span>
          )}
        </div>

        <div>
          {course.isEnrolled ? (
            <span className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1">
              <span>Go to Class</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickBuy(course);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Buy with QR</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
