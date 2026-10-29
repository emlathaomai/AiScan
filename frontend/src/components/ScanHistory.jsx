import React from 'react';
import { History, Trash2, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';

export default function ScanHistory({ history, onSelectHistoryItem, onClearHistory }) {
  if (!history || history.length === 0) {
    return (
      <div className="w-full bg-[#121824]/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl text-center backdrop-blur-sm">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-500 mb-2">
          <History className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300">Chưa có lịch sử quét</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Các kết quả quét gần nhất sẽ tự động lưu vào trình duyệt của bạn (tối đa 5 lượt).
        </p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'fresh':
        return {
          label: 'Tươi',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'aging':
        return {
          label: 'Cần nấu ngay',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      case 'frozen_damaged':
        return {
          label: 'Cháy đông',
          color: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
        };
      case 'spoiled':
        return {
          label: 'Ươn / Hỏng',
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };
      default:
        return {
          label: 'Đã phân tích',
          color: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        };
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + date.toLocaleDateString();
    } catch {
      return 'Vừa xong';
    }
  };

  return (
    <div className="w-full bg-[#121824]/90 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-left space-y-4 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Lịch Sử Quét Gần Đây</h3>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center space-x-1 p-1 hover:bg-slate-800 rounded-lg"
          title="Xóa toàn bộ lịch sử"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {history.map((item) => {
          const badge = getStatusBadge(item.freshness_status);
          return (
            <div
              key={item.id}
              onClick={() => onSelectHistoryItem(item)}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B0F17]/70 border border-slate-800/80 hover:border-slate-700 hover:bg-[#0B0F17] transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt="Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {item.confidence}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Action icon */}
              <div className="p-2 text-slate-500 group-hover:text-emerald-400 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
