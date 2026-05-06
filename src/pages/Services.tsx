import React from "react";
import { Layers, Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";

export default function Services() {
  const services = [
    { id: 1, name: "General Inquiry", prefix: "A", avgTime: "5m", status: "Active" },
    { id: 2, name: "Account Opening", prefix: "B", avgTime: "25m", status: "Active" },
    { id: 3, name: "Loan Consulting", prefix: "C", avgTime: "45m", status: "Active" },
    { id: 4, name: "Cash Withdrawal", prefix: "D", avgTime: "3m", status: "Active" },
    { id: 5, name: "Card Replacement", prefix: "E", avgTime: "15m", status: "Maintenance" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service Catalog</h1>
          <p className="text-slate-500 font-medium">Configure service categories and token routing</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200">
          <Plus size={16} /> Add New Service
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Name</th>
              <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prefix</th>
              <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Duration</th>
              <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</th>
              <th className="text-right py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {services.map((s) => (
              <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-6 px-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                      <Layers size={18} />
                    </div>
                    <span className="font-bold text-slate-800">{s.name}</span>
                  </div>
                </td>
                <td className="py-6 px-8 font-mono font-black text-blue-600">{s.prefix}</td>
                <td className="py-6 px-8 text-sm font-bold text-slate-500">{s.avgTime}</td>
                <td className="py-6 px-8">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    s.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {s.status === 'Active' && <CheckCircle2 size={10} />}
                    {s.status}
                  </span>
                </td>
                <td className="py-6 px-8">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                      <Pencil size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
