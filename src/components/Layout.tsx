import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Monitor, UserRound, ShieldCheck, Ticket } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Get Token", icon: Ticket },
    { path: "/display", label: "Queue Display", icon: Monitor },
    { path: "/counter", label: "Staff Counter", icon: UserRound },
    { path: "/admin", label: "Admin Panel", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      {/* Sidebar for Navigation */}
      <nav className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col h-auto md:h-screen sticky top-0 shadow-2xl z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            <Ticket size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter leading-none">QueueMaster</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Status: Online</p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-800 mt-6 space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">System Active</span>
          </div>
          <p className="text-[10px] text-slate-600 px-2 font-medium">
            v2.1.0-PROD
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Internal Header simulation from theme */}
          <header className="flex items-center justify-between bg-white px-8 py-5 rounded-2xl shadow-soft border border-slate-200 mb-8">
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Workspace Overview</h2>
              <p className="text-slate-800 font-bold">Main Branch Terminal</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase">Operational Status</p>
                <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-bold text-xs capitalize">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Connected
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold text-sm">
                AD
              </div>
            </div>
          </header>

          {children}
          
          <footer className="pt-12 pb-6 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
            <div>&copy; 2026 DIGITAL QUEUE MANAGEMENT</div>
            <div className="flex items-center gap-4">
              <span>Privacy</span>
              <span>Terms</span>
              <span className="opacity-30">|</span>
              <span className="text-slate-300">Last Sync: Today 11:22 AM</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
