import React, { useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Snowflake,
  ShieldAlert,
  Flame,
  Refrigerator,
  Sparkles,
  Layers,
  ThermometerSnowflake,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultCard({ result }) {
  if (!result) return null;

  const {
    freshness_status,
    status_title,
    status_description,
    confidence,
    probabilities = { fresh: 0, aging: 0, frozen_damaged: 0, spoiled: 0 },
    detected_meat,
    meat_name_vn,
    color_metrics,
    safety_advice,
    model_mode,
    inference_time_ms
  } = result;

  // Trigger celebration confetti if fresh
  useEffect(() => {
    if (freshness_status === 'fresh') {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [freshness_status]);

  // Color config according to status
  const statusTheme = {
    fresh: {
      badgeBg: 'bg-emerald-500/15',
      badgeBorder: 'border-emerald-500/30',
      badgeText: 'text-emerald-400',
      accentColor: '#10b981',
      barColor: 'bg-emerald-500',
      glowRing: 'ring-emerald-500/20',
      Icon: CheckCircle,
      tag: '🟢 AN TOÀN'
    },
    aging: {
      badgeBg: 'bg-amber-500/15',
      badgeBorder: 'border-amber-500/30',
      badgeText: 'text-amber-400',
      accentColor: '#f59e0b',
      barColor: 'bg-amber-500',
      glowRing: 'ring-amber-500/20',
      Icon: AlertTriangle,
      tag: '🟡 CẦN NẤU NGAY'
    },
    frozen_damaged: {
      badgeBg: 'bg-sky-500/15',
      badgeBorder: 'border-sky-500/30',
      badgeText: 'text-sky-400',
      accentColor: '#0ea5e9',
      barColor: 'bg-sky-500',
      glowRing: 'ring-sky-500/20',
      Icon: Snowflake,
      tag: '❄️ CHÁY ĐÔNG / ĐÓNG ĐÁ'
    },
    spoiled: {
      badgeBg: 'bg-rose-500/15',
      badgeBorder: 'border-rose-500/30',
      badgeText: 'text-rose-400',
      accentColor: '#f43f5e',
      barColor: 'bg-rose-500',
      glowRing: 'ring-rose-500/20',
      Icon: XCircle,
      tag: '🔴 NGUY CƠ NHIỄM KHUẨN'
    }
  }[freshness_status] || {
    badgeBg: 'bg-slate-500/15',
    badgeBorder: 'border-slate-500/30',
    badgeText: 'text-slate-400',
    accentColor: '#94a3b8',
    barColor: 'bg-slate-500',
    glowRing: 'ring-slate-500/20',
    Icon: CheckCircle,
    tag: 'CHƯA RÕ'
  };

  const StatusIcon = statusTheme.Icon;

  // Format percentages
  const pFresh = Math.round((probabilities.fresh || 0) * 100);
  const pAging = Math.round((probabilities.aging || 0) * 100);
  const pFrozen = Math.round((probabilities.frozen_damaged || 0) * 100);
  const pSpoiled = Math.round((probabilities.spoiled || 0) * 100);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 text-left animate-fadeIn">
      {/* Status Header Banner */}
      <div className={`p-5 rounded-2xl ${statusTheme.badgeBg} border ${statusTheme.badgeBorder} ring-1 ${statusTheme.glowRing} relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-950/60 border ${statusTheme.badgeBorder}`}>
              <StatusIcon className={`w-7 h-7 ${statusTheme.badgeText}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/70 border border-slate-800 text-slate-300">
                  {statusTheme.tag}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {meat_name_vn || 'Thịt tươi sống'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {status_title}
              </h2>
            </div>
          </div>

          {/* Big Confidence Score Pill */}
          <div className="flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 border-slate-800/60 pt-2 sm:pt-0">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Độ tin cậy
            </span>
            <div className="flex items-baseline space-x-1">
              <span className={`text-3xl font-black ${statusTheme.badgeText}`}>
                {confidence}%
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Status Description */}
        <p className="mt-3 text-xs sm:text-sm text-slate-300/90 leading-relaxed">
          {status_description}
        </p>
      </div>

      {/* Confidence Breakdown Bars */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Phân bố xác suất phân loại (Confidence Bar)
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {inference_time_ms ? `${inference_time_ms}ms` : 'Realtime'}
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {/* Fresh Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                🟢 Tươi (Fresh)
              </span>
              <span className="text-slate-200 font-mono">{pFresh}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pFresh}%` }}
              />
            </div>
          </div>

          {/* Aging Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                🟡 Bắt đầu suy giảm (Half-Fresh / Aging)
              </span>
              <span className="text-slate-200 font-mono">{pAging}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pAging}%` }}
              />
            </div>
          </div>

          {/* Frozen Damaged Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-sky-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                ❄️ Cháy đông / Đá tuyết (Frozen Damaged)
              </span>
              <span className="text-slate-200 font-mono">{pFrozen}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pFrozen}%` }}
              />
            </div>
          </div>

          {/* Spoiled Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                🔴 Ươn / Hỏng (Spoiled)
              </span>
              <span className="text-slate-200 font-mono">{pSpoiled}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pSpoiled}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Cooking Advice */}
      {safety_advice && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-teal-400">
              <Refrigerator className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Khuyến nghị bảo quản</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {safety_advice.storage}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400">
              <Flame className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Chế biến & Rủi ro</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {safety_advice.cooking}
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Mức độ rủi ro:</span>
              <span className={`text-[11px] font-bold ${statusTheme.badgeText}`}>
                {safety_advice.risk_level}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Colorimetric Spectroscopy Details (Collapsible/Informational) */}
      {color_metrics && (
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Chỉ số quang phổ màu (Colorimetric Metrics):
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {model_mode === 'onnx_model' ? 'Mô hình Deep Learning' : 'Heuristic Engine'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase">Tỷ lệ Đỏ/Xanh (R/G)</p>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{color_metrics.red_green_ratio}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase">Góc sắc thái (Hue)</p>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{color_metrics.hue_degrees}°</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase">Độ bão hòa (Sat)</p>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{color_metrics.saturation_pct}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase">Điểm tươi sống</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{color_metrics.freshness_index}/100</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
