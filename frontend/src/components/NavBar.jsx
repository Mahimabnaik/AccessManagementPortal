// frontend/src/components/NavBar.jsx
import React, { useEffect, useState } from "react";
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

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const readUser = () => {
      try {
        const raw =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        const user = raw ? JSON.parse(raw) : null;
        setIsAdmin(user && user.role && user.role.toLowerCase() === "admin");
      } catch {
        setIsAdmin(false);
      }
    };
    readUser();

    const onStorage = (e) => {
      if (e.key === "user") readUser();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("user"); // if you store user here
      navigate("/login");
    }
  };

  const visibleLinks = navLinks.filter(
    (link) => link.to !== "/admin" || isAdmin
  );

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
            visibleLinks.map(({ to, label }) => (
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
                        }`}
                    />
                  </span>
                )}
              </NavLink>
            ))}
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
