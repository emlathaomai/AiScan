# 🥩 MeatGuard — AI Meat Freshness Scanner

Ứng dụng Web hoàn chỉnh nhận diện và đánh giá độ tươi sống của các loại thịt (**Thịt bò, Thịt lợn, Gia cầm**) qua camera điện thoại hoặc ảnh tải lên máy tính.

---

## 🌟 Tính Năng Nổi Bật

1. **Giao diện chuẩn Mobile-First**:
   - Nút chụp ảnh mở trực tiếp camera sau của smartphone (`capture="environment"`).
   - Hỗ trợ xem trực tiếp camera (Live Video Stream) và chụp khung hình.
   - Kéo thả ảnh (Drag & Drop) hoặc tải từ thư viện ảnh máy tính.
   - Xem trước (preview) sắc nét, hỗ trợ chụp lại hoặc đổi ảnh dễ dàng.
   - **Thư viện mẫu thử nghiệm (Quick Presets)**: Cung cấp sẵn các mẫu thịt tươi, thịt cũ và thịt ươn tạo sẵn để test ngay tức thì không cần chuẩn bị ảnh thật.

2. **Hiệu ứng Quét Laser (Scanner UI Animation)**:
   - Thanh quét laser beam chuyển động quét lên xuống trên ảnh với hiệu ứng radar glow, grid quang phổ và telemetry đọc dữ liệu thời gian thực trong lúc chờ phản hồi từ API.

3. **Bảng Kết Quả Trực Quan (Result Dashboard)**:
   - **3 Trạng thái chính**:
     - 🟢 **Tươi (Fresh)**: Tươi ngon, an toàn tiêu thụ.
     - 🟡 **Bắt đầu suy giảm (Half-Fresh / Aging)**: Cần chế biến ngay, xử lý nhiệt kỹ.
     - 🔴 **Ươn / Hỏng (Spoiled)**: Đã biến chất, nguy cơ nhiễm khuẩn, cảnh báo không nên ăn.
   - **Thanh đo độ tin cậy (Confidence Bar)**: Thể hiện trực quan % xác suất của từng nhóm.
   - **Chỉ số quang phổ màu (Colorimetric Metrics)**: Tỷ lệ Đỏ/Xanh (R/G), Góc sắc thái Hue, Độ bão hòa Saturation, Điểm tươi sống Freshness Index.
   - **Khuyến nghị bảo quản & nấu nướng**: Nhiệt độ lưu trữ, hướng dẫn chế biến an toàn và phân loại mức độ rủi ro vi sinh.

4. **Bảng Kiểm Tra Cảm Quan Bổ Sung (Sensory Checklist)**:
   - Checklist tương tác cho phép người dùng tự kiểm tra chéo 3 tiêu chí:
     1. Độ đàn hồi khi ấn tay (đàn hồi nhanh hay lún sâu).
     2. Mùi hương (mùi tự nhiên hay mùi chua/hôi).
     3. Bề mặt (khô ráo se mặt hay màng nhầy dính nhớt).
   - **Cảnh báo xung đột thông minh**: Tự động cảnh báo nếu ảnh bề mặt còn sắc đỏ nhưng khứu giác phát hiện mùi hôi/nhớt (dấu hiệu vi khuẩn kỵ khí phân hủy sâu).

5. **Lịch Sử Quét (Recent Scans)**:
   - Tự động lưu 5 lượt quét gần nhất vào `localStorage` của trình duyệt.
   - Lưu trữ thumbnail nhỏ, nhãn kết quả, độ tin cậy và timestamp.
   - Bấm vào bất kỳ lượt quét nào để xem lại chi tiết kết quả.

6. **Cơ Chế Dual-Engine & Mock Fallback Thông Minh**:
   - Nếu chưa có file mô hình PyTorch/ONNX, hệ thống tự động chạy **Heuristic Mock Simulation** dựa trên sinh hóa sắc tố Myoglobin (Oxymyoglobin vs Metmyoglobin vs Sulfmyoglobin) và không gian màu HSV/RGB vùng tâm ảnh.
   - Khi đặt file `meat_freshness_model.onnx` hoặc `meat_freshness_model.pt` vào thư mục `backend/models/`, server sẽ tự động nạp mô hình Deep Learning thực tế!

---

## 📁 Cấu Trúc Thư Mục

```
AiScan/
├── backend/
│   ├── models/                    # Thư mục chứa file trọng số .onnx hoặc .pt (tùy chọn)
│   ├── main.py                    # FastAPI server, CORS, Endpoint /api/health & /api/analyze
│   ├── model_loader.py            # Class nạp mô hình ONNX/PyTorch + Bộ phân tích Heuristic Fallback
│   └── requirements.txt           # Thư viện Python (FastAPI, Uvicorn, Pillow, NumPy)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraCapture.jsx   # Input camera sau, live camera, kéo thả file, preview
│   │   │   ├── ScannerOverlay.jsx  # Hiệu ứng vệt laser quét lên xuống & HUD telemetry
│   │   │   ├── ResultCard.jsx      # Thẻ kết quả, thanh confidence, khuyến nghị bảo quản
│   │   │   ├── SensoryChecklist.jsx# Bảng kiểm tra chéo cảm quan (đàn hồi, mùi, nhớt)
│   │   │   ├── ScanHistory.jsx     # Lưu & xem lại 5 lượt quét gần nhất (localStorage)
│   │   │   ├── SampleSelector.jsx  # Bộ ảnh mẫu thử nhanh (Bò tươi, Lợn tươi, Thịt ươn...)
│   │   │   ├── DisclaimerBanner.jsx# Banner khuyến cáo an toàn thực phẩm
│   │   │   └── Navbar.jsx          # Thanh tiêu đề, trạng thái kết nối Backend
│   │   ├── App.jsx                 # Quản lý luồng chính & Client Fallback
│   │   ├── index.css               # Tailwind CSS & keyframes animation
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── start_backend.bat               # File chạy nhanh Backend (Windows)
├── start_frontend.bat              # File chạy nhanh Frontend (Windows)
└── README.md
```

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Khởi động Backend (FastAPI)

Mở một cửa sổ Terminal (PowerShell hoặc Command Prompt):

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- Server Backend sẽ chạy tại: `http://localhost:8000`
- Tài liệu API tương tác (Swagger UI): `http://localhost:8000/docs`
- Kiểm tra trạng thái: `http://localhost:8000/api/health`

*(Hoặc trên Windows bạn có thể nhấp đúp trực tiếp vào file `start_backend.bat`)*

---

### 2. Khởi động Frontend (React + Vite)

Mở một cửa sổ Terminal thứ hai:

```bash
cd frontend
npm install
npm run dev
```

- Mở trình duyệt truy cập: `http://localhost:5173`

*(Hoặc trên Windows bạn có thể nhấp đúp trực tiếp vào file `start_frontend.bat`)*

---

## 📱 Trải Nghiệm Trên Điện Thoại Thông Minh (Mobile)

Để dùng trực tiếp camera sau trên điện thoại của bạn:
1. Đảm bảo điện thoại và máy tính kết nối chung mạng Wi-Fi.
2. Kiểm tra địa chỉ IP nội bộ của máy tính (ví dụ `192.168.1.15`).
3. Khởi chạy frontend với cờ host:
   ```bash
   npm run dev -- --host
   ```
4. Mở trình duyệt trên điện thoại và truy cập: `http://<IP-CUA-MAY-TINH>:5173`.
5. Bấm nút **"Chụp ảnh (Camera sau)"** để mở ngay ứng dụng camera góc rộng của điện thoại!

---

## 🔬 Tích Hợp Mô Hình Deep Learning Thực Tế (Tùy chọn)

Nếu bạn có mô hình CNN / Vision Transformer đã huấn luyện (đầu ra 3 nhãn `fresh`, `aging`, `spoiled`):
1. Xuất mô hình sang định dạng ONNX hoặc PyTorch.
2. Đặt file vào thư mục:
   - `backend/models/meat_freshness_model.onnx`
   hoặc:
   - `backend/models/meat_freshness_model.pt`
3. Cài đặt thêm thư viện tương ứng trong backend:
   ```bash
   python -m pip install onnxruntime
   ```
4. Khởi động lại backend, hệ thống sẽ tự động chuyển từ `model_mode: heuristic_mock` sang `model_mode: onnx_model`!
