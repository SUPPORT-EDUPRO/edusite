'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Filter,
  Search,
  Download,
  Mail,
  Phone,
  Calendar,
  User,
  Users,
  Loader2
} from 'lucide-react';

interface RegistrationRequest {
  id: string;
  guardian_name: string;
  guardian_email: string;
  guardian_phone: string;
  guardian_address: string;
  student_first_name: string;
  student_last_name: string;
  student_dob: string;
  student_gender: string;
  preferred_class: string;
  preferred_start_date: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'enrolled' | 'waitlisted';
  submission_date: string;
  reviewed_date?: string;
  rejection_reason?: string;
  sibling_enrolled: boolean;
  priority_points: number;
  how_did_you_hear?: string;
  special_requests?: string;
}

interface RegistrationDashboardProps {
  organizationId: string;
}

export function RegistrationDashboard({ organizationId }: RegistrationDashboardProps) {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    
    let query = supabase
      .from('registration_requests')
      .select('*')
      .eq('organization_id', organizationId)
      .order('submission_date', { ascending: false });

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching requests:', error);
      alert('Failed to load registration requests');
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('registration_requests')
        .update({
          status: 'approved',
          reviewed_date: new Date().toISOString(),
          reviewed_by: user.user?.id,
        })
        .eq('id', requestId);

      if (error) throw error;

      console.log('Registration approved! Approval email will be sent.');
      
      // TODO: Send approval email via API
      // await fetch('/api/notifications/send', { ... });

      fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert('Failed to approve registration');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    setProcessingId(requestId);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('registration_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_date: new Date().toISOString(),
          reviewed_by: user.user?.id,
        })
        .eq('id', requestId);

      if (error) throw error;

      console.log('Registration rejected. Notification will be sent.');
      
      // TODO: Send rejection email via API
      // await fetch('/api/notifications/send', { ... });

      fetchRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject registration');
    } finally {
      setProcessingId(null);
      setShowDetails(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (!searchQuery) return true;
    
    const search = searchQuery.toLowerCase();
    return (
      req.student_first_name.toLowerCase().includes(search) ||
      req.student_last_name.toLowerCase().includes(search) ||
      req.guardian_name.toLowerCase().includes(search) ||
      req.guardian_email.toLowerCase().includes(search)
    );
  });

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      enrolled: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      waitlisted: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Registration Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage student registration applications for 2026 academic year
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.all}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statusCounts.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statusCounts.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statusCounts.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by student or guardian name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No registration requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Guardian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {req.student_first_name} {req.student_last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            DOB: {new Date(req.student_dob).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">{req.guardian_name}</div>
                        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {req.guardian_email}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {req.guardian_phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {req.preferred_class}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(req.submission_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4">
                      {req.sibling_enrolled && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-semibold">
                          Sibling +{req.priority_points}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={processingId === req.id}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition disabled:opacity-50"
                              title="Approve"
                            >
                              {processingId === req.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setShowDetails(true);
                              }}
                              disabled={processingId === req.id}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Registration Details
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Student Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Name:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRequest.student_first_name} {selectedRequest.student_last_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Date of Birth:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedRequest.student_dob).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRequest.student_gender}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Preferred Class:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRequest.preferred_class}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guardian Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Guardian Information</h3>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Name:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.guardian_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Email:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.guardian_email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.guardian_phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Address:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.guardian_address}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {selectedRequest.special_requests && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Special Requests</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {selectedRequest.special_requests}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedRequest.status === 'pending' && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleApprove(selectedRequest.id)}
                        disabled={processingId === selectedRequest.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingId === selectedRequest.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve Registration
                      </button>

                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) {
                            handleReject(selectedRequest.id, reason);
                          }
                        }}
                        disabled={processingId === selectedRequest.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Registration
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
