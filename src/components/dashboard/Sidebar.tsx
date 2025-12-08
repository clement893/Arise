'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, BarChart3, Target, LogOut, ChevronDown, Settings, User } from 'lucide-react';

interface SidebarProps {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    plan?: string;
  };
  activePage?: string;
  onLogout?: () => void;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/dashboard/results', label: 'Results & Reports', icon: BarChart3 },
  { href: '/dashboard/development', label: 'Development plan', icon: Target },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ user, activePage, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const displayName = user.firstName || 'User';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

  return (
    <aside className="w-[240px] min-h-screen bg-[#0D5C5C] flex flex-col">
      {/* Logo */}
      <div className="p-6 flex justify-center">
        <Link href="/">
          <svg width="60" height="70" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 5C20 5 15 15 15 25C15 35 20 40 30 45C40 40 45 35 45 25C45 15 40 5 30 5Z" stroke="#D4A84B" strokeWidth="2" fill="none"/>
            <path d="M30 15C25 15 22 20 22 27C22 34 25 38 30 42C35 38 38 34 38 27C38 20 35 15 30 15Z" stroke="#D4A84B" strokeWidth="2" fill="none"/>
            <path d="M30 25C28 25 26 28 26 32C26 36 28 39 30 42C32 39 34 36 34 32C34 28 32 25 30 25Z" fill="#D4A84B"/>
            <path d="M30 45C30 55 35 60 35 65" stroke="#D4A84B" strokeWidth="2" fill="none"/>
          </svg>
        </Link>
      </div>

      {/* User Profile */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            <span className="text-[#0D5C5C] font-semibold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-white text-sm font-medium">{fullName}</span>
              <ChevronDown className="w-4 h-4 text-white/70" />
            </div>
            <span className="inline-block px-2 py-0.5 bg-[#D4A84B] text-[#0D5C5C] text-xs font-semibold rounded mt-1">
              {user.plan || 'Starter'} plan
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activePage ? item.href.includes(activePage) : pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#D4A84B] text-[#0D5C5C] font-semibold'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-4 py-3 bg-[#D4A84B] text-[#0D5C5C] rounded-lg font-semibold text-sm hover:bg-[#c49a42] transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
