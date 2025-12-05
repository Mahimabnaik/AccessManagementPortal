import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { FaArrowLeft, FaCheck, FaTimes, FaUser, FaHistory } from "react-icons/fa";


export default function RequestDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [request, setRequest] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [reqRes, auditRes] = await Promise.all([
          api.get(`/requests/${id}`),
          api.get(`/requests/${id}/audit`)
        ]);
        if (!mounted) return;
        setRequest(reqRes.data);
        setAudit((auditRes.data || []).map(a => normalizeAuditEntry(a)));
      } catch (err) {
        console.error("RequestDetail load error:", err);
        setError(err?.response?.data?.error || "Failed to load request");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  function normalizeAuditEntry(a) {
    return {
      id: a.id ?? a.audit_id ?? Math.random().toString(36).slice(2,9),
      action: a.action ?? a.type ?? "ACTION",
      performed_by: a.performed_by ?? a.user ?? a.actor ?? "system",
      details: a.details ?? a.payload ?? null,
      created_at: a.created_at ?? a.timestamp ?? a.createdAt ?? new Date().toISOString(),
    };
  }

  function updateStatusLocal(newStatus) {
    setRequest(prev => prev ? { ...prev, status: newStatus } : prev);
  }

  async function handleAdminAction(type) {
    setError("");
    setActioning(true);
    try {
      await toast.promise(
        api.post(`/requests/admin/${id}/${type}`, { notes }),
        {
          loading: type === "approve" ? "Approving..." : "Rejecting...",
          success: type === "approve" ? "Approved ✅" : "Rejected ✅",
          error: "Action failed",
        }
      );

      updateStatusLocal(type === "approve" ? "APPROVED" : "REJECTED");

      const { data: auditRes } = await api.get(`/requests/${id}/audit`);
      setAudit((auditRes || []).map(a => normalizeAuditEntry(a)));
      setNotes("");
    } catch (err) {
      console.error("Admin action error:", err);
      setError(err?.response?.data?.error || "Action failed");
    } finally {
      setActioning(false);
    }
  }

  const isAdmin = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
      return u && u.role === "admin";
    } catch { return false; }
  })();

  const isOwner = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
      return u && (u.role === "admin" || u.email === request?.requester_email);
    } catch { return false; }
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-cyan-50 to-white">
        <div className="w-full max-w-3xl animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-72 bg-gray-200 rounded md:col-span-2" />
            <div className="h-72 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-cyan-50 to-white">
        <button onClick={() => nav(-1)} className="inline-flex items-center text-white gap-2 text-teal-700 mb-6">
          <FaArrowLeft /> Back
        </button>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-red-600 font-medium">Request not found or you don't have access.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => nav(-1)} className="inline-flex items-center text-white gap-2 text-teal-700 hover:underline">
              <FaArrowLeft /> Back
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-teal-700">Request #{request.id}</h1>
              <div className="text-sm text-gray-500 mt-1">Requested by <span className="font-medium text-gray-700">{request.requester_email}</span> · {request.created_at}</div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 shadow-sm">
              <FaUser className="text-gray-600" />
              <div className="text-xs text-gray-700 font-medium">{String(request.requester_email || "").split('@')[0] || "user"}</div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-semibold">
              <StatusPill status={request.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main details */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 space-y-6 transform transition-all duration-300 hover:shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoBlock label="Application" value={request.application} />
              <InfoBlock label="Environment" value={request.environment} />
              <InfoBlock label="Group / Role" value={request.group_role || "—"} />
              <InfoBlock label="Project" value={request.project || "—"} />
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-2">Notes</div>
              <div className="bg-gray-50 p-4 rounded text-gray-700 whitespace-pre-wrap">{request.notes || "No notes provided."}</div>
            </div>

            {request.external_job_id && (
              <div>
                <div className="text-xs text-gray-500 mb-2">Provisioning Job</div>
                <div className="font-mono text-sm text-gray-700 bg-gray-50 p-3 rounded">{request.external_job_id}</div>
              </div>
            )}
          </div>

          {/* Right: Actions & Audit */}
          <aside className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl shadow p-4 w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-500">Quick Actions</div>
                <div className="text-xs text-gray-400">{isAdmin ? "Admin" : "User"}</div>
              </div>

              <div className="space-y-3">
                {request.status === "PENDING" && isAdmin && (
                  <>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes (optional)"
                      className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-200"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdminAction("approve")}
                        disabled={actioning}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-br from-green-600 to-green-700 text-white rounded font-semibold hover:scale-[1.02] disabled:opacity-60"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        onClick={() => handleAdminAction("reject")}
                        disabled={actioning}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded font-semibold hover:scale-[1.02] disabled:opacity-60"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  </>
                )}

                {request.status === "PENDING" && isOwner && !isAdmin && (
                  <div className="text-xs text-gray-500">This request is pending. Contact an admin to approve or reject.</div>
                )}

                <div className="pt-2 border-t text-xs text-gray-500">
                  <div>Created: <span className="text-gray-700 font-medium">{request.created_at}</span></div>
                </div>
              </div>
            </div>

            {/* Audit timeline (improved) */}
            <div className="bg-white rounded-2xl shadow p-4 w-full">
              <div className="flex items-center gap-2 mb-3">
                <FaHistory className="text-gray-600" />
                <div className="text-sm font-medium text-gray-700">Audit / History</div>
              </div>

              <div className="relative pl-10">
                {/* vertical line */}
                <div className="absolute left-8 top-6 bottom-2 w-px bg-gray-200" />

                {audit.length === 0 ? (
                  <div className="text-sm text-gray-500 pl-6">No audit entries yet.</div>
                ) : (
                  <div className="space-y-6">
                    {audit.map((a, idx) => (
                      <AuditItem key={a.id || idx} entry={a} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}
      </div>
    </div>
  );
}

/* ---------- Audit item component ---------- */

function AuditItem({ entry }) {
  const [open, setOpen] = useState(false);

  function handleToggle() {
    if (!open && entry?.details) {
      console.log("AUDIT DETAILS RAW:", entry.details);
    }
    setOpen(v => !v);
  }

  const actor = entry.performed_by || "system";
  const stamp = formatDate(entry.created_at);
  const details = entry.details;

  return (
    <div className="flex items-start gap-4 pl-2">
      {/* fixed marker column (no negative left) */}
      <div className="flex-shrink-0 w-10">
        <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-teal-700 font-semibold shadow">
          {String(entry.action || "A").slice(0,2).toUpperCase()}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-800">{entry.action}</div>
          <div className="text-xs text-gray-400">{stamp}</div>
        </div>

        <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
          <span className="text-gray-500">by</span>
          <span className="text-gray-700 font-medium">{actor}</span>
        </div>

        {details ? (
          <div className="mt-2 text-xs text-gray-700">
            <DetailsPreview details={details} open={open} />
            <button
              onClick={handleToggle}
              className="mt-2 text-xs text-teal-600 hover:underline"
            >
              {open ? "Show less" : "Show details"}
            </button>
          </div>
        ) : (
          <div className="mt-2 text-xs text-gray-500">—</div>
        )}
      </div>
    </div>
  );
}

function DetailsPreview({ details, open }) {
  function tryParse(v) {
    if (v === null || v === undefined) return v;
    if (typeof v === "string") {
      let cur = v;
      for (let i = 0; i < 3; i++) { 
        try {
          const parsed = JSON.parse(cur);
          cur = parsed;
        } catch {
          break;
        }
      }
      return cur;
    }
    return v;
  }

  const parsed = tryParse(details);

  const copyJSON = (obj) => {
    try {
      const txt = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
      navigator.clipboard?.writeText(txt);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  if (!open) {
    if (parsed === null || parsed === undefined) return <div className="text-xs text-gray-600">No details</div>;

    if (typeof parsed === "string") {
      return <div className="truncate text-xs text-gray-700 max-w-full">{parsed}</div>;
    }

    if (Array.isArray(parsed)) {
      const items = parsed.slice(0, 3).map((it, i) => <span key={i} className="mr-2 inline-block truncate max-w-[10rem]">{String(it)}</span>);
      return <div className="text-xs text-gray-600">{items}{parsed.length > 3 && <span className="text-gray-400"> …</span>}</div>;
    }

    if (typeof parsed === "object") {
      const keys = Object.keys(parsed).slice(0, 4);
      return (
        <div className="text-xs text-gray-600">
          {keys.map(k => (
            <span key={k} className="mr-3 inline-block max-w-[10rem] truncate">
              <strong className="text-gray-700">{k}</strong>: {String(parsed[k]).slice(0,40)}
            </span>
          ))}
          {Object.keys(parsed).length > keys.length && <span className="text-gray-400"> …</span>}
        </div>
      );
    }

    return <div className="text-xs text-gray-600">{String(parsed)}</div>;
  }

  if (typeof parsed === "string") {
    return (
      <div className="bg-gray-50 p-3 rounded text-xs">
        <pre className="whitespace-pre-wrap break-words">{parsed}</pre>
        <div className="mt-2">
          <button onClick={() => copyJSON(parsed)} className="text-xs text-teal-600 hover:underline">Copy</button>
        </div>
      </div>
    );
  }

  if (Array.isArray(parsed)) {
    return (
      <div className="bg-gray-50 p-3 rounded text-xs overflow-auto">
        <pre className="whitespace-pre-wrap break-words">{JSON.stringify(parsed, null, 2)}</pre>
        <div className="mt-2">
          <button onClick={() => copyJSON(parsed)} className="text-xs text-teal-600 hover:underline">Copy JSON</button>
        </div>
      </div>
    );
  }

  if (typeof parsed === "object") {
    return (
      <div className="bg-gray-50 p-3 rounded text-xs">
        <RecursiveRenderer obj={parsed} />
        <div className="mt-2">
          <button onClick={() => copyJSON(parsed)} className="text-xs text-teal-600 hover:underline">Copy JSON</button>
        </div>
      </div>
    );
  }

  return <div className="text-xs text-gray-700">{String(parsed)}</div>;
}


function RecursiveRenderer({ obj, level = 0 }) {
  const indent = `${level * 12}px`;
  if (obj === null) return <div style={{ paddingLeft: indent }} className="text-gray-600">null</div>;
  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
    return <div style={{ paddingLeft: indent }} className="text-gray-700">{String(obj)}</div>;
  }
  if (Array.isArray(obj)) {
    return (
      <div style={{ paddingLeft: indent }}>
        <div className="text-gray-600">[</div>
        {obj.map((it, i) => (
          <div key={i} className="mb-2">
            <RecursiveRenderer obj={it} level={level + 1} />
          </div>
        ))}
        <div className="text-gray-600">]</div>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(obj).map(([k, v]) => (
        <div key={k} className="flex gap-2 mb-2" style={{ paddingLeft: `${level * 12}px` }}>
          <div className="text-gray-500 w-28">{k}:</div>
          <div className="flex-1">
            { (typeof v === "object" && v !== null)
                ? <RecursiveRenderer obj={v} level={level + 1} />
                : <div className="text-gray-700">{String(v)}</div>
            }
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Small helper components ---------- */

function InfoBlock({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-800 mt-1">{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const s = (status || "").toUpperCase();
  const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold";
  switch (s) {
    case "APPROVED": return <span className={`${base} bg-green-50 text-green-800`}>Approved</span>;
    case "REJECTED": return <span className={`${base} bg-red-50 text-red-800`}>Rejected</span>;
    case "PROVISIONED": return <span className={`${base} bg-indigo-50 text-indigo-800`}>Provisioned</span>;
    case "PENDING": return <span className={`${base} bg-yellow-50 text-yellow-800`}>Pending</span>;
    default: return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
  }
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
}