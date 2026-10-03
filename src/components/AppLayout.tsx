import {
  Activity, BarChart3, BookOpenText, CircleUserRound, HeartPulse, LayoutDashboard,
  LogOut, Menu, MessageSquareText, ShieldCheck, Target, X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/health", label: "Health tools", icon: HeartPulse },
  { to: "/conversations", label: "Conversations", icon: MessageSquareText },
  { to: "/metrics", label: "Health metrics", icon: Activity },
  { to: "/goals", label: "Wellness goals", icon: Target },
  { to: "/profile", label: "My profile", icon: CircleUserRound },
  { to: "/privacy", label: "Privacy", icon: ShieldCheck },
  { to: "/admin", label: "Analytics", icon: BarChart3 },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { username, logout } = useAuth();

  return (
    <div className="app-frame">
      <header className="mobile-header">
        <Brand />
        <button className="icon-button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <Brand />
        <nav className="main-nav" aria-label="Main navigation">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}>
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-chip">
            <span className="avatar">{username?.slice(0, 1).toUpperCase() || "U"}</span>
            <span>
              <small>Signed in as</small>
              <strong>{username}</strong>
            </span>
          </div>
          <button className="nav-logout" onClick={logout}>
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {open && <button className="sidebar-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
      <main className="main-content">{children}</main>
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark"><HeartPulse size={23} strokeWidth={2} /></span>
      <span>
        <strong>HealthPulse</strong>
        <small>Personal wellness</small>
      </span>
    </div>
  );
}
