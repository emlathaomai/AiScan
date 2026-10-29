import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Info, RefreshCw, Cpu, CheckCircle2, AlertCircle, X, FileText } from 'lucide-react';

export default function Navbar({ serverStatus, onCheckServer, activeMode, onOpenGuide }) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showInfoModal) {
        setShowInfoModal(false);
      }
    };
    if (showInfoModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInfoModal]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0B0F17]/85 border-b border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent flex items-center gap-1.5">
              MeatGuard
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 leading-none">Make by Venola la la</p>
          </div>
        </div>

        {/* Server & Info Actions */}
        <div className="flex items-center space-x-2">
          {/* Server Status Pill */}
          <button
            onClick={onCheckServer}
            title="Nhấn để kiểm tra lại kết nối Backend"
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
              serverStatus === 'online'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : serverStatus === 'checking'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === 'online'
                  ? 'bg-emerald-400 animate-ping'
                  : serverStatus === 'checking'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <span className="hidden sm:inline">
              {serverStatus === 'online'
                ? activeMode === 'onnx_model'
                  ? 'AI ONNX Live'
                  : 'Backend Live (Heuristic Fallback)'
                : serverStatus === 'checking'
                ? 'Đang kết nối...'
                : 'Backend Offline'}
            </span>
            <span className="sm:hidden">
              {serverStatus === 'online' ? 'Live' : 'Offline'}
            </span>
            <RefreshCw className={`w-3 h-3 ${serverStatus === 'checking' ? 'animate-spin' : ''}`} />
          </button>

          {/* Food Safety Indicator Paper Guide Button */}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition-all active:scale-95 shadow-sm"
              title="Xem hướng dẫn Giấy chỉ thị an toàn thực phẩm"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Giấy chỉ thị pH</span>
            </button>
          )}

          {/* About / Info Modal Button */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors border border-slate-700/80"
            title="Thông tin & Nguyên lý"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Modal rendered via Portal to escape header backdrop-filter containing block */}
      {showInfoModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn transition-opacity duration-200">
          {/* Click outside backdrop to close */}
          <div
            className="absolute inset-0"
            onClick={() => setShowInfoModal(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-[#121824] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-modalIn text-left transition-all duration-300 will-change-transform">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#0B0F17]/90 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Nguyên Lý Hoạt Động MeatGuard
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Computer Vision & Phân Tích Quang Phổ Màu Sắc
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all duration-200 active:scale-90"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#0B0F17]/60 custom-scrollbar overscroll-contain">
              <div className="p-3.5 rounded-2xl bg-[#121824] border border-slate-800/90 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                    1. Sắc Tố Myoglobin & Trạng Thái Oxy Hóa (Thịt Sống)
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-4">
                  Thịt tươi chứa hàm lượng cao <strong className="text-emerald-300">Oxymyoglobin</strong> (màu đỏ tươi tự nhiên hoặc hồng phấn). Khi bảo quản lâu hoặc tiếp xúc không khí, sắt Fe²⁺ bị oxy hóa thành Fe³⁺ sinh ra <strong className="text-amber-300">Metmyoglobin</strong> khiến thịt ngả nâu xỉn. Khi bị nhiễm khuẩn (như <em>Pseudomonas</em>), sắc tố <strong className="text-rose-400">Sulfmyoglobin</strong> hình thành tạo màng xanh tái hoặc xám sẫm.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121824] border border-slate-800/90 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <h4 className="font-bold text-teal-400 text-xs uppercase tracking-wider">
                    2. Kiểm Định Thịt Đã Nấu Chín & Cơ Chế Heuristic Fallback
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-4">
                  Với thịt chín, MeatGuard phân tích quang phổ loại trừ màu nâu caramel tự nhiên của gia vị kho/nướng, đồng thời tập trung quét các dấu hiệu nguy hại: <strong className="text-teal-300">vết nấm mốc xanh lục</strong>, <strong className="text-amber-300">đốm mỡ đông trắng đục</strong> và <strong className="text-rose-400">màng nhớt vi khuẩn phản quang</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121824] border border-slate-800/90 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                    3. Lời Khuyên An Toàn Tiêu Thụ Thực Phẩm
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-4">
                  Camera phân tích bề mặt quang học và màu sắc. Để đảm bảo an toàn tuyệt đối, người tiêu dùng luôn nên kết hợp kiểm tra <strong>xúc giác</strong> (ấn tay cảm nhận độ đàn hồi, không nhớt dính) và <strong>khứu giác</strong> (ngửi mùi, không có mùi chua ôi thiu) trước khi chế biến hoặc sử dụng.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-[#0B0F17]/90 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-transform active:scale-95"
              >
                Đã hiểu & Bắt đầu quét
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
