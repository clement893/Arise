'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  userType?: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage first
        const storedUser = localStorage.getItem('arise_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role !== 'admin') {
            router.push('/dashboard');
            return;
          }
          setUser(parsedUser);
          setIsLoading(false);
          return;
        }

        // Verify with API and get full user data including userType
        const accessToken = localStorage.getItem('arise_access_token');
        if (accessToken) {
          const { authenticatedFetch } = await import('@/lib/token-refresh');
          const response = await authenticatedFetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            const fullUser = {
              ...data.user,
              role: parsedUser?.role || 'admin', // Keep role from localStorage
            };
            if (fullUser.role !== 'admin') {
              router.push('/dashboard');
              return;
            }
            setUser(fullUser);
            localStorage.setItem('arise_user', JSON.stringify(fullUser));
            setIsLoading(false);
            return;
          }
        }
        
        // Fallback: use stored user if API fails
        if (parsedUser) {
          setUser(parsedUser);
          setIsLoading(false);
          return;
        }
        router.push('/login');
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={user} />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
