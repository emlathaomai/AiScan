/**
 * Utility to generate realistic supermarket label canvas graphics
 * for instant one-click testing of MeatGuard OCR label scanner.
 */

export function generateSampleLabelCanvas(presetKey) {
  const now = new Date();
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');

  let title = 'Ba Chỉ Heo Quế Lâm';
  let brand = 'MEATDELI';
  let weight = '400g';
  let price = '79.000 đ';
  let batch = 'MD-20261028-09';
  let headerColor = '#059669'; // Emerald
  let hsdDaysOffset = 3;
  let filename = 'meatdeli_bachi.jpg';

  if (presetKey === 'cp_can_date') {
    title = 'Nạc Dăm Heo Tươi';
    brand = 'C.P. VIETNAM';
    weight = '500g';
    price = '68.500 đ';
    batch = 'CP-HCM-882';
    headerColor = '#d97706'; // Amber
    hsdDaysOffset = 1;
    filename = 'cp_can_date.jpg';
  } else if (presetKey === 'coop_het_han') {
    title = 'Thịt Thăn Bò Úc';
    brand = 'CO.OP SELECT';
    weight = '300g';
    price = '115.000 đ';
    batch = 'CS-AU-0144';
    headerColor = '#e11d48'; // Rose
    hsdDaysOffset = -2;
    filename = 'coop_het_han.jpg';
  }

  // Format dates
  const mfg = new Date(now.getTime() - 2 * 24 * 3600 * 1000);
  const exp = new Date(now.getTime() + hsdDaysOffset * 24 * 3600 * 1000);

  const fmt = (d) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const mfgStr = fmt(mfg);
  const expStr = fmt(exp);

  // Background Ticket (Thermal Paper white)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 640, 420);

  // Outer border with ticket rounded corners
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, 624, 404);

  // Header Banner
  ctx.fillStyle = headerColor;
  ctx.fillRect(8, 8, 624, 65);

  // Brand text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
  ctx.fillText(brand, 25, 48);

  ctx.font = 'normal 13px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TEM KIỂM ĐỊNH NGUỒN GỐC & HẠN DÙNG', 320, 48);

  // Product Name
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
  ctx.fillText(title, 25, 115);

  // Divider line
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(25, 135);
  ctx.lineTo(615, 135);
  ctx.stroke();

  // Date and details table
  ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('NGÀY SẢN XUẤT (NSX):', 25, 175);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(mfgStr, 230, 175);

  ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('HẠN SỬ DỤNG (HSD):', 25, 215);
  ctx.fillStyle = headerColor;
  ctx.font = 'bold 20px monospace';
  ctx.fillText(expStr, 230, 215);

  ctx.font = 'normal 14px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText(`Khối lượng tịnh: ${weight}`, 25, 255);
  ctx.fillText(`Giá thành: ${price}`, 240, 255);
  ctx.fillText(`Số lô: ${batch}`, 440, 255);

  // Storage tip
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(25, 280, 590, 40);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.strokeRect(25, 280, 590, 40);
  ctx.fillStyle = '#334155';
  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Bảo quản ở nhiệt độ 0°C đến 4°C. Sử dụng ngay sau khi mở bao bì.', 35, 305);

  // Barcode mockup
  ctx.fillStyle = '#0F172A';
  for (let x = 120; x < 520; x += 8) {
    const barWidth = (x % 3 === 0) ? 5 : (x % 5 === 0) ? 3 : 2;
    ctx.fillRect(x, 340, barWidth, 45);
  }
  ctx.font = '13px monospace';
  ctx.fillText('8 935028 109284', 255, 402);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

  // Convert to File
  const byteString = atob(dataUrl.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: 'image/jpeg' });
  const file = new File([blob], filename, { type: 'image/jpeg' });

  return { dataUrl, file, filename };
}
