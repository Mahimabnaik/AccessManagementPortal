import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FaClipboardList,
  FaCheckCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import api from "../services/api";

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let mountedFlag = true;

    async function fetchRequests() {
      try {
        setLoading(true);
        console.log("Dashboard: fetching /requests/mine");
        const res = await api.get("/requests/mine");
        console.log("Dashboard: got response", res.status, res.data);
        if (!mountedFlag) return;
        setRequests(res.data || []);
      } catch (err) {
        console.error(
          "Dashboard fetch error:",
          err?.response?.status,
          err?.response?.data || err.message
        );
        if (err?.response?.status === 401) {
          setRequests([]); 
        } else if (err?.response?.status === 404) {
          console.warn(
            "Route not found: check backend route mounting and baseURL"
          );
        }
      } finally {
        if (mountedFlag) {
          setLoading(false);
          setMounted(true);
        }
      }
    }

    fetchRequests();

    return () => {
      mountedFlag = false;
    };
  }, []);

  const total = requests.length;
  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-200 to-amber-400 text-amber-800 shadow-md transform-gpu">
              <FaClipboardList className="text-2xl md:text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-teal-700 leading-tight">
                My Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Overview of your access requests & statuses
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto flex gap-3 items-center">
            <Link
              to="/new-request"
              className="bg-teal-600 !text-amber-50 px-4 py-2 rounded-lg"
            >
              + New Request
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-sm text-gray-500">Last sync:</div>
              <div className="text-xs px-3 py-1 bg-white/60 rounded-full shadow-inner text-gray-700">
                2m ago
              </div>
            </div>
          </div>
        </header>

        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          <AnimatedCard mounted={mounted} index={0}>
            <SummaryCard
              icon={<FaHourglassHalf className="text-yellow-500 text-3xl" />}
              label="Pending"
              value={pending}
              gradient="from-yellow-50 to-yellow-100"
            />
          </AnimatedCard>

          <AnimatedCard mounted={mounted} index={1}>
            <SummaryCard
              icon={<FaCheckCircle className="text-green-500 text-3xl" />}
              label="Approved"
              value={approved}
              gradient="from-green-50 to-green-100"
            />
          </AnimatedCard>

          <AnimatedCard mounted={mounted} index={2}>
            <SummaryCard
              icon={<FaClipboardList className="text-teal-600 text-3xl" />}
              label="Total"
              value={total}
              gradient="from-cyan-50 to-cyan-100"
            />
          </AnimatedCard>
        </section>

        {/* Recent Requests */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-teal-700">
              Recent Requests
            </h2>
            <div className="text-sm text-gray-500">
              Quick view of latest requests
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center items-center">
              <div className="animate-pulse text-gray-400">
                Loading requests…
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 rounded-lg text-center text-gray-600">
              You have no requests yet.{" "}
              <Link
                to="/new-request"
                className="text-teal-600 font-semibold hover:underline"
              >
                Create one
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs md:text-sm text-gray-500">
                      ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs md:text-sm text-gray-500">
                      Application
                    </th>
                    <th className="text-left px-4 py-3 text-xs md:text-sm text-gray-500">
                      Environment
                    </th>
                    <th className="text-left px-4 py-3 text-xs md:text-sm text-gray-500">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs md:text-sm text-gray-500">
                      Created
                    </th>
                    <th className="text-left px-4 py-3 text-xs md:text-sm text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requests.map((r, i) => (
                    <AnimatedRow mounted={mounted} index={i} key={r.id}>
                      <tr className="hover:bg-cyan-50 transition-colors duration-200">
                        <td className="px-4 py-4 font-mono text-sm text-gray-700">
                          {r.id}
                        </td>
                        <td className="px-4 py-4 text-sm md:text-base text-gray-800">
                          {r.application}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 capitalize">
                          {r.environment}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {r.created_at}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            to={`/requests/${r.id}`}
                            className="inline-flex items-center gap-2 text-teal-600 font-medium hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    </AnimatedRow>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AnimatedCard({ children, index = 0, mounted }) {
  return (
    <div
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`transform transition duration-500 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {children}
    </div>
  );
}

function AnimatedRow({ children, index = 0, mounted }) {
  return (
    <tr
      style={{ transitionDelay: `${index * 60}ms` }}
      className={`transform transition duration-500 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {children.props.children /* keep inner <tr> content */}
    </tr>
  );
}

function SummaryCard({ icon, label, value, gradient = "from-white to-white" }) {
  return (
    <div
      className={`rounded-2xl shadow-xl p-6 md:p-7 group hover:scale-[1.02] transform transition-all duration-300`}
      aria-hidden
    >
      <div className={`flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-white/60 to-white/40 shadow-inner">
            {icon}
          </div>
          <div>
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl md:text-3xl font-extrabold text-teal-700 mt-1">
              {value}
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center text-sm text-gray-400">
          %
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-500">Recent activity & trends</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  const base =
    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold";
  switch (s) {
    case "APPROVED":
      return (
        <span className={`${base} bg-green-50 text-green-800`}>Approved</span>
      );
    case "REJECTED":
      return <span className={`${base} bg-red-50 text-red-800`}>Rejected</span>;
    case "PROVISIONED":
      return (
        <span className={`${base} bg-indigo-50 text-indigo-800`}>
          Provisioned
        </span>
      );
    case "PENDING":
      return (
        <span className={`${base} bg-yellow-50 text-yellow-800`}>Pending</span>
      );
    default:
      return (
        <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>
      );
  }
}

export default Dashboard;
