import React, { useEffect, useState } from "react";
import { BarChart3, Users, Clock, Trash2, ArrowUpRight, Activity } from "lucide-react";
import socket from "../lib/socket.ts";

export default function Admin() {
  const [stats, setStats] = useState<any>({ waiting: 0, completed: 0, currentlyCalling: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    socket.on("queue-updated", fetchStats);
    return () => { socket.off("queue-updated"); };
  }, []);

  const fetchStats = async () => {
    const res = await fetch("/api/queue/stats");
    const data = await res.json();
    setStats(data);
  };

  const clearQueue = async () => {
    if (!confirm("Are you sure you want to CLEAR the entire queue? This will reset all tokens and counters.")) return;
    setLoading(true);
    await fetch("/api/admin/clear-queue", { method: "POST" });
    setLoading(false);
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
          value={stats.waiting + stats.completed + stats.currentlyCalling.length} 
          icon={Users} 
          trend="+14%" 
          color="blue" 
        />
        <StatCard 
          title="Currently Waiting" 
          value={stats.waiting} 
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  {stats.currentlyCalling.map((item: any) => (
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
                  {stats.currentlyCalling.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-400 italic">No counters are currently calling.</td>
                    </tr>
                  )}
                </tbody>
             </table>
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
