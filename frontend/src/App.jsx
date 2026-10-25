import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CourseCard } from './components/CourseCard';
import { CourseDetailModal } from './components/CourseDetailModal';
import { PaymentQRModal } from './components/PaymentQRModal';
import { Classroom } from './components/Classroom';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { api } from './services/api';
import {
  GraduationCap, ShieldCheck, QrCode, BookOpen,
  Filter, Sparkles, Layers, CheckCircle
} from 'lucide-react';

const MainApp = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Navigation & View State
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'dashboard' | 'admin' | 'classroom'
  const [classroomCourseId, setClassroomCourseId] = useState(null);

  // Modals
  const [detailCourseId, setDetailCourseId] = useState(null);
  const [paymentCourse, setPaymentCourse] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });

  // Filters & Course list
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Web Development', 'Computer Science', 'Artificial Intelligence'];

  useEffect(() => {
    loadCourses();
  }, [searchQuery, selectedTag, selectedCategory, user]);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await api.getCourses({
        search: searchQuery,
        tag: selectedTag,
        category: selectedCategory === 'All' ? '' : selectedCategory
      });
      if (res.success) {
        setCourses(res.courses || []);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleEnterClassroom = (courseId) => {
    setDetailCourseId(null);
    setClassroomCourseId(courseId);
    setCurrentView('classroom');
  };

  const handleStartPayment = (course) => {
    if (!isAuthenticated) {
      setAuthModal({ open: true, mode: 'login' });
      return;
    }
    setDetailCourseId(null);
    setPaymentCourse(course);
  };

  const handlePaymentSuccess = () => {
    const courseId = paymentCourse?.id;
    setPaymentCourse(null);
    loadCourses();
    if (courseId) {
      handleEnterClassroom(courseId);
    }
  };

  // If inside Classroom view, show full screen distraction-free classroom
  if (currentView === 'classroom' && classroomCourseId) {
    return (
      <Classroom
        courseId={classroomCourseId}
        onBack={() => {
          setCurrentView('home');
          setClassroomCourseId(null);
          loadCourses();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div>
            {/* Hero Section with Search & Hashtags */}
            <Hero
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              onSearch={setSearchQuery}
              searchQuery={searchQuery}
            />

            {/* Course Catalog Explorer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
              {/* Filter and Heading Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
                    <span>Explore Lectures & Class Documents</span>
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {courses.length} Available
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a course to view syllabus, watch preview lectures, or unlock full access via UPI QR code.
                  </p>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filter Chips */}
              {(selectedTag || searchQuery) && (
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>Filtered by:</span>
                  {selectedTag && (
                    <span className="bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center space-x-1">
                      <span>{selectedTag}</span>
                      <button onClick={() => setSelectedTag('')} className="hover:text-white ml-1 font-bold">×</button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                      <span>"{searchQuery}"</span>
                      <button onClick={() => setSearchQuery('')} className="hover:text-white ml-1 font-bold">×</button>
                    </span>
                  )}
                  <button
                    onClick={() => { setSelectedTag(''); setSearchQuery(''); }}
                    className="text-xs text-indigo-400 hover:underline ml-2"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Courses Grid */}
              {loadingCourses ? (
                <div className="py-24 text-center text-slate-500">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs">Loading course catalog...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-base font-bold text-white">No courses match your criteria</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try clearing your search query or selecting a different category or hashtag.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onSelectCourse={(id) => setDetailCourseId(id)}
                      onQuickBuy={(crs) => handleStartPayment(crs)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'dashboard' && (
          <StudentDashboard
            onOpenCourse={(id) => handleEnterClassroom(id)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-200">EduLearn Classroom Portal</span>
              <p className="text-[11px] text-slate-500">Protected Video Streaming & In-Browser Document Learning</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti-Download Content Shield</span>
            </span>
            <span className="flex items-center space-x-1">
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dynamic UPI QR Gateway</span>
            </span>
          </div>

          <p className="text-[11px]">
            © {new Date().getFullYear()} EduLearn Portal. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {detailCourseId && (
        <CourseDetailModal
          courseId={detailCourseId}
          onClose={() => setDetailCourseId(null)}
          onEnroll={(course) => handleStartPayment(course)}
          onEnterClassroom={(id) => handleEnterClassroom(id)}
          onAuthRequired={() => {
            setDetailCourseId(null);
            setAuthModal({ open: true, mode: 'register' });
          }}
        />
      )}

      {paymentCourse && (
        <PaymentQRModal
          course={paymentCourse}
          onClose={() => setPaymentCourse(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onSuccess={() => {
            loadCourses();
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
