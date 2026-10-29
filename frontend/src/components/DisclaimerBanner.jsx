import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-amber-50/90 border border-amber-200/90 p-3.5 shadow-xs text-left backdrop-blur-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex-1 pr-6">
          <p className="text-xs font-semibold text-amber-900 mb-0.5">Khuyến cáo an toàn thực phẩm</p>
          <p className="text-xs text-amber-800/90 leading-relaxed">
            Kết quả AI từ camera chỉ mang tính chất tham khảo trực quan bề mặt, luôn kiểm tra thêm mùi và hạn sử dụng trước khi nấu.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 text-amber-600/70 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-colors"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
