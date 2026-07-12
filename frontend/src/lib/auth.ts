'use client';

export const ROLE_ROUTES: Record<string, string> = {
  FLEET_MANAGER: '/fleet-manager',
  DISPATCHER: '/dispatcher',
  SAFETY_OFFICER: '/safety-officer',
  FINANCIAL_ANALYST: '/financial-analyst',
};

export function getAuthRoute(role?: string | null): string {
  if (typeof window === 'undefined') return '/login';
  
  const token = localStorage.getItem('access_token');
  if (!token) return '/login';

  const savedRole = role || localStorage.getItem('user_role');
  const savedRoute = localStorage.getItem('user_route');

  if (savedRoute && savedRoute !== '/login') return savedRoute;
  if (savedRole && ROLE_ROUTES[savedRole]) return ROLE_ROUTES[savedRole];

  return '/fleet-manager';
}

export function setAuthSession(accessToken: string, refreshToken?: string, role?: string) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  
  if (role) {
    localStorage.setItem('user_role', role);
    const route = ROLE_ROUTES[role] || '/fleet-manager';
    localStorage.setItem('user_route', route);
  }
  window.dispatchEvent(new Event('storage'));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_route');
  sessionStorage.clear();
  window.dispatchEvent(new Event('storage'));
}
