import React, { useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Snowflake,
  Download,
  Share2,
  FileText,
  Copy,
  Check,
  Award,
  Sparkles,
  Calendar,
  Hash,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

/**
 * Safe UTF-8 Base64 serialization for Vietnamese strings in QR code URL
 */
export function encodeCertPayload(data) {
  try {
    const json = JSON.stringify(data);
    return btoa(
      encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode('0x' + p1)
      )
    );
  } catch (err) {
    console.error('Failed to encode cert payload:', err);
    return '';
  }
}

export function decodeCertPayload(b64) {
  try {
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(b64), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (err) {
    console.error('Failed to decode cert payload:', err);
    return null;
  }
}

export default function InspectionCertificate({
  result,
  imagePreview,
  certId: customCertId,
  isVerifiedFromUrl = false
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const certificateRef = useRef(null);

  // Persistent fallback values defined unconditionally at top level
  const fallbackCertId = useRef(
    customCertId || `#MG-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  );
  const fallbackTimestamp = useRef(
    new Date().toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  );

  if (!result) return null;

  const certId = customCertId || result.certId || fallbackCertId.current;
  const timestamp = result.scannedAt || fallbackTimestamp.current;

  const {
    freshness_status = 'fresh',
    status_title = 'Tươi ngon',
    confidence = 98,
    detected_meat = 'beef',
    meat_name_vn = 'Thịt Bò',
    detected_type = 'raw',
    sub_category,
    risk_level = 'low',
    indicators_found = [],
    recommendation,
    safety_advice,
    color_metrics,
    cv_inspection
  } = result;

  // Grade & Stamp Configuration
  const certGrade = {
    fresh: {
      grade: 'HẠNG A',
      title: 'ĐẠT CHUẨN AN TOÀN',
      subtitle: 'Tươi mới tự nhiên - An tâm tiêu thụ',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
      stampBorder: 'border-emerald-500',
      stampText: 'text-emerald-400',
      stampBg: 'bg-emerald-950/40',
      accentColor: '#10b981',
      Icon: CheckCircle,
      ribbonText: 'MEATGUARD CERTIFIED SAFE'
    },
    aging: {
      grade: 'HẠNG B',
      title: 'CHÚ Ý - CHẾ BIẾN NGAY',
      subtitle: 'Bắt đầu lão hóa - Cần nấu chín kỹ trên 85°C',
      badgeBg: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
      stampBorder: 'border-amber-500',
      stampText: 'text-amber-400',
      stampBg: 'bg-amber-950/40',
      accentColor: '#f59e0b',
      Icon: AlertTriangle,
      ribbonText: 'EAT SOON - HANDLE WITH CARE'
    },
    frozen_damaged: {
      grade: 'HẠNG C',
      title: 'CHÁY ĐÔNG / ĐÓNG ĐÁ',
      subtitle: 'Mất nước protein - Suy giảm dưỡng chất',
      badgeBg: 'bg-sky-500/10 border-sky-500/40 text-sky-400',
      stampBorder: 'border-sky-500',
      stampText: 'text-sky-400',
      stampBg: 'bg-sky-950/40',
      accentColor: '#0ea5e9',
      Icon: Snowflake,
      ribbonText: 'FREEZER BURN INSPECTED'
    },
    spoiled: {
      grade: 'HẠNG F',
      title: 'CẢNH BÁO - NGUY CƠ HỎNG',
      subtitle: 'Nhiễm khuẩn / Đổi màu - Tuyệt đối không ăn',
      badgeBg: 'bg-rose-500/10 border-rose-500/40 text-rose-400',
      stampBorder: 'border-rose-500',
      stampText: 'text-rose-400',
      stampBg: 'bg-rose-950/40',
      accentColor: '#f43f5e',
      Icon: XCircle,
      ribbonText: 'UNSAFE - DO NOT CONSUME'
    }
  }[freshness_status] || {
    grade: 'HẠNG B',
    title: 'CẦN KIỂM TRA THÊM',
    subtitle: 'Theo dõi chỉ số cảm quan',
    badgeBg: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
    stampBorder: 'border-slate-500',
    stampText: 'text-slate-400',
    stampBg: 'bg-slate-900/40',
    accentColor: '#64748b',
    Icon: AlertTriangle,
    ribbonText: 'MEATGUARD EVALUATION'
  };

  // Build verification URL encoded in QR Code
  const qrVerificationPayload = {
    id: certId,
    status: freshness_status,
    title: status_title,
    conf: confidence,
    meat: meat_name_vn,
    type: detected_type,
    date: timestamp,
    rec: recommendation
  };

  const currentOrigin =
    typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://meatguard.app';
  const currentPath =
    typeof window !== 'undefined' && window.location.pathname ? window.location.pathname : '/';
  const verificationUrl = `${currentOrigin}${currentPath}#cert=${encodeCertPayload(qrVerificationPayload)}`;

  // Copy Verification Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  // 1. Export as PNG Image or Native Share (2x Retina scale)
  const handleExportPNG = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    setExportMessage('Đang kết xuất ảnh chứng nhận độ phân giải cao...');

    try {
      // Ensure images are fully loaded and rendered at 2x resolution
      const dataUrl = await toPng(certificateRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#0F1522',
        cacheBust: true,
        filter: (node) => !node.classList?.contains('no-export')
      });

      // Check for Mobile Web Share API support
      if (navigator.share && navigator.canShare) {
        const blob = await toBlob(certificateRef.current, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: '#0F1522'
        });

        if (blob) {
          const file = new File([blob], `MeatGuard_Certificate_${certId.replace('#', '')}.png`, {
            type: 'image/png'
          });

          if (navigator.canShare({ files: [file] })) {
            setExportMessage('Đang mở khay chia sẻ...');
            await navigator.share({
              title: `Phiếu Kiểm Định Chất Lượng ${meat_name_vn} - ${certId}`,
              text: `Kết quả kiểm định chất lượng thực phẩm từ MeatGuard AI: ${certGrade.title} - ${confidence}%`,
              files: [file]
            });
            setIsExporting(false);
            setExportMessage(null);
            return;
          }
        }
      }

      // Download file directly
      const link = document.createElement('a');
      link.download = `MeatGuard_Certificate_${certId.replace('#', '')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportMessage('Đã tải ảnh chứng nhận thành công!');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (error) {
      console.error('Export PNG failed:', error);
      alert('Không thể tạo file ảnh lúc này. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Export as Formal A4 PDF Report
  const handleExportPDF = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    setExportMessage('Đang kết xuất báo cáo kiểm định PDF chuẩn A4...');

    try {
      const dataUrl = await toPng(certificateRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#0F1522',
        cacheBust: true,
        filter: (node) => !node.classList?.contains('no-export')
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Background canvas fill (#0B0F17)
      pdf.setFillColor(11, 15, 23);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

      // Top Security Banner
      pdf.setFillColor(16, 185, 129); // emerald-500
      pdf.rect(10, 8, pdfWidth - 20, 1.5, 'F');

      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.text('HE THONG KIEM DINH CHAT LUONG THUC PHAM TRUC QUAN - MEATGUARD DIGITAL REPORT', 12, 14);

      pdf.setTextColor(16, 185, 129);
      pdf.text(`CERTIFICATE ID: ${certId}  |  DATE: ${timestamp}`, pdfWidth - 12, 14, { align: 'right' });

      // Embed high-resolution certificate image centered
      const margin = 12;
      const usableWidth = pdfWidth - margin * 2;
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * usableWidth) / imgProps.width;

      pdf.addImage(
        dataUrl,
        'PNG',
        margin,
        18,
        usableWidth,
        Math.min(imgHeight, pdfHeight - 28)
      );

      // Save PDF file
      pdf.save(`MeatGuard_Inspection_Report_${certId.replace('#', '')}.pdf`);

      setExportMessage('Đã tạo báo cáo PDF thành công!');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (error) {
      console.error('Export PDF failed:', error);
      alert('Không thể tạo file PDF lúc này. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  const StampIcon = certGrade?.Icon || CheckCircle;

  return (
    <div className="w-full space-y-3.5">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-[#121824] border border-slate-800 shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>Phiếu Kiểm Định Chất Lượng Điện Tử</span>
              {isVerifiedFromUrl && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  Đã Xác Thực Mã QR
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Mã chứng nhận: <strong className="text-slate-200">{certId}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="Sao chép link xác thực phiếu này"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Đã sao chép' : 'Sao chép link'}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportPNG}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-transform active:scale-95 disabled:opacity-60"
            title="Lưu ảnh hoặc chia sẻ qua Zalo/Story"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Lưu ảnh</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportPDF}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-950/40 transition-transform active:scale-95 disabled:opacity-60"
            title="Tải báo cáo chi tiết chuẩn PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Xuất PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Mở rộng phiếu' : 'Thu gọn'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Export Status Notification */}
      {exportMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Collapsible Certificate Container */}
      {!isCollapsed && (
        <div className="relative group">
          {/* Outer Certification Card (Exported Area) */}
          <div
            ref={certificateRef}
            className="w-full bg-[#0F1522] border-2 border-emerald-500/30 rounded-3xl p-4 sm:p-7 shadow-2xl relative overflow-hidden ring-1 ring-white/10 text-left"
            style={{
              backgroundImage:
                'radial-gradient(circle at 10% 10%, rgba(16, 185, 129, 0.04) 0%, transparent 60%), radial-gradient(circle at 90% 90%, rgba(20, 184, 166, 0.04) 0%, transparent 60%)'
            }}
          >
            {/* Guilloche Security Border Trim Accent */}
            <div className="absolute inset-1.5 border border-emerald-500/15 rounded-[22px] pointer-events-none" />

            {/* Corner Security Markers */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-emerald-400/60 pointer-events-none" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-emerald-400/60 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-emerald-400/60 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-emerald-400/60 pointer-events-none" />

            {/* Certificate Header */}
            <div className="border-b border-slate-800/80 pb-4 mb-4 sm:mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 ring-2 ring-white/20">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                      MeatGuard AI Inspector
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Chính Thức
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Hệ Thống Kiểm Định Chất Lượng & An Toàn Thực Phẩm Số
                  </p>
                </div>
              </div>

              {/* Certificate Metadata Badges */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-[11px] font-mono text-slate-400 gap-1 border-t sm:border-t-0 border-slate-800/60 pt-2 sm:pt-0">
                <span className="flex items-center gap-1.5 text-slate-200 font-bold bg-[#141C2B] px-2.5 py-1 rounded-lg border border-slate-800">
                  <Hash className="w-3 h-3 text-emerald-400" />
                  {certId}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {timestamp}
                </span>
              </div>
            </div>

            {/* Certificate Body (2-Column Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
              {/* Left Column: Sample Image & Category */}
              <div className="md:col-span-5 space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0B0F17] aspect-square flex items-center justify-center shadow-inner group">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Ảnh mẫu phẩm thịt kiểm định"
                      className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <span className="text-xs">Ảnh mẫu phẩm lưu trữ</span>
                    </div>
                  )}

                  {/* Watermark Ribbon Overlay */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{certGrade.ribbonText}</span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-mono text-slate-300 border border-slate-700">
                    RAW CAPTURE 1080P
                  </div>
                </div>

                {/* Sample Type Tags */}
                <div className="p-3 rounded-2xl bg-[#141C2B] border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Phân loại mẫu:</span>
                    <span className="font-bold text-slate-200">
                      {detected_type === 'cooked' ? '🍲 Đã chế biến' : '🥩 Thịt tươi sống'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Tên mẫu phẩm:</span>
                    <strong className="text-emerald-400 font-semibold">{meat_name_vn}</strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Large Quality Seal & Metrics */}
              <div className="md:col-span-7 space-y-4">
                {/* Official Stamp & Quality Grade Box */}
                <div
                  className={`p-4 rounded-2xl border ${certGrade.badgeBg} relative overflow-hidden shadow-lg flex items-center justify-between gap-3`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      KẾT QUẢ ĐÁNH GIÁ CHẤT LƯỢNG
                    </span>
                    <h4 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>{certGrade.title}</span>
                    </h4>
                    <p className="text-xs text-slate-300 font-medium">{certGrade.subtitle}</p>
                    <div className="pt-1 text-[11px] font-mono text-slate-400">
                      Độ chuẩn xác AI: <strong className="text-white font-bold">{confidence}%</strong>
                    </div>
                  </div>

                  {/* Circular Authentic Seal Stamp */}
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-dashed ${certGrade.stampBorder} ${certGrade.stampBg} flex flex-col items-center justify-center p-1 text-center shadow-inner flex-shrink-0 rotate-[-8deg] transform`}
                  >
                    <StampIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${certGrade.stampText} mb-0.5`} />
                    <span className="text-[9px] font-black uppercase tracking-tighter text-white leading-tight">
                      {certGrade.grade}
                    </span>
                    <span className="text-[8px] font-mono text-slate-300 leading-none">VERIFIED</span>
                  </div>
                </div>

                {/* Detailed Indicators Breakdown Table */}
                <div className="p-3.5 rounded-2xl bg-[#141C2B] border border-slate-800/80 space-y-2.5">
                  <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Kiểm Định Quang Học & Sắc Tố</span>
                    <span className="text-[10px] font-mono text-emerald-400">ISO/AI STANDARD</span>
                  </h5>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-[#0F1522] border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Sắc tố chủ đạo</span>
                      <strong className="text-slate-200">
                        {detected_type === 'cooked' ? 'Caramel / Protein chín' : 'Myoglobin tự nhiên'}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0F1522] border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Mức độ rủi ro</span>
                      <strong
                        className={
                          risk_level === 'danger'
                            ? 'text-rose-400'
                            : risk_level === 'medium'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {risk_level === 'danger'
                          ? 'Nguy hiểm'
                          : risk_level === 'medium'
                          ? 'Cần lưu ý'
                          : 'Rất an toàn'}
                      </strong>
                    </div>
                  </div>

                  {/* Anomaly Checkpoints */}
                  <div className="text-xs space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400 block">Dấu hiệu bất thường phát hiện:</span>
                    {indicators_found && indicators_found.length > 0 ? (
                      <ul className="space-y-1">
                        {indicators_found.map((ind, idx) => (
                          <li
                            key={idx}
                            className="text-[11px] text-rose-300 flex items-center gap-1.5 font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                            {ind}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Bề mặt sạch, không có mảng mốc, màng nhớt hay đông đá bất thường.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chef & Safety Recommendation Box */}
                {recommendation && (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Khuyến Cáo Chế Biến & Bảo Quản
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{recommendation}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Footer: QR Code & Legal Disclaimer */}
            <div className="border-t border-slate-800/80 pt-4 mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left Side: Legal Disclaimer & Signoff */}
              <div className="space-y-1.5 text-left flex-1">
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-md">
                  * <strong>Miễn trừ trách nhiệm:</strong> Kết quả phân tích dựa trên thị giác máy tính và quang
                  phổ màu bề mặt mẫu phẩm tại thời điểm quét. Khuyến nghị người tiêu dùng luôn kết hợp kiểm tra
                  nhiệt độ bảo quản và mùi vị trước khi chế biến.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Ký số: MeatGuard Optical Verification Division | Hash SHA-256</span>
                </div>
              </div>

              {/* Right Side: Dynamic QR Code Box */}
              <div className="flex items-center space-x-3 p-2 rounded-2xl bg-[#141C2B] border border-slate-800 shadow-sm flex-shrink-0">
                <div className="p-1 rounded-xl bg-[#0B0F17] border border-slate-700/80">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={72}
                    bgColor="#0B0F17"
                    fgColor="#10B981"
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-200 block">Xác Thực Nguồn Gốc</span>
                  <p className="text-[9px] text-slate-400 max-w-[100px] leading-tight">
                    Quét mã QR để xem lại chứng nhận gốc
                  </p>
                  <span className="text-[9px] font-mono text-emerald-400 block pt-0.5">
                    {certId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
