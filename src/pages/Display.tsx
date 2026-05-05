import React, { useEffect, useState, useRef } from "react";
import socket from "../lib/socket.ts";
import { Monitor, BellRing, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Display() {
  const [stats, setStats] = useState<any>({ waiting: 0, completed: 0, currentlyCalling: [] });
  const [lastCalled, setLastCalled] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchStats();

    socket.on("queue-updated", fetchStats);
    socket.on("token-called", (token: any) => {
      setLastCalled(token);
      playAnnouncement();
      fetchStats();
      // Clear announcement highlight after 8 seconds
      setTimeout(() => setLastCalled(null), 8000);
    });

    return () => {
      socket.off("queue-updated");
      socket.off("token-called");
    };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/queue/stats");
      if (!res.ok) throw new Error("HTTP error");
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid content type: expected JSON");
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Display FetchStats error:", err);
    }
  };

  const playAnnouncement = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser. Interaction needed."));
    }
  };

  return (
    <div className="space-y-8 py-6">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      
      <div className="flex flex-col md:flex-row items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1 text-center md:text-left w-full">
          <div className="flex items-center gap-2 justify-center md:justify-start text-indigo-600 mb-1">
            <Monitor size={20} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Live Queue Hub</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Now Serving</h1>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-soft text-center min-w-[140px]">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Waiting</p>
            <p className="text-2xl font-black text-indigo-600 tabular-nums">{stats.waiting}</p>
          </div>
          <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-soft text-center min-w-[140px]">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Completed</p>
            <p className="text-2xl font-black text-emerald-600 tabular-nums">{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Display Grid */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white min-h-[450px] shadow-strong relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
              <Monitor size={200} />
            </div>
            
            <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
              <h2 className="text-indigo-400 font-black tracking-[0.2em] uppercase text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Active Announcements
              </h2>
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              </div>
            </header>

            <AnimatePresence mode="wait">
              {stats.currentlyCalling.length > 0 ? (
                <div className="flex-1 space-y-10">
                  {/* Highlight the most recently called token */}
                  <motion.div 
                    key={stats.currentlyCalling[0].id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col sm:flex-row items-center justify-between bg-white/5 border border-white/10 p-10 rounded-[2rem] gap-8"
                  >
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Token Number</p>
                      <p className="text-9xl font-black tracking-tighter leading-none border-b-8 border-indigo-600 inline-block pb-2">
                        {stats.currentlyCalling[0].token_number}
                      </p>
                    </div>
                    <div className="text-center sm:text-right space-y-4">
                      <div className="bg-indigo-600 px-8 py-3 rounded-full text-white text-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30">
                        {stats.currentlyCalling[0].counter_name}
                      </div>
                      <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Proceed Immediately</p>
                    </div>
                  </motion.div>

                  {/* List of other active counters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stats.currentlyCalling.slice(1).map((item: any) => (
                      <div key={item.id} className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-colors">
                        <span className="text-3xl font-black text-white">{item.token_number}</span>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.counter_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-6">
                  <UserCircle size={80} strokeWidth={0.5} className="opacity-20" />
                  <div className="text-center">
                    <p className="text-2xl font-bold tracking-tight text-slate-400">Queue is currently clear</p>
                    <p className="text-sm font-medium uppercase tracking-widest mt-2 opacity-50">Awaiting next customer</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Announcements */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-soft h-full flex flex-col">
            <h2 className="text-xs font-black text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-[0.2em]">
              <BellRing size={16} className="text-amber-500" />
              Notifications
            </h2>
            
            <AnimatePresence>
              {lastCalled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-10 p-8 bg-indigo-900 border border-indigo-800 rounded-3xl flex flex-col gap-6 text-white shadow-xl shadow-indigo-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center animate-bounce shadow-lg">
                      <BellRing size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">New Call</p>
                      <h3 className="text-2xl font-black tracking-tight leading-none mt-1">Token {lastCalled.token_number}</h3>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-indigo-200 leading-relaxed bg-white/5 p-4 rounded-xl">
                    Please proceed to <span className="text-white font-bold">{lastCalled.counter_name}</span>. Staff is ready to assist you.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 space-y-6 overflow-hidden">
               <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Queue Status Log</h3>
               <div className="space-y-4 font-mono text-[11px]">
                  <div className="flex gap-3 text-slate-400">
                    <span className="opacity-50">14:22</span>
                    <span className="text-slate-600">SYST HEARTBEAT: HEALTHY</span>
                  </div>
                  <div className="flex gap-3 text-slate-400">
                    <span className="opacity-50">14:15</span>
                    <span className="text-slate-600">DB CLOUD SYNC: COMPLETE</span>
                  </div>
                  <div className="flex gap-3 text-slate-400">
                    <span className="opacity-50">14:02</span>
                    <span className="text-slate-600">SOCKET MGR: 12 PEERS</span>
                  </div>
               </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 italic text-[11px] text-slate-400">
              * Display refreshes automatically when status changes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
