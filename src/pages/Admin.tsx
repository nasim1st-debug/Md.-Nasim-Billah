import React, { useEffect, useState } from "react";
import { BarChart3, Users, Clock, Trash2, ArrowUpRight, Activity, Sparkles, Lightbulb, Target } from "lucide-react";
import socket from "../lib/socket.ts";
import { getQueueInsights } from "../services/aiService";

export default function Admin() {
  const [stats, setStats] = useState<any>({ waiting: 0, completed: 0, currentlyCalling: [] });
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [fetchingAi, setFetchingAi] = useState(false);

  useEffect(() => {
    fetchStats();
    socket.on("queue-updated", fetchStats);
    return () => { socket.off("queue-updated"); };
  }, []);

  // Fetch AI insights whenever stats change significantly (or manually)
  useEffect(() => {
    if (stats.waiting > 0 || stats.completed > 0) {
      triggerAiInsight();
    }
  }, [stats.waiting]);

  const triggerAiInsight = async () => {
    setFetchingAi(true);
    const insight = await getQueueInsights({
      waiting: stats?.waiting || 0,
      completed: stats?.completed || 0,
      activeCounters: stats?.currentlyCalling?.length || 1
    });
    setAiInsight(insight);
    setFetchingAi(false);
  };

  const fetchStats = async () => {
    const res = await fetch("/api/queue/stats");
    const data = await res.json();
    setStats(data);
  };

  const clearQueue = async () => {
    if (!confirm("Are you sure you want to CLEAR the entire queue? This will reset all tokens and counters.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clear-queue", { method: "POST" });
      if (res.ok) {
        alert("Queue cleared successfully");
        fetchStats();
      }
    } catch (err) {
      console.error("Clear queue error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col md:flex-row items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <BarChart3 size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Admin Dashboard</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900">System Overview</h1>
        </div>
        <button 
          onClick={clearQueue}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl font-bold transition-all disabled:opacity-50"
        >
          <Trash2 size={18} />
          Reset All Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Tokens" 
          value={(stats?.waiting || 0) + (stats?.completed || 0) + (stats?.currentlyCalling?.length || 0)} 
          icon={Users} 
          trend="+14%" 
          color="blue" 
        />
        <StatCard 
          title="Currently Waiting" 
          value={stats?.waiting || 0} 
          icon={Clock} 
          trend="+2" 
          color="amber" 
        />
        <StatCard 
          title="Avg. Serv. Time" 
          value="4.2m" 
          icon={Activity} 
          trend="-0.5m" 
          color="green" 
        />
        <StatCard 
          title="Active Counters" 
          value="3/5" 
          icon={BarChart3} 
          trend="Stable" 
          color="indigo" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Operations Insights */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-indigo-500/20">
             <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
               <Sparkles size={180} />
             </div>
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
               <div className="space-y-1">
                 <div className="flex items-center gap-2 text-indigo-400 mb-1">
                   <Sparkles size={18} />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Operational Intelligence</span>
                 </div>
                 <h2 className="text-3xl font-black tracking-tight">AI Branch Insights</h2>
               </div>
               
               <button 
                onClick={triggerAiInsight}
                disabled={fetchingAi}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
               >
                {fetchingAi ? "Analyzing..." : "Refresh Intelligence"}
               </button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-indigo-300">
                    <Target size={20} />
                    <h4 className="font-black text-xs uppercase tracking-widest">Smart Prediction</h4>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl min-h-[140px] flex items-center">
                    {aiInsight ? (
                      <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                        {aiInsight.prediction}
                      </p>
                    ) : (
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-amber-300">
                    <Lightbulb size={20} />
                    <h4 className="font-black text-xs uppercase tracking-widest">Efficiency Score</h4>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl min-h-[140px] flex flex-col justify-center items-center text-center">
                    {aiInsight ? (
                      <>
                        <p className="text-5xl font-black text-amber-400 tracking-tighter">{aiInsight.efficiencyScore}%</p>
                        <p className="text-[10px] text-amber-200/50 font-black uppercase tracking-widest mt-2">Optimal Threshold</p>
                      </>
                    ) : (
                      <span className="text-slate-600 font-black">---</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Activity size={20} />
                    <h4 className="font-black text-xs uppercase tracking-widest">Recommendations</h4>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl min-h-[140px]">
                    <ul className="space-y-3">
                      {aiInsight?.suggestions?.map((item: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-emerald-50">
                          <span className="text-emerald-400 font-black">•</span>
                          <span className="font-medium">{item}</span>
                        </li>
                      )) || (
                        <li className="text-slate-600 italic text-sm">Gathering actionable data puntos...</li>
                      )}
                    </ul>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Active Counters Table */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl">
           <h3 className="text-xl font-bold text-slate-900 mb-6 px-2">Active Sessions</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b">
                    <th className="pb-4 px-2">Counter</th>
                    <th className="pb-4 px-2">Token</th>
                    <th className="pb-4 px-2">Status</th>
                    <th className="pb-4 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats?.currentlyCalling?.map((item: any) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-2 font-bold text-slate-900">{item.counter_name}</td>
                      <td className="py-5 px-2 font-mono text-blue-600 font-bold">{item.token_number}</td>
                      <td className="py-5 px-2">
                         <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">ACTIVE</span>
                      </td>
                      <td className="py-5 px-2 text-right">
                        <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                           <Activity size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.currentlyCalling || stats.currentlyCalling.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-400 italic">No counters are currently calling.</td>
                    </tr>
                  )}
                </tbody>
             </table>
           </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-600">
             <Target size={120} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-6 px-2 flex items-center justify-between">
              User Distribution
           </h3>
           <div className="space-y-4">
              {stats.locations?.map((loc: any, i: number) => (
                <div key={i} className="flex items-center gap-4 group/item">
                   <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-xl font-mono text-xs font-bold text-slate-500 group-hover/item:bg-cyan-50 group-hover/item:text-cyan-600 transition-colors">
                     {i + 1}
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-slate-700">{loc.location}</span>
                        <span className="text-xs font-black text-cyan-600">{loc.count} Users</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full" 
                          style={{ width: `${(loc.count / stats.completed) * 100 || 0}%` }}
                        />
                      </div>
                   </div>
                </div>
              ))}
              {(!stats.locations || stats.locations.length === 0) && (
                <div className="py-12 text-center text-slate-400 italic">
                  No geographic data collected yet.
                </div>
              )}
           </div>
           <div className="mt-8 pt-6 border-t border-slate-100">
             <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
               Detailed Area Report
             </button>
           </div>
        </div>

        {/* System Health / Traffic Chart simulation */}
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <Activity size={160} />
           </div>
           <h3 className="text-xl font-bold mb-8">Traffic Analysis</h3>
           <div className="aspect-video flex items-end justify-between gap-2 px-2">
              {[40, 60, 45, 90, 65, 80, 50, 70, 85, 40, 30, 20].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                   <div 
                    className="w-full bg-blue-500/50 hover:bg-blue-400 rounded-t-lg transition-all" 
                    style={{ height: `${h}%` }}
                   />
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                     {h} req
                   </div>
                </div>
              ))}
           </div>
           <div className="mt-6 flex justify-between text-slate-500 text-xs font-bold uppercase tracking-widest px-2">
              <span>08:00 AM</span>
              <span>12:00 PM</span>
              <span>05:00 PM</span>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colorClasses: any = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
           <ArrowUpRight size={14} />
           {trend}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
    </div>
  );
}
