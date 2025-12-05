import React, { useEffect, useMemo, useState } from "react";
import { FaSearch, FaFilter, FaCheck, FaTimes, FaBolt, FaUserShield } from "react-icons/fa";
import api from "../services/api";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "PROVISIONED"];

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actioningId, setActioningId] = useState(null);
  const [modal, setModal] = useState({ open: false, id: null, type: null });
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAdminRequests() {
      try {
        setLoading(true);
        const res = await api.get("/requests/admin/all");
        setRequests(res.data);
      } catch (err) {
        console.error("Admin fetch error:", err);
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    }

    fetchAdminRequests();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter(r => {
      if (statusFilter !== "ALL" && (r.status || "").toUpperCase() !== statusFilter) return false;
      if (!q) return true;
      return (
        String(r.id).includes(q) ||
        (r.requester_email || "").toLowerCase().includes(q) ||
        (r.application || "").toLowerCase().includes(q) ||
        (r.project || "").toLowerCase().includes(q)
      );
    });
  }, [requests, search, statusFilter]);

  async function performAction(id, type, notesPayload = "") {
    setError("");
    setActioningId(id);

    const prevRequests = requests;


    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: type === "approve" ? "APPROVED" : "REJECTED" } : r))
    );

    const route = `/requests/admin/${id}/${type === "approve" ? "approve" : "reject"}`;
    try {
      await toast.promise(
        api.post(route, { notes: notesPayload }),
        {
          loading: type === "approve" ? "Approving..." : "Rejecting...",
          success: type === "approve" ? "Approved ✅" : "Rejected ✅",
          error: type === "approve" ? "Approve failed" : "Reject failed",
        }
      );

    } catch (err) {
      console.error(`${type} error:`, err);
      setError("Action failed — rolled back");
      setRequests(prevRequests);
    } finally {
      setActioningId(null);
      setModal({ open: false, id: null, type: null });
      setNotes("");
    }
  }

  function openModal(id, type) {
    setModal({ open: true, id, type });
    setNotes("");
    setError("");
  }

  function closeModal() {
    setModal({ open: false, id: null, type: null });
    setNotes("");
    setError("");
  }

  return (
    <div className="min-h-screen py-8 px-2 bg-gradient-to-br from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-teal-700 flex items-center gap-3 drop-shadow">
              <FaUserShield className="text-amber-500" /> Admin — Requests
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review incoming access requests and take action.</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative w-full sm:w-auto">
              <input
                className="pl-10 pr-4 py-2 rounded-lg border w-full sm:w-64 md:w-80 focus:outline-none focus:ring-2 focus:ring-teal-200 transition text-gray-700"
                placeholder="Search by requester, app, project or id..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <button
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-white border text-white-600 rounded-lg text-sm hover:bg-gray-50 transition"
                onClick={() => { setStatusFilter("ALL"); setSearch(""); }}
              >
                <FaFilter /> Reset
              </button>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-200"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total requests" value={requests.length} />
          <StatCard label="Pending" value={requests.filter(r => r.status === "PENDING").length} accent="yellow" />
          <StatCard label="Approved" value={requests.filter(r => r.status === "APPROVED").length} accent="green" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden md:block border-b">
            <div className="grid grid-cols-12 gap-2 px-6 py-3 text-sm font-semibold text-gray-600">
              <div className="col-span-1">ID</div>
              <div className="col-span-3">Requester</div>
              <div className="col-span-2">Application</div>
              <div className="col-span-1">Env</div>
              <div className="col-span-2">Project</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-center">Action</div>
            </div>
          </div>

          {/* Content */}
          <div>
            {loading ? (
              <div className="p-8 text-center text-gray-500 animate-pulse">Loading requests…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No requests found.</div>
            ) : (
              <div className="divide-y">
                {filtered.map((r) => (
                  <div key={r.id} className="px-4 py-4 md:px-6 md:py-3 hover:bg-cyan-50 transition">
                    {/* Mobile Card Layout */}
                    <div className="md:hidden space-y-2 mb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono text-teal-700 font-semibold">{r.id}</div>
                          <div className="text-sm text-gray-800">{r.requester_email}</div>
                          <div className="text-xs text-gray-500">{r.created_at}</div>
                        </div>
                        <StatusPill status={r.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">App:</span> {r.application}
                        </div>
                        <div>
                          <span className="text-gray-500">Env:</span> {r.environment}
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Project:</span> {r.project || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1 font-mono text-teal-700 font-semibold">{r.id}</div>
                      <div className="col-span-3">
                        <div className="font-medium text-gray-800">{r.requester_email}</div>
                        <div className="text-xs text-gray-500">{r.created_at}</div>
                      </div>
                      <div className="col-span-2 text-sm text-gray-700">{r.application}</div>
                      <div className="col-span-1 text-sm text-gray-600 capitalize">{r.environment}</div>
                      <div className="col-span-2 text-sm text-gray-700">{r.project || "—"}</div>
                      <div className="col-span-1">
                        <StatusPill status={r.status} />
                      </div>
                      <div className="col-span-2 flex items-center justify-center gap-2">
                        {r.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() => openModal(r.id, "approve")}
                              disabled={actioningId === r.id}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 hover:scale-105 transform transition disabled:opacity-50"
                            >
                              <FaCheck size={14} />
                              {actioningId === r.id ? "..." : null}
                            </button>
                            <button
                              onClick={() => openModal(r.id, "reject")}
                              disabled={actioningId === r.id}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 hover:scale-105 transform transition disabled:opacity-50"
                            >
                              <FaTimes size={14} />
                              {actioningId === r.id ? "..." : null}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No action</span>
                        )}
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="md:hidden flex gap-2 mt-3">
                      {r.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => openModal(r.id, "approve")}
                            disabled={actioningId === r.id}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition disabled:opacity-50"
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            onClick={() => openModal(r.id, "reject")}
                            disabled={actioningId === r.id}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition disabled:opacity-50"
                          >
                            <FaTimes /> Reject
                          </button>
                        </>
                      ) : (
                        <div className="w-full text-center text-xs text-gray-400 italic py-2">No action</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {modal.open && (
          <Modal onClose={closeModal}>
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-teal-700 mb-2">{modal.type === "approve" ? "Approve Request" : "Reject Request"}</h3>
              <p className="text-sm text-gray-600 mb-4">Optional notes (will be saved in audit log)</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-200"
                placeholder="Add notes for the requester or internal reason..."
              />
              {error && <div className="text-red-600 mt-2">{error}</div>}
              <div className="mt-4 flex items-center gap-3 justify-end">
                <button onClick={closeModal} className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-50">Cancel</button>
                <button
                  onClick={() => performAction(modal.id, modal.type === "approve" ? "approve" : "reject", notes)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded font-semibold hover:scale-105 transition"
                >
                  <FaBolt />
                  <span>{modal.type === "approve" ? "Confirm Approve" : "Confirm Reject"}</span>
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = "teal" }) {
  const colors = {
    teal: "from-cyan-50 to-cyan-100 text-teal-700",
    yellow: "from-yellow-50 to-yellow-100 text-yellow-800",
    green: "from-green-50 to-green-100 text-green-800",
  }[accent || "teal"];
  return (
    <div className={`rounded-xl p-5 bg-gradient-to-br ${colors} shadow-md flex flex-col items-center`}>
      <div className="text-xs font-semibold text-gray-600">{label}</div>
      <div className="text-3xl font-extrabold mt-2">{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const s = (status || "").toUpperCase();
  const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold";
  switch (s) {
    case "APPROVED": return <span className={`${base} bg-green-50 text-green-700`}>Approved</span>;
    case "REJECTED": return <span className={`${base} bg-red-50 text-red-600`}>Rejected</span>;
    case "PROVISIONED": return <span className={`${base} bg-indigo-50 text-indigo-700`}>Provisioned</span>;
    case "PENDING": return <span className={`${base} bg-yellow-50 text-yellow-700`}>Pending</span>;
    default: return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
  }
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-2xl mx-4">{children}</div>
    </div>
  );
}