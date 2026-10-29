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
  Clock,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultCard({ result }) {
  const freshness_status = result?.freshness_status;

  // Trigger celebration confetti if fresh (unconditional hook)
  useEffect(() => {
    if (freshness_status === 'fresh') {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      } catch {
        // Safe fallback
      }
    }
  }, [freshness_status]);

  if (!result) return null;

  const {
    status_title,
    status_description,
    confidence,
    probabilities = { fresh: 0, aging: 0, frozen_damaged: 0, spoiled: 0 },
    detected_meat: _detected_meat,
    meat_name_vn,
    detected_type,
    risk_level,
    indicators_found = [],
    recommendation,
    color_metrics,
    cv_inspection,
    safety_advice,
    model_mode,
    inference_time_ms
  } = result;

  // Color config according to status
  const statusTheme = {
    fresh: {
      badgeBg: 'bg-emerald-500/10',
      badgeBorder: 'border-emerald-500/25',
      badgeText: 'text-emerald-400',
      accentColor: '#10b981',
      barColor: 'bg-emerald-500',
      glowRing: 'ring-emerald-500/15',
      Icon: CheckCircle,
      tag: '🟢 AN TOÀN'
    },
    aging: {
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/25',
      badgeText: 'text-amber-400',
      accentColor: '#f59e0b',
      barColor: 'bg-amber-500',
      glowRing: 'ring-amber-500/15',
      Icon: AlertTriangle,
      tag: '🟡 CẦN NẤU NGAY'
    },
    frozen_damaged: {
      badgeBg: 'bg-sky-500/10',
      badgeBorder: 'border-sky-500/25',
      badgeText: 'text-sky-400',
      accentColor: '#0ea5e9',
      barColor: 'bg-sky-500',
      glowRing: 'ring-sky-500/15',
      Icon: Snowflake,
      tag: '❄️ CHÁY ĐÔNG / ĐÓNG ĐÁ'
    },
    spoiled: {
      badgeBg: 'bg-rose-500/10',
      badgeBorder: 'border-rose-500/25',
      badgeText: 'text-rose-400',
      accentColor: '#f43f5e',
      barColor: 'bg-rose-500',
      glowRing: 'ring-rose-500/15',
      Icon: XCircle,
      tag: '🔴 NGUY CƠ NHIỄM KHUẨN'
    }
  }[freshness_status] || {
    badgeBg: 'bg-slate-500/10',
    badgeBorder: 'border-slate-500/25',
    badgeText: 'text-slate-400',
    accentColor: '#94a3b8',
    barColor: 'bg-slate-500',
    glowRing: 'ring-slate-500/15',
    Icon: CheckCircle,
    tag: 'CHƯA RÕ'
  };

  const StatusIcon = statusTheme?.Icon || CheckCircle;

  // Format percentages safely
  const pFresh = Math.round(((probabilities && probabilities.fresh) || 0) * 100);
  const pAging = Math.round(((probabilities && probabilities.aging) || 0) * 100);
  const pFrozen = Math.round(((probabilities && probabilities.frozen_damaged) || 0) * 100);
  const pSpoiled = Math.round(((probabilities && probabilities.spoiled) || 0) * 100);

  return (
    <div className="w-full bg-[#121824]/90 border border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 text-left animate-fadeIn backdrop-blur-sm">
      {/* Status Header Banner */}
      <div className={`p-5 rounded-2xl ${statusTheme.badgeBg} border ${statusTheme.badgeBorder} ring-1 ${statusTheme.glowRing} relative overflow-hidden shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#0B0F17]/70 border ${statusTheme.badgeBorder}`}>
              <StatusIcon className={`w-7 h-7 ${statusTheme.badgeText}`} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0B0F17]/80 border border-slate-800 text-slate-300">
                  {statusTheme.tag}
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  detected_type === 'cooked'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}>
                  {detected_type === 'cooked' ? '🍲 Thịt Đã Nấu Chín' : '🥩 Thịt Tươi Sống'}
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

      {/* Actionable Recommendation Callout */}
      {recommendation && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed flex items-start gap-3 shadow-md ${
          risk_level === 'danger'
            ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
            : risk_level === 'medium'
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
        }`}>
          <ShieldAlert className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            risk_level === 'danger' ? 'text-rose-400' : risk_level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
          }`} />
          <div>
            <strong className="block font-bold mb-0.5">Khuyến nghị từ MeatGuard:</strong>
            <span>{recommendation}</span>
          </div>
        </div>
      )}

      {/* Visual Indicators Found */}
      {indicators_found && indicators_found.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F17]/70 border border-slate-800/80 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Dấu hiệu quang học nhận diện:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {indicators_found.map((ind, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#121824]/90 border border-slate-800 text-xs text-slate-300">
                <span className={`font-bold mt-0.5 ${
                  risk_level === 'danger' ? 'text-rose-400' : risk_level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                }`}>•</span>
                <span>{ind}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Breakdown Bars */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F17]/70 border border-slate-800/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Phân bố xác suất phân loại
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
                🟢 Tươi
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
                🟡 Bắt đầu suy giảm
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
                ❄️ Cháy đông / Đá tuyết
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
                🔴 Ươn / Hỏng
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

      {/* OpenCV Computer Vision Guardrail Inspection */}
      {cv_inspection && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F17]/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ThermometerSnowflake className="w-4 h-4 text-sky-400" />
              Kiểm định quang học OpenCV
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
              HSV Thresholding
            </span>
          </div>

          {/* Warning alert banner if threshold exceeded */}
          {cv_inspection.guardrail_verdict && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Cảnh báo thị giác máy tính:</span> {cv_inspection.guardrail_verdict}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {detected_type === 'cooked' ? (
              <>
                {/* Cooked: Mold Colonies */}
                <div className="p-3 rounded-xl bg-[#121824]/90 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      Đốm nấm mốc xanh/trắng:
                    </span>
                    <span className={`font-mono font-bold ${cv_inspection.mold_threshold_exceeded ? 'text-rose-400' : 'text-slate-300'}`}>
                      {cv_inspection.mold_ratio_pct || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cv_inspection.mold_threshold_exceeded ? 'bg-rose-500' : 'bg-slate-500'}`}
                      style={{ width: `${Math.min((cv_inspection.mold_ratio_pct || 0) * 5, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Ngưỡng cảnh báo: &gt;2%</span>
                    <span className={cv_inspection.mold_threshold_exceeded ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                      {cv_inspection.mold_threshold_exceeded ? '⚠️ Phát hiện nấm mốc' : '✓ Sạch mốc'}
                    </span>
                  </div>
                </div>

                {/* Cooked: Congealed Fat / Mỡ đông tủ lạnh */}
                <div className="p-3 rounded-xl bg-[#121824]/90 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Snowflake className="w-3.5 h-3.5 text-sky-400" />
                      Lớp mỡ đông trắng đục:
                    </span>
                    <span className={`font-mono font-bold ${cv_inspection.congealed_fat_exceeded ? 'text-amber-400' : 'text-slate-300'}`}>
                      {cv_inspection.white_ratio_pct || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cv_inspection.congealed_fat_exceeded ? 'bg-amber-500' : 'bg-slate-500'}`}
                      style={{ width: `${Math.min(cv_inspection.white_ratio_pct || 0, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Ngưỡng trữ lạnh: &gt;18%</span>
                    <span className={cv_inspection.congealed_fat_exceeded ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                      {cv_inspection.congealed_fat_exceeded ? '⚠️ Để tủ lạnh lâu' : '✓ Bình thường'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Raw: Ice / White Frost Mask */}
                <div className="p-3 rounded-xl bg-[#121824]/90 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Snowflake className="w-3.5 h-3.5 text-sky-400" />
                      Tỷ lệ mảng trắng / Đá tuyết:
                    </span>
                    <span className={`font-mono font-bold ${cv_inspection.white_threshold_exceeded ? 'text-sky-400' : 'text-slate-300'}`}>
                      {cv_inspection.white_ratio_pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cv_inspection.white_threshold_exceeded ? 'bg-sky-400' : 'bg-slate-500'}`}
                      style={{ width: `${Math.min(cv_inspection.white_ratio_pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Ngưỡng cảnh báo: &gt;15%</span>
                    <span className={cv_inspection.white_threshold_exceeded ? 'text-sky-400 font-semibold' : 'text-emerald-400'}>
                      {cv_inspection.white_threshold_exceeded ? '⚠️ Vượt ngưỡng cháy đông' : '✓ An toàn'}
                    </span>
                  </div>
                </div>

                {/* Raw: Dark / Necrotic Mask */}
                <div className="p-3 rounded-xl bg-[#121824]/90 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      Tỷ lệ thâm sẫm / Biến chất:
                    </span>
                    <span className={`font-mono font-bold ${cv_inspection.dark_threshold_exceeded ? 'text-rose-400' : 'text-slate-300'}`}>
                      {cv_inspection.dark_ratio_pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cv_inspection.dark_threshold_exceeded ? 'bg-rose-500' : 'bg-slate-500'}`}
                      style={{ width: `${Math.min(cv_inspection.dark_ratio_pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Ngưỡng cảnh báo: &gt;40%</span>
                    <span className={cv_inspection.dark_threshold_exceeded ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                      {cv_inspection.dark_threshold_exceeded ? '⚠️ Vượt ngưỡng biến chất' : '✓ An toàn'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Safety & Cooking Advice */}
      {safety_advice && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#0B0F17]/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-2 text-teal-400">
              <Refrigerator className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Khuyến nghị bảo quản</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {safety_advice.storage}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0F17]/70 border border-slate-800/80 space-y-2">
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

      {/* Certificate Shortcut Button */}
      <button
        type="button"
        onClick={() => {
          const el = document.getElementById('inspection-certificate-view');
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 border border-emerald-500/30 text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
      >
        <Award className="w-4 h-4 text-emerald-400" />
        <span>Xem & Xuất Phiếu Kiểm Định Chất Lượng Số</span>
      </button>

      {/* Colorimetric Spectroscopy Details (Collapsible/Informational) */}
      {color_metrics && (
        <div className="p-4 rounded-2xl bg-[#0B0F17]/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Chỉ số quang phổ màu:
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
              {model_mode === 'onnx_model' ? 'Mô hình Deep Learning' : 'Heuristic Engine'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#121824]/90 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Tỷ lệ Đỏ/Xanh</p>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{color_metrics.red_green_ratio}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#121824]/90 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Góc sắc thái</p>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{color_metrics.hue_degrees}°</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#121824]/90 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Độ bão hòa</p>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{color_metrics.saturation_pct}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#121824]/90 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Điểm tươi sống</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{color_metrics.freshness_index}/100</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
