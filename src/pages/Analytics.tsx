import React from "react";
import { BarChart3, TrendingUp, Users, Clock, Calendar } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Advanced Analytics</h1>
          <p className="text-slate-500 font-medium">Detailed operational performance reports</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Export CSV</button>
          <button className="px-4 py-2 bg-cyan-600 rounded-xl text-xs font-bold text-white hover:bg-cyan-700 transition-colors">Generate Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficiency</p>
          <h3 className="text-2xl font-black text-slate-800">94.2%</h3>
        </div>
        
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Steady</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Peak Traffic</p>
          <h3 className="text-2xl font-black text-slate-800">11:30 AM</h3>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">-4.2%</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Wait</p>
          <h3 className="text-2xl font-black text-slate-800">08:45m</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
            <BarChart3 size={32} />
          </div>
          <h4 className="font-bold text-slate-800">Service Distribution Chart</h4>
          <p className="text-sm text-slate-400 max-w-xs mt-1">Detailed visualization of tokens issued per service category over the last 30 days.</p>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
            <TrendingUp size={32} />
          </div>
          <h4 className="font-bold text-slate-800">Wait Time Heatmap</h4>
          <p className="text-sm text-slate-400 max-w-xs mt-1">Identify bottlenecks by visualizing customer wait times throughout the business week.</p>
        </div>
      </div>
    </div>
  );
}
