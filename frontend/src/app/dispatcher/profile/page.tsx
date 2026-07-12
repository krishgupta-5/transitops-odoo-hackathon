'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCog, Shield, Key, Bell, CheckCircle2, AlertCircle } from 'lucide-react';

interface UserProfileData {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  created_at?: string;
}

export default function DispatcherProfilePage() {
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
        const res = await fetch('http://localhost:8000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
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
      const res = await fetch('http://localhost:8000/api/v1/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile details.');
      }

      const updated = await res.json();
      setProfile(updated);
      setSuccessMsg('Profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to change security password.');
      }

      setSuccessMsg('Security password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1040px] mx-auto font-sans pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dispatcher Profile & Settings
        </h1>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 rounded-3xl shadow-xs">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-2xl tracking-tight shadow-sm">
              {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'DI'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profile?.name || 'Demo Dispatcher'}
                </h2>
                <Badge className="bg-black/5 dark:bg-white/10 text-gray-800 dark:text-gray-200 border-0 text-[10px] uppercase tracking-wider px-2.5 py-0.5">
                  Dispatcher
                </Badge>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                {profile?.email || 'dispatcher@transitops.demo'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 rounded-3xl shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCog className="w-4 h-4 text-gray-500" />
              Identity & Communications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Demo Dispatcher"
                  required
                  className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dispatcher@transitops.demo"
                  required
                  className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Role Permission Level
                </label>
                <Input
                  disabled
                  value="DISPATCHER (Logistics & Trip Operations)"
                  className="w-full bg-gray-100 dark:bg-[#161616] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-xs font-semibold rounded-xl h-10 px-3.5 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs h-10 rounded-xl hover:opacity-90 transition-opacity"
                >
                  {loading ? 'Saving Changes...' : 'Save Profile Settings'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security & Password */}
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 rounded-3xl shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              Security & Access Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  New Security Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs h-10 rounded-xl hover:opacity-90 transition-opacity"
                >
                  {loading ? 'Updating Password...' : 'Update Security Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
