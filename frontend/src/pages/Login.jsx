import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email: username, password });
      const { token, user } = res.data;
      if (remember) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      setTimeout(() => {
        const path = user.role === "admin" ? "/admin" : "/dashboard";
        navigate(path);

        setTimeout(() => window.location.reload(), 50);
      }, 350);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-cyan-50 to-teal-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* left - illustration / marketing */}
        <div className="hidden md:flex flex-col gap-6 justify-center p-8 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <path
                  d="M3 7h18M3 12h18M3 17h18"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-teal-700">Access Portal</h3>
              <p className="text-sm text-gray-600">
                Secure access requests — fast approvals, full audit trail.
              </p>
            </div>
          </div>

          <div className="mt-4 text-gray-700">
            <h4 className="font-semibold text-teal-700 mb-2">
              Why use this portal?
            </h4>
            <ul className="list-disc list-inside text-sm space-y-2 pl-1">
              <li>Role-based approvals & admin controls</li>
              <li>Simple request form — one-click create</li>
              <li>Audit logs for traceability</li>
            </ul>
          </div>

          <div className="flex gap-3 items-center mt-4 text-gray-500">
            <div className="text-xs text-gray-500">Demo accounts:</div>
            <div className="text-xs px-3 py-1 rounded bg-white/50 shadow-sm text-gray-500">
              admin@example.com / Admin@123
            </div>
            <div className="text-xs px-3 py-1 rounded bg-white/50 shadow-sm text-gray-500">
              user@example.com / User@123
            </div>
          </div>
        </div>

        {/* right - form */}
        <div className="w-full">
          <button
            type="button"
            onClick={() => (window.location.href = "/")}
            className="absolute top-6 left-6 text-teal-700 font-semibold hover:underline flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 18l-6-6 6-6"
              />
            </svg>
            Back
          </button>
          <form
            onSubmit={handleLogin}
            className="mx-auto max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8 transform transition-all duration-300 hover:scale-[1.003]"
          >
            <h2 className="text-2xl font-extrabold text-teal-700 mb-2 text-center">
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-500 mb-6 text-center">
              Use your company credentials to continue
            </p>

            <label className="block mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Email</span>
              </div>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 transition text-gray-500"
                placeholder="you@company.com"
                disabled={loading}
              />
            </label>

            <label className="block mb-2 relative">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Password
                </span>
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="text-xs text-teal-600 hover:underline focus:outline-none text-gray-500"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 transition pr-20 text-gray-500"
                placeholder="Enter your password"
                disabled={loading}
              />
              {/* subtle helper if needed */}
            </label>

            <div className="flex items-center justify-between mb-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  disabled={loading}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() =>
                  alert("Password reset flow (not implemented in demo)")
                }
                className="text-sm text-teal-600 hover:underline focus:outline-none"
              >
                Forgot?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full inline-flex items-center justify-center gap-3 py-3 rounded-lg font-semibold text-white bg-gradient-to-br from-amber-500 to-amber-600 shadow hover:from-amber-600 hover:to-amber-700 transition transform hover:-translate-y-0.5 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <Spinner />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {error && (
              <div className="mt-4 text-center text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="mt-5 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <span className="text-teal-600 font-medium">Contact admin</span>
            </div>

            <div className="mt-6 border-t pt-4 flex gap-3 justify-center">
              <button
                type="button"
                onClick={async () => {
                  setUsername("user@example.com");
                  setPassword("User@123");
                  setTimeout(
                    () => document.querySelector("form").requestSubmit(),
                    300
                  );
                }}
                className="px-3 py-2 rounded-md bg-white border shadow-sm text-sm hover:bg-gray-50"
              >
                Demo User
              </button>

              <button
                type="button"
                onClick={async () => {
                  setUsername("admin@example.com");
                  setPassword("Admin@123");
                  setTimeout(
                    () => document.querySelector("form").requestSubmit(),
                    300
                  );
                }}
                className="px-3 py-2 rounded-md bg-white border shadow-sm text-sm hover:bg-gray-50"
              >
                Demo Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* small inline SVG spinner so no extra deps required */
function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}
