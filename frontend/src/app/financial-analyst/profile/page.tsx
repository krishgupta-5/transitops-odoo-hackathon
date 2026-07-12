'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Bell,
  Key,
  Laptop,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function FinancialAnalystProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('Demo Financial Analyst');
  const [email, setEmail] = useState('financial@transitops.demo');
  const [phone, setPhone] = useState('+1 (555) 482-9011');
  const [depot, setDepot] = useState('Financial Operations HQ');
  const [timezone, setTimezone] = useState('America/New_York (UTC-05:00)');
  const [employeeId, setEmployeeId] = useState('EMP-20412');

  const [notifExpenseThreshold, setNotifExpenseThreshold] = useState(true);
  const [notifAnomalies, setNotifAnomalies] = useState(true);
  const [notifMonthlyReports, setNotifMonthlyReports] = useState(true);
  const [notifBudgetAlerts, setNotifBudgetAlerts] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function loadUser() {
      const savedPhone = localStorage.getItem('financial_profile_phone');
      const savedDepot = localStorage.getItem('financial_profile_depot');
      const savedTimezone = localStorage.getItem('financial_profile_timezone');

      if (savedPhone) setPhone(savedPhone);
      if (savedDepot) setDepot(savedDepot);
      if (savedTimezone) setTimezone(savedTimezone);

      try {
        const data = await apiClient('/auth/me');
        if (data) {
          if (data.name) setFullName(data.name);
          if (data.email) setEmail(data.email);
          if (data.id) setEmployeeId(`EMP-${data.id}`);
          if (!savedDepot) setDepot(data.role === 'FINANCIAL_ANALYST' ? 'Financial Operations HQ' : `${data.role} Hub`);
        }
      } catch {
        // keep defaults
      }
    }
    loadUser();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    localStorage.setItem('financial_profile_phone', phone);
    localStorage.setItem('financial_profile_depot', depot);
    localStorage.setItem('financial_profile_timezone', timezone);

    setTimeout(() => {
      setLoading(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }, 400);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-[1040px] mx-auto font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Financial Persona
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              ID: {employeeId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Financial Analyst Profile
          </h1>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-xs">
            <CheckCircle2 size={16} />
            <span>Profile changes saved successfully</span>
          </div>
        )}
      </div>

      {/* Hero Banner Card */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-md shrink-0">
              {fullName ? fullName.substring(0, 2).toUpperCase() : 'FA'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-xs font-bold">
                  Financial Analyst
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <span className="flex items-center gap-1">
                  <Mail size={13} />
                  {email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {depot}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Shield size={13} />
                  Financial Clearance
                </span>
              </div>
            </div>
          </div>

          {/* Tab Selection Pill */}
          <div className="flex p-1 bg-gray-100 dark:bg-[#181818] rounded-2xl self-start sm:self-auto border border-gray-200/60 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-[#262626] text-black dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Overview & Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-white dark:bg-[#262626] text-black dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Alerts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-white dark:bg-[#262626] text-black dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Security
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: Profile & HQ Settings */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-gray-100 dark:border-white/10 pb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Account Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs font-semibold pl-10 pr-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs font-semibold pl-10 pr-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Direct Contact Phone
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs font-semibold pl-10 pr-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Employee / Staff ID
                </label>
                <input
                  type="text"
                  value={employeeId}
                  disabled
                  className="w-full bg-gray-100 dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-xs font-mono font-semibold px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-white/10 pt-6">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                Financial Operations Region
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Primary Financial Hub
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={depot}
                      onChange={(e) => setDepot(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs font-semibold pl-10 pr-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Reporting Timezone
                  </label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs font-semibold pl-10 pr-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Settings'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Notification & Alert Preferences */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 dark:border-white/10 pb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Financial Notification Channels
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200/60 dark:border-white/[0.06]">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  High Expense Threshold Alert
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Notify when any single vehicle trip expense exceeds ₹25,000
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifExpenseThreshold(!notifExpenseThreshold)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  notifExpenseThreshold ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-black transition-transform ${
                    notifExpenseThreshold ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200/60 dark:border-white/[0.06]">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Fuel Efficiency Anomaly Alert
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Instant alert when fuel burn deviates more than 15% from fleet baseline
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifAnomalies(!notifAnomalies)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  notifAnomalies ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-black transition-transform ${
                    notifAnomalies ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200/60 dark:border-white/[0.06]">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Automated Monthly P&L Summary
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Receive comprehensive profit/loss statements on the 1st of each month
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifMonthlyReports(!notifMonthlyReports)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  notifMonthlyReports ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-black transition-transform ${
                    notifMonthlyReports ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
              }}
              className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              Save Alert Preferences
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Active Sessions */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form onSubmit={handlePasswordUpdate} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-gray-100 dark:border-white/10 pb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Change Account Password
              </h3>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>
            </div>

            <div className="flex justify-start pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Update Security Password'}
              </button>
            </div>
          </form>

          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Active Authenticated Sessions
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200/60 dark:border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                    <Laptop size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>Windows / Chrome (Current Session)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        Active Now
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Authenticated via Financial Analyst JWT Token
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
