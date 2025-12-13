'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { LoadingPage } from '@/components/ui';
import { api } from '@/lib/api-client';

interface User {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  plan?: string;
  role?: string;
  roles?: string[];
}

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        const response = await api.get('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          const updatedUser = {
            ...data.user,
            role: data.user.role,
            roles: data.user.roles || (data.user.role ? [data.user.role] : []),
          };
          setUser(updatedUser);
          localStorage.setItem('arise_user', JSON.stringify(updatedUser));
          
          // Check if user has coach role
          const roles = updatedUser.roles || [updatedUser.role];
          if (!roles.includes('coach') && !roles.includes('admin')) {
            router.push('/dashboard');
            return;
          }
        } else {
          if (response.status === 401) {
            router.push('/login');
            return;
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_access_token');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  // Determine active page from pathname
  const getActivePage = () => {
    if (pathname?.startsWith('/coach/participants')) return 'participants';
    if (pathname === '/coach/dashboard') return 'dashboard';
    return undefined;
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} activePage={getActivePage()} onLogout={handleLogout} />
      <div className="flex-1 lg:ml-0">
        {children}
      </div>
    </div>
  );
}

