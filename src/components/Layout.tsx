import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Monitor, 
  UserRound, 
  ShieldCheck, 
  Ticket, 
  MessageSquare, 
  BarChart3, 
  Layers, 
  Settings,
  LogOut,
  User
} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    } else {
      setUser(null);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const facebookPageId = "ConnectSheba";

  const allNavItems = [
    { path: "/", label: "Get Token", icon: Ticket, roles: ["public", "staff", "admin"] },
    { path: "/display", label: "Queue Display", icon: Monitor, roles: ["public", "staff", "admin"] },
    { path: "/counter", label: "Staff Counter", icon: UserRound, roles: ["staff", "admin"] },
    { path: "/admin", label: "Admin Panel", icon: ShieldCheck, roles: ["admin"] },
    { path: "/analytics", label: "Advanced Analytics", icon: BarChart3, roles: ["admin"] },
    { path: "/services", label: "Service Catalog", icon: Layers, roles: ["admin"] },
    { path: "/settings", label: "Branch Settings", icon: Settings, roles: ["admin"] },
  ];

  const userRole = user?.role || "public";
  
  // Define items with their visibility and requirement
  const navItems = [
    { path: "/", label: "Get Token", icon: Ticket, roles: ["public", "staff", "admin"] },
    { path: "/display", label: "Queue Display", icon: Monitor, roles: ["public", "staff", "admin"] },
    { path: "/counter", label: "Staff Counter", icon: UserRound, roles: ["staff", "admin"], restricted: true },
    { path: "/admin", label: "Admin Panel", icon: ShieldCheck, roles: ["admin"], restricted: true },
    { path: "/analytics", label: "Advanced Analytics", icon: BarChart3, roles: ["admin"], restricted: true },
    { path: "/services", label: "Service Catalog", icon: Layers, roles: ["admin"], restricted: true },
    { path: "/settings", label: "Branch Settings", icon: Settings, roles: ["admin"], restricted: true },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar for Navigation */}
      <nav className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col h-auto md:h-screen sticky top-0 shadow-2xl z-10 border-r border-slate-800">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            <Ticket size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter leading-none">
              Connect <span className="bg-[#006A4E] px-2 py-0.5 rounded-lg text-white">sheba.Com</span>
            </h1>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isOnline ? 'text-cyan-400' : 'text-rose-400'}`}>
              Status: {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Navigation</p>
          {navItems.map((item) => {
            const isAccessible = item.roles.includes(userRole);
            if (!isAccessible && !item.restricted) return null;

            return (
              <div key={item.path}>
                {isAccessible ? (
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                      location.pathname === item.path
                        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 cursor-not-allowed group relative">
                    <div className="flex items-center gap-3 opacity-40">
                      <item.icon size={18} />
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </div>
                    <ShieldCheck size={14} className="opacity-20 translate-y-0.5" />
                    
                    {/* Tooltip on hover */}
                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      Login Required
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-6 border-t border-slate-800 mt-6 space-y-4">
          {user && (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-semibold text-sm mb-4"
            >
              <LogOut size={20} />
              <span>Logout Session</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-2">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
              {isOnline ? 'System Active' : 'Offline Mode'}
            </span>
          </div>
          <p className="text-[10px] text-slate-600 px-2 font-medium italic">
            Sheba Core v2.1.0-PROD
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Internal Header */}
          <header className="flex items-center justify-between bg-white px-8 py-5 rounded-2xl shadow-soft border border-slate-200 mb-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Operational Command</span>
                <span className="text-[10px] text-cyan-600 font-bold opacity-50">•</span>
                <span className="text-[10px] text-cyan-600 font-black uppercase tracking-widest">HQ-DHAKA-CENTRAL</span>
              </div>
              <p className="text-slate-900 font-black text-xl tracking-tight">Main Digital Hub <span className="text-slate-400 font-medium">/ Front Desk Terminal</span></p>
            </div>
            <div className="flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Logged In As</p>
                    <p className="text-slate-900 font-black text-sm uppercase">{user.username}</p>
                    <p className="text-[9px] text-cyan-600 font-bold uppercase tracking-tighter">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-cyan-50 border-2 border-white shadow-sm flex items-center justify-center text-cyan-600 font-black text-sm ring-4 ring-cyan-50 relative group">
                    <User size={20} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/admin" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 group">
                    <ShieldCheck size={14} className="text-cyan-600 group-hover:rotate-12 transition-transform" />
                    Admin Panel
                  </Link>
                  <Link to="/counter" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 group">
                    <UserRound size={14} className="text-cyan-400 group-hover:-translate-y-0.5 transition-transform" />
                    Staff Login
                  </Link>
                </div>
              )}
            </div>
          </header>

          {children}
          
          <footer className="pt-12 pb-6 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
            <div>&copy; 2026 CONNECT SHEBA.COM • DIGITAL SOLUTIONS</div>
            <div className="flex items-center gap-4">
              <a href={`https://m.me/${facebookPageId}`} target="_blank" rel="noreferrer" className="text-cyan-600 hover:text-cyan-700 font-black">Facebook Support</a>
              <span className="opacity-30">|</span>
              <span>Privacy</span>
              <span>Terms</span>
              <span className="opacity-30">|</span>
              <span className="text-slate-300">Managed by Sheba Manager</span>
            </div>
          </footer>
        </div>
      </main>

      {/* Floating Facebook Message Button */}
      <a 
        href={`https://m.me/${facebookPageId}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all z-50 group"
      >
        <MessageSquare size={28} />
        <span className="absolute right-20 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Message us on Facebook
        </span>
      </a>
    </div>
  );
}
