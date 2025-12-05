import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const nav = useNavigate();

  function goLogin(prefill) {
    if (prefill === "admin") {
      sessionStorage.setItem("demoEmail", "admin@example.com");
      sessionStorage.setItem("demoPassword", "Admin@123");
    } else if (prefill === "user") {
      sessionStorage.setItem("demoEmail", "user@example.com");
      sessionStorage.setItem("demoPassword", "User@123");
    } else {
      sessionStorage.removeItem("demoEmail");
      sessionStorage.removeItem("demoPassword");
    }
    nav("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex flex-col">
      <section className="max-w-7xl w-full mx-auto px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 bg-amber-100/70 text-amber-700 px-3 py-1 rounded-full shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 6h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium">Internal Tools — Demo</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-tight font-extrabold text-teal-700">
              Access Portal — Request, Approve, Audit
            </h1>

            <p className="text-gray-600 max-w-2xl">
              Fast, secure access requests for internal apps (Teamcenter, AWC, SAP). Built with role-based approvals,
              audit logs, and a clean admin workflow — demo-ready.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => goLogin()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-teal-600 text-white font-semibold shadow hover:bg-teal-700 transition"
              >
                Sign in
                <svg className="w-4 h-4 opacity-90" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => goLogin("user")}
                  className="px-4 py-3 rounded-lg border bg-white text-teal-600 hover:bg-gray-50 transition text-sm shadow-sm"
                >
                  Demo user
                </button>
                <button
                  onClick={() => goLogin("admin")}
                  className="px-4 py-3 rounded-lg border bg-white text-amber-600 hover:bg-gray-50 transition text-sm shadow-sm"
                >
                  Demo admin
                </button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <strong>Tip:</strong> Use demo buttons to auto-fill credentials on the login page for a quick walkthrough.
            </div>
          </div>

          {/* Right: illustration */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <Illustration />
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-12 grid gap-4 grid-cols-1 sm:grid-cols-3">
          <FeatureCard
            title="Role-based approvals"
            desc="Assign approvers and enforce permissions for each application and environment."
            color="teal"
          />
          <FeatureCard
            title="Audit & history"
            desc="Every action is recorded with notes and timestamps for traceability."
            color="amber"
          />
          <FeatureCard
            title="Fast requests"
            desc="Create a request in under 30 seconds. Admins can approve with one click."
            color="cyan"
          />
        </div>
      </section>

      <footer className="mt-auto border-t bg-white/60">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Access Portal — Built with React & Tailwind. For demo use only.
        </div>
      </footer>
    </main>
  );
}

/* ---------------- helper UI ---------------- */

function FeatureCard({ title, desc, color = "teal" }) {
  const palette = {
    teal: "from-cyan-50 to-cyan-100 text-teal-700",
    amber: "from-amber-50 to-amber-100 text-amber-700",
    cyan: "from-blue-50 to-blue-100 text-cyan-700",
  }[color];

  return (
    <div
      className={`rounded-xl p-4 shadow-md bg-gradient-to-br ${palette} border border-white/40 transform transition hover:-translate-y-1`}
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-gray-600 mt-2">{desc}</div>
    </div>
  );
}

function Illustration() {
  return (
    <div className="relative">
      <div className="rounded-2xl bg-gradient-to-br from-white to-cyan-50 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold">AP</div>
          <div className="text-xs text-gray-500">v1.0 (demo)</div>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Request</div>
              <div className="text-sm font-medium text-teal-700">Teamcenter — Dev</div>
            </div>
            <div className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">Pending</div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Request</div>
              <div className="text-sm font-medium text-teal-700">AWC — Prod</div>
            </div>
            <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">Approved</div>
          </div>

          <div className="mt-3 text-xs text-gray-500">Recent activity</div>
          <div className="grid grid-cols-1 gap-2 mt-2">
            <small className="text-xs text-gray-400">• user@example.com requested Teamcenter</small>
            <small className="text-xs text-gray-400">• admin@example.com approved AWC</small>
            <small className="text-xs text-gray-400">• user2@example.com requested SAP</small>
          </div>
        </div>
      </div>

      {/* decorative floating circles */}
      <div className="absolute -right-6 -top-6 w-44 h-44 rounded-full bg-amber-100/40 blur-2xl pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 w-36 h-36 rounded-full bg-cyan-100/50 blur-2xl pointer-events-none" />
    </div>
  );
}