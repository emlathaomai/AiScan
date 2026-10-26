import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  SwitchCamera,
  X,
  AlertCircle,
  Utensils,
  Beef,
  Bot
} from 'lucide-react';
import ScannerOverlay from './ScannerOverlay';

export default function CameraCapture({
  imagePreview,
  selectedFile,
  meatCategory = 'auto',
  onMeatCategoryChange,
  meatHint,
  isScanning,
  onImageSelected,
  onMeatHintChange,
  onResetImage,
  onStartAnalyze
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const [cameraError, setCameraError] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop live camera stream when unmounted or closed
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraOpen(false);
    setCameraError(null);
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  // Start live webcam / mobile camera stream
  const startLiveCamera = async (facing = cameraFacing) => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsLiveCameraOpen(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Không thể mở camera. Vui lòng cấp quyền truy cập camera hoặc dùng nút Tải ảnh/Chụp file.');
      setIsLiveCameraOpen(false);
    }
  };

  const switchCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startLiveCamera(nextFacing);
  };

  // Capture frame from live video
  const captureLiveFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `meat_camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = canvas.toDataURL('image/jpeg', 0.95);
        stopLiveCamera();
        onImageSelected(file, previewUrl);
      }
    }, 'image/jpeg', 0.95);
  };

  // Handle standard file inputs
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một file hình ảnh (JPEG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onImageSelected(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden text-left">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Mobile-optimized camera capture with capture="environment" */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Meat Category Mode: Segmented Control */}
      <div className="mb-4 space-y-2.5 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Chế độ quét chất lượng:
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {meatCategory === 'cooked' ? '🍲 Đồ đã chế biến' : meatCategory === 'raw' ? '🥩 Thịt tươi sống' : '🤖 AI Auto-Detect'}
          </span>
        </div>

        {/* 3-Way Segmented Control */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            type="button"
            disabled={isScanning}
            onClick={() => {
              onMeatCategoryChange?.('auto');
              onMeatHintChange?.('');
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              meatCategory === 'auto'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Tự Động</span>
          </button>

          <button
            type="button"
            disabled={isScanning}
            onClick={() => {
              onMeatCategoryChange?.('raw');
              if (meatHint && !['beef', 'pork', 'poultry'].includes(meatHint)) {
                onMeatHintChange?.('');
              }
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              meatCategory === 'raw'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Beef className="w-3.5 h-3.5" />
            <span>Thịt Sống</span>
          </button>

          <button
            type="button"
            disabled={isScanning}
            onClick={() => {
              onMeatCategoryChange?.('cooked');
              if (meatHint && !['boiled_pork', 'braised_pork', 'fried_grilled', 'processed_sausage'].includes(meatHint)) {
                onMeatHintChange?.('');
              }
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              meatCategory === 'cooked'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Thịt Đã Nấu Chín</span>
          </button>
        </div>

        {/* Dynamic Sub-Category Filters */}
        {meatCategory === 'raw' && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-0.5 animate-fadeIn">
            <span className="text-[11px] text-slate-400 flex-shrink-0">Loại thịt:</span>
            {[
              { id: '', label: 'Tất cả thịt sống' },
              { id: 'beef', label: '🥩 Thịt Bò' },
              { id: 'pork', label: '🥩 Thịt Lợn' },
              { id: 'poultry', label: '🍗 Gia cầm' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                disabled={isScanning}
                onClick={() => onMeatHintChange(type.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  meatHint === type.id
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}

        {meatCategory === 'cooked' && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-0.5 animate-fadeIn">
            <span className="text-[11px] text-slate-400 flex-shrink-0">Món ăn:</span>
            {[
              { id: '', label: 'Tất cả đồ chín' },
              { id: 'boiled_pork', label: '🍲 Thịt Luộc' },
              { id: 'braised_pork', label: '🥘 Thịt Kho / Rim' },
              { id: 'fried_grilled', label: '🍖 Chiên / Nướng' },
              { id: 'processed_sausage', label: '🌭 Giò / Xúc Xích' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                disabled={isScanning}
                onClick={() => onMeatHintChange(type.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  meatHint === type.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}

        {meatCategory === 'auto' && (
          <p className="text-[11px] text-slate-400 pt-0.5 italic flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            AI sẽ tự động nhận diện ảnh là thịt sống hay đồ đã nấu chín trước khi áp dụng thuật toán kiểm định.
          </p>
        )}
      </div>

      {/* Camera Error Message */}
      {cameraError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {cameraError}
          </span>
          <button onClick={() => setCameraError(null)} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main View Area: Either Live Video, Image Preview, or Upload Box */}
      {isLiveCameraOpen ? (
        <div className="relative w-full aspect-square max-h-[440px] rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center border border-emerald-500/30 shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Guide Overlay for live camera */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 rounded-full border-2 border-dashed border-emerald-400/60 flex items-center justify-center">
              <span className="text-[11px] text-emerald-300/80 bg-slate-950/70 px-2 py-0.5 rounded-full">
                Đặt miếng thịt vào tâm
              </span>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center space-x-4 px-4 z-20">
            <button
              type="button"
              onClick={switchCameraFacing}
              className="p-3 rounded-full bg-slate-900/80 text-slate-200 border border-slate-700 hover:text-white hover:bg-slate-800 transition-transform active:scale-95"
              title="Đổi camera trước/sau"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={captureLiveFrame}
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center space-x-2 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
            >
              <Camera className="w-5 h-5" />
              <span>Chụp ảnh</span>
            </button>

            <button
              type="button"
              onClick={stopLiveCamera}
              className="p-3 rounded-full bg-slate-900/80 text-slate-200 border border-slate-700 hover:text-white hover:bg-slate-800 transition-transform active:scale-95"
              title="Đóng camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : imagePreview ? (
        /* Image Preview with Scanner Overlay */
        <div className="relative w-full aspect-square max-h-[440px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-2xl flex items-center justify-center group">
          <img
            src={imagePreview}
            alt="Meat Preview"
            className="w-full h-full object-cover transition-transform duration-300"
          />

          {/* Scanner animation active during API request */}
          {isScanning && <ScannerOverlay />}

          {/* Retake / Change Image Action Buttons */}
          {!isScanning && (
            <div className="absolute top-3 right-3 flex items-center space-x-2 z-20">
              <button
                type="button"
                onClick={onResetImage}
                className="px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-transform active:scale-95"
                title="Chọn lại ảnh"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đổi ảnh</span>
              </button>
            </div>
          )}

          {/* Filename & Resolution badge */}
          {selectedFile && !isScanning && (
            <div className="absolute bottom-3 left-3 z-20">
              <span className="text-[11px] font-mono text-slate-300 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Upload & Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full aspect-square max-h-[380px] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-700 hover:border-slate-600 bg-slate-950/60'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors mb-4 shadow-inner">
            <Upload className="w-8 h-8 text-emerald-400" />
          </div>

          <p className="text-base font-semibold text-slate-200 mb-1">
            Kéo thả hoặc tải ảnh thịt lên
          </p>
          <p className="text-xs text-slate-400 max-w-xs mb-5">
            Hỗ trợ ảnh chụp cận cảnh thịt tươi sống (JPEG, PNG, WEBP). Khuyên dùng ánh sáng tự nhiên rõ nét.
          </p>

          {/* Dual Action Buttons: Smartphone Camera vs File Library */}
          <div
            className="flex flex-wrap items-center justify-center gap-2.5 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Direct Rear Camera button for Smartphones */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Chụp ảnh (Camera sau)</span>
            </button>

            {/* Live Camera Stream (Webcam / Mobile Browser) */}
            <button
              type="button"
              onClick={() => startLiveCamera('environment')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center space-x-2 transition-transform active:scale-95"
            >
              <Camera className="w-4 h-4 text-teal-400" />
              <span>Camera trực tiếp</span>
            </button>

            {/* File Library Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center space-x-2 transition-transform active:scale-95"
            >
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <span>Chọn từ thư viện</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Action Button: Analyze Freshness */}
      {imagePreview && (
        <div className="mt-4">
          <button
            type="button"
            disabled={isScanning}
            onClick={onStartAnalyze}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2.5 transition-all shadow-xl ${
              isScanning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25 active:scale-[0.99]'
            }`}
          >
            {isScanning ? (
              <>
                <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>AI Đang Phân Tích Quang Phổ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>Phân Tích Chất Lượng Thịt</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
