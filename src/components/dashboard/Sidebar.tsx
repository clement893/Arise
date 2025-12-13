'use client';

/**
 * Sidebar Component
 * Main navigation sidebar for the dashboard
 * 
 * Features:
 * - User profile display with plan badge
 * - Navigation items with active state highlighting
 * - Admin panel link (visible only for admin users)
 * - Logout functionality
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  Target, 
  LogOut, 
  ChevronDown, 
  Settings, 
  User, 
  Shield, 
  LucideIcon,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { isAdmin as checkIsAdmin } from '@/lib/constants';
import { getInitials } from '@/lib/helpers';

// =============================================================================
// TYPES
// =============================================================================

interface SidebarProps {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    plan?: string;
    role?: string;
  };
  activePage?: string;
  onLogout?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Dashboard navigation items
 * Centralized here for easy maintenance
 */
const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/dashboard/results', label: 'Results & Reports', icon: BarChart3 },
  { href: '/dashboard/development', label: 'Development plan', icon: Target },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * NavLink - Individual navigation item
 * Handles active state styling and accessibility
 */
interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  variant?: 'default' | 'admin';
}

const NavLink = ({ href, icon: Icon, label, isActive, variant = 'default' }: NavLinkProps) => {
  // Base classes for all nav links
  const baseClasses = 'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors';
  
  // Variant-specific classes
  const variantClasses = {
    default: isActive
      ? 'bg-secondary-500 text-primary-700 font-semibold'
      : 'text-white/90 hover:bg-white/10',
    admin: 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
  };

  return (
    <Link 
      href={href} 
      className={cn(baseClasses, variantClasses[variant])}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </Link>
  );
};

/**
 * UserProfile - User info display in sidebar header
 * Shows avatar, name, plan badge, and admin badge if applicable
 */
interface UserProfileProps {
  displayName: string;
  fullName: string;
  plan?: string;
  isAdmin: boolean;
}

const UserProfile = ({ displayName, fullName, plan, isAdmin }: UserProfileProps) => {
  return (
    <div className="px-4 mb-6">
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
        {/* Avatar with initials */}
        <div 
          className="w-10 h-10 rounded-full bg-neutral-300 flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          <span className="text-primary-700 font-semibold text-sm">
            {getInitials(displayName, 1)}
          </span>
        </div>
        
        {/* User info */}
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-white text-sm font-medium">{fullName}</span>
            <ChevronDown className="w-4 h-4 text-white/70" aria-hidden="true" />
          </div>
          
          {/* Badges */}
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" size="sm">
              {plan || 'Starter'} plan
            </Badge>
            {isAdmin && (
              <Badge variant="admin" size="sm">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Logo - ARISE logo SVG component
 */
const Logo = () => (
  <svg 
    width="60" 
    height="70" 
    viewBox="0 0 60 70" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    aria-hidden="true"
  >
    <path 
      d="M30 5C20 5 15 15 15 25C15 35 20 40 30 45C40 40 45 35 45 25C45 15 40 5 30 5Z" 
      stroke="currentColor" 
      className="text-secondary-500" 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M30 15C25 15 22 20 22 27C22 34 25 38 30 42C35 38 38 34 38 27C38 20 35 15 30 15Z" 
      stroke="currentColor" 
      className="text-secondary-500" 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M30 25C28 25 26 28 26 32C26 36 28 39 30 42C32 39 34 36 34 32C34 28 32 25 30 25Z" 
      fill="currentColor" 
      className="text-secondary-500"
    />
    <path 
      d="M30 45C30 55 35 60 35 65" 
      stroke="currentColor" 
      className="text-secondary-500" 
      strokeWidth="2" 
      fill="none"
    />
  </svg>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Sidebar - Main dashboard navigation sidebar
 */
export default function Sidebar({ user, activePage, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Derive display values from user object
  const displayName = user.firstName || 'User';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const userIsAdmin = checkIsAdmin(user.role || '');

  /**
   * Determine if a nav item is active
   * Uses activePage prop if provided, otherwise compares with current pathname
   */
  const isItemActive = (itemHref: string): boolean => {
    if (activePage) {
      return itemHref.includes(activePage);
    }
    return pathname === itemHref;
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 flex justify-center">
        <Link href="/" aria-label="Go to homepage">
          <Logo />
        </Link>
      </div>

      {/* User Profile Section */}
      <UserProfile 
        displayName={displayName}
        fullName={fullName}
        plan={user.plan}
        isAdmin={userIsAdmin}
      />

      {/* Navigation Items */}
      <nav className="flex-1 px-3" aria-label="Dashboard navigation">
        <ul className="space-y-1" role="list">
          {DASHBOARD_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isItemActive(item.href)}
              />
            </li>
          ))}
          
          {/* Admin Link - Only visible for admin users */}
          {userIsAdmin && (
            <li className="mt-4 pt-4 border-t border-white/20">
              <NavLink
                href="/admin"
                icon={Shield}
                label="Admin Panel"
                isActive={false}
                variant="admin"
              />
            </li>
          )}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <Button
          variant="secondary"
          onClick={onLogout}
          leftIcon={<LogOut className="w-5 h-5" />}
          fullWidth
          aria-label="Log out of your account"
        >
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-500 text-white rounded-lg shadow-lg hover:bg-primary-600 transition-colors"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop: Fixed, Mobile: Slide-in */}
      <aside 
        className={cn(
          "w-[240px] min-h-screen bg-primary-500 flex flex-col",
          "fixed lg:static top-0 left-0 z-40",
          "transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
      {/* Logo */}
      <div className="p-6 flex justify-center">
        <Link href="/" aria-label="Go to homepage">
          <Logo />
        </Link>
      </div>

      {/* User Profile Section */}
      <UserProfile 
        displayName={displayName}
        fullName={fullName}
        plan={user.plan}
        isAdmin={userIsAdmin}
      />

      {/* Navigation Items */}
      <nav className="flex-1 px-3" aria-label="Dashboard navigation">
        <ul className="space-y-1" role="list">
          {DASHBOARD_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isItemActive(item.href)}
              />
            </li>
          ))}
          
          {/* Admin Link - Only visible for admin users */}
          {userIsAdmin && (
            <li className="mt-4 pt-4 border-t border-white/20">
              <NavLink
                href="/admin"
                icon={Shield}
                label="Admin Panel"
                isActive={false}
                variant="admin"
              />
            </li>
          )}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <Button
          variant="secondary"
          onClick={onLogout}
          leftIcon={<LogOut className="w-5 h-5" />}
          fullWidth
          aria-label="Log out of your account"
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}

// Export types for external use
export type { SidebarProps, NavItem };
