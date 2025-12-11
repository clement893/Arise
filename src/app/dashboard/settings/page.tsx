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
    const loadData = async () => {
      const userData = localStorage.getItem('arise_user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        router.push('/login');
        return;
      }
      
      // Load settings from API
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
          
          // Apply dark mode if enabled
          if (data.settings.appearance.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Fall back to localStorage
        const savedSettings = localStorage.getItem('arise_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary-500">
      {/* Top Bar */}
      <div className="bg-primary-500 text-white px-6 py-3">
        <span className="text-sm font-medium tracking-wider">SETTINGS</span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar user={user} activePage="settings" />

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 bg-primary-500/30 min-h-[calc(100vh-48px)]">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-primary-500">Settings</h1>
                <p className="text-gray-600">Manage your account settings</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
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
                    'Save'
                  )}
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  <span className="text-primary-500 font-semibold text-sm">
                    {user.firstName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>

            {/* Settings Card */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* Notifications */}
              <section className="mb-8">
                <h2 className="text-primary-500 font-semibold mb-4">Notifications</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Email notifications</h3>
                      <p className="text-sm text-gray-500">Receive updates about your assessments</p>
                    </div>
                    <Toggle
                      enabled={settings.notifications.emailNotifications}
                      onChange={() => handleToggle('notifications', 'emailNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Weekly progress report</h3>
                      <p className="text-sm text-gray-500">Get a summary of your development</p>
                    </div>
                    <Toggle
                      enabled={settings.notifications.weeklyProgressReport}
                      onChange={() => handleToggle('notifications', 'weeklyProgressReport')}
                    />
                  </div>
                </div>
              </section>

              {/* Appearance */}
              <section className="mb-8">
                <h2 className="text-primary-500 font-semibold mb-4">Appearance</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Dark Mode</h3>
                      <p className="text-sm text-gray-500">Enable dark theme across the platform</p>
                    </div>
                    <Toggle
                      enabled={settings.appearance.darkMode}
                      onChange={() => handleToggle('appearance', 'darkMode')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Language</h3>
                      <p className="text-sm text-gray-500">Choose your preferred language</p>
                      <p className="text-xs text-amber-600 mt-1">Coming soon - Currently English only</p>
                    </div>
                    <div className="relative">
                      <select
                        value={settings.appearance.language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        disabled
                        className="appearance-none bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-500 cursor-not-allowed"
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
              <section className="mb-8">
                <h2 className="text-primary-500 font-semibold mb-4">Privacy</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Data Sharing</h3>
                      <p className="text-sm text-gray-500">Share anonymous data to improve platform features</p>
                    </div>
                    <Toggle
                      enabled={settings.privacy.dataSharing}
                      onChange={() => handleToggle('privacy', 'dataSharing')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Analytics Tracking</h3>
                      <p className="text-sm text-gray-500">Allow us to track usage for better experience</p>
                    </div>
                    <Toggle
                      enabled={settings.privacy.analyticsTracking}
                      onChange={() => handleToggle('privacy', 'analyticsTracking')}
                    />
                  </div>
                </div>
              </section>

              {/* Security */}
              <section className="mb-8">
                <h2 className="text-primary-500 font-semibold mb-4">Security</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      <p className="text-xs text-amber-600 mt-1">Coming soon</p>
                    </div>
                    <Toggle
                      enabled={settings.security.twoFactorAuth}
                      onChange={() => {}}
                      disabled={true}
                    />
                  </div>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="pt-6 border-t border-gray-200">
                <h2 className="text-red-600 font-semibold mb-4">Danger Zone</h2>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h3 className="font-medium text-gray-900">Delete Account</h3>
                    <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete account'
                    )}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
