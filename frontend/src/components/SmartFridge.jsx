import React, { useState } from 'react';
import {
  Refrigerator,
  Calendar,
  Clock,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Package,
  Plus
} from 'lucide-react';

export default function SmartFridge({
  items = [],
  onRemoveItem,
  onClearFridge
}) {
  const [isOpen, setIsOpen] = useState(true);

  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return (
      <div className="w-full bg-[#121824]/90 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl text-left space-y-3 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Refrigerator className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Tủ Lạnh Ảo MeatGuard</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">0 món</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed py-2">
          Tủ lạnh ảo đang trống. Hãy chuyển sang chế độ <strong>"Quét Tem Nhãn & HSD"</strong> và bấm <strong>"Thêm vào Tủ Lạnh Ảo"</strong> để MeatGuard giúp bạn theo dõi đếm ngược hạn sử dụng, không bao giờ bỏ quên thịt hư hỏng!
        </p>
      </div>
    );
  }

  // Count items by status
  const safeCount = safeItems.filter(it => it.expiry_status === 'safe').length;
  const expiringCount = safeItems.filter(it => it.expiry_status === 'expiring_soon').length;
  const expiredCount = safeItems.filter(it => it.expiry_status === 'expired').length;

  return (
    <div className="w-full bg-[#121824]/90 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-left space-y-4 backdrop-blur-sm transition-all">
      {/* Header with summary stats and toggle */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Refrigerator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Tủ Lạnh Ảo MeatGuard</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 text-[10px] font-mono font-bold border border-slate-700">
                {safeItems.length} món
              </span>
            </div>
            {/* Quick summary chips */}
            <div className="flex items-center gap-2 mt-0.5 text-[10px]">
              {expiringCount > 0 && (
                <span className="text-amber-400 font-medium">
                  • {expiringCount} món cận date
                </span>
              )}
              {expiredCount > 0 && (
                <span className="text-rose-400 font-medium">
                  • {expiredCount} món quá hạn
                </span>
              )}
              {safeCount > 0 && (
                <span className="text-emerald-400 font-medium">
                  • {safeCount} món an toàn
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {safeItems.length > 0 && (
            <button
              type="button"
              onClick={onClearFridge}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 hover:bg-slate-800/80 rounded-lg flex items-center gap-1"
              title="Xóa toàn bộ tủ lạnh"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Dọn tủ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isOpen ? 'Thu gọn' : 'Mở rộng'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Item List */}
      {isOpen && (
        <div className="space-y-2.5 pt-1">
          {safeItems.map((item) => {
            const isExpired = item.expiry_status === 'expired';
            const isExpiring = item.expiry_status === 'expiring_soon';

            const badgeBg = isExpired
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : isExpiring
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

            const StatusIcon = isExpired ? XCircle : isExpiring ? AlertTriangle : CheckCircle;

            return (
              <div
                key={item.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#0B0F17]/80 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-center justify-between gap-3"
              >
                {/* Left: Thumbnail & Name */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700 flex-shrink-0 bg-slate-900"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Package className="w-5 h-5 text-teal-400" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {item.product_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                      <span>HSD: <strong className="text-slate-300">{item.exp_date}</strong></span>
                      {item.brand && <span className="text-slate-400">• {item.brand}</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Badge, Countdown & Remove Button */}
                <div className="flex items-center space-x-2.5 flex-shrink-0">
                  <div className="text-right">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-flex items-center gap-1 ${badgeBg}`}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {item.remaining_text || item.expiry_badge}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 transition-all"
                    title="Đã dùng món này (Xóa khỏi tủ lạnh)"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
