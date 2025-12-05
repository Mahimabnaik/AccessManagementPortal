import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane, FaTimes, FaClipboard } from "react-icons/fa";
import api from "../services/api"; 
import toast from 'react-hot-toast';

export default function NewRequest() {
  const [form, setForm] = useState({
    application: "teamcenter",
    environment: "dev",
    group_role: "",
    project: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
    setError("");
    setSuccessMsg("");
  }

  const isValid = form.group_role.trim().length > 0;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!isValid) {
      setError("Please provide the Group / Role (e.g. Engineer).");
      return;
    }
    setLoading(true);
    try {
      setLoading(true);
      await toast.promise(api.post("/requests", form), {
        loading: "Creating request...",
        success: "Request created!",
        error: "Failed to create request",
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create request");
    } finally {
      setLoading(false);
    }
  }

  function cancel() {
    setForm({
      application: "teamcenter",
      environment: "dev",
      group_role: "",
      project: "",
      notes: "",
    });
    setError("");
    setSuccessMsg("");
    window.history.back();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 transform-gpu transition-all duration-300 hover:scale-[1.003]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-200 to-amber-400 text-amber-800 shadow">
                  <FaClipboard className="text-xl" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-extrabold text-teal-700">
                    Create Access Request
                  </h1>
                  <p className="text-sm text-gray-500">
                    Quickly request access to applications and track status.
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={cancel}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-gray-50 text-sm transition"
                  aria-label="Cancel"
                >
                  <FaTimes className="text-sm text-gray-600" /> Cancel
                </button>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-xs text-gray-600 mb-1">Application</div>
                  <select
                    value={form.application}
                    onChange={(e) => update("application", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 transition text-gray-500"
                    aria-label="Application"
                  >
                    <option value="teamcenter">Teamcenter</option>
                    <option value="awc">AWC</option>
                    <option value="sap">SAP</option>
                    <option value="jira">Jira</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label className="block">
                  <div className="text-xs text-gray-600 mb-1">Environment</div>
                  <select
                    value={form.environment}
                    onChange={(e) => update("environment", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-200 transition text-gray-500"
                    aria-label="Environment"
                  >
                    <option value="dev">Dev</option>
                    <option value="stage">Stage</option>
                    <option value="prod">Prod</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600 mb-1">
                    Group / Role{" "}
                    <span className="text-amber-600 font-semibold ml-1">*</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {form.group_role.length}/60
                  </div>
                </div>
                <input
                  value={form.group_role}
                  onChange={(e) =>
                    update("group_role", e.target.value.slice(0, 60))
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-100 transition text-gray-500"
                  placeholder="e.g. Engineer, Viewer, TeamLead"
                  aria-required="true"
                />
              </label>

              <label className="block">
                <div className="text-xs text-gray-600 mb-1">
                  Project (optional)
                </div>
                <input
                  value={form.project}
                  onChange={(e) => update("project", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-100 transition text-gray-500"
                  placeholder="Project name or ID"
                />
              </label>

              <label className="block">
                <div className="text-xs text-gray-600 mb-1">
                  Notes (optional)
                </div>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    update("notes", e.target.value.slice(0, 600))
                  }
                  rows={5}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-100 transition resize-none text-gray-500"
                  placeholder="Why you need access, duration, special instructions..."
                />
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {form.notes.length}/600
                </div>
              </label>

              {error && <div className="text-red-600 font-medium">{error}</div>}
              {successMsg && (
                <div className="text-green-700 font-medium">{successMsg}</div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-3 bg-gradient-to-br from-teal-600 to-teal-700 text-white px-5 py-2 rounded-lg shadow-lg hover:scale-[1.01] transform transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane
                    className={`${loading ? "animate-pulse" : ""}`}
                  />
                  <span>{loading ? "Submitting..." : "Create Request"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      application: "teamcenter",
                      environment: "dev",
                      group_role: "",
                      project: "",
                      notes: "",
                    });
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
                >
                  Reset
                </button>

                <div className="ml-auto text-xs text-gray-500">
                  All fields saved locally — demo mode
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Preview / Info column */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 shadow-lg border">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Request Preview
              </h3>
              <div className="space-y-2">
                <Row label="Application" value={form.application} />
                <Row label="Environment" value={form.environment} />
                <Row label="Group / Role" value={form.group_role || "—"} />
                <Row label="Project" value={form.project || "—"} />
                <Row
                  label="Notes"
                  value={
                    form.notes
                      ? form.notes.length > 120
                        ? form.notes.slice(0, 120) + "…"
                        : form.notes
                      : "—"
                  }
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 shadow-inner border">
              <h4 className="text-sm font-semibold text-amber-700 mb-2">
                Tips
              </h4>
              <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
                <li>
                  Provide clear justification in Notes to speed approvals.
                </li>
                <li>Prefer short-lived access (e.g. 7 days) where possible.</li>
                <li>
                  If it's production, mention the business reason and owner.
                </li>
              </ul>
            </div>

            <div className="text-center text-sm text-gray-500">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm">
                <span className="text-xs font-medium">Demo</span>
                <span className="text-xs text-gray-400">
                  No external provisioning
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* small helper components */
function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="text-gray-800 font-medium text-right ml-4">{value}</div>
    </div>
  );
}
