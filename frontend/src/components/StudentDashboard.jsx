import React, { useState, useEffect } from 'react';
import {
  BookOpen, User, Key, CheckCircle, Clock, Play,
  ShieldCheck, AlertCircle, Save, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const StudentDashboard = ({ onOpenCourse }) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'profile', 'payments'
  const [myCourses, setMyCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile edit form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [coursesRes, paymentsRes] = await Promise.all([
          api.getMyLearning(),
          api.getMyPayments()
        ]);
        if (coursesRes.success) setMyCourses(coursesRes.myCourses || []);
        if (paymentsRes.success) setPayments(paymentsRes.payments || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);
    try {
      const updates = { name, phone, bio };
      if (newPassword) {
        updates.currentPassword = currentPassword;
        updates.newPassword = newPassword;
      }
      const res = await updateProfile(updates);
      if (res.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setProfileMsg({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'An error occurred while updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* User Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 shadow-xl">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl border-2 border-indigo-500/40 p-1 bg-slate-950 shadow-md shrink-0"
        />
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit mx-auto sm:mx-0">
              {user?.role === 'admin' ? 'Instructor / Admin' : 'Enrolled Student'}
            </span>
          </div>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <p className="text-xs text-slate-300 max-w-xl italic mt-1">{user?.bio || 'Learning on EduLearn Portal'}</p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800 text-center">
          <div>
            <div className="text-xl font-extrabold text-indigo-400">{myCourses.length}</div>
            <div className="text-[11px] text-slate-400">Enrolled Courses</div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <div className="text-xl font-extrabold text-emerald-400">
              {myCourses.reduce((acc, c) => acc + (c.completedLessons?.length || 0), 0)}
            </div>
            <div className="text-[11px] text-slate-400">Lessons Completed</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'courses' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Enrolled Courses ({myCourses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'profile' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'payments' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Transaction History</span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading your learning space...</p>
        </div>
      ) : activeTab === 'courses' ? (
        <div className="space-y-6">
          {myCourses.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Enrolled Courses Yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Explore our catalog, select a course, and scan the QR code to unlock access immediately.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group shadow-xl"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onOpenCourse(c.id)}
                        className="p-3 bg-indigo-600 text-white rounded-full shadow-lg"
                      >
                        <Play className="w-5 h-5 fill-white" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        {c.category}
                      </span>
                      <h3 className="text-base font-bold text-white mt-2 line-clamp-1">{c.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{c.subtitle}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progress</span>
                          <span className="font-bold text-indigo-400">{c.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${c.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenCourse(c.id)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30"
                      >
                        <span>Resume Learning</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'profile' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl">
          <h2 className="text-lg font-bold text-white mb-4">Edit Profile Information</h2>

          {profileMsg && (
            <div
              className={`p-3.5 rounded-xl mb-6 text-xs font-medium flex items-center space-x-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}
            >
              {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Registered email cannot be modified directly.</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Bio / Learning Goal</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Share your background or study ambitions..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>Change Password (Optional)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Payments History Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Your QR Code Payments & Transactions</h2>
            <p className="text-xs text-slate-400">All submitted UPI reference numbers and their activation status</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">UTR Reference</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{p.courseTitle}</td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">₹{p.amount}</td>
                      <td className="px-6 py-4 font-mono text-slate-300">{p.utrNumber}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center space-x-1 ${
                            p.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : p.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {p.status === 'approved' && <ShieldCheck className="w-3 h-3" />}
                          <span>{p.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
