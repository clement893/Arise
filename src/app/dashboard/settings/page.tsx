'use client';

import { Button, Card, CardContent, Badge, LoadingPage } from '@/components/ui';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { ChevronDown, Loader2, Check, AlertCircle } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

interface Settings {
  notifications: {
    emailNotifications: boolean;
    weeklyProgressReport: boolean;
  };
  appearance: {
    darkMode: boolean;
    language: string;
  };
  privacy: {
    dataSharing: boolean;
    analyticsTracking: boolean;
  };
  security: {
    twoFactorAuth: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDeleting, setIsDeleting] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      emailNotifications: true,
      weeklyProgressReport: true,
    },
    appearance: {
      darkMode: false,
      language: 'English',
    },
    privacy: {
      dataSharing: true,
      analyticsTracking: true,
    },
    security: {
      twoFactorAuth: false,
    },
  });

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      const userData = localStorage.getItem('arise_user');
      if (userData) {
        if (isMounted) {
          setUser(JSON.parse(userData));
        }
      } else {
        if (isMounted) {
          router.push('/login');
        }
        return;
      }
      
      // Load settings from API
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setSettings(data.settings);
            
            // Apply dark mode if enabled
            if (data.settings.appearance.darkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Fall back to localStorage
        const savedSettings = localStorage.getItem('arise_settings');
        if (savedSettings && isMounted) {
          setSettings(JSON.parse(savedSettings));
        }
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleToggle = (category: keyof Settings, setting: string) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: !prev[category][setting as keyof typeof prev[typeof category]],
        },
      };
      
      // Apply dark mode immediately
      if (category === 'appearance' && setting === 'darkMode') {
        if (!prev.appearance.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      return newSettings;
    });
    setSaveStatus('idle');
  };

  const handleLanguageChange = (language: string) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        language,
      },
    }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });
      
      if (response.ok) {
        // Also save to localStorage as backup
        localStorage.setItem('arise_settings', JSON.stringify(settings));
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Save to localStorage as fallback
      localStorage.setItem('arise_settings', JSON.stringify(settings));
      setSaveStatus('error');
    }
    
    setIsSaving(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account?\n\n' +
      'This will permanently delete:\n' +
      '• Your profile and all personal data\n' +
      '• All assessment results\n' +
      '• All evaluator feedback\n' +
      '• Your subscription\n\n' +
      'This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = confirm(
      'Please confirm one more time.\n\n' +
      'Type DELETE in the next prompt to permanently delete your account.'
    );
    
    if (!doubleConfirm) return;
    
    const typed = prompt('Type DELETE to confirm account deletion:');
    if (typed !== 'DELETE') {
      alert('Account deletion cancelled.');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('arise_user');
        localStorage.removeItem('arise_settings');
        
        alert('Your account has been deleted. You will be redirected to the homepage.');
        router.push('/');
      } else {
        const data = await response.json();
        alert(`Failed to delete account: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again or contact support.');
    }
    
    setIsDeleting(false);
  };

  const Toggle = ({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary-500' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_access_token');
    router.push('/');
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} activePage="settings" onLogout={handleLogout} />

      <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your account settings and preferences</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 sm:px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Error
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

          {/* Settings Card */}
          <Card className="p-6 sm:p-8">
            {/* Notifications */}
            <section className="mb-6 sm:mb-8">
              <div className="mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Notifications</h2>
                <p className="text-sm text-gray-500">Manage how and when you receive updates from ARISE</p>
              </div>
                
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Email Notifications</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Receive email updates about your assessment progress, results, and important platform updates</p>
                  </div>
                  <div className="flex-shrink-0 pt-1">
                    <Toggle
                      enabled={settings.notifications.emailNotifications}
                      onChange={() => handleToggle('notifications', 'emailNotifications')}
                    />
                  </div>
                </div>
                  
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Weekly Progress Report</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Get a weekly summary email with your development progress and insights</p>
                  </div>
                  <div className="flex-shrink-0 pt-1">
                    <Toggle
                      enabled={settings.notifications.weeklyProgressReport}
                      onChange={() => handleToggle('notifications', 'weeklyProgressReport')}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Appearance */}
            <section className="mb-6 sm:mb-8">
              <div className="mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Appearance</h2>
                <p className="text-sm text-gray-500">Customize the look and feel of your ARISE experience</p>
              </div>
                
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Dark Mode</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Switch to a darker color scheme for reduced eye strain, especially in low-light environments</p>
                  </div>
                  <div className="flex-shrink-0 pt-1">
                    <Toggle
                      enabled={settings.appearance.darkMode}
                      onChange={() => handleToggle('appearance', 'darkMode')}
                    />
                  </div>
                </div>
                  
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Language</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2">Choose your preferred language for the interface</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                      Coming soon
                    </span>
                  </div>
                  <div className="relative flex-shrink-0">
                    <select
                      value={settings.appearance.language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      disabled
                      className="appearance-none bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-500 cursor-not-allowed min-w-[140px]"
                    >
                      <option value="English">English</option>
                      <option value="French">French</option>
                      <option value="Spanish">Spanish</option>
                      <option value="German">German</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </section>

            {/* Privacy */}
            <section className="mb-6 sm:mb-8">
              <div className="mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Privacy & Data</h2>
                <p className="text-sm text-gray-500">Control how your data is used to enhance your experience</p>
              </div>
                
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Anonymous Data Sharing</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Help us improve ARISE by sharing anonymized usage data. Your personal information remains private</p>
                  </div>
                  <div className="flex-shrink-0 pt-1">
                    <Toggle
                      enabled={settings.privacy.dataSharing}
                      onChange={() => handleToggle('privacy', 'dataSharing')}
                    />
                  </div>
                </div>
                  
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Analytics Tracking</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Allow us to track your interactions to personalize your experience and improve platform features</p>
                  </div>
                  <div className="flex-shrink-0 pt-1">
                    <Toggle
                      enabled={settings.privacy.analyticsTracking}
                      onChange={() => handleToggle('privacy', 'analyticsTracking')}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="mb-6 sm:mb-8">
              <div className="mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Security</h2>
                <p className="text-sm text-gray-500">Protect your account with additional security measures</p>
              </div>
                
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                        Coming soon
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">Add an extra layer of security by requiring a verification code in addition to your password when signing in</p>
                  </div>
                  <div className="flex-shrink-0 pt-1">
                    <Toggle
                      enabled={settings.security.twoFactorAuth}
                      onChange={() => {}}
                      disabled={true}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="pt-6 border-t-2 border-red-200">
              <div className="mb-4 pb-3 border-b border-red-100">
                <h2 className="text-lg sm:text-xl font-semibold text-red-600 mb-1">Danger Zone</h2>
                <p className="text-sm text-red-600/70">Irreversible and destructive actions</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 border-2 border-red-200 rounded-lg bg-red-50/50">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1.5">Delete Account</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">This will permanently delete your account, all assessment results, evaluator feedback, and subscription. This action cannot be undone.</p>
                  <p className="text-xs text-red-600 font-medium">⚠️ Warning: This action is permanent</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-5 sm:px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm hover:shadow-md"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </section>
          </Card>
        </div>
      </main>
    </div>
  );
}
