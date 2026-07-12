'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Save,
  Laptop,
  Smartphone,
  Check,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function FleetProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('Demo Fleet Manager');
  const [email, setEmail] = useState('fleet@transitops.demo');
  const [phone, setPhone] = useState('+1 (555) 382-9104');
  const [depot, setDepot] = useState('North Terminal Logistics Hub');
  const [timezone, setTimezone] = useState('America/New_York (UTC-05:00)');
  const [employeeId, setEmployeeId] = useState('EMP-90214');

  const [notifCritical, setNotifCritical] = useState(true);
  const [notifRouteDeviation, setNotifRouteDeviation] = useState(true);
  const [notifSafetyReports, setNotifSafetyReports] = useState(true);
  const [notifWeeklySpend, setNotifWeeklySpend] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function loadUser() {
      const savedPhone = localStorage.getItem('fleet_profile_phone');
      const savedDepot = localStorage.getItem('fleet_profile_depot');
      const savedTimezone = localStorage.getItem('fleet_profile_timezone');

      if (savedPhone) setPhone(savedPhone);
      if (savedDepot) setDepot(savedDepot);
      if (savedTimezone) setTimezone(savedTimezone);

      try {
        const data = await apiClient('/auth/me');
        if (data) {
          if (data.name) setFullName(data.name);
          if (data.email) setEmail(data.email);
          if (data.id) setEmployeeId(`EMP-${data.id}`);
          if (!savedDepot) setDepot(data.role === 'FLEET_MANAGER' ? 'North Terminal Logistics Hub' : `${data.role} Hub`);
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

    localStorage.setItem('fleet_profile_phone', phone);
    localStorage.setItem('fleet_profile_depot', depot);
    localStorage.setItem('fleet_profile_timezone', timezone);

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
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
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
              Active Operational Persona
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              ID: {employeeId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Fleet Manager Profile
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
              {fullName ? fullName.substring(0, 2).toUpperCase() : 'FM'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-800 dark:text-gray-200">
                  Fleet Manager
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-gray-400" />
                  {email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-gray-400" />
                  {depot}
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield size={14} className="text-gray-400" />
                  Tier 3 Clearance
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Overview & Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Alerts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Security
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-2xl flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: Profile & Terminal Settings */}
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
                    type="text"
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
                Terminal Assignment & Region
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Primary Depot Facility
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
                    System Timezone
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

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Save size={15} />
                <span>{loading ? 'Saving Profile...' : 'Save Profile Settings'}</span>
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
              Operational Notification Channels
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200/60 dark:border-white/[0.06]">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Critical Vehicle Maintenance & Fault Alerts
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Instant alert when OBD telemetry detects critical engine or brake system faults
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifCritical(!notifCritical)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  notifCritical ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-black transition-transform ${
                    notifCritical ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200/60 dark:border-white/[0.06]">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Live Dispatch Route Deviations
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Notify when a vehicle strays more than 2.0 miles from active AI dispatched corridor
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifRouteDeviation(!notifRouteDeviation)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  notifRouteDeviation ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-black transition-transform ${
                    notifRouteDeviation ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200/60 dark:border-white/[0.06]">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Daily Safety Inspection Summaries
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Receive daily digests of pre-trip and post-trip safety inspection scores
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifSafetyReports(!notifSafetyReports)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  notifSafetyReports ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-black transition-transform ${
                    notifSafetyReports ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200/60 dark:border-white/[0.06]">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Weekly Fuel Spend & P&L Digest
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Email report comparing fleet fuel consumption against projected operational budget
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifWeeklySpend(!notifWeeklySpend)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  notifWeeklySpend ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-black transition-transform ${
                    notifWeeklySpend ? 'translate-x-5' : 'translate-x-0'
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
              <Check size={15} />
              <span>Update Alert Preferences</span>
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
                <div className="relative">
                  <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs font-medium pl-10 pr-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs font-medium pl-10 pr-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs font-medium pl-10 pr-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Shield size={15} />
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>

          {/* Active Sessions */}
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
                      <span>Windows / Chrome (Current Device)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        Active Now
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      IP: 192.168.1.104 • Signed in via OAuth2 Bearer
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200/60 dark:border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 flex items-center justify-center">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      TransitOps Field Inspector iPad
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      IP: 172.16.4.88 • Terminal Yard inspection log
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-gray-400">
                  Last active 3h ago
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
