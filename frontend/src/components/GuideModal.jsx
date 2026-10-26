import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

export default function GuideModal({ isOpen, onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dontShowAgain]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('meatguard_hide_guide_modal_v1', 'true');
      } catch (e) {
        // Safe fallback
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-scaleUp">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                Giấy Chỉ Thị An Toàn Thực Phẩm
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Bắp Cải Tím
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Hướng dẫn sử dụng & đối chiếu kết quả pH tự nhiên
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Đóng popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Image Guide Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 bg-slate-950/40 custom-scrollbar">
          {/* Infographic Banner Image */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 flex items-center justify-center group relative">
            <img
              src="/food-safety-guide.png"
              alt="Giấy An Toàn Thực Phẩm - Bắp Cải Tím"
              className="w-full h-auto object-contain rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
              loading="eager"
            />
          </div>

          {/* Quick Summary Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-2 text-purple-200">
              <span className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-purple-300">Giữ nguyên màu tím:</strong>
                <span>pH ổn định, thịt/cá có dấu hiệu tươi mới an toàn.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2 text-emerald-200">
              <span className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-300">Chuyển sang màu xanh:</strong>
                <span>pH biến đổi tăng tính kiềm, có nguy cơ thịt bị ươn/hỏng.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/20"
            />
            <span>Không tự động hiển thị lại</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition-transform active:scale-95"
          >
            <span>Đã Hiểu & Bắt Đầu Sử Dụng</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
}
