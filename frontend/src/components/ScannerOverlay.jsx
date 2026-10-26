import React, { useState, useEffect } from 'react';
import { Scan, Activity, Eye, Zap } from 'lucide-react';

export default function ScannerOverlay() {
  const [metricIndex, setMetricIndex] = useState(0);

  const statusTexts = [
    { label: 'Đang quét dải quang phổ RGB/HSV...', icon: Eye },
    { label: 'Phân tích sắc tố Oxymyoglobin & Metmyoglobin...', icon: Activity },
    { label: 'Kiểm tra độ bão hòa & Tỷ lệ đỏ/xanh...', icon: Zap },
    { label: 'Đánh giá nguy cơ vi sinh & Chỉ số tươi sống...', icon: Scan },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMetricIndex((prev) => (prev + 1) % statusTexts.length);
    }, 600);
    return () => clearInterval(timer);
  }, [statusTexts.length]);

  const CurrentIcon = statusTexts[metricIndex].icon;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl">
      {/* High-tech scanning grid background */}
      <div className="absolute inset-0 scanner-grid opacity-35" />

      {/* 4 Corner Targeting Brackets */}
      <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
      <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />

      {/* Center Target Reticle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-28 h-28 rounded-full border border-dashed border-emerald-400/40 animate-spin" style={{ animationDuration: '8s' }} />
        <div className="absolute w-20 h-20 rounded-full border border-emerald-500/30" />
        <div className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </div>

      {/* Sweeping Laser Bar (Moves vertically) */}
      <div className="absolute left-0 right-0 h-1.5 laser-beam animate-scanner-sweep" />

      {/* Real-time telemetry scanner HUD at the bottom */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 shadow-xl">
        <div className="flex items-center space-x-2">
          <CurrentIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-medium truncate">
            {statusTexts[metricIndex].label}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 pl-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
            SCANNING
          </span>
        </div>
      </div>
    </div>
  );
}
