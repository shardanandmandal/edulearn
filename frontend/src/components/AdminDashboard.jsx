import React, { useState, useEffect } from 'react';
import {
  Plus, Upload, Video, FileText, CheckCircle, XCircle,
  Settings, DollarSign, Users, BookOpen, Clock, Tag,
  Trash2, Edit, Check, ShieldAlert, Sparkles, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'payments', 'settings'
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    pendingPaymentsCount: 0
  });
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({
    upiId: '',
    payeeName: '',
    currencySymbol: '₹',
    instantAccessMode: true,
    supportEmail: '',
    supportPhone: ''
  });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState(null);

  // New Course Form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    discountPrice: '',
    category: 'Web Development',
    hashtags: '#FullStack, #React, #Coding',
    level: 'All Levels',
    language: 'English',
    features: 'Protected Video Lectures\nIn-Browser Document Reader\nCertificate of Completion'
  });
  const [courseThumbnailFile, setCourseThumbnailFile] = useState(null);

  // New Lesson / Material Form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    sectionTitle: 'Module 1: Core Fundamentals',
    type: 'video', // 'video', 'document', 'video_document'
    duration: '20 min',
    isFreePreview: false,
    summary: '',
    documentContent: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);

  // Notifications
  const [actionMsg, setActionMsg] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, coursesRes, paymentsRes, settingsRes] = await Promise.all([
        api.getAdminStats(),
        api.getCourses(),
        api.getAdminPayments(),
        api.getAdminSettings()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (coursesRes.success) setCourses(coursesRes.courses);
      if (paymentsRes.success) setPayments(paymentsRes.payments);
      if (settingsRes.success) setSettings(settingsRes.settings);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (text, type = 'success') => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg(null), 4000);
  };

  // 1. Create Course Handler
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', courseForm.title);
      formData.append('subtitle', courseForm.subtitle);
      formData.append('description', courseForm.description);
      formData.append('price', courseForm.price);
      formData.append('discountPrice', courseForm.discountPrice || courseForm.price);
      formData.append('category', courseForm.category);
      formData.append('hashtags', courseForm.hashtags);
      formData.append('level', courseForm.level);
      formData.append('language', courseForm.language);
      formData.append('features', courseForm.features);
      formData.append('isPublished', 'true');

      if (courseThumbnailFile) {
        formData.append('thumbnail', courseThumbnailFile);
      }

      const res = await api.createCourse(formData);
      if (res.success) {
        showNotification('Course created successfully!');
        setShowCourseModal(false);
        setCourseForm({
          title: '',
          subtitle: '',
          description: '',
          price: '',
          discountPrice: '',
          category: 'Web Development',
          hashtags: '#FullStack, #React, #Coding',
          level: 'All Levels',
          language: 'English',
          features: 'Protected Video Lectures\nIn-Browser Document Reader\nCertificate of Completion'
        });
        setCourseThumbnailFile(null);
        loadAllAdminData();
      } else {
        showNotification(res.message || 'Failed to create course.', 'error');
      }
    } catch (err) {
      showNotification('Error creating course.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // 2. Upload Lesson & Material Handler
  const handleUploadLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourseForLesson) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', lessonForm.title);
      formData.append('sectionTitle', lessonForm.sectionTitle);
      formData.append('type', lessonForm.type);
      formData.append('duration', lessonForm.duration);
      formData.append('isFreePreview', lessonForm.isFreePreview ? 'true' : 'false');
      formData.append('summary', lessonForm.summary);
      formData.append('documentContent', lessonForm.documentContent);

      if (videoFile) {
        formData.append('video', videoFile);
      }
      if (documentFile) {
        formData.append('document', documentFile);
      }

      const res = await api.uploadLesson(selectedCourseForLesson.id, formData);
      if (res.success) {
        showNotification('Lecture & protected content uploaded successfully!');
        setShowLessonModal(false);
        setLessonForm({
          title: '',
          sectionTitle: 'Module 1: Core Fundamentals',
          type: 'video',
          duration: '20 min',
          isFreePreview: false,
          summary: '',
          documentContent: ''
        });
        setVideoFile(null);
        setDocumentFile(null);
        loadAllAdminData();
      } else {
        showNotification(res.message || 'Failed to upload lesson.', 'error');
      }
    } catch (err) {
      showNotification('Error uploading lesson.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // 3. Delete Course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course and its materials?')) return;
    try {
      const res = await api.deleteCourse(id);
      if (res.success) {
        showNotification('Course deleted.');
        loadAllAdminData();
      }
    } catch (err) {
      showNotification('Failed to delete course.', 'error');
    }
  };

  // 4. Update Payment Status (Approve/Reject)
  const handlePaymentStatus = async (paymentId, status) => {
    try {
      const res = await api.updatePaymentStatus(paymentId, status);
      if (res.success) {
        showNotification(`Payment ${status}! Course access updated.`);
        loadAllAdminData();
      }
    } catch (err) {
      showNotification('Failed to update payment status.', 'error');
    }
  };

  // 5. Save QR Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateAdminSettings(settings);
      if (res.success) {
        showNotification('Payment Gateway & UPI settings saved successfully!');
      }
    } catch (err) {
      showNotification('Failed to update settings.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Instructor Studio
            </span>
            <span className="text-xs text-slate-400">Classroom Management Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Admin Control Center</h1>
        </div>

        <button
          onClick={() => setShowCourseModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Course</span>
        </button>
      </div>

      {/* Notifications */}
      {actionMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center space-x-2 shadow-lg ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          {actionMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Total Revenue Collected</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Total Students</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {stats.totalStudents}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Active Published Courses</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {stats.totalCourses}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Pending QR Approvals</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              {stats.pendingPaymentsCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'courses' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses & Content Studio ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'payments' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>QR Payments Queue ({payments.length})</span>
          {stats.pendingPaymentsCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500 text-slate-950 font-bold">
              {stats.pendingPaymentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'settings' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Payment Gateway & QR Settings</span>
        </button>
      </div>

      {/* Tab 1: Courses Management */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="relative aspect-video">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-mono font-bold text-emerald-400 border border-slate-800">
                      ₹{course.discountPrice || course.price}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-indigo-400">{course.category}</span>
                      <span>{course.totalLessons || 0} Lectures/Docs</span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{course.subtitle}</p>

                    {/* Hashtags */}
                    {course.hashtags && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {course.hashtags.map((h, i) => (
                          <span key={i} className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-800/80 flex items-center justify-between mt-4">
                  <button
                    onClick={() => {
                      setSelectedCourseForLesson(course);
                      setShowLessonModal(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-md shadow-indigo-600/30"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Video/Docs</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Payments Queue */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Student QR Code Submissions</h2>
              <p className="text-xs text-slate-400">Review incoming UTR transactions and grant classroom access</p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Mode: <span className={settings.instantAccessMode ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {settings.instantAccessMode ? 'Instant Auto-Approve' : 'Manual Audit'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">UTR Reference</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{p.studentName}</div>
                        <div className="text-[11px] text-slate-400">{p.studentEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200 line-clamp-1">{p.courseTitle}</td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">₹{p.amount}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-indigo-300">{p.utrNumber}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : p.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {p.status !== 'approved' && (
                          <button
                            onClick={() => handlePaymentStatus(p.id, 'approved')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {p.status !== 'rejected' && (
                          <button
                            onClick={() => handlePaymentStatus(p.id, 'rejected')}
                            className="px-3 py-1 bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Payment Gateway & QR Settings */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl shadow-xl">
          <h2 className="text-lg font-bold text-white mb-2">QR Code & UPI Gateway Configuration</h2>
          <p className="text-xs text-slate-400 mb-6">
            Configure your merchant UPI handle and student verification workflow. Dynamic QR codes are generated using these details.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Instructor / Merchant UPI ID (VPA):
              </label>
              <input
                type="text"
                required
                value={settings.upiId}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                placeholder="e.g. sharda@okaxis or teacher@upi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Payments made by scanning the QR code will be credited directly to this UPI address.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Payee / Merchant Display Name:
              </label>
              <input
                type="text"
                required
                value={settings.payeeName}
                onChange={(e) => setSettings({ ...settings, payeeName: e.target.value })}
                placeholder="e.g. Prof. Sharma Classes"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Instant Access Toggle */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white block">Instant Access Auto-Approval</span>
                <p className="text-xs text-slate-400 mt-0.5">
                  When enabled, student gets instant classroom access upon submitting their 12-digit UTR reference.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.instantAccessMode}
                  onChange={(e) => setSettings({ ...settings, instantAccessMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Support Contact Email</label>
              <input
                type="email"
                value={settings.supportEmail || ''}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Payment Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Create New Course */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-white mb-1">Create New Class / Course</h2>
            <p className="text-xs text-slate-400 mb-6">Enter course details, pricing, and hashtags for student discovery.</p>

            <form onSubmit={handleCreateCourse} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Complete System Design & Microservices"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subtitle / Short Hook</label>
                <input
                  type="text"
                  value={courseForm.subtitle}
                  onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                  placeholder="e.g. Master distributed caching, event queues, and fault tolerance"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Original Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    placeholder="999"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={courseForm.discountPrice}
                    onChange={(e) => setCourseForm({ ...courseForm, discountPrice: e.target.value })}
                    placeholder="499"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Programming">Programming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hashtags (Comma separated)</label>
                <input
                  type="text"
                  value={courseForm.hashtags}
                  onChange={(e) => setCourseForm({ ...courseForm, hashtags: e.target.value })}
                  placeholder="#SystemDesign, #Architecture, #Backend, #Microservices"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Thumbnail Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCourseThumbnailFile(e.target.files[0])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Course Description (Markdown supported)</label>
                <textarea
                  rows={4}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Provide syllabus outline, prerequisites, and learning objectives..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {uploading ? 'Publishing...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Lesson Video / Document */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-white mb-1">
              Upload Video / Documents to "{selectedCourseForLesson?.title}"
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              All uploaded videos and documents are strictly protected from downloads and only viewable within the portal.
            </p>

            <form onSubmit={handleUploadLesson} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Module / Section Title</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.sectionTitle}
                    onChange={(e) => setLessonForm({ ...lessonForm, sectionTitle: e.target.value })}
                    placeholder="e.g. Module 1: Architecture"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Lecture Title *</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="e.g. 01. High-Performance Sharding"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Content Type</label>
                  <select
                    value={lessonForm.type}
                    onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="video">Video Lecture Only</option>
                    <option value="document">Class Document / Notes Only</option>
                    <option value="video_document">Video + Document Notes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    placeholder="e.g. 24 min or 15 min read"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-xs text-indigo-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lessonForm.isFreePreview}
                      onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Allow Free Preview</span>
                  </label>
                </div>
              </div>

              {/* Video File Upload */}
              {(lessonForm.type === 'video' || lessonForm.type === 'video_document') && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                    <Video className="w-4 h-4 text-indigo-400" />
                    <span>Upload Video File (.mp4, .webm)</span>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500 block">
                    (If skipped, the system uses the high-efficiency demo lecture stream)
                  </span>
                </div>
              )}

              {/* Document File / Notes Upload */}
              {(lessonForm.type === 'document' || lessonForm.type === 'video_document') && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Upload Document File (.pdf, .txt, .md)</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={(e) => setDocumentFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500"
                  />
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Or Write / Paste Class Notes / Markdown directly:
                    </label>
                    <textarea
                      rows={4}
                      value={lessonForm.documentContent}
                      onChange={(e) => setLessonForm({ ...lessonForm, documentContent: e.target.value })}
                      placeholder="# Lecture Notes: Concepts, code snippets, formula summaries..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Key Lecture Summary</label>
                <textarea
                  rows={2}
                  value={lessonForm.summary}
                  onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })}
                  placeholder="Key takeaways for the student..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {uploading ? 'Uploading Materials...' : 'Upload Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
