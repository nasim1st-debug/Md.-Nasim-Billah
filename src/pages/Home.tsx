import React, { useState } from "react";
import { Ticket, Clock, CheckCircle2, MessageSquare, Sparkles, Send, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { chatWithSupport } from "../services/aiService";

import socket from "../lib/socket.ts";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ waiting: 0 });
  const [showAi, setShowAi] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [userLocation, setUserLocation] = useState<string>("Detecting Location...");

  React.useEffect(() => {
    fetchStats();
    detectLocation();

    socket.on("queue-updated", () => {
      fetchStats();
      if (token) {
        checkTokenStatus(token.id);
      }
    });

    socket.on("token-called", (data) => {
      if (token && data.id === token.id) {
        setToken(data);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("আপনার ডাক পড়েছে!", {
            body: `কাউন্টার ${data.counter_id} এ যান (টোকেন: ${data.token_number})`,
            icon: "/pwa-192x192.png"
          });
        }
      }
    });
    
    return () => {
      socket.off("queue-updated");
      socket.off("token-called");
    };
  }, [token]);

  const checkTokenStatus = async (tokenId: number) => {
    try {
      const res = await fetch(`/api/tokens/${tokenId}`);
      if (res.ok) {
        const data = await res.json();
        setToken(data);
      }
    } catch (err) {
      console.error("Failed to check token status:", err);
    }
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  };

  const detectLocation = async () => {
    if (!("geolocation" in navigator)) {
      setUserLocation("Location Not Supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "Local Terminal";
          const country = data.address.country || "";
          setUserLocation(`${city}${country ? `, ${country}` : ""} • Active`);
        } catch (e) {
          setUserLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)} • Active`);
        }
      },
      () => {
        setUserLocation("Main Terminal Dhaka • Active");
      },
      { timeout: 10000 }
    );
  };

  const handleSend = async (explicitMsg?: string) => {
    const msg = explicitMsg || aiMessage;
    if (!msg.trim()) return;
    
    setAiMessage("");
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setSending(true);
    
    const response = await chatWithSupport(msg, stats.waiting, chatHistory);
    setChatHistory(prev => [...prev, { role: 'ai', text: response || "Something went wrong." }]);
    setSending(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/queue/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Fetch Stats error:", err);
    }
  };

  const generateToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tokens/generate", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: userLocation })
      });
      if (!res.ok) throw new Error("Failed to generate token");
      const data = await res.json();
      setToken(data);
      fetchStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center py-12 px-4 overflow-hidden">
      {/* Background Flourishes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-cyan-400 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-600 rounded-full blur-[140px] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      {/* Brand Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 mb-16 relative z-10"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm mb-4">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <div className="flex items-center gap-2">
            <MapPin size={10} className="text-cyan-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {userLocation}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic">
            Connect <span className="bg-[#006A4E] text-white px-4 py-1 rounded-2xl transform -skew-x-6 inline-block shadow-lg shadow-emerald-200">sheba.Com</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl mx-auto tracking-tight leading-relaxed">
            Revolutionizing your physical experience with <span className="text-slate-900 font-bold">seamless digital queueing</span>.
          </p>
        </div>
      </motion.div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
        <div className="md:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {!token ? (
              <motion.div
                key="action"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-cyan-600" />
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
                        <Ticket size={28} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Wait</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tighter">~{stats.waiting * 5} MINS</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Generate Service Token</h2>
                      <p className="text-sm text-slate-500 font-medium max-w-sm">Tap the button below to register your position in our digital priority queue.</p>
                    </div>

                    <button
                      onClick={generateToken}
                      disabled={loading}
                      className="w-full group relative py-6 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-cyan-600 transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden"
                    >
                      <div className="relative z-10 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest">
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Issue My Priority Pass
                            <Ticket size={18} className="group-hover:rotate-12 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>
                    {error && <p className="text-rose-500 text-xs font-bold text-center mt-4">{error}</p>}
                  </div>
                  <div className="absolute -bottom-10 -right-10 text-[120px] font-black text-slate-50 select-none -z-10 group-hover:text-cyan-50 transition-colors">01</div>
                </div>

                <div className="flex items-center gap-4 px-6 py-4 bg-white/50 backdrop-blur-sm border border-white/50 rounded-2xl">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />)}
                  </div>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    <span className="text-cyan-600">Join 48+ users</span> served today
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-strong text-center relative overflow-hidden border border-slate-800"
              >
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600" />
                <div className="space-y-8 py-4">
                  <div className="space-y-3">
                    <div className={`w-16 h-16 ${token.status === 'calling' ? 'bg-emerald-500 text-white animate-bounce' : 'bg-cyan-600/20 text-cyan-400'} rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-cyan-600/5`}>
                      {token.status === 'calling' ? <MapPin size={32} /> : <CheckCircle2 size={32} />}
                    </div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">
                      {token.status === 'calling' ? 'আপনার ডাক পড়েছে' : 'রেজিস্ট্রেশন সম্পন্ন'}
                    </p>
                    <h2 className="text-8xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl">
                      {token.token_number}
                    </h2>
                  </div>

                  {token.status === 'calling' ? (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="p-6 bg-emerald-600 text-white rounded-3xl shadow-xl space-y-2"
                    >
                      <h4 className="text-lg font-black uppercase tracking-tight">কাউন্টার {token.counter_id} এ যান</h4>
                      <p className="text-xs font-medium opacity-90">আপনার সেবা প্রদানের জন্য আমাদের প্রতিনিধি অপেক্ষা করছেন।</p>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">অবস্থান</p>
                        <p className="text-2xl font-black text-white">{stats.waiting + 1}</p>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">সময়</p>
                        <p className="text-2xl font-black text-white">~{(stats.waiting + 1) * 5}m</p>
                      </div>
                    </div>
                  )}

                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {token.status === 'calling' 
                        ? "অনুগ্রহ করে এখনই আপনার নির্দিষ্ট কাউন্টারে যান।"
                        : "আপনার পজিশন নিশ্চিত করা হয়েছে। অনুগ্রহ করে ওয়েটিং লাউঞ্জে অপেক্ষা করুন এবং স্ক্রিনে নজর রাখুন।"
                      }
                    </p>
                    {token.status !== 'calling' && "Notification" in window && Notification.permission === "default" && (
                      <button onClick={requestNotificationPermission} className="mt-4 text-[10px] text-cyan-400 font-bold uppercase tracking-widest hover:underline">
                        নোটিফিকেশন চালু করুন 🔔
                      </button>
                    )}
                  </div>

                  <button onClick={() => setToken(null)} className="group py-3 px-8 border border-white/10 rounded-xl text-[10px] text-slate-500 hover:text-white hover:border-white/30 uppercase font-black tracking-widest transition-all inline-flex items-center gap-3">
                    আরেকটি টোকেন ইস্যু করুন
                    <X size={14} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Status */}
        <div className="md:col-span-5 space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-soft space-y-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <p className="text-2xl font-black text-slate-800 tracking-tighter">{stats.waiting}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Currently Waiting</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl space-y-1">
                <p className="text-2xl font-black text-emerald-600 tracking-tighter">98.2%</p>
                <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">System Health</p>
              </div>
            </div>
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex gap-4 group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <MessageSquare size={20} />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">Concierge Assistance</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">Real-time manager support via official social messaging.</p>
                  <a href="https://m.me/ConnectSheba" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">Connect with manager →</a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-soft space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800 tracking-tight">AI Branch Assistant</h4>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Ask anything about our services</p>
              </div>
            </div>

            <div className="relative">
              <input 
                type="text" 
                placeholder="How to get home loan?"
                className="w-full pl-6 pr-14 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = e.currentTarget.value;
                    if (val.trim()) {
                      setShowAi(true);
                      handleSend(val);
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input.value.trim()) {
                    setShowAi(true);
                    handleSend(input.value);
                    input.value = "";
                  }
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAi(true)}
        className="fixed bottom-32 right-8 w-16 h-16 bg-white text-slate-900 rounded-full shadow-strong flex items-center justify-center z-40 border border-slate-100 group"
      >
        <Sparkles size={24} className="relative z-10 animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {showAi && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-8 w-full max-w-[360px] bg-white rounded-[2rem] shadow-strong border border-slate-200 z-50 flex flex-col overflow-hidden"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm tracking-tight">Connect AI</h4>
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Branch Assistant</p>
                </div>
              </div>
              <button onClick={() => setShowAi(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
            </div>

            <div className="flex-1 h-80 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {chatHistory.map((chat, i) => (
                <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium ${chat.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}`}>{chat.text}</div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
              <input 
                type="text" 
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask branch AI..."
                className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-xl text-sm outline-none"
              />
              <button onClick={handleSend} disabled={sending || !aiMessage.trim()} className="p-2 bg-cyan-600 text-white rounded-xl shadow-lg shadow-cyan-100">
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
