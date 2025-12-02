'use client';

import { AlertTriangle, Search, Shield, Trash2 } from 'lucide-react';
import { useEffect,useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import { getServiceRoleClient } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  organization_id: string | null;
  preschool_id: string | null;
  created_at: string;
  phone?: string | null;
}

interface DeletePreview {
  user: User;
  relatedRecords: Record<string, number>;
  canDelete: boolean;
  warnings?: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deletePreview, setDeletePreview] = useState<DeletePreview | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const supabase = getServiceRoleClient();
      
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (user: User) => {
    try {
      // Fetch delete preview
      const response = await fetch(`/api/admin/users/${user.id}`);
      const preview: DeletePreview = await response.json();
      
      setDeletePreview(preview);
      setShowDeleteModal(true);
    } catch (error) {
      console.error('Error fetching delete preview:', error);
      alert('Failed to fetch user details');
    }
  };

  const confirmDelete = async () => {
    if (!deletePreview) return;

    const userId = deletePreview.user.id;
    setDeletingUserId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // Show detailed deletion log
      const logMessage = [
        `✅ User deleted successfully!`,
        ``,
        `User: ${deletePreview.user.full_name || deletePreview.user.email}`,
        ``,
        `Deletion Log:`,
        ...result.deletionLog.map((log: string) => `  ${log}`),
      ];

      if (result.warnings && result.warnings.length > 0) {
        logMessage.push(``, `⚠️ Warnings:`, ...result.warnings.map((w: string) => `  ${w}`));
      }

      alert(logMessage.join('\n'));
      
      // Refresh user list
      fetchUsers();
      setShowDeleteModal(false);
      setDeletePreview(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === '' ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const roleStats = {
    all: users.length,
    superadmin: users.filter(u => u.role === 'superadmin').length,
    principal: users.filter(u => u.role === 'principal').length,
    admin: users.filter(u => u.role === 'admin').length,
    user: users.filter(u => u.role === 'user').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage all system users and their access rights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{roleStats.all}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Super Admins</p>
                <p className="text-3xl font-bold text-purple-600">{roleStats.superadmin}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Principals</p>
                <p className="text-3xl font-bold text-amber-600">{roleStats.principal}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-3xl font-bold text-green-600">{roleStats.admin}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Regular Users</p>
                <p className="text-3xl font-bold text-gray-600">{roleStats.user}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              {(['all', 'superadmin', 'principal', 'admin', 'user'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    roleFilter === role
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 md:w-80"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'No name'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            user.role === 'superadmin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'principal'
                              ? 'bg-amber-100 text-amber-800'
                              : user.role === 'admin'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Confirm User Deletion</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* User Details */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">User to be deleted:</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {deletePreview.user.full_name || 'No name'}</p>
                  <p><span className="font-medium">Email:</span> {deletePreview.user.email}</p>
                  <p><span className="font-medium">Role:</span> <span className="capitalize">{deletePreview.user.role}</span></p>
                </div>
              </div>

              {/* Related Records */}
              {Object.values(deletePreview.relatedRecords).some(count => count > 0) && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                  <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Related records that will be deleted:
                  </h3>
                  <ul className="space-y-1 text-sm text-amber-800">
                    {Object.entries(deletePreview.relatedRecords)
                      .filter(([_, count]) => count > 0)
                      .map(([table, count]) => (
                        <li key={table}>
                          • {count} record(s) from <code className="bg-amber-100 px-1 rounded">{table}</code>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Warning */}
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ This will permanently delete the user and all related records. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-200 p-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePreview(null);
                }}
                disabled={deletingUserId !== null}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingUserId !== null}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingUserId ? 'Deleting...' : 'Yes, Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
