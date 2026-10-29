import React from 'react';
import { History, Trash2, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';

export default function ScanHistory({ history, onSelectHistoryItem, onClearHistory }) {
  if (!history || history.length === 0) {
    return (
      <div className="w-full bg-white/95 border border-emerald-100/90 rounded-3xl p-6 shadow-xl shadow-emerald-950/5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 mb-2 shadow-2xs">
          <History className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Chưa có lịch sử quét</h4>
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
          label: 'Tươi (Fresh)',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
        };
      case 'aging':
        return {
          label: 'Cần nấu ngay (Aging)',
          color: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
        };
      case 'frozen_damaged':
        return {
          label: 'Cháy đông (Freeze)',
          color: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold'
        };
      case 'spoiled':
        return {
          label: 'Ươn / Hỏng (Spoiled)',
          color: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold'
        };
      default:
        return {
          label: 'Đã phân tích',
          color: 'bg-slate-100 text-slate-700 border-slate-200 font-semibold'
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
    <div className="w-full bg-white/95 border border-emerald-100/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-emerald-950/5 text-left space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Lịch Sử Quét Gần Đây (Recent Scans)</h3>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-slate-500 hover:text-rose-600 transition-colors flex items-center space-x-1 p-1 hover:bg-slate-100 rounded-lg"
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
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0 shadow-2xs">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt="Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shadow-2xs ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {item.confidence}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Action icon */}
              <div className="p-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
