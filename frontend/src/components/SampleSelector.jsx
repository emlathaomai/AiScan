import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Generates an in-memory sample image data URL with specific RGB color distributions
 * mimicking meat tissue appearance for instant demo testing.
 */
function createMeatSampleDataUrl(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Fill background plate/board
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 400, 400);

  // Meat base shape
  ctx.beginPath();
  ctx.ellipse(200, 200, 140, 110, Math.PI / 8, 0, Math.PI * 2);

  if (type === 'fresh_beef') {
    // Rich oxymyoglobin red
    const grad = ctx.createRadialGradient(200, 200, 20, 200, 200, 140);
    grad.addColorStop(0, '#c52222');
    grad.addColorStop(0.7, '#a51818');
    grad.addColorStop(1, '#830f0f');
    ctx.fillStyle = grad;
    ctx.fill();

    // Marbling fat lines (cream white)
    ctx.strokeStyle = 'rgba(255, 245, 235, 0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(130, 180);
    ctx.bezierCurveTo(170, 210, 220, 170, 270, 210);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.bezierCurveTo(190, 170, 230, 140, 260, 160);
    ctx.stroke();
  } else if (type === 'fresh_pork') {
    // Tender pink
    const grad = ctx.createRadialGradient(200, 200, 20, 200, 200, 140);
    grad.addColorStop(0, '#f87171');
    grad.addColorStop(0.7, '#e15050');
    grad.addColorStop(1, '#c03838');
    ctx.fillStyle = grad;
    ctx.fill();

    // Fat rim
    ctx.strokeStyle = 'rgba(255, 248, 240, 0.85)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(200, 200, 115, -0.4, 1.2);
    ctx.stroke();
  } else if (type === 'fresh_poultry') {
    // Light peach/ivory poultry
    const grad = ctx.createRadialGradient(200, 200, 20, 200, 200, 140);
    grad.addColorStop(0, '#fed7aa');
    grad.addColorStop(0.6, '#fdba74');
    grad.addColorStop(1, '#fb923c');
    ctx.fillStyle = grad;
    ctx.fill();
  } else if (type === 'aging_meat') {
    // Metmyoglobin oxidation (brownish/greyish red)
    const grad = ctx.createRadialGradient(200, 200, 20, 200, 200, 140);
    grad.addColorStop(0, '#8c583c');
    grad.addColorStop(0.7, '#714227');
    grad.addColorStop(1, '#532e18');
    ctx.fillStyle = grad;
    ctx.fill();

    // Dry patches
    ctx.fillStyle = 'rgba(60, 30, 15, 0.4)';
    ctx.beginPath();
    ctx.arc(230, 190, 40, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'frozen_meat') {
    // Dark oxidized dry brown base with ice crust
    const grad = ctx.createRadialGradient(200, 200, 20, 200, 200, 140);
    grad.addColorStop(0, '#664a38');
    grad.addColorStop(0.7, '#4d3322');
    grad.addColorStop(1, '#331f13');
    ctx.fillStyle = grad;
    ctx.fill();

    // Thick ice crystals & white frost patches
    ctx.fillStyle = 'rgba(235, 245, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(170, 170, 45, 0, Math.PI * 2);
    ctx.arc(230, 220, 50, 0, Math.PI * 2);
    ctx.arc(150, 230, 35, 0, Math.PI * 2);
    ctx.fill();

    // Frost spiky speckles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    for (let i = 0; i < 25; i++) {
      ctx.fillRect(130 + (i * 9) % 140, 140 + (i * 13) % 120, 4, 4);
    }
  } else if (type === 'spoiled_meat') {
    // Greenish-gray decomposition
    const grad = ctx.createRadialGradient(200, 200, 20, 200, 200, 140);
    grad.addColorStop(0, '#5f6f52');
    grad.addColorStop(0.6, '#49583d');
    grad.addColorStop(1, '#343f2b');
    ctx.fillStyle = grad;
    ctx.fill();

    // Bacterial slime discoloration spots
    ctx.fillStyle = 'rgba(100, 130, 80, 0.6)';
    ctx.beginPath();
    ctx.arc(180, 210, 35, 0, Math.PI * 2);
    ctx.arc(240, 180, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}

// Convert Data URL to File object
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default function SampleSelector({ onSelectSample, disabled }) {
  const samples = [
    {
      id: 'fresh_beef',
      name: '🥩 Bò Tươi',
      badge: 'Tươi (Fresh)',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      meatHint: 'beef',
      fileName: 'sample_fresh_beef.jpg'
    },
    {
      id: 'fresh_pork',
      name: '🥩 Lợn Tươi',
      badge: 'Tươi (Fresh)',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      meatHint: 'pork',
      fileName: 'sample_fresh_pork.jpg'
    },
    {
      id: 'fresh_poultry',
      name: '🍗 Gà Tươi',
      badge: 'Tươi (Fresh)',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      meatHint: 'poultry',
      fileName: 'sample_fresh_poultry.jpg'
    },
    {
      id: 'aging_meat',
      name: '🍖 Thịt Cũ',
      badge: 'Suy giảm (Aging)',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      meatHint: 'beef',
      fileName: 'sample_aging_beef.jpg'
    },
    {
      id: 'frozen_meat',
      name: '❄️ Cháy Đông',
      badge: 'Đá tuyết (Burn)',
      badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      meatHint: 'beef',
      fileName: 'sample_frozen_damaged.jpg'
    },
    {
      id: 'spoiled_meat',
      name: '⚠️ Thịt Ươn',
      badge: 'Hỏng (Spoiled)',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      meatHint: 'beef',
      fileName: 'sample_spoiled_meat.jpg'
    }
  ];

  const handleChoose = (sample) => {
    if (disabled) return;
    const dataUrl = createMeatSampleDataUrl(sample.id);
    const file = dataURLtoFile(dataUrl, sample.fileName);
    onSelectSample({
      file,
      previewUrl: dataUrl,
      meatHint: sample.meatHint,
      sampleName: sample.name
    });
  };

  return (
    <div className="w-full text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Hoặc thử nhanh với mẫu có sẵn:
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {samples.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => handleChoose(s)}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all text-center group disabled:opacity-50"
          >
            <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
              {s.name}
            </span>
            <span className={`mt-1 text-[10px] px-1.5 py-0.2 rounded border font-medium ${s.badgeClass}`}>
              {s.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
