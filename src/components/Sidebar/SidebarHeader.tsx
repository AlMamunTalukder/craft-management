/* eslint-disable @typescript-eslint/no-explicit-any */
import { Menu, PanelLeftClose, PanelLeftOpen, X, Search, Bell, User, LogOut } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export const SidebarHeader = ({
  isMobile,
  mobileOpen,
  open,
  onToggleDrawer,
  onToggleMobile,
  onProfileOpen,
  profileAnchorEl,
  onProfileClose,
  onLogout,
  onProfile,
  user,
}: any) => {
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.name || "User";
  const userEmail = user?.email || "user@example.com";
  const userInitials = getInitials(displayName);
  const isProfileOpen = Boolean(profileAnchorEl);

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[64px] bg-[#4F0187] border-b border-white/10 shadow-[0_2px_10px_rgba(79,1,135,0.25)]"
      style={{ zIndex: 1300 }}
    >
      <div className="h-full px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 max-w-full">
        {/* Left: Toggle + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={isMobile ? onToggleMobile : onToggleDrawer}
            aria-label="Toggle menu"
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white hover:text-[#4F0187] hover:border-white transition-all duration-150 shadow-sm"
          >
            {isMobile ? (
              mobileOpen ? <X size={18} /> : <Menu size={18} />
            ) : open ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )}
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="hidden sm:flex w-9 h-9 rounded-xl bg-white items-center justify-center text-[#4F0187] shrink-0 shadow-sm border border-white/20">
              <span className="text-[11px] font-black tracking-widest">CII</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] sm:text-[16px] font-bold tracking-tight text-white leading-none truncate">
                Craft International
                <span className="hidden lg:inline font-bold"> Institute</span>
              </h1>
              <p className="hidden sm:block text-[11px] font-medium text-white/70 leading-none mt-0.5 tracking-wide">
                Management Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden sm:flex flex-1 max-w-[380px] justify-center mx-4">
          <div className="relative w-full group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors">
              <Search size={16} />
            </div>
            <input
              placeholder="Search students, fees, reports…"
              className="w-full h-9 pl-10 pr-16 bg-white/15 border border-white/20 rounded-full text-sm text-white placeholder:text-white/60 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400 focus:border-white focus:ring-4 focus:ring-white/20 transition-all"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-[10px] font-bold text-white/70 bg-white/10 border border-white/20 rounded-full px-2 py-1 backdrop-blur">
              <span className="w-4 h-4 rounded bg-white text-[#4F0187] flex items-center justify-center text-[10px] leading-none font-bold">⌘</span>
              K
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile search */}
          <button className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white hover:text-[#4F0187] transition-colors">
            <Search size={18} />
          </button>

          <div className="hidden sm:block [&>button]:!bg-white/10 [&>button]:!border-white/20 [&>button]:!text-white hover:[&>button]:!bg-white hover:[&>button]:!text-[#4F0187]">
            <ThemeSwitcher />
          </div>

          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white hover:text-[#4F0187] hover:border-white transition-all">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#4F0187] shadow-sm">
              4
            </span>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={onProfileOpen}
              className="flex items-center gap-2.5 pl-1 pr-2 sm:pr-3 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white hover:border-white hover:shadow-md transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white text-[#4F0187] flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-[13px] font-bold text-white group-hover:text-[#4F0187] leading-none truncate max-w-[120px] transition-colors">
                  {displayName.length > 14 ? `${displayName.substring(0, 14)}…` : displayName}
                </p>
                <p className="text-[11px] font-medium text-white/70 group-hover:text-slate-500 leading-none capitalize truncate max-w-[120px] transition-colors">
                  {user?.role?.replace("_", " ") || "Administrator"}
                </p>
              </div>
              <div className="hidden sm:flex w-5 h-5 rounded-full bg-white/20 group-hover:bg-slate-100 flex items-center justify-center text-white group-hover:text-slate-600 shrink-0 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </button>

            {/* Dropdown */}
            {isProfileOpen && (
              <>
                <button
                  aria-label="Close menu"
                  onClick={onProfileClose}
                  className="fixed inset-0 z-20 cursor-default"
                  tabIndex={-1}
                />
                <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[280px] bg-white border border-slate-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* User header */}
                  <div className="px-4 py-4 bg-gradient-to-br from-[#4F0187]/5 via-white to-white border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#4F0187] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                        {userInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#4F0187] text-white text-[10px] font-bold tracking-wide uppercase shrink-0">
                            {user?.role || "User"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <button
                      onClick={onProfile}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                    >
                      <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                        <User size={16} />
                      </span>
                      <span className="flex-1">View Profile</span>
                      <span className="text-slate-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                      </span>
                    </button>

                    <div className="h-px bg-slate-100 my-1.5 mx-1" />

                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                    >
                      <span className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                        <LogOut size={16} />
                      </span>
                      <span className="flex-1">Logout</span>
                    </button>
                  </div>

                  <div className="px-3 py-2.5 bg-slate-50 border-t border-slate-100">
                    <p className="text-[11px] font-medium text-slate-500 text-center">
                      Craft International Institute • v1.0
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
