import React, { useState } from 'react';
import { ClipboardCheck, Hand, Wind, Droplets, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SensoryChecklist({ aiStatus, detectedType = 'raw' }) {
  const isCooked = detectedType === 'cooked';

  // Sensory questionnaire state
  const [elasticity, setElasticity] = useState('good'); // raw: elasticity, cooked: room temp time
  const [smell, setSmell] = useState('normal'); // 'normal' or 'bad' (sour/rancid)
  const [texture, setTexture] = useState('dry'); // 'dry' (firm/dry) or 'slimy' (sticky/mucus)

  // Determine if there is a conflict between AI result and physical sensory findings
  const hasSensoryWarning = smell === 'bad' || texture === 'slimy' || elasticity === 'poor';
  const isConflictWithAiFresh = aiStatus === 'fresh' && (smell === 'bad' || texture === 'slimy');

  return (
    <div className="w-full bg-[#121824]/90 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-left space-y-4 backdrop-blur-sm">
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
        {/* Question 1: Odor / Smell for Cooked, Elasticity for Raw */}
        <div className="p-3.5 rounded-2xl bg-[#0B0F17]/70 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-200 text-xs font-semibold mb-2">
            {isCooked ? <Wind className="w-4 h-4 text-teal-400" /> : <Hand className="w-4 h-4 text-emerald-400" />}
            <span>{isCooked ? '1. Mùi hương khi ngửi gần:' : '1. Độ đàn hồi khi ấn tay:'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {isCooked ? (
              <>
                <button
                  type="button"
                  onClick={() => setSmell('normal')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    smell === 'normal'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ✅ Thơm mùi tự nhiên / gia vị nấu chín
                </button>
                <button
                  type="button"
                  onClick={() => setSmell('bad')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    smell === 'bad'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ❌ Mùi chua lên men, mùi ủng hoặc dầu ôi
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setElasticity('good')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    elasticity === 'good'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ✅ Đàn hồi tốt, không để lại vết lõm
                </button>
                <button
                  type="button"
                  onClick={() => setElasticity('poor')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    elasticity === 'poor'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ⚠️ Nhão, lún sâu không đàn hồi
                </button>
              </>
            )}
          </div>
        </div>

        {/* Question 2: Slime / Chopstick test for Cooked, Odor for Raw */}
        <div className="p-3.5 rounded-2xl bg-[#0B0F17]/70 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-200 text-xs font-semibold mb-2">
            {isCooked ? <Droplets className="w-4 h-4 text-cyan-400" /> : <Wind className="w-4 h-4 text-teal-400" />}
            <span>{isCooked ? '2. Kiểm tra độ nhớt / kéo sợi bằng đũa:' : '2. Mùi hương khi ngửi gần:'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {isCooked ? (
              <>
                <button
                  type="button"
                  onClick={() => setTexture('dry')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    texture === 'dry'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ✅ Khô ráo hoặc có lớp mỡ bóng, không dính
                </button>
                <button
                  type="button"
                  onClick={() => setTexture('slimy')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    texture === 'slimy'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ❌ Chạm đũa thấy nhớt dính kéo màng sợi
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSmell('normal')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    smell === 'normal'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ✅ Mùi đặc trưng tự nhiên của thịt
                </button>
                <button
                  type="button"
                  onClick={() => setSmell('bad')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    smell === 'bad'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ❌ Mùi chua, hăng hắc hoặc ôi thiu
                </button>
              </>
            )}
          </div>
        </div>

        {/* Question 3: Room temperature exposure for Cooked, Texture for Raw */}
        <div className="p-3.5 rounded-2xl bg-[#0B0F17]/70 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-200 text-xs font-semibold mb-2">
            {isCooked ? <Hand className="w-4 h-4 text-amber-400" /> : <Droplets className="w-4 h-4 text-cyan-400" />}
            <span>{isCooked ? '3. Thời gian để ngoài nhiệt độ phòng:' : '3. Độ dính / nhớt của bề mặt:'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {isCooked ? (
              <>
                <button
                  type="button"
                  onClick={() => setElasticity('good')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    elasticity === 'good'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ✅ Mới nấu hoặc cất tủ lạnh trong vòng 2h
                </button>
                <button
                  type="button"
                  onClick={() => setElasticity('poor')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    elasticity === 'poor'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ⚠️ Đã để ngoài phòng quá 2 tiếng (&gt;25°C)
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setTexture('dry')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    texture === 'dry'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ✅ Bề mặt khô ráo, hơi se mặt
                </button>
                <button
                  type="button"
                  onClick={() => setTexture('slimy')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    texture === 'slimy'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium'
                      : 'bg-[#121824] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  ❌ Bề mặt nhớt trơn, dính nhầy tay
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cross-Check Analysis Feedback */}
      {isConflictWithAiFresh ? (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start space-x-3 text-rose-200 text-xs leading-relaxed animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300 block mb-0.5 font-bold">
              Cảnh báo kiểm tra chéo: Phát hiện dấu hiệu ôi thiu / biến chất!
            </strong>
            {isCooked
              ? 'Dù màu sắc món ăn nhìn còn vàng ruộm hoặc óng ánh, nhưng bạn phát hiện mùi chua lạ hoặc nhớt dính kéo sợi bằng đũa. Đây là dấu hiệu vi sinh vật đã lên men sinh độc tố. Tuyệt đối KHÔNG ĐƯỢC ĂN dù hâm sôi lại!'
              : 'Dù hình ảnh camera cho thấy bề mặt còn sắc đỏ, nhưng bạn phát hiện mùi chua/hôi hoặc màng nhớt. Đây là dấu hiệu vi khuẩn kỵ khí phân giải protein từ bên trong. Tuyệt đối ưu tiên khứu giác/xúc giác và KHÔNG nên ăn.'}
          </div>
        </div>
      ) : hasSensoryWarning ? (
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start space-x-2.5 text-amber-200 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            {isCooked
              ? 'Món ăn có dấu hiệu giảm chất lượng hoặc để ngoài nhiệt độ phòng quá lâu. Nếu sử dụng, phải đun sôi sùng sục tối thiểu 5 phút (nhiệt độ tâm > 85°C) và không tiếp tục để lưu cữu.'
              : 'Cảm quan cho thấy miếng thịt có dấu hiệu giảm chất lượng. Nếu chế biến, cần rửa sạch, khử mùi bằng muối/rượu gừng và nấu thật kỹ ở nhiệt độ cao.'}
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center space-x-2.5 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            {isCooked
              ? 'Tuyệt vời! Kết quả kiểm tra cảm quan thực tế đồng nhất với chất lượng thơm ngon, an toàn của món ăn.'
              : 'Tuyệt vời! Kết quả kiểm tra cảm quan thực tế hoàn toàn đồng nhất với phân tích quang phổ tươi sống của AI.'}
          </span>
        </div>
      )}
    </div>
  );
}
