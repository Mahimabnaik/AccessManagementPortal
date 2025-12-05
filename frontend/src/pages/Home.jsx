import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50">
      <div className="max-w-3xl w-full p-8 bg-white rounded-xl shadow">
        <h1 className="text-3xl font-bold text-teal-700 mb-4">Access Management Portal</h1>
        <p className="text-gray-600 mb-6">
          Request access to Teamcenter / AWC environments and track approval lifecycle.
        </p>

        <div className="flex gap-3">
          <Link to="/new-request" className="px-4 py-2 bg-teal-600 text-white rounded shadow">Create Request</Link>
          <Link to="/dashboard" className="px-4 py-2 border rounded">My Requests</Link>
        </div>
      </div>
    </div>
  );
}