'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ClipboardList, LogOut, User, Users } from 'lucide-react';

interface AdminSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    userType?: string;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/assessments', label: 'Assessments', icon: ClipboardList },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('arise_user');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = () => {
    return `${user.firstName?.charAt(0) || 'A'}${user.lastName?.charAt(0) || 'D'}`;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#0D5C5C]">ARISE</span>
        </Link>
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#0D5C5C] flex items-center justify-center text-white font-semibold text-sm">
            {getInitials()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500">Admin Profile</p>
          </div>
        </div>
        
        {/* Switch Profile Button */}
        <button
          onClick={() => {
            router.push('/dashboard');
          }}
          className="w-full flex items-center gap-2 px-3 py-2 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg transition-colors text-sm text-primary-700 font-medium"
        >
          {user.userType === 'coach' ? (
            <>
              <Users className="w-4 h-4" />
              <span>Switch to Coach Profile</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              <span>Switch to Personal Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#0D5C5C] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
