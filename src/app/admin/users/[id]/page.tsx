'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Shield,
  Calendar,
  Edit
} from 'lucide-react';
import { 
  Button, 
  Card,
  Input,
  Badge,
  LoadingInline,
  Avatar,
} from '@/components/ui';
import { api } from '@/lib/api-client';

interface UserDetails {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  roles?: string[];
  userType: string;
  plan: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  company?: string | null;
  jobTitle?: string | null;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);

  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    roles: ['participant'] as string[],
    userType: 'individual' as 'coach' | 'individual' | 'business',
    plan: 'starter' as 'starter' | 'individual' | 'coach' | 'professional' | 'enterprise' | 'revelation' | 'coaching',
    isActive: true,
  });

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch user details - we'll need to create this endpoint or use existing one
      const response = await api.get(`/api/admin/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load user');
      }
      
      const data = await response.json();
      setUser(data.user);
      
      // Set form data from user
      const roles = data.user.roles || [data.user.role || 'participant'];
      setFormData({
        roles: Array.isArray(roles) ? roles : [roles],
        userType: data.user.userType || 'individual',
        plan: data.user.plan || 'starter',
        isActive: data.user.isActive !== false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    setIsSaving(true);

    try {
      // Update user roles using PUT endpoint with set_roles action
      const response = await api.put('/api/admin/users', {
        userId: userId,
        action: 'set_roles',
        roles: formData.roles,
        userType: formData.userType,
        plan: formData.plan,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      // Reload user data
      await loadUser();
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleToggle = (role: 'coach' | 'participant' | 'admin') => {
    const currentRoles = formData.roles || [];
    let newRoles: string[];
    
    if (currentRoles.includes(role)) {
      // Remove role if already present
      newRoles = currentRoles.filter(r => r !== role);
      // Ensure at least one role remains
      if (newRoles.length === 0) {
        newRoles = ['participant'];
      }
    } else {
      // Add role
      newRoles = [...currentRoles, role];
    }
    
    setFormData({
      ...formData,
      roles: newRoles,
      userType: newRoles.includes('coach') ? 'coach' : formData.userType,
      plan: newRoles.includes('coach') && formData.plan === 'starter' ? 'coach' : formData.plan,
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center items-center min-h-screen">
        <LoadingInline message="Loading user details..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
              <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
              <Button onClick={() => router.push('/admin/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <Avatar 
              name={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email} 
              size="lg" 
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.email}
              </h1>
              <p className="text-gray-600 mt-1">User Profile & Permissions</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">User updated successfully!</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  
                  {user.firstName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <p className="text-gray-900">{user.firstName}</p>
                    </div>
                  )}
                  
                  {user.lastName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <p className="text-gray-900">{user.lastName}</p>
                    </div>
                  )}
                  
                  {user.company && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <p className="text-gray-900">{user.company}</p>
                    </div>
                  )}
                  
                  {user.jobTitle && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      <p className="text-gray-900">{user.jobTitle}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Permissions & Role */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Permissions & Role
                </h2>
                
                <div className="space-y-6">
                  {/* Role Selection - Multiple roles */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      User Roles * (Multiple selection allowed)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.roles.includes('coach')
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.roles.includes('coach')}
                            onChange={() => handleRoleToggle('coach')}
                            className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">Coach</div>
                            <div className="text-sm text-gray-600 mt-1">For coaches and consultants</div>
                          </div>
                        </div>
                      </label>
                      <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.roles.includes('participant')
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.roles.includes('participant')}
                            onChange={() => handleRoleToggle('participant')}
                            className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">Participant</div>
                            <div className="text-sm text-gray-600 mt-1">Regular user</div>
                          </div>
                        </div>
                      </label>
                      <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.roles.includes('admin')
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.roles.includes('admin')}
                            onChange={() => handleRoleToggle('admin')}
                            className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">Admin</div>
                            <div className="text-sm text-gray-600 mt-1">Administrator</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Current Roles Badges */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Roles
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(user.roles || [user.role]).map((role: string) => (
                        <Badge 
                          key={role}
                          variant={role === 'admin' ? 'admin' : role === 'coach' ? 'coach' : 'participant'}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Plan Selection */}
                  {!formData.roles.includes('admin') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan
                      </label>
                      <select
                        value={formData.plan}
                        onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="starter">Starter</option>
                        <option value="individual">Individual</option>
                        {formData.roles.includes('coach') && <option value="coach">Coach</option>}
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="revelation">Revelation</option>
                        <option value="coaching">Coaching</option>
                      </select>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="pt-4 border-t">
                      <Button
                        onClick={handleSave}
                        leftIcon={<Save className="w-4 h-4" />}
                        isLoading={isSaving}
                        disabled={
                          JSON.stringify(formData.roles.sort()) === 
                          JSON.stringify((user.roles || [user.role]).sort())
                        }
                      >
                        Update Permissions
                      </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant={user.isActive ? 'success' : 'error'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Verified</span>
                    <Badge variant={user.emailVerified ? 'success' : 'error'}>
                      {user.emailVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Account Details */}
            <Card>
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Account Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">User Type</span>
                    <p className="text-gray-900 font-medium capitalize">{user.userType || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Plan</span>
                    <p className="text-gray-900 font-medium capitalize">{user.plan || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Created</span>
                    <p className="text-gray-900 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated</span>
                    <p className="text-gray-900 font-medium">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

