'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { LoadingPage } from '@/components/ui';

interface User {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  plan?: string;
  role?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Load from localStorage first for immediate display
        const storedUser = localStorage.getItem('arise_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }

        // Verify and refresh user data from API
        const accessToken = localStorage.getItem('arise_access_token');
        if (accessToken) {
          try {
            const { authenticatedFetch } = await import('@/lib/token-refresh');
            const response = await authenticatedFetch('/api/user/profile');
            if (response.ok) {
              const data = await response.json();
              const updatedUser = {
                ...data.user,
                // Preserve role from localStorage if API doesn't return it
                role: data.user.role || JSON.parse(storedUser || '{}').role,
              };
              setUser(updatedUser);
              // Update localStorage with fresh data
              localStorage.setItem('arise_user', JSON.stringify(updatedUser));
            }
          } catch (error) {
            console.error('Failed to refresh user data:', error);
            // Keep using localStorage data if API fails
          }
        }

        // If no user found, redirect to login
        if (!storedUser && !user) {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error loading user:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []); // Only run once on mount

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_access_token');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  // Determine active page from pathname
  const getActivePage = () => {
    if (pathname?.startsWith('/dashboard/assessments')) return 'assessments';
    if (pathname?.startsWith('/dashboard/results')) return 'results';
    if (pathname?.startsWith('/dashboard/development')) return 'development';
    if (pathname?.startsWith('/dashboard/settings')) return 'settings';
    if (pathname?.startsWith('/dashboard/profile')) return 'profile';
    if (pathname === '/dashboard') return 'dashboard';
    return undefined;
  };

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} activePage={getActivePage()} onLogout={handleLogout} />
      <div className="flex-1 lg:ml-0">
        {children}
      </div>
    </div>
  );
}
