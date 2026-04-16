import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Get Pickup Time" },
  { to: "/my-flights", label: "My Flights" },
  { to: "/my-pickups", label: "Rides for Others" },
  { to: "/gate-timer", label: "Track gate distances" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link
          to="/"
          className="font-bold text-sky-400 text-lg tracking-tight hover:text-sky-300 transition-colors"
        >
          ✈ EZ Pickup
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [
                  "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sky-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Mobile hamburger button */}
        <button
          className="sm:hidden p-2 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-slate-700 px-4 py-2 flex flex-col gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  "px-3 py-2 rounded text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sky-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
