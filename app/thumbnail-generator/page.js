'use client';

import { useState, useCallback } from 'react';
import {
  Sparkles,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  UserPlus,
  Palette,
  Bell,
  Info,
  LayoutGrid,
  Plus,
  Copy
} from 'lucide-react';

export default function ThumbnailGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      // Simulate API call for the UI
      setTimeout(() => {
        setResult({
          success: true,
          imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1280&auto=format&fit=crop',
        });
        setLoading(false);
      }, 3000);
      
      // Actual API Integration Logic:
      // const res = await fetch('/api/thumbnail-generator', { ... });
      // const data = await res.json();
      // ...
    } catch {
      setResult({ error: 'خطأ في الشبكة. لم يتم التوليد.' });
      setLoading(false);
    }
  }, [topic]);

  return (
    <div dir="rtl" className="min-h-screen flex bg-[#0B0E14] text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* ===== RIGHT SIDEBAR (لوحة التحكم) ===== */}
      <aside className="w-[340px] shrink-0 bg-[#10131A] border-l border-white/5 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Header */}
          <h2 className="text-xl font-bold text-white">لوحة التحكم</h2>

          {/* Section 1: Text Input */}
          <div className="bg-[#1A1D24] border border-white/5 rounded-xl p-4 space-y-3 relative">
            <button className="w-1/3 flex items-center gap-2 text-xs text-gray-300 bg-[#10131A] border border-white/5 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors absolute top-4 left-4">
              <Copy size={12} className="text-gray-500" />
              إضافة ملحقات
            </button>

            <div className="flex items-center justify-between">
              <button className="flex items-center gap-1.5 text-sm text-gray-300 bg-[#0B0E14] rounded-lg px-3 py-1.5 border border-white/5">
                عنوان
                <ChevronDown size={14} className="text-[#EAB308] ml-1" />
              </button>
              <span className="text-xs text-gray-500">{topic.length}/1000</span>
            </div>
            
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="اكتب عنوان الفيديو... (استخدم @ للإشارة للصور)"
              rows={3}
              className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none mt-2"
            />
          </div>

          {/* Section 2: References */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ImageIcon size={16} className="text-[#EAB308]" />
                المراجع
              </div>
              <span className="text-[10px] bg-[#1A1D24] px-2 py-0.5 rounded text-gray-400 font-mono">0/10</span>
            </div>
            <button className="w-full border border-dashed border-[#EAB308]/40 rounded-xl py-3 text-sm text-[#EAB308] flex items-center justify-center gap-2 bg-transparent hover:bg-[#EAB308]/5 transition-colors font-medium">
              <Plus size={16} />
              إضافة مرجع (ستايل / ملحقات)
            </button>
          </div>

          {/* Section 3: Character & Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-end gap-1.5 text-xs text-white font-bold mb-1">
                الشخصية
                <UserPlus size={14} className="text-[#EAB308]" />
              </div>
              <button className="w-full bg-[#1A1D24] border border-white/5 rounded-xl py-3 flex items-center justify-center gap-2 text-sm text-gray-400 hover:bg-[#1A1D24]/80 transition-colors">
                <UserPlus size={16} />
                إضافة شخصية
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-end gap-1.5 text-xs text-white font-bold mb-1">
                الألوان
                <Palette size={14} className="text-[#EAB308]" />
              </div>
              <button className="w-full bg-[#1A1D24] border border-white/5 rounded-xl py-3 flex items-center justify-center gap-2 text-sm text-gray-400 hover:bg-[#1A1D24]/80 transition-colors">
                <Palette size={16} />
                إضافة ألوان
              </button>
            </div>
          </div>

          {/* Section 4: Settings */}
          <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
             <div>
              <span className="text-xs text-white font-bold block mb-2 flex items-center justify-between">
                <ChevronDown size={14} className="text-gray-500" />
                الموديل
              </span>
              <button className="w-full flex items-center justify-center text-sm text-white font-bold bg-[#1A1D24] border border-white/5 rounded-lg py-2">
                Basic
              </button>
            </div>
            <div>
              <span className="text-xs text-white font-bold block mb-2 flex items-center justify-between">
                <ChevronDown size={14} className="text-[#EAB308]" />
                الأبعاد
              </span>
              <div className="flex gap-1 justify-end">
                <button className="bg-[#EAB308] rounded-lg px-2 py-1.5 text-xs text-black font-bold flex items-center gap-1 relative">
                  <span className="absolute -top-2 -right-2 text-[8px] bg-red-600 text-white px-1 rounded shadow-sm">NEW</span>
                  16:9
                </button>
                <button className="bg-[#1A1D24] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-gray-400">9:16</button>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom action */}
        <div className="p-5 border-t border-white/5 space-y-3 bg-[#10131A]">
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-[#EAB308] font-bold text-lg">20 <span className="text-gray-500 font-normal text-xs">نقطة</span></span>
            <span className="text-gray-400 text-xs font-medium">التكلفة المقدرة</span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full bg-[#EAB308] disabled:bg-[#1A1D24] disabled:text-gray-600 hover:bg-[#FACC15] text-black font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg disabled:shadow-none"
          >
             {loading ? (
                <span className="inline-block w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
             ) : (
               <>إنشاء <Plus size={18} /></>
             )}
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex flex-col bg-[#0B0E14] min-h-screen overflow-y-auto">

        {/* Top Navbar */}
        <nav className="flex items-center justify-between px-8 py-5">
          {/* Right side (Logo) */}
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-xl font-bold text-white tracking-tight">ThumPure</span>
            <div className="w-6 h-6 rounded-md flex items-center justify-center border-2 border-[#EAB308]">
              <div className="w-2.5 h-2.5 bg-[#EAB308] rounded-[2px]"></div>
            </div>
          </div>
          
          {/* Left side */}
          <div className="flex items-center gap-5">
            <button className="bg-[#1A1D24] text-gray-300 text-sm font-medium rounded-full px-5 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors border border-white/5">
              <Info size={16} className="text-[#EAB308]" />
              دليل الاستخدام
            </button>
            <button className="bg-white text-black text-sm font-bold rounded-full px-6 py-2 hover:bg-gray-200 transition-colors">
              ترقية
            </button>
            <button className="relative text-gray-400 hover:text-white transition-colors p-1">
              <Bell size={20} />
            </button>
            <div className="w-9 h-9 rounded-full bg-[#1A1D24] border-2 border-[#EAB308] overflow-hidden p-[2px] cursor-pointer">
               <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-600 to-pink-500">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </nav>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-5xl aspect-video bg-[#10131A] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-500">
            {loading ? (
               <div className="flex flex-col items-center animate-pulse">
                  <div className="w-16 h-16 border-4 border-[#1A1D24] border-t-[#EAB308] rounded-full animate-spin mb-6"></div>
                  <h2 className="text-2xl font-bold text-white tracking-wide">جاري الإبداع...</h2>
                  <p className="text-gray-500 mt-2 text-sm">نستخدم سحر الذكاء الاصطناعي لإنشاء صورتك المصغرة</p>
               </div>
            ) : result && result.success === false ? (
               <div className="text-center">
                 <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-red-500 text-3xl">❌</span>
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">فشل التوليد</h2>
                 <p className="text-gray-500 text-sm">{result.error}</p>
               </div>
            ) : result && result.success ? (
               <div className="w-full h-full p-6 animate-in fade-in zoom-in duration-500">
                 <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 relative group bg-[#0B0E14]">
                   <img src={result.imageUrl} alt="Generated Thumbnail" className="w-full h-full object-contain" />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                     <button className="bg-[#EAB308] hover:bg-[#FACC15] text-black font-bold px-8 py-3 rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 shadow-xl">
                       تحميل الصورة <ImageIcon size={18} />
                     </button>
                   </div>
                 </div>
               </div>
            ) : (
              <div className="flex flex-col items-center text-center animate-in fade-in duration-1000">
                <div className="w-20 h-20 bg-[#1A1D24] rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner border border-white/5 relative group cursor-pointer hover:border-[#EAB308]/30 transition-colors">
                  <Sparkles size={32} className="text-[#EAB308] group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-[#EAB308]/5 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h1 className="text-3xl font-bold mb-4 text-white tracking-tight">جاهز للإبداع</h1>
                <p className="text-gray-500 text-sm max-w-[280px] leading-relaxed">
                  قم بضبط الإعدادات على اليمين لإنشاء الصورة المصغرة التالية.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Latest Designs */}
        <div className="px-8 pb-8 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-4 justify-end">
            <h3 className="text-sm font-bold text-white">أحدث التصاميم</h3>
            <LayoutGrid size={16} className="text-[#EAB308]" />
          </div>
          <div className="w-full border border-dashed border-white/10 bg-[#10131A]/30 rounded-2xl py-14 flex items-center justify-center transition-colors hover:bg-[#10131A]/50 cursor-pointer">
            <p className="text-gray-600 text-sm font-medium">لا يوجد سجل بعد، ابدأ الإبداع الآن!</p>
          </div>
        </div>
      </main>

    </div>
  );
}
