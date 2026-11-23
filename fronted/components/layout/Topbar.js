"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchJobs } from "../../store/slices/jobsSlice";
import { markAllRead } from "../../store/slices/notificationsSlice";
import { fmtRelative } from "../../utils/formatDate";
import Button from "../ui/Button";

import JobsDeadlineStatusButton from "../../components/jobs/JobsDeadlineStatusButton";

export default function Topbar({ title, actions }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { list: notifs, unreadCount } = useSelector((s) => s.notifications);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      dispatch(fetchJobs({ search }));
      router.push("/jobs");
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-40">
      <h1 className="text-[15px] font-semibold flex-1">{title}</h1>
      <div className="flex items-center gap-2">

        <div>
          <JobsDeadlineStatusButton />
        </div>

        {/* Search */}
        {/* <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search jobs…"
            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-brand w-44 transition-all focus:w-56"
          />
        </div> */}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 relative"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute top-10 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-semibold text-sm">Notifications</span>
                <button
                  onClick={() => dispatch(markAllRead())}
                  className="text-xs text-brand hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!n.is_read ? "bg-blue-50/40" : ""}`}
                  >
                    <span className="text-lg shrink-0">
                      {n.type === "DANGER"
                        ? "🔴"
                        : n.type === "WARNING"
                          ? "🟡"
                          : n.type === "SUCCESS"
                            ? "✅"
                            : "ℹ️"}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-gray-900">
                        {n.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {n.message}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {fmtRelative(n.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
                {!notifs.length && (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {actions}
      </div>
    </header>
  );
}
