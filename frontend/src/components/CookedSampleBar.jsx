import React, { useRef } from 'react';
import { Utensils } from 'lucide-react';

export default function CookedSampleBar({ onSelectSample, disabled }) {
  const generateSampleImage = (type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (type === 'boiled_fresh') {
      // 1. Fresh Boiled Pork (Ivory-cream, juicy cooked pork texture)
      const grad = ctx.createRadialGradient(200, 200, 30, 200, 200, 200);
      grad.addColorStop(0, '#f2ece4');
      grad.addColorStop(0.5, '#e4dcd2');
      grad.addColorStop(1, '#cfc4b6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 400);

      // Light meat striations
      ctx.strokeStyle = 'rgba(195, 180, 165, 0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 400; i += 12) {
        ctx.beginPath();
        ctx.moveTo(0, i + Math.sin(i) * 6);
        ctx.bezierCurveTo(130, i - 10, 260, i + 10, 400, i);
        ctx.stroke();
      }

      // Natural soft gloss
      const gloss = ctx.createRadialGradient(160, 150, 10, 160, 150, 100);
      gloss.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gloss;
      ctx.fillRect(0, 0, 400, 400);

    } else if (type === 'braised_aged') {
      // 2. Aged Braised Pork (Rich caramel amber base + cold congealed white fat crust)
      const grad = ctx.createLinearGradient(0, 0, 400, 400);
      grad.addColorStop(0, '#8c4819');
      grad.addColorStop(0.5, '#ab5e24');
      grad.addColorStop(1, '#66320d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 400);

      // Deep brown caramelized glaze lines
      ctx.strokeStyle = 'rgba(60, 25, 5, 0.6)';
      ctx.lineWidth = 4;
      for (let i = 0; i < 400; i += 24) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 40, 400);
        ctx.stroke();
      }

      // Congealed white fat patches (refrigerated lard crust)
      ctx.fillStyle = 'rgba(250, 248, 245, 0.95)';
      for (let i = 0; i < 9; i++) {
        const x = 50 + (i % 3) * 110 + (Math.sin(i) * 20);
        const y = 60 + Math.floor(i / 3) * 110;
        ctx.beginPath();
        ctx.ellipse(x, y, 35 + (i % 2) * 15, 22 + (i % 3) * 8, (i * 45 * Math.PI) / 180, 0, 2 * Math.PI);
        ctx.fill();
      }

    } else if (type === 'sausage_spoiled') {
      // 3. Spoiled / Slimy Sausage (Pinkish-grey base + olive green mold colonies & slimy glaze)
      const grad = ctx.createRadialGradient(200, 200, 20, 200, 200, 200);
      grad.addColorStop(0, '#ba8d88');
      grad.addColorStop(0.6, '#99736e');
      grad.addColorStop(1, '#6e504c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 400);

      // Bacterial slime glare patches
      const slimeGrad = ctx.createLinearGradient(80, 80, 260, 260);
      slimeGrad.addColorStop(0, 'rgba(240, 255, 220, 0.45)');
      slimeGrad.addColorStop(0.5, 'rgba(180, 220, 160, 0.3)');
      slimeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = slimeGrad;
      ctx.fillRect(50, 50, 300, 300);

      // Green & white fuzzy mold colonies
      const moldColors = ['#4d6938', '#5e7d44', '#7d945a', '#f0f5ec'];
      for (let i = 0; i < 28; i++) {
        const mx = 60 + ((i * 47) % 280);
        const my = 70 + ((i * 73) % 270);
        const radius = 6 + (i % 5) * 4;
        ctx.fillStyle = moldColors[i % moldColors.length];
        ctx.beginPath();
        ctx.arc(mx, my, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const filename = `${type}_test_sample.jpg`;
        const file = new File([blob], filename, { type: 'image/jpeg' });
        const previewUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve({ file, previewUrl });
      }, 'image/jpeg', 0.95);
    });
  };

  const handlePickSample = async (typeKey, category, hint) => {
    if (disabled) return;
    const { file, previewUrl } = await generateSampleImage(typeKey);
    onSelectSample({
      file,
      previewUrl,
      meatCategory: category,
      meatHint: hint
    });
  };

  const samples = [
    {
      id: 'boiled_fresh',
      title: 'Thịt Luộc Tươi',
      badge: '🟢 An toàn',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      category: 'cooked',
      hint: 'boiled_pork',
      desc: 'Săn chắc, mỡ trong tự nhiên'
    },
    {
      id: 'braised_aged',
      title: 'Thịt Kho Để Lâu',
      badge: '🟡 Cần kiểm tra',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      category: 'cooked',
      hint: 'braised_pork',
      desc: 'Mỡ đông trắng, để tủ lạnh lâu'
    },
    {
      id: 'sausage_spoiled',
      title: 'Giò / Xúc Xích Nhớt Thiu',
      badge: '🔴 Hỏng / Mốc',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      category: 'cooked',
      hint: 'processed_sausage',
      desc: 'Màng nhớt, đốm nấm mốc vi khuẩn'
    }
  ];

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-teal-400" />
          Mẫu thử nhanh đồ nấu chín (Cooked Quick-test):
        </span>
        <span className="text-[11px] font-mono text-slate-400">1-Click Test</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {samples.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => handlePickSample(s.id, s.category, s.hint)}
            className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-left flex flex-col justify-between group active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-start justify-between gap-1 mb-1">
              <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                {s.title}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap ${s.badgeColor}`}>
                {s.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">{s.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
