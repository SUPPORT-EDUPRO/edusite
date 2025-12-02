'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Shield, Users, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  permissions?: AdminPermissions;
}

interface AdminPermissions {
  can_view_registrations: boolean;
  can_manage_registrations: boolean;
  can_view_organizations: boolean;
  can_manage_organizations: boolean;
  can_approve_organizations: boolean;
  can_view_campaigns: boolean;
  can_manage_campaigns: boolean;
  can_manage_pages: boolean;
  can_manage_media: boolean;
  can_manage_navigation: boolean;
  can_manage_themes: boolean;
  can_view_analytics: boolean;
  can_export_data: boolean;
  can_manage_users: boolean;
  can_manage_admins: boolean;
  can_manage_settings: boolean;
  can_manage_centres: boolean;
}

const DEFAULT_PERMISSIONS: AdminPermissions = {
  can_view_registrations: true,
  can_manage_registrations: true,
  can_view_organizations: true,
  can_manage_organizations: false,
  can_approve_organizations: false,
  can_view_campaigns: false,
  can_manage_campaigns: false,
  can_manage_pages: false,
  can_manage_media: false,
  can_manage_navigation: false,
  can_manage_themes: false,
  can_view_analytics: false,
  can_export_data: false,
  can_manage_users: false,
  can_manage_admins: false,
  can_manage_settings: false,
  can_manage_centres: false,
};

const PERMISSION_GROUPS = {
  'Registrations': [
    { key: 'can_view_registrations', label: 'View Registrations' },
    { key: 'can_manage_registrations', label: 'Approve/Reject Registrations' },
  ],
  'Organizations': [
    { key: 'can_view_organizations', label: 'View Organizations' },
    { key: 'can_manage_organizations', label: 'Edit Organizations' },
    { key: 'can_approve_organizations', label: 'Approve New Organizations' },
  ],
  'Campaigns & Marketing': [
    { key: 'can_view_campaigns', label: 'View Campaigns' },
    { key: 'can_manage_campaigns', label: 'Create/Edit Campaigns' },
  ],
  'Content Management': [
    { key: 'can_manage_pages', label: 'Manage Pages' },
    { key: 'can_manage_media', label: 'Manage Media Library' },
    { key: 'can_manage_navigation', label: 'Manage Navigation' },
    { key: 'can_manage_themes', label: 'Manage Themes' },
  ],
  'Analytics & Data': [
    { key: 'can_view_analytics', label: 'View Analytics' },
    { key: 'can_export_data', label: 'Export Data' },
  ],
  'System': [
    { key: 'can_manage_centres', label: 'Manage Centres' },
    { key: 'can_manage_settings', label: 'Manage Settings' },
    { key: 'can_manage_users', label: 'Manage Users' },
    { key: 'can_manage_admins', label: 'Manage Admins (SuperAdmin only)' },
  ],
};

export default function AdminManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPermissions, setNewAdminPermissions] = useState<AdminPermissions>(DEFAULT_PERMISSIONS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      alert('Failed to load admins');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAdmin() {
    if (!newAdminEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdminEmail,
          permissions: newAdminPermissions,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create admin');
      }

      alert(`✅ Admin created successfully!\nInvite email sent to ${newAdminEmail}`);
      setShowCreateModal(false);
      setNewAdminEmail('');
      setNewAdminPermissions(DEFAULT_PERMISSIONS);
      fetchAdmins();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePermissions(userId: string, permissions: AdminPermissions) {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update permissions');
      }

      alert('✅ Permissions updated successfully!');
      setSelectedUser(null);
      fetchAdmins();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAdmin(userId: string, email: string) {
    if (!confirm(`Are you sure you want to delete admin: ${email}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete admin');
      }

      alert('✅ Admin deleted successfully');
      fetchAdmins();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  }

  function togglePermission(key: keyof AdminPermissions) {
    if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        permissions: {
          ...selectedUser.permissions!,
          [key]: !selectedUser.permissions![key],
        },
      });
    } else {
      setNewAdminPermissions({
        ...newAdminPermissions,
        [key]: !newAdminPermissions[key],
      });
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
            <p className="mt-2 text-gray-600">
              Create and manage admin users with granular permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold"
          >
            <UserPlus className="h-5 w-5" />
            Create Admin
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Admins</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-10 w-10 text-amber-200" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SuperAdmins</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'superadmin').length}
                </p>
              </div>
              <Shield className="h-10 w-10 text-purple-200" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platform Admins</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <Users className="h-10 w-10 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Admin List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-600">
              Loading admins...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No admins found
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Admin
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
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-700 font-semibold">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role === 'superadmin' ? 'SuperAdmin' : 'Platform Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {user.role !== 'superadmin' && (
                          <>
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit Permissions"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(user.id, user.email)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete Admin"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Admin</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  An invitation email will be sent to this address
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
                <div className="space-y-6">
                  {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                    <div key={groupName}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">{groupName}</h4>
                      <div className="space-y-2">
                        {permissions.map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newAdminPermissions[key as keyof AdminPermissions]}
                              onChange={() => togglePermission(key as keyof AdminPermissions)}
                              className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAdmin}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Permissions</h2>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                <div key={groupName}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">{groupName}</h4>
                  <div className="space-y-2">
                    {permissions.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUser.permissions?.[key as keyof AdminPermissions] || false}
                          onChange={() => togglePermission(key as keyof AdminPermissions)}
                          className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-6 border-t mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdatePermissions(selectedUser.id, selectedUser.permissions!)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
