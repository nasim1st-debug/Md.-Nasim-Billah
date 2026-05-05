import React, { useEffect, useState } from "react";
import { Play, SkipForward, CheckCircle, Power, UserRound, ArrowRight } from "lucide-react";
import socket from "../lib/socket.ts";
import { motion, AnimatePresence } from "motion/react";

export default function Counter() {
  const [counters, setCounters] = useState<any[]>([]);
  const [selectedCounter, setSelectedCounter] = useState<any>(null);
  const [activeToken, setActiveToken] = useState<any>(null);
  const [waitingCount, setWaitingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCounters();
    fetchStats();

    socket.on("queue-updated", () => {
      fetchStats();
      fetchCounters(); // Refresh to see if counter status changed elsewhere
    });

    return () => {
      socket.off("queue-updated");
    };
  }, []);

  const fetchCounters = async () => {
    const res = await fetch("/api/counters");
    const data = await res.json();
    setCounters(data);
    if (selectedCounter) {
      const updated = data.find((c: any) => c.id === selectedCounter.id);
      setSelectedCounter(updated);
    }
  };

  const fetchStats = async () => {
    const res = await fetch("/api/queue/stats");
    const data = await res.json();
    setWaitingCount(data.waiting);
  };

  const callNext = async () => {
    if (!selectedCounter) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/counters/${selectedCounter.id}/call-next`, { method: "POST" });
      const data = await res.json();
      if (data.token_number) {
        setActiveToken(data);
      } else {
        setActiveToken(null);
        alert("No more tokens in queue");
      }
      fetchCounters();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!selectedCounter) return;
    const newStatus = selectedCounter.status === "open" ? "closed" : "open";
    try {
      await fetch(`/api/counters/${selectedCounter.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchCounters();
    } catch (err) {
      console.error(err);
    }
  };

  if (!selectedCounter) {
    return (
      <div className="space-y-8 py-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Select Workspace</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest px-1">Main Branch Operational Terminals</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counters.map((counter: any) => (
            <button
              key={counter.id}
              onClick={() => setSelectedCounter(counter)}
              className="p-8 bg-white border border-slate-200 rounded-3xl shadow-soft hover:shadow-xl hover:border-indigo-600 transition-all text-left flex items-start justify-between group active:scale-[0.98]"
            >
              <div className="space-y-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  counter.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'
                }`}>
                  <UserRound size={24} />
                </div>
                <div>
                   <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    counter.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {counter.status === 'open' ? 'Online' : 'Closed'}
                  </span>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-2">{counter.name}</h3>
                </div>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={24} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
       <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedCounter(null)}
              className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-colors"
            >
              <ArrowRight size={20} className="rotate-180" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{selectedCounter.name}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: {selectedCounter.status.toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={toggleStatus}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              selectedCounter.status === 'open' 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            <Power size={18} />
            {selectedCounter.status === 'open' ? 'Deactivate session' : 'Activate session'}
          </button>
       </div>

       <div className="grid grid-cols-12 gap-8">
          {/* Main Control Card */}
          <div className="col-span-12 lg:col-span-8 flex flex-col">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-soft flex-1 flex flex-col min-h-[500px]">
               <div className="flex justify-between items-start mb-12">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Customer</p>
                   <AnimatePresence mode="wait">
                    {activeToken ? (
                      <motion.div 
                        key={activeToken.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-2"
                      >
                        <h2 className="text-9xl font-black text-indigo-600 tracking-tighter leading-none">{activeToken.token_number}</h2>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Active Processing</p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-2 border-dashed border-slate-100 rounded-[2rem] p-12 text-center"
                      >
                         <p className="text-4xl font-black text-slate-200 tracking-tighter">AWAITING TOKEN</p>
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Ready to serve next customer</p>
                      </motion.div>
                    )}
                   </AnimatePresence>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">In Queue</p>
                    <div className="text-4xl font-black text-slate-800 tabular-nums">
                      {waitingCount}
                    </div>
                 </div>
               </div>

               <div className="flex-1 flex flex-col justify-end">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                   <button 
                     onClick={callNext}
                     disabled={loading || selectedCounter.status === 'closed'}
                     className="flex items-center justify-center gap-3 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none"
                   >
                     <span className="text-xl font-bold">Call Next Customer</span>
                     <ArrowRight size={24} />
                   </button>
                   <button 
                     disabled={!activeToken}
                     className="flex items-center justify-center gap-3 py-6 bg-white border-2 border-slate-200 text-slate-800 rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-30"
                   >
                     <span className="text-xl font-bold">Recall Token</span>
                   </button>
                 </div>
               </div>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-strong">
               <h3 className="font-black text-slate-500 mb-8 uppercase tracking-[0.2em] text-[10px]">Session Metrics</h3>
               <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Served Today</p>
                      <p className="text-4xl font-black tracking-tighter">42</p>
                    </div>
                    <div className="text-emerald-400 text-xs font-black bg-emerald-400/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                      +12.4%
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Performance target</span>
                      <span>84%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="w-[84%] h-full bg-indigo-500 rounded-full" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Workstation</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">
                        C03
                      </div>
                      <div className="text-xs font-bold text-slate-400 italic">
                        Logged in since 08:30 AM
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-soft">
               <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-4">Operating Note</h4>
               <p className="text-sm text-slate-500 leading-relaxed font-medium">
                 High traffic detected. Ensure customers are called promptly. Switch status to <span className="text-red-500">DEACTIVATE</span> before logging off.
               </p>
            </div>
          </div>
       </div>
    </div>
  );
}
