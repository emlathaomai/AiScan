import React, { useRef } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  ScanLine,
  Tag,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

export default function LabelScannerView({
  imagePreview,
  selectedFile,
  isScanning,
  onImageSelected,
  onResetImage,
  onStartScanLabel,
  onSelectSamplePreset
}) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onImageSelected(file, previewUrl);
    }
  };

  return (
    <div className="w-full bg-[#121824]/90 border border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md text-center space-y-5">
      {/* Viewfinder / Image Preview Zone */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#0B0F17] rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col items-center justify-center group">
        {imagePreview ? (
          <>
            <img
              src={imagePreview}
              alt="Tem nhãn chụp"
              className="w-full h-full object-contain"
            />
            {/* Viewfinder Target Frame Overlay */}
            <div className="absolute inset-4 sm:inset-8 border border-teal-500/30 rounded-xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-5 h-5 border-t-2 border-l-2 border-teal-400 rounded-tl-md" />
                <div className="w-5 h-5 border-t-2 border-r-2 border-teal-400 rounded-tr-md" />
              </div>
              <div className="flex justify-between">
                <div className="w-5 h-5 border-b-2 border-l-2 border-teal-400 rounded-bl-md" />
                <div className="w-5 h-5 border-b-2 border-r-2 border-teal-400 rounded-br-md" />
              </div>
            </div>
          </>
        ) : (
          /* Empty Viewfinder state with optical alignment guidance */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
            {/* Alignment Rectangular Reticle */}
            <div className="w-4/5 sm:w-3/4 max-w-sm h-36 sm:h-44 border-2 border-dashed border-teal-500/40 rounded-2xl flex flex-col items-center justify-center p-4 bg-teal-500/5 relative shadow-inner">
              {/* 4 Corner Markers */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-400 rounded-tl" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-400 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-teal-400 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-teal-400 rounded-br" />

              <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-2">
                <ScanLine className="w-5 h-5 animate-pulse" />
              </div>

              <p className="text-xs sm:text-sm font-semibold text-teal-300">
                Căn chỉnh tem nhãn siêu thị vào trong khung hình để đạt độ nét cao nhất
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Chụp thẳng góc, đủ ánh sáng, tránh bóng lóa đèn trên tem in nhiệt
              </p>
            </div>
          </div>
        )}

        {/* Laser Scanning Animation during OCR inference */}
        {isScanning && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 pointer-events-none">
            {/* Moving Laser Beam */}
            <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_#2dd4bf] animate-scanner" />
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/40 shadow-2xl flex items-center space-x-3 text-teal-300">
              <ScanLine className="w-5 h-5 animate-spin text-teal-400" />
              <span className="text-xs font-bold tracking-wide">
                Đang quét tiền xử lý OpenCV & trích xuất HSD...
              </span>
            </div>
          </div>
        )}

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs flex items-center space-x-2 shadow-lg shadow-teal-600/30 transition-transform active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span>Chụp ảnh tem nhãn</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center space-x-2 transition-transform active:scale-95"
        >
          <Upload className="w-4 h-4 text-teal-400" />
          <span>Tải ảnh từ thư viện</span>
        </button>

        {imagePreview && (
          <button
            type="button"
            onClick={onResetImage}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
            title="Đổi ảnh khác"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Test Presets (Supermarket Templates) */}
      <div className="pt-1 border-t border-slate-800/80">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Mẫu tem nhãn siêu thị thực tế để thử nghiệm nhanh:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Preset 1: MeatDeli Safe */}
          <button
            type="button"
            onClick={() => onSelectSamplePreset('meatdeli_bachi')}
            className="p-2.5 rounded-xl bg-[#0B0F17] hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                🟢 AN TOÀN
              </span>
              <span className="text-[9px] text-slate-500 font-mono">MeatDeli</span>
            </div>
            <p className="text-xs font-semibold text-slate-200 mt-1 truncate group-hover:text-emerald-300">
              Ba chỉ heo Quế Lâm
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Còn 3 ngày</p>
          </button>

          {/* Preset 2: CP Expiring Soon */}
          <button
            type="button"
            onClick={() => onSelectSamplePreset('cp_can_date')}
            className="p-2.5 rounded-xl bg-[#0B0F17] hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                🟡 CẬN DATE
              </span>
              <span className="text-[9px] text-slate-500 font-mono">CP Vietnam</span>
            </div>
            <p className="text-xs font-semibold text-slate-200 mt-1 truncate group-hover:text-amber-300">
              Nạc dăm heo tươi
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Hết hạn trong 18 giờ</p>
          </button>

          {/* Preset 3: Co.op Expired */}
          <button
            type="button"
            onClick={() => onSelectSamplePreset('coop_het_han')}
            className="p-2.5 rounded-xl bg-[#0B0F17] hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                🔴 HẾT HẠN
              </span>
              <span className="text-[9px] text-slate-500 font-mono">Co.op Select</span>
            </div>
            <p className="text-xs font-semibold text-slate-200 mt-1 truncate group-hover:text-rose-300">
              Thăn bò Úc tươi
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Quá hạn 2 ngày</p>
          </button>
        </div>
      </div>

      {/* Big Action Button */}
      {imagePreview && (
        <div className="pt-2">
          <button
            type="button"
            disabled={isScanning}
            onClick={onStartScanLabel}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-xl shadow-teal-950/50 transition-all duration-300 active:scale-98 disabled:opacity-50"
          >
            <ScanLine className="w-5 h-5 text-white animate-pulse" />
            <span>{isScanning ? 'ĐANG QUÉT TEM NHÃN...' : 'BẮT ĐẦU QUÉT TEM NHÃN OCR'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
