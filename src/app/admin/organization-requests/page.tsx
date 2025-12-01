"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const supabase = createClient();

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  async function fetchRequests() {
    try {
      setLoading(true);
      let query = supabase
        .from("organization_registration_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setRequests(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching requests:", err);
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
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Organization Registration Requests
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: 16 }}>
            Review and approve organization registrations for EduDashPro and EduSitePro
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: "10px 20px",
                background: filter === status ? "#00f5ff" : "#1a1a1f",
                border: `1px solid ${filter === status ? "#00f5ff" : "#2a2a2f"}`,
                borderRadius: 8,
                color: filter === status ? "#000" : "#fff",
                fontWeight: 600,
                textTransform: "capitalize",
                cursor: "pointer",
              }}
            >
              {status} ({requests.filter(r => status === "all" || r.status === status).length})
            </button>
          ))}
          <button
            onClick={fetchRequests}
            style={{
              padding: "10px 20px",
              background: "#1a1a1f",
              border: "1px solid #2a2a2f",
              borderRadius: 8,
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#ef444415", border: "1px solid #ef444430", borderRadius: 8, padding: 16, marginBottom: 24, color: "#ef4444" }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>
            Loading requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>
            No {filter !== "all" && filter} requests found.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  background: "#111113",
                  border: "1px solid #1f1f23",
                  borderRadius: 12,
                  padding: 24,
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onClick={() => setSelectedRequest(request)}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a2f")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1f1f23")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
                      {request.organization_name}
                    </h3>
                    <p style={{ color: "#9CA3AF", fontSize: 14 }}>
                      {request.full_name} • {request.email}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 600,
                      background:
                        request.status === "approved"
                          ? "#10b98115"
                          : request.status === "rejected"
                          ? "#ef444415"
                          : "#f59e0b15",
                      color:
                        request.status === "approved"
                          ? "#10b981"
                          : request.status === "rejected"
                          ? "#ef4444"
                          : "#f59e0b",
                      textTransform: "capitalize",
                    }}
                  >
                    {request.status}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12, marginBottom: 4 }}>Organization Type</p>
                    <p style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{request.organization_type}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12, marginBottom: 4 }}>Campus</p>
                    <p style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{request.campus_name}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12, marginBottom: 4 }}>Location</p>
                    <p style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
                      {request.city}, {request.province}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12, marginBottom: 4 }}>Submitted</p>
                    <p style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {request.status === "pending" && (
                  <div style={{ display: "flex", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #1f1f23" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(request.id);
                      }}
                      disabled={actionLoading === request.id}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        background: "#10b981",
                        border: "none",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: actionLoading === request.id ? "not-allowed" : "pointer",
                        opacity: actionLoading === request.id ? 0.5 : 1,
                      }}
                    >
                      {actionLoading === request.id ? "Processing..." : "✓ Approve"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(request.id);
                      }}
                      disabled={actionLoading === request.id}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        background: "#ef4444",
                        border: "none",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: actionLoading === request.id ? "not-allowed" : "pointer",
                        opacity: actionLoading === request.id ? 0.5 : 1,
                      }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}

                {request.rejection_reason && (
                  <div style={{ marginTop: 16, padding: 12, background: "#ef444415", border: "1px solid #ef444430", borderRadius: 8 }}>
                    <p style={{ color: "#ef4444", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Rejection Reason:
                    </p>
                    <p style={{ color: "#d1d5db", fontSize: 13 }}>{request.rejection_reason}</p>
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
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 1000,
          }}
          onClick={() => setSelectedRequest(null)}
        >
          <div
            style={{
              background: "#111113",
              border: "1px solid #1f1f23",
              borderRadius: 12,
              padding: 32,
              maxWidth: 800,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9CA3AF",
                  fontSize: 24,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: 24 }}>
              {/* Personal Information */}
              <section>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#00f5ff" }}>
                  Personal Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Full Name</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.full_name}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Email</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Phone</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.phone_number}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>ID Number</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.id_number}</p>
                  </div>
                </div>
              </section>

              {/* Organization Information */}
              <section>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#00f5ff" }}>
                  Organization Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Organization Name</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.organization_name}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Slug</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.organization_slug}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Type</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.organization_type}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Registration Number</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.registration_number || "N/A"}</p>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Tax Number</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.tax_number || "N/A"}</p>
                  </div>
                </div>
              </section>

              {/* Address */}
              <section>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#00f5ff" }}>
                  Address
                </h3>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Street Address</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.street_address}</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    <div>
                      <p style={{ color: "#6B7280", fontSize: 12 }}>Suburb</p>
                      <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.suburb}</p>
                    </div>
                    <div>
                      <p style={{ color: "#6B7280", fontSize: 12 }}>City</p>
                      <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.city}</p>
                    </div>
                    <div>
                      <p style={{ color: "#6B7280", fontSize: 12 }}>Province</p>
                      <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.province}</p>
                    </div>
                    <div>
                      <p style={{ color: "#6B7280", fontSize: 12 }}>Postal Code</p>
                      <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.postal_code}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Campus Information */}
              <section>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#00f5ff" }}>
                  Campus Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Campus Name</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.campus_name}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Campus Slug</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{selectedRequest.campus_slug}</p>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <p style={{ color: "#6B7280", fontSize: 12 }}>Campus Address</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>
                      {selectedRequest.campus_address}, {selectedRequest.campus_city}, {selectedRequest.campus_province} {selectedRequest.campus_postal_code}
                    </p>
                  </div>
                </div>
              </section>

              {/* Status Information */}
              {selectedRequest.status !== "pending" && (
                <section>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#00f5ff" }}>
                    Status Information
                  </h3>
                  <div style={{ display: "grid", gap: 12 }}>
                    {selectedRequest.approved_at && (
                      <div>
                        <p style={{ color: "#6B7280", fontSize: 12 }}>Approved At</p>
                        <p style={{ color: "#fff", fontSize: 14 }}>
                          {new Date(selectedRequest.approved_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedRequest.edusitepro_org_id && (
                      <div>
                        <p style={{ color: "#6B7280", fontSize: 12 }}>EduSitePro Organization ID</p>
                        <p style={{ color: "#fff", fontSize: 14, fontFamily: "monospace" }}>
                          {selectedRequest.edusitepro_org_id}
                        </p>
                      </div>
                    )}
                    {selectedRequest.edudashpro_org_id && (
                      <div>
                        <p style={{ color: "#6B7280", fontSize: 12 }}>EduDashPro Organization ID</p>
                        <p style={{ color: "#fff", fontSize: 14, fontFamily: "monospace" }}>
                          {selectedRequest.edudashpro_org_id}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Actions */}
              {selectedRequest.status === "pending" && (
                <div style={{ display: "flex", gap: 12, paddingTop: 16, borderTop: "1px solid #1f1f23" }}>
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={actionLoading === selectedRequest.id}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      background: "#10b981",
                      border: "none",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: actionLoading === selectedRequest.id ? "not-allowed" : "pointer",
                      opacity: actionLoading === selectedRequest.id ? 0.5 : 1,
                    }}
                  >
                    {actionLoading === selectedRequest.id ? "Processing..." : "✓ Approve Request"}
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={actionLoading === selectedRequest.id}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      background: "#ef4444",
                      border: "none",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: actionLoading === selectedRequest.id ? "not-allowed" : "pointer",
                      opacity: actionLoading === selectedRequest.id ? 0.5 : 1,
                    }}
                  >
                    ✕ Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
