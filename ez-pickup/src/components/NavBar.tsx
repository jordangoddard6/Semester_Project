import { NavLink, Link } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Get Pickup Time" },
  { to: "/my-flights", label: "My Flights" },
  { to: "/my-pickups", label: "Rides for Others" },
  { to: "/gate-timer", label: "Track gate distances" },
];

export default function NavBar() {
  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14">
        <Link
          to="/"
          className="font-bold text-sky-400 mr-4 text-lg tracking-tight hover:text-sky-300 transition-colors"
        >
          ✈ EZ Pickup
        </Link>
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
    </nav>
  );
}
