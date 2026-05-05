import React, { useState } from "react";
import { Ticket, Clock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Home() {
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ waiting: 0 });

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/queue/stats");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Fetch Stats error:", err);
    }
  };

  const generateToken = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tokens/generate", { method: "POST" });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server responded with:", errorText);
        throw new Error("Failed to generate token");
      }
      const data = await res.json();
      setToken(data);
      fetchStats();
      
      // Auto-clear after 10 seconds
      setTimeout(() => setToken(null), 10000);
    } catch (err) {
      console.error("Token error:", err);
      alert("Failed to generate token. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 py-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white border border-slate-200 shadow-soft text-indigo-600 rounded-3xl mb-4">
          <Ticket size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Self-Service Terminal</h1>
        <p className="text-slate-500 font-medium max-w-sm mx-auto uppercase text-xs tracking-widest">
          Select a service to generate your digital token
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!token ? (
          <motion.div
            key="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md space-y-4"
          >
            <button
              onClick={generateToken}
              disabled={loading}
              className="w-full group relative p-8 bg-white border-2 border-slate-200 hover:border-indigo-600 rounded-2xl shadow-soft hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 text-left"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-black text-2xl text-slate-800 tracking-tight">Standard Service</p>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Estimated Wait: {stats.waiting * 5} mins</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {loading ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : <span className="text-3xl font-light">+</span>}
                </div>
              </div>
            </button>

            <div className="flex items-center justify-center gap-6 pt-8 text-slate-400">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span className="text-[11px] font-black uppercase tracking-widest">Efficiency: 98%</span>
              </div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-600">{stats.waiting}</span>
                <span className="text-[11px] font-black uppercase tracking-widest">Currently Waiting</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="token"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-slate-900 rounded-[2.5rem] p-10 shadow-strong text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
            
            <div className="space-y-8 py-4">
              <div className="flex items-center justify-center gap-2 text-indigo-400 mb-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em] opacity-80">Registration Confirmed</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Terminal Token</p>
                <h2 className="text-8xl font-black text-white tracking-tighter drop-shadow-lg">{token.token_number}</h2>
              </div>

              <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <p className="text-sm text-slate-400 leading-relaxed">
                  Please proceed to the waiting area. Watch the <span className="text-white font-bold">Main Display Screen</span> for your number.
                </p>
              </div>

              <button 
                onClick={() => setToken(null)}
                className="text-[10px] text-slate-500 hover:text-indigo-400 uppercase font-black tracking-widest transition-colors"
              >
                Tap to clear display
              </button>
            </div>

            {/* Geometry Details */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
