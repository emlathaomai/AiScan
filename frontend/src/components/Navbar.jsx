import React, { useState } from 'react';
import { ShieldCheck, Info, RefreshCw, Cpu, CheckCircle2, AlertCircle, X, FileText } from 'lucide-react';

export default function Navbar({ serverStatus, onCheckServer, activeMode, onOpenGuide }) {
  const [showInfoModal, setShowInfoModal] = useState(false);

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

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121824] border border-slate-750 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Nguyên Lý Hoạt Động MeatGuard</h3>
                <p className="text-xs text-slate-400">Computer Vision & Colorimetry Spectroscopy</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              <div className="p-3 rounded-xl bg-[#0B0F17]/80 border border-slate-800">
                <h4 className="font-semibold text-emerald-400 text-xs uppercase tracking-wider mb-1">
                  1. Sắc tố Myoglobin & Trạng thái Oxy hóa
                </h4>
                <p className="text-xs text-slate-300">
                  Thịt tươi chứa nhiều <strong>Oxymyoglobin</strong> (màu đỏ tươi anh đào hoặc hồng phấn). Khi để lâu, sắt Fe2+ bị oxy hóa thành Fe3+ tạo ra <strong>Metmyoglobin</strong> khiến thịt ngả nâu xỉn. Khi bị vi khuẩn xâm nhập (như Pseudomonas), hình thành <strong>Sulfmyoglobin</strong> gây biến màu xám hoặc ánh xanh.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0F17]/80 border border-slate-800">
                <h4 className="font-semibold text-teal-400 text-xs uppercase tracking-wider mb-1">
                  2. Cơ chế Dual-Engine & Fallback tự động
                </h4>
                <p className="text-xs text-slate-300">
                  MeatGuard hỗ trợ cả mô hình Deep Learning PyTorch/ONNX và cơ chế <strong>Heuristic Mock Simulation</strong> phân tích dải màu HSV/RGB trung tâm. Đảm bảo ứng dụng luôn phản hồi nhanh, mượt mà và hoạt động ngay cả khi chưa nạp trọng số nặng.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0F17]/80 border border-slate-800">
                <h4 className="font-semibold text-amber-400 text-xs uppercase tracking-wider mb-1">
                  3. Lời khuyên an toàn tiêu thụ
                </h4>
                <p className="text-xs text-slate-300">
                  Camera phân tích bề mặt quang học. Với an toàn thực phẩm tối đa, người tiêu dùng luôn nên kết hợp kiểm tra xúc giác (ấn tay kiểm tra độ đàn hồi) và khứu giác (ngửi mùi) trước khi nấu.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/25"
            >
              Đã hiểu & Bắt đầu quét
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
