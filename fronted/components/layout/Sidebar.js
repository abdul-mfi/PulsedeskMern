"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "../ui/Avatar";

const NAV = [
  {
    href: "/dashboard",
    icon: "grid",
    label: "Dashboard",
    roles: ["ADMIN", "MANAGER", "EMPLOYEE", "HR"],
  },
  {
    href: "/jobs",
    icon: "briefcase",
    label: "All Jobs",
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },
  {
    href: "/kanban",
    icon: "columns",
    label: "Kanban Board",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/timeline",
    icon: "list",
    label: "Timeline",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/workload",
    icon: "users",
    label: "Team Workload",
    roles: ["ADMIN", "MANAGER"],
  },

  // ─── Employee daily workflow ───
  { section: "My Day" },
  {
    href: "/daily-checkin",
    icon: "sun",
    label: "Morning Check-In",
    roles: ["EMPLOYEE", "ADMIN"],
  }, // ← NEW
  {
    href: "/daily-checkout",
    icon: "moon",
    label: "Day Closure",
    roles: ["EMPLOYEE", "ADMIN"],
  }, // ← NEW

  { section: "Reports" },
  {
    href: "/daily-closure",
    icon: "calendar",
    label: "Daily Closure",
    roles: ["ADMIN", "MANAGER", "HR"],
  },
  {
    href: "/weekly-closure",
    icon: "bar-chart",
    label: "Weekly Closure",
    roles: ["ADMIN", "MANAGER", "HR"],
  },
  {
    href: "/monthly-performance",
    icon: "trending",
    label: "Monthly Performance",
    roles: ["ADMIN", "MANAGER", "HR"],
  },
  { section: "Management" },
  {
    href: "/team",
    icon: "user-plus",
    label: "Team Members",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/clients",
    icon: "building",
    label: "Clients",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/departments",
    icon: "folder",
    label: "Departments",
    roles: ["ADMIN"],
  },
  // { href: "/settings", icon: "settings", label: "Settings", roles: ["ADMIN"] },
];

const Icon = ({ name }) => {
  const icons = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </>
    ),
    briefcase: (
      <>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </>
    ),
    columns: (
      <>
        <rect x="3" y="3" width="5" height="18" rx="1" />
        <rect x="10" y="3" width="5" height="12" rx="1" />
        <rect x="17" y="3" width="5" height="15" rx="1" />
      </>
    ),
    list: (
      <>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
        <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
        <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
      </>
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    "bar-chart": (
      <>
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </>
    ),
    trending: (
      <>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </>
    ),
    "user-plus": (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </>
    ),
    building: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
      </>
    ),
    folder: (
      <>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
        <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
        <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
      </>
    ),
    moon: (
      <>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {icons[name]}
    </svg>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const unread = useSelector((s) => s.notifications.unreadCount);

  return (
    <aside className="mainsidebar w-56 bg-sidebar flex flex-col h-screen shrink-0 fixed top-0 left-0 z-50">
      {/* Logo */}
      <div className="p-4 border-b border-white/[.07] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
          >
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 15" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-white leading-tight">
            PulseDesk
          </div>
          <div className="text-[9px] text-white/30 tracking-wider">
            DEADLINE INTELLIGENCE
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {NAV.map((item, i) => {
          if (item.section)
            return (
              <div
                key={i}
                className="text-[9.5px] text-white/25 px-2 pt-4 pb-1 tracking-widest uppercase"
              >
                {item.section}
              </div>
            );
          if (!item.roles?.includes(user?.role)) return null;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md mb-0.5 text-[12.5px] transition-all ${active ? "bg-white/10 text-white font-medium" : "text-white/50 hover:bg-white/[.07] hover:text-white/80"}`}
            >
              <Icon name={item.icon} />
              <span className="flex-1">{item.label}</span>
              {item.href === "/jobs" && unread > 0 && (
                <span className="bg-red-500 text-white text-[9.5px] px-1.5 py-0.5 rounded-full font-semibold">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-2 border-t border-white/[.07]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-white/[.07] cursor-pointer">
          <Avatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white font-medium truncate">
              {user?.name}
            </div>
            <div className="text-[10px] text-white/35 truncate">
              {user?.designation || user?.role}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-center text-[10.5px] text-white/25 hover:text-white/50 py-1.5 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
