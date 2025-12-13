'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  ClipboardCheck, 
  Search, 
  Filter, 
  MoreHorizontal,
  Download,
  AlertTriangle,
  X
} from 'lucide-react';

// Import UI components
import { 
  Button, 
  StatCard, 
  Badge, 
  Input,
  PasswordInput,
  Tabs,
  Avatar,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingInline,
  Card
} from '@/components/ui';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  assessmentsCompleted: number;
  userGrowth: number;
  activeRate: number;
  revenueGrowth: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
  status: string;
  progress: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    assessmentsCompleted: 0,
    userGrowth: 0,
    activeRate: 0,
    revenueGrowth: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, activeTab, searchQuery]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuOpen !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.action-menu-container')) {
          setActionMenuOpen(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuOpen]);

  const loadData = async () => {
    try {
      console.log('Loading admin data...');
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch('/api/admin/stats');
      console.log('Admin stats response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Admin data loaded:', { stats: data.stats, usersCount: data.users?.length });
        setStats(data.stats || {
          totalUsers: 0,
          activeUsers: 0,
          totalRevenue: 0,
          assessmentsCompleted: 0,
          userGrowth: 0,
          activeRate: 0,
          revenueGrowth: 0,
        });
        setUsers(data.users || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error loading admin data:', errorData);
        setLoadError(errorData.error || `Failed to load data (${response.status})`);
        // Set empty data to prevent blank screen
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalRevenue: 0,
          assessmentsCompleted: 0,
          userGrowth: 0,
          activeRate: 0,
          revenueGrowth: 0,
        });
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load admin data');
      // Set empty data to prevent blank screen
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        assessmentsCompleted: 0,
        userGrowth: 0,
        activeRate: 0,
        revenueGrowth: 0,
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(user => user.role === activeTab);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Role', 'Plan', 'Status', 'Join Date'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role,
        user.plan,
        user.status,
        new Date(user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arise-users.csv';
    a.click();
  };

  const handleUserAction = async (userId: number, action: string) => {
    setActionMenuOpen(null);
    
    // For delete action, show confirmation modal
    if (action === 'delete') {
      const user = users.find(u => u.id === userId);
      if (user) {
        setUserToDelete(user);
        setDeleteModalOpen(true);
        setDeletePassword('');
        setDeleteError('');
      }
      return;
    }
    
    try {
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch('/api/admin/users', {
        method: 'PUT',
        body: JSON.stringify({ userId, action }),
      });
      
      if (response.ok) {
        loadData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error performing action:', errorData);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete || !deletePassword) {
      setDeleteError('Please enter your password to confirm deletion');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch('/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ 
          userId: userToDelete.id,
          password: deletePassword 
        }),
      });

      if (response.ok) {
        setDeleteModalOpen(false);
        setUserToDelete(null);
        setDeletePassword('');
        loadData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setDeleteError(errorData.error || 'Failed to delete user. Please check your password.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setDeleteError('An error occurred while deleting the user');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeVariant = (role: string): 'admin' | 'coach' | 'participant' => {
    switch (role) {
      case 'admin': return 'admin';
      case 'coach': return 'coach';
      default: return 'participant';
    }
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'error' | 'neutral' => {
    switch (status) {
      case 'active': return 'success';
      case 'at_risk': return 'error';
      default: return 'neutral';
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'participant', label: 'Participant' },
    { id: 'coach', label: 'Coach' },
    { id: 'admin', label: 'Admin' },
  ];

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center items-center min-h-screen">
        <LoadingInline message="Loading admin data..." />
      </div>
    );
  }

  console.log('Rendering admin dashboard:', { stats, usersCount: users.length, filteredCount: filteredUsers.length });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome Admin</h1>
          <p className="text-sm sm:text-base text-gray-500">Manage users, view analytics, and configure platform settings</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Button
            variant="secondary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Avatar name="Admin" size="lg" />
        </div>
      </div>

      {/* Error Message */}
      {loadError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Error loading data</h3>
          </div>
          <p className="text-sm text-red-800 mb-3">{loadError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoadError(null);
              setIsLoading(true);
              loadData();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stats Cards - Using StatCard component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6" />}
          variant="blue"
          trend={{ value: stats.userGrowth, label: `+${stats.userGrowth}% from last month` }}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<UserCheck className="w-6 h-6" />}
          variant="green"
          subtitle={`${stats.activeRate}% active rate`}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          variant="yellow"
          trend={{ value: stats.revenueGrowth, label: `+${stats.revenueGrowth}% from last month` }}
        />
        <StatCard
          title="Assessments"
          value={stats.assessmentsCompleted}
          icon={<ClipboardCheck className="w-6 h-6" />}
          variant="purple"
          subtitle="Completed this month"
        />
      </div>

      {/* Tabs - Using Tabs component */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* User Management Table */}
      <Card className="mt-6" padding="none">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">User Management</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                fullWidth={false}
                className="w-full sm:w-64"
              />
              <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />} className="w-full sm:w-auto">
                Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-900 capitalize">{user.plan}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.status)} dot>
                    {user.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${user.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">{user.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="relative action-menu-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuOpen(actionMenuOpen === user.id ? null : user.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="User actions"
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-600" />
                    </button>
                    {actionMenuOpen === user.id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        <button
                          onClick={() => {
                            handleUserAction(user.id, 'view');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            handleUserAction(user.id, 'make_coach');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Make Coach
                        </button>
                        <button
                          onClick={() => {
                            handleUserAction(user.id, 'make_admin');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Make Admin
                        </button>
                        <div className="border-t border-gray-200 my-1" />
                        <button
                          onClick={() => {
                            handleUserAction(user.id, 'delete');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          🗑️ Delete User
                        </button>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                You are about to delete:
              </p>
              <p className="font-semibold text-gray-900">
                {userToDelete.firstName} {userToDelete.lastName}
              </p>
              <p className="text-sm text-gray-600">{userToDelete.email}</p>
            </div>

            <div className="mb-4">
              <PasswordInput
                label="Enter your password to confirm deletion"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError('');
                }}
                placeholder="Your password"
                fullWidth
                error={deleteError}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                fullWidth
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleDeleteConfirm}
                fullWidth
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
