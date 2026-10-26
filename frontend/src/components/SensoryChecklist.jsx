import React, { useState } from 'react';
import { ClipboardCheck, Hand, Wind, Droplets, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SensoryChecklist({ aiStatus }) {
  // Sensory questionnaire state
  const [elasticity, setElasticity] = useState('good'); // 'good' (elastic) or 'poor' (dented)
  const [smell, setSmell] = useState('normal'); // 'normal' or 'bad' (sour/rancid)
  const [texture, setTexture] = useState('dry'); // 'dry' (firm/dry) or 'slimy' (sticky/mucus)

  // Determine if there is a conflict between AI result and physical sensory findings
  const hasSensoryWarning = smell === 'bad' || texture === 'slimy' || elasticity === 'poor';
  const isConflictWithAiFresh = aiStatus === 'fresh' && (smell === 'bad' || texture === 'slimy');

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl text-left space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Kiểm Tra Cảm Quan Bổ Sung</h3>
            <p className="text-[11px] text-slate-400">Kiểm tra chéo xúc giác & khứu giác thực tế</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Tự Kiểm Tra
        </span>
      </div>

      {/* Interactive 3 Sensory Questions */}
      <div className="space-y-3">
        {/* 1. Elasticity */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-200 text-xs font-semibold mb-2">
            <Hand className="w-4 h-4 text-emerald-400" />
            <span>1. Độ đàn hồi khi ấn tay:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setElasticity('good')}
              className={`p-2 rounded-xl border text-left transition-all ${
                elasticity === 'good'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ✅ Đàn hồi tốt, không để lại vết lõm
            </button>
            <button
              type="button"
              onClick={() => setElasticity('poor')}
              className={`p-2 rounded-xl border text-left transition-all ${
                elasticity === 'poor'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚠️ Nhão, lún sâu không đàn hồi
            </button>
          </div>
        </div>

        {/* 2. Smell / Odor */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-200 text-xs font-semibold mb-2">
            <Wind className="w-4 h-4 text-teal-400" />
            <span>2. Mùi hương khi ngửi gần:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSmell('normal')}
              className={`p-2 rounded-xl border text-left transition-all ${
                smell === 'normal'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ✅ Mùi đặc trưng tự nhiên của thịt
            </button>
            <button
              type="button"
              onClick={() => setSmell('bad')}
              className={`p-2 rounded-xl border text-left transition-all ${
                smell === 'bad'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ❌ Mùi chua, hăng hắc hoặc ôi thiu
            </button>
          </div>
        </div>

        {/* 3. Surface texture / stickiness */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-200 text-xs font-semibold mb-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span>3. Độ dính / nhớt của bề mặt:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setTexture('dry')}
              className={`p-2 rounded-xl border text-left transition-all ${
                texture === 'dry'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ✅ Bề mặt khô ráo, hơi se mặt
            </button>
            <button
              type="button"
              onClick={() => setTexture('slimy')}
              className={`p-2 rounded-xl border text-left transition-all ${
                texture === 'slimy'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ❌ Bề mặt nhớt trơn, dính nhầy tay
            </button>
          </div>
        </div>
      </div>

      {/* Cross-Check Analysis Feedback */}
      {isConflictWithAiFresh ? (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start space-x-3 text-rose-200 text-xs leading-relaxed animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300 block mb-0.5">
              Cảnh báo kiểm tra chéo: Phát hiện dấu hiệu biến chất!
            </strong>
            Dù hình ảnh camera cho thấy bề mặt còn sắc đỏ, nhưng bạn phát hiện mùi chua/hôi hoặc màng nhớt. Đây là dấu hiệu vi khuẩn kỵ khí phân giải protein từ bên trong. <strong>Tuyệt đối ưu tiên khứu giác/xúc giác và KHÔNG nên ăn.</strong>
          </div>
        </div>
      ) : hasSensoryWarning ? (
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start space-x-2.5 text-amber-200 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            Cảm quan cho thấy miếng thịt có dấu hiệu giảm chất lượng. Nếu chế biến, cần rửa sạch, khử mùi bằng muối/rượu gừng và nấu thật kỹ ở nhiệt độ cao.
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center space-x-2.5 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Tuyệt vời! Kết quả kiểm tra cảm quan thực tế hoàn toàn đồng nhất với phân tích quang phổ tươi sống của AI.
          </span>
        </div>
      )}
    </div>
  );
}
