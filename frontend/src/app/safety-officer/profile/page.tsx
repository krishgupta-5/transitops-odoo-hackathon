'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCog, Shield, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface UserProfileData {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  created_at?: string;
}

export default function SafetyOfficerProfilePage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await apiClient('/auth/me');
        if (data) {
          setProfile(data);
          setName(data.name || '');
          setEmail(data.email || '');
        }
      } catch (err) {
        console.error('Failed to load profile details', err);
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const updated = await apiClient('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ name, email }),
      });
      setProfile(updated);
      setSuccessMsg('Profile details updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      setSuccessMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-[1040px] mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-100 dark:border-white/[0.06]">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Safety Officer Profile Settings
        </h1>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Role & Account Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield size={16} className="text-amber-500" />
                <span>Account Role</span>
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                Your permissions and access scope
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Assigned Role
                </span>
                <div className="mt-1">
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold">
                    {profile?.role || 'SAFETY_OFFICER'}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  User ID
                </span>
                <p className="mt-1 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                  #{profile?.id || '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Update Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details Form */}
          <Card className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UserCog size={16} />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                Update your display name and email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Demo Safety Officer"
                      className="rounded-xl text-xs bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-white/15 text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500 h-9"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. safety@transitops.demo"
                      className="rounded-xl text-xs bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-white/15 text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500 h-9"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 shadow-sm transition-colors"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Change Form */}
          <Card className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Key size={16} />
                <span>Change Password</span>
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                Ensure your account stays secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="rounded-xl text-xs bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-white/15 text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500 h-9"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rounded-xl text-xs bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-white/15 text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500 h-9"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="rounded-xl text-xs bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-white/15 text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500 h-9"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 shadow-sm transition-colors"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
