import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaKey } from "react-icons/fa";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/new-request", label: "Create Request" },
  { to: "/admin", label: "Admin" },
];

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === "/" || location.pathname === "/login";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/login");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 text-2xl font-bold tracking-wide">
          <FaKey className="text-yellow-300 animate-bounce" />
          Access Portal
        </div>

        {/* Nav Links & Logout */}
        <div className="flex gap-6 items-center">
          {!isLanding &&
            navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative px-3 py-2 rounded-md text-base font-semibold transition duration-300
                  hover:bg-teal-600 hover:text-yellow-200
                  ${isActive ? "text-yellow-300" : "text-white"}`
                }
              >
                {({ isActive }) => (
                  <span className="relative flex items-center text-amber-50">
                    {label}
                    <span
                      className={`absolute left-0 -bottom-1 w-full h-1 rounded bg-yellow-300 transition-all duration-300
                        ${
                          isActive
                            ? "opacity-100 scale-x-100"
                            : "opacity-0 scale-x-0"
                        }
                      `}
                    />
                  </span>
                )}
              </NavLink>
            ))}
          {/* Logout button only when not on landing/login */}
          {!isLanding && (
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
