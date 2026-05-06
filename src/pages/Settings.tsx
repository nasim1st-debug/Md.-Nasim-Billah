import React from "react";
import { Settings, Shield, Bell, Monitor, Database, Globe } from "lucide-react";

export default function AppSettings() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Branch Settings</h1>
        <p className="text-slate-500 font-medium">Global configuration for Connect <span className="text-[#006A4E] font-bold">sheba.Com</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-8 space-y-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Globe size={20} className="text-cyan-600" />
              Branch Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Branch Name</label>
                <input type="text" defaultValue="Main Branch Terminal" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-cyan-600 outline-none font-bold text-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Location ID</label>
                <input type="text" defaultValue="HQ-DHAKA-01" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-cyan-600 outline-none font-bold text-slate-700" />
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-8">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <Monitor size={20} className="text-blue-600" />
                Display Configuration
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-slate-800">Voice Announcements</p>
                    <p className="text-xs text-slate-500">Enable synthesized voice for token calls</p>
                  </div>
                  <div className="w-12 h-6 bg-cyan-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-slate-800">Scrolling News Ticker</p>
                    <p className="text-xs text-slate-500">Show latest branch updates on main display</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl space-y-6">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Shield size={20} className="text-indigo-400" />
              System Security
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Managing critical system hooks and authentication protocols.
            </p>
            <div className="space-y-3">
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                Change Admin Salt
              </button>
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                Rotate API Keys
              </button>
              <button className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                Purge Token History
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-8 flex flex-col items-center text-center space-y-4">
             <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-3xl flex items-center justify-center">
               <Database size={32} />
             </div>
             <div>
               <h4 className="font-black text-slate-800 tracking-tight">Database Health</h4>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Status: Optimized</p>
             </div>
             <p className="text-xs text-slate-400">Next scheduled maintenance in 14 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
