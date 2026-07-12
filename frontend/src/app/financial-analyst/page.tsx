'use client';

import AuthGuard from '@/components/auth-guard';

export default function FinancialAnalystPage() {
  return (
    <AuthGuard allowedRoles={['FINANCIAL_ANALYST']}>
      {(user) => (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-gray-100 gap-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#a16222]">Protected Route</div>
          <h1 className="text-4xl font-bold">Financial Analyst</h1>
          <p className="text-gray-500 text-sm">Logged in as {user.email}</p>
        </div>
      )}
    </AuthGuard>
  );
}
