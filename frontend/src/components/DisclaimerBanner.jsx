import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-amber-950/40 border border-amber-500/30 p-3.5 shadow-sm text-left backdrop-blur-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex-1 pr-6">
          <p className="text-xs font-semibold text-amber-300 mb-0.5">Khuyến cáo an toàn thực phẩm</p>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Kết quả AI từ camera chỉ mang tính chất tham khảo trực quan bề mặt, luôn kiểm tra thêm mùi và hạn sử dụng trước khi nấu.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 text-amber-400/60 hover:text-amber-200 hover:bg-amber-900/40 rounded-md transition-colors"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
