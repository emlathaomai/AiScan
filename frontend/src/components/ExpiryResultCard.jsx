import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Refrigerator,
  Tag,
  Package,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

export default function ExpiryResultCard({
  result,
  imagePreview,
  onAddToFridge,
  isAddedToFridge
}) {
  const [showRawText, setShowRawText] = useState(false);

  if (!result) return null;

  const {
    product_name = 'Thịt tươi đóng khay',
    brand = 'Nhãn thực phẩm',
    mfg_date = 'Chưa xác định',
    exp_date = 'Chưa xác định',
    expiry_status = 'safe',
    status_title = 'ĐẠT CHUẨN AN TOÀN',
    expiry_badge = '🟢 AN TOÀN',
    remaining_text = 'Còn hạn',
    remaining_days = 3,
    net_weight,
    price,
    batch_code,
    advice,
    storage_advice,
    raw_text_detected,
    ocr_mode,
    scanner_time_ms
  } = result;

  // Theme configuration based on expiry status
  const themes = {
    safe: {
      cardBorder: 'border-emerald-500/40',
      glow: 'shadow-emerald-950/40',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      bannerBg: 'bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-teal-950/40 border-emerald-500/30',
      countdownBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      countdownText: 'text-emerald-400',
      Icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      actionBtnBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 text-white'
    },
    expiring_soon: {
      cardBorder: 'border-amber-500/50',
      glow: 'shadow-amber-950/40',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      bannerBg: 'bg-gradient-to-r from-amber-950/50 via-amber-900/25 to-yellow-950/40 border-amber-500/40',
      countdownBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      countdownText: 'text-amber-400',
      Icon: AlertTriangle,
      iconColor: 'text-amber-400',
      actionBtnBg: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 text-white'
    },
    expired: {
      cardBorder: 'border-rose-500/50',
      glow: 'shadow-rose-950/40',
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      bannerBg: 'bg-gradient-to-r from-rose-950/50 via-rose-900/25 to-red-950/40 border-rose-500/40',
      countdownBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      countdownText: 'text-rose-400',
      Icon: XCircle,
      iconColor: 'text-rose-400',
      actionBtnBg: 'bg-slate-700 hover:bg-slate-600 shadow-slate-900/30 text-slate-300'
    }
  };

  const theme = themes[expiry_status] || themes.safe;
  const StatusIcon = theme?.Icon || ShieldCheck;

  return (
    <div className={`w-full bg-[#121824]/90 border ${theme.cardBorder} rounded-3xl p-5 sm:p-7 shadow-2xl ${theme.glow} text-left space-y-5 backdrop-blur-md transition-all duration-300`}>
      {/* Top Header: Supermarket Brand & OCR Tag */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 shadow-inner">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {brand}
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700 font-bold">
                {ocr_mode === 'tesseract_engine' ? 'Tesseract OCR' : 'Smart Supermarket OCR'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {product_name}
            </h3>
          </div>
        </div>

        {/* Thumbnail Preview */}
        {imagePreview && (
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700/80 shadow-md flex-shrink-0 bg-slate-950">
            <img
              src={imagePreview}
              alt="Tem nhãn đã quét"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Prominent Status Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${theme.bannerBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner`}>
        <div className="flex items-start sm:items-center space-x-3">
          <div className={`p-2 rounded-xl bg-slate-950/60 border border-slate-800 ${theme.iconColor}`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block ${theme.badgeBg}`}>
              {expiry_badge}
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-white mt-1">
              {status_title}
            </h4>
          </div>
        </div>

        {/* Countdown Box */}
        <div className={`px-4 py-2.5 rounded-xl border ${theme.countdownBg} text-center flex-shrink-0 shadow-sm`}>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Thời gian còn lại</span>
          </div>
          <div className={`text-base sm:text-lg font-black tracking-tight mt-0.5 ${theme.countdownText}`}>
            {remaining_text}
          </div>
        </div>
      </div>

      {/* Key Dates Grid: NSX & HSD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* NSX */}
        <div className="p-3.5 rounded-2xl bg-[#0B0F17]/80 border border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 flex-shrink-0">
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Ngày sản xuất (NSX):</p>
            <p className="text-sm font-bold text-slate-100 font-mono tracking-wide">{mfg_date}</p>
          </div>
        </div>

        {/* HSD */}
        <div className="p-3.5 rounded-2xl bg-[#0B0F17]/80 border border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 flex-shrink-0">
            <Calendar className={`w-5 h-5 ${theme.iconColor}`} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Hạn sử dụng (HSD):</p>
            <p className={`text-sm font-black font-mono tracking-wide ${theme.countdownText}`}>{exp_date}</p>
          </div>
        </div>
      </div>

      {/* Packaging & Batch Details if detected */}
      {(net_weight || batch_code || price) && (
        <div className="p-3 rounded-2xl bg-[#0B0F17]/50 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {net_weight && (
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Package className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400">Khối lượng:</span>
              <strong className="text-slate-200">{net_weight}</strong>
            </div>
          )}
          {price && (
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-slate-400">Giá bán:</span>
              <strong className="text-emerald-400 font-semibold">{price}</strong>
            </div>
          )}
          {batch_code && (
            <div className="flex items-center space-x-1.5 text-slate-300 font-mono text-[11px]">
              <span className="text-slate-400">Lô:</span>
              <span className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{batch_code}</span>
            </div>
          )}
        </div>
      )}

      {/* Chef & Storage Advice Box */}
      <div className="p-4 rounded-2xl bg-[#0B0F17]/70 border border-slate-800/80 space-y-2">
        <div className="flex items-center space-x-2 text-amber-400">
          <Sparkles className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Khuyến nghị bảo quản & an toàn</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {advice}
        </p>
        {storage_advice && (
          <div className="pt-1.5 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-start gap-1.5">
            <span className="font-bold text-slate-300 flex-shrink-0">Lưu ý:</span>
            <span>{storage_advice}</span>
          </div>
        )}
      </div>

      {/* Action Buttons: Save to Virtual Fridge & Raw Text Dropdown */}
      <div className="pt-1 space-y-3">
        <button
          type="button"
          onClick={onAddToFridge}
          disabled={isAddedToFridge}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-98 disabled:opacity-80 ${
            isAddedToFridge
              ? 'bg-emerald-600 text-white cursor-default'
              : theme.actionBtnBg
          }`}
        >
          {isAddedToFridge ? (
            <>
              <Check className="w-4 h-4" />
              <span>Đã lưu vào Tủ Lạnh Ảo thành công!</span>
            </>
          ) : (
            <>
              <Refrigerator className="w-4 h-4" />
              <span>Thêm vào Tủ Lạnh Ảo MeatGuard</span>
            </>
          )}
        </button>

        {/* Collapsible raw OCR text for transparency */}
        {raw_text_detected && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showRawText ? 'Ẩn văn bản OCR gốc' : 'Xem chi tiết văn bản máy đọc (OCR Text)'}</span>
              {showRawText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showRawText && (
              <pre className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 font-mono text-left whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                {raw_text_detected}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
