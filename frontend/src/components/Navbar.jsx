import React, { useState } from "react";
import {
  Bell, Settings, ShieldCheck, Activity, Search,
  ChevronDown, LayoutDashboard, MonitorCheck, BarChart3,
  UserCheck, LogOut, X, Star
} from "lucide-react";

const NAV_TABS = [
  { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { id: "workspace",  label: "Workspace",  icon: MonitorCheck    },
  { id: "analytics",  label: "Analytics",  icon: BarChart3       },
  { id: "validation", label: "Validation", icon: Star            },
];

export const Navbar = ({
  user,
  activeView,
  onSetView,
  onOpenSettings,
  onOpenAuditLog,
  onLogout,
  auditCount = 2,
  allCases = [],
  onSelectCase,
  currentCase,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const matchingPatients = searchTerm.trim()
    ? allCases.filter(
        (c) =>
          c.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.currentStudy.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const initials = user
    ? (user.display_name || user.username || "DR")
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "DR";

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070B12]/95 backdrop-blur-md border-b border-[#1D2A38]">
      {/* Top row */}
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#8B7CFF] p-[1px]">
            <div className="w-full h-full bg-[#070B12] rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#00D9FF]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-xl text-white">
                PRIOR<span className="text-[#00D9FF]">IQ</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-500/15 text-[#00D9FF] border border-cyan-500/30">
                v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Centre: Search */}
        <div className="relative flex-1 max-w-md mx-2 sm:mx-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Search patient (e.g. PT-20481, Vance, CT Chest)..."
              className="w-full bg-[#0D131D] hover:bg-[#111927] focus:bg-[#111927] border border-[#1D2A38] focus:border-[#00D9FF] rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-2.5 text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchFocused && searchTerm && (
            <div
              className="absolute left-0 right-0 top-10 mt-1 bg-[#0D131D] border border-[#1D2A38] rounded-xl p-2 shadow-2xl z-50"
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">
                Patients Found ({matchingPatients.length})
              </div>
              {matchingPatients.length > 0 ? (
                matchingPatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { onSelectCase(p); setSearchTerm(""); setSearchFocused(false); }}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#162234] flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{p.patientName}</div>
                      <div className="text-[10px] font-mono text-cyan-300">{p.patientId} • {p.currentStudy.name}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {p.priorStudies.length} priors
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  No patient matches found for &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Live status */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D131D] border border-[#1D2A38]">
            <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-pulse" />
            <span className="text-[11px] font-mono text-slate-300">PACS: 14ms</span>
          </div>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-[#0D131D] border border-[#1D2A38] text-slate-300 hover:text-[#00D9FF] hover:border-cyan-500/40 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00D9FF] text-[10px] font-bold text-[#070B12]">2</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-[#0D131D] border border-[#1D2A38] text-slate-300 hover:text-[#00D9FF] hover:border-cyan-500/40 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#0D131D] border border-[#1D2A38] hover:border-cyan-500/40 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-100 flex items-center gap-1">
                  <span>{user ? (user.display_name || user.username) : "Dr. Demo"}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {user ? user.role : "Radiologist"}
                </div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 mt-1 w-64 bg-[#0D131D] border border-[#1D2A38] rounded-xl p-3 shadow-2xl z-50">
                <div className="pb-2 mb-2 border-b border-[#1D2A38]">
                  <div className="text-xs font-bold text-slate-200">{user ? user.display_name : "Dr. Demo"}</div>
                  <div className="text-[11px] text-cyan-400">{user ? user.role : "Radiologist"}</div>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <button
                    onClick={() => { setShowProfileMenu(false); onOpenAuditLog(); }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#162234] flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Audit Trail Log</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-[#00D9FF]">{auditCount}</span>
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); onOpenSettings(); }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#162234] flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" /> Workspace Settings
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); onLogout && onLogout(); }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-rose-900/40 flex items-center gap-2 text-rose-400 border-t border-[#1D2A38] mt-1 pt-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tab Row */}
      <div className="px-4 lg:px-6 flex items-center gap-1 border-t border-[#1D2A38]/60 bg-[#070B12]/80">
        {NAV_TABS.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onSetView && onSetView(id)}
              className={"flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-wide transition-all border-b-2 " + (
                active
                  ? "border-[#00D9FF] text-[#00D9FF]"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 py-1.5">
          <span className="text-[10px] font-mono text-slate-500">42 tests ?</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
