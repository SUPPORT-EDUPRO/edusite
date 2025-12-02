"use client";

import { useState, useEffect } from "react";
import AdminLayout from '@/components/admin/AdminLayout';

interface RegistrationRequest {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  id_number: string;
  organization_name: string;
  organization_slug: string;
  organization_type: string;
  registration_number: string;
  tax_number: string;
  street_address: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  campus_name: string;
  campus_slug: string;
  campus_address: string;
  campus_city: string;
  campus_province: string;
  campus_postal_code: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approval_notes?: string;
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  edusitepro_org_id?: string;
  edudashpro_org_id?: string;
}

export default function OrganizationRequestsPage() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  async function fetchRequests() {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/requests?status=${filter}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const result = await response.json();
      setRequests(result.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    if (!confirm("Are you sure you want to approve this organization registration?")) {
      return;
    }

    try {
      setActionLoading(requestId);
      const response = await fetch(`/api/organizations/approve/${requestId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve request");
      }

      const result = await response.json();
      alert(`Organization approved successfully!\n\nEduSitePro Org ID: ${result.edusiteproOrgId}\nEduDashPro Org ID: ${result.edudashproOrgId}`);
      
      // Refresh the list
      await fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error("Error approving request:", err);
      alert(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(requestId: string) {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      setActionLoading(requestId);
      const response = await fetch(`/api/organizations/approve/${requestId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject request");
      }

      alert("Request rejected successfully. The applicant will be notified.");
      
      // Refresh the list
      await fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setActionLoading(null);
    }
  }

  const filteredRequests = requests;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Organization Registration Requests
          </h1>
          <p className="mt-2 text-gray-600">
            Review and approve organization registrations for EduDashPro and EduSitePro
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm capitalize transition ${
                filter === status
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status} ({requests.filter(r => status === "all" || r.status === status).length})
            </button>
          ))}
          <button
            onClick={fetchRequests}
            className="ml-auto px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold text-sm hover:bg-gray-50"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            Loading requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No {filter !== "all" && filter} requests found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {request.organization_name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {request.full_name} • {request.email}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      request.status === "approved"
                        ? 'bg-green-100 text-green-800'
                        : request.status === "rejected"
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {request.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Organization Type</p>
                    <p className="text-sm font-medium text-gray-900">{request.organization_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Campus</p>
                    <p className="text-sm font-medium text-gray-900">{request.campus_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {request.city}, {request.province}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Submitted</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(request.id);
                      }}
                      disabled={actionLoading === request.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === request.id ? "Processing..." : "✓ Approve"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(request.id);
                      }}
                      disabled={actionLoading === request.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}

                {request.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-xs font-semibold mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-gray-700 text-sm">{request.rejection_reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <section>
                <h3 className="text-base font-semibold mb-3 text-amber-600">
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm text-gray-900">{selectedRequest.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{selectedRequest.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ID Number</p>
                    <p className="text-sm text-gray-900">{selectedRequest.id_number}</p>
                  </div>
                </div>
              </section>

              {/* Organization Information */}
              <section>
                <h3 className="text-base font-semibold mb-3 text-amber-600">
                  Organization Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Organization Name</p>
                    <p className="text-sm text-gray-900">{selectedRequest.organization_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Slug</p>
                    <p className="text-sm text-gray-900">{selectedRequest.organization_slug}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm text-gray-900">{selectedRequest.organization_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Registration Number</p>
                    <p className="text-sm text-gray-900">{selectedRequest.registration_number || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Tax Number</p>
                    <p className="text-sm text-gray-900">{selectedRequest.tax_number || "N/A"}</p>
                  </div>
                </div>
              </section>

              {/* Address */}
              <section>
                <h3 className="text-base font-semibold mb-3 text-amber-600">
                  Address
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Street Address</p>
                    <p className="text-sm text-gray-900">{selectedRequest.street_address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Suburb</p>
                      <p className="text-sm text-gray-900">{selectedRequest.suburb}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">City</p>
                      <p className="text-sm text-gray-900">{selectedRequest.city}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Province</p>
                      <p className="text-sm text-gray-900">{selectedRequest.province}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Postal Code</p>
                      <p className="text-sm text-gray-900">{selectedRequest.postal_code}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Campus Information */}
              <section>
                <h3 className="text-base font-semibold mb-3 text-amber-600">
                  Campus Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Campus Name</p>
                    <p className="text-sm text-gray-900">{selectedRequest.campus_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Campus Slug</p>
                    <p className="text-sm text-gray-900">{selectedRequest.campus_slug}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Campus Address</p>
                    <p className="text-sm text-gray-900">
                      {selectedRequest.campus_address}, {selectedRequest.campus_city}, {selectedRequest.campus_province} {selectedRequest.campus_postal_code}
                    </p>
                  </div>
                </div>
              </section>

              {/* Status Information */}
              {selectedRequest.status !== "pending" && (
                <section>
                  <h3 className="text-base font-semibold mb-3 text-amber-600">
                    Status Information
                  </h3>
                  <div className="space-y-3">
                    {selectedRequest.approved_at && (
                      <div>
                        <p className="text-xs text-gray-500">Approved At</p>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedRequest.approved_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedRequest.edusitepro_org_id && (
                      <div>
                        <p className="text-xs text-gray-500">EduSitePro Organization ID</p>
                        <p className="text-sm text-gray-900 font-mono">
                          {selectedRequest.edusitepro_org_id}
                        </p>
                      </div>
                    )}
                    {selectedRequest.edudashpro_org_id && (
                      <div>
                        <p className="text-xs text-gray-500">EduDashPro Organization ID</p>
                        <p className="text-sm text-gray-900 font-mono">
                          {selectedRequest.edudashpro_org_id}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Actions */}
              {selectedRequest.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={actionLoading === selectedRequest.id}
                    className="flex-1 px-5 py-3 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === selectedRequest.id ? "Processing..." : "✓ Approve Request"}
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={actionLoading === selectedRequest.id}
                    className="flex-1 px-5 py-3 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✕ Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
