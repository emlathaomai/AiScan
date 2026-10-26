"""
MeatGuard - AI Meat Freshness Analyzer
Supports 4 Comprehensive States:
1. Fresh (Tươi ngon)
2. Aging (Bắt đầu suy giảm)
3. Frozen_Damaged (Cháy đông / Đóng đá tuyết / Freezer Burn)
4. Spoiled (Ươn / Hỏng)
Supports ONNX deep learning inference and smart biometric heuristic fallback.
"""

import os
import time
import colorsys
from typing import Dict, Any, Tuple, Optional
from PIL import Image
import numpy as np


class MeatFreshnessAnalyzer:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = os.path.join(os.path.dirname(__file__), models_dir)
        os.makedirs(self.models_dir, exist_ok=True)
        self.model_mode = "heuristic_mock"
        self.model = None
        self.classes = ["fresh", "aging", "frozen_damaged", "spoiled"]
        self._initialize_model()

    def _initialize_model(self):
        """
        Attempt to load ONNX or PyTorch model weights from models_dir.
        """
        onnx_file = os.path.join(self.models_dir, "meat_freshness_model.onnx")
        pytorch_file = os.path.join(self.models_dir, "meat_freshness_model.pt")

        if os.path.exists(onnx_file):
            try:
                import onnxruntime as ort
                self.model = ort.InferenceSession(onnx_file)
                self.model_mode = "onnx_model"
                print(f"[MeatGuard] Successfully loaded 4-class ONNX model: {onnx_file}")
                return
            except Exception as e:
                print(f"[MeatGuard] Failed to load ONNX model ({e}), falling back...")

        if os.path.exists(pytorch_file):
            try:
                import torch
                self.model = torch.load(pytorch_file, map_location="cpu", weights_only=False)
                self.model.eval()
                self.model_mode = "pytorch_model"
                print(f"[MeatGuard] Successfully loaded PyTorch model: {pytorch_file}")
                return
            except Exception as e:
                print(f"[MeatGuard] Failed to load PyTorch model ({e}), falling back...")

        self.model_mode = "heuristic_mock"
        print("[MeatGuard] Using Intelligent Heuristic Mock Engine (RGB/HSV Colorimetric).")

    def preprocess_image(self, image: Image.Image) -> Tuple[Image.Image, np.ndarray]:
        """
        Standard pre-processing pipeline:
        1. Convert image to RGB.
        2. Crop central 70% ROI where meat is positioned.
        3. Resize to 224x224.
        4. Normalize for ImageNet standard.
        """
        if image.mode != "RGB":
            image = image.convert("RGB")

        w, h = image.size
        crop_ratio = 0.70
        crop_w, crop_h = int(w * crop_ratio), int(h * crop_ratio)
        left = (w - crop_w) // 2
        top = (h - crop_h) // 2
        cropped_img = image.crop((left, top, left + crop_w, top + crop_h))

        resized_img = cropped_img.resize((224, 224), Image.Resampling.LANCZOS)

        img_np = np.array(resized_img, dtype=np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        normalized_np = (img_np - mean) / std

        return resized_img, normalized_np

    def _infer_with_heuristic(self, resized_img: Image.Image, meat_hint: Optional[str] = None) -> Dict[str, Any]:
        """
        Biometric / Colorimetric evaluation handling 4 states including Freezer Burn.
        """
        img_array = np.array(resized_img, dtype=np.float32) / 255.0  # (224, 224, 3)

        h, w, _ = img_array.shape
        margin_h, margin_w = int(h * 0.20), int(w * 0.20)
        core_patch = img_array[margin_h:h - margin_h, margin_w:w - margin_w]

        r_mean = float(np.mean(core_patch[:, :, 0]))
        g_mean = float(np.mean(core_patch[:, :, 1]))
        b_mean = float(np.mean(core_patch[:, :, 2]))

        h_val, s_val, v_val = colorsys.rgb_to_hsv(r_mean, g_mean, b_mean)
        hue_degrees = h_val * 360.0

        rg_ratio = (r_mean + 1e-4) / (g_mean + 1e-4)

        # Detect Meat Type
        detected_meat = meat_hint if meat_hint in ["beef", "pork", "poultry"] else None
        if not detected_meat:
            if v_val > 0.65 and r_mean < 0.70 and s_val < 0.40:
                detected_meat = "poultry"
            elif r_mean > 0.55 and rg_ratio > 1.35 and s_val > 0.38:
                detected_meat = "beef"
            else:
                detected_meat = "pork"

        # Check for Frost / Ice crystals / Freezer Burn
        # High-brightness white frost pixels (R, G, B > 0.75, low saturation < 0.20)
        brightness_map = np.mean(core_patch, axis=2)
        frost_pixels = np.sum((brightness_map > 0.75) & (np.abs(core_patch[:, :, 0] - core_patch[:, :, 1]) < 0.12))
        frost_ratio = frost_pixels / float(core_patch.shape[0] * core_patch.shape[1])

        # Evaluate states
        is_red_hue = (hue_degrees >= 340 or hue_degrees <= 22)
        is_brown_hue = (22 < hue_degrees <= 45)
        is_green_or_abnormal = (45 < hue_degrees <= 160)

        # Baseline probabilities
        if frost_ratio > 0.20 or (v_val > 0.70 and s_val < 0.22 and rg_ratio < 1.25):
            status = "frozen_damaged"
            p_frozen = 0.85
            p_aging = 0.08
            p_fresh = 0.05
            p_spoiled = 0.02
        elif is_red_hue and rg_ratio >= 1.25 and s_val >= 0.28:
            status = "fresh"
            p_fresh = 0.92
            p_aging = 0.05
            p_frozen = 0.02
            p_spoiled = 0.01
        elif is_brown_hue or (rg_ratio < 1.25 and rg_ratio >= 1.05):
            status = "aging"
            p_aging = 0.78
            p_fresh = 0.10
            p_frozen = 0.06
            p_spoiled = 0.06
        else:
            status = "spoiled"
            p_spoiled = 0.89
            p_aging = 0.06
            p_frozen = 0.03
            p_fresh = 0.02

        total_p = p_fresh + p_aging + p_frozen + p_spoiled
        p_fresh = round(p_fresh / total_p, 4)
        p_aging = round(p_aging / total_p, 4)
        p_frozen = round(p_frozen / total_p, 4)
        p_spoiled = round(p_spoiled / total_p, 4)

        probs = {
            "fresh": p_fresh,
            "aging": p_aging,
            "frozen_damaged": p_frozen,
            "spoiled": p_spoiled
        }
        confidence = round(probs[status] * 100.0, 1)

        return self._format_result(status, confidence, probs, detected_meat, r_mean, g_mean, b_mean, hue_degrees, s_val, v_val, rg_ratio)

    def _format_result(self, status, confidence, probs, detected_meat, r_mean, g_mean, b_mean, hue_degrees, s_val, v_val, rg_ratio):
        status_titles = {
            "fresh": "Tươi (Fresh)",
            "aging": "Bắt đầu suy giảm (Aging / Half-Fresh)",
            "frozen_damaged": "Cháy đông / Đá tuyết (Frozen Damaged)",
            "spoiled": "Ươn / Hỏng (Spoiled)"
        }

        status_descs = {
            "fresh": "Thịt tươi ngon, mô cơ săn chắc, màu sắc tự nhiên, an toàn để chế biến tiêu thụ.",
            "aging": "Thịt đã bắt đầu oxy hóa metmyoglobin, giảm độ tươi. Cần chế biến ngay trong ngày và xử lý nhiệt kỹ.",
            "frozen_damaged": "Thịt có dấu hiệu cháy lạnh (Freezer Burn) hoặc đóng đá tuyết dày do để ngăn đông lâu hoặc bao gói hở khí. Hơi nước thăng hoa khiến mô xơ khô cứng, mất vị ngọt tự nhiên.",
            "spoiled": "Thịt đã biến chất, có dấu hiệu ươn hỏng hoặc nhiễm khuẩn bề mặt. Tuyệt đối KHÔNG nên ăn để tránh ngộ độc thực phẩm."
        }

        advice_dict = {
            "fresh": {
                "headline": "Thịt đạt chuẩn tươi sống",
                "storage": "Bảo quản ngăn mát tủ lạnh (0°C - 4°C) dùng trong 1-2 ngày, hoặc cấp đông (-18°C) để giữ lâu dài.",
                "cooking": "Thích hợp chế biến mọi món ăn (xào, nướng, lẩu, bít tết).",
                "risk_level": "Thấp (An toàn)"
            },
            "aging": {
                "headline": "Cần nấu chín kỹ ngay lập tức",
                "storage": "Không nên tiếp tục để ngăn mát. Hãy sơ chế, tẩm ướp gia vị và nấu chín hoàn toàn trong hôm nay.",
                "cooking": "Nên dùng cho các món hầm, kho kỹ hoặc ninh lâu. Đảm bảo nhiệt độ tâm thịt đạt tối thiểu 75°C.",
                "risk_level": "Trung bình (Cần lưu ý)"
            },
            "frozen_damaged": {
                "headline": "Thịt bị cháy lạnh / Đóng đá tuyết",
                "storage": "Nên rã đông chậm trong ngăn mát (0-4°C). Cắt gọt bỏ các mảng xơ trắng xám khô ráp bên ngoài.",
                "cooking": "Không thích hợp làm bít tết hoặc xào (thịt sẽ khô bã và dai). Nên thái mỏng, tẩm ướp đậm đà hoặc dùng nấu canh, hầm kỹ, xay nhuyễn.",
                "risk_level": "Trung bình (Không ngộ độc nhưng mất chất lượng ẩm thực)"
            },
            "spoiled": {
                "headline": "Cảnh báo nguy cơ ngộ độc",
                "storage": "Vứt bỏ ngay lập tức vào thùng rác kín. Khử khuẩn các dụng cụ và bề mặt dao thớt đã tiếp xúc.",
                "cooking": "Nhiệt độ đun nấu thông thường không thể loại bỏ hoàn toàn độc tố vi khuẩn.",
                "risk_level": "Nguy hiểm (Tuyệt đối không ăn)"
            }
        }

        meat_names_vn = {
            "beef": "Thịt bò (Beef)",
            "pork": "Thịt lợn / heo (Pork)",
            "poultry": "Gia cầm / Gà (Poultry)",
            "unknown": "Thịt tươi sống"
        }

        freshness_index_map = {
            "fresh": 92.5,
            "aging": 55.0,
            "frozen_damaged": 45.0,
            "spoiled": 12.0
        }

        raw_risk_level = "low" if status == "fresh" else "medium" if status in ["aging", "frozen_damaged"] else "danger"

        raw_indicators_map = {
            "fresh": [
                "Màu đỏ tươi / hồng đặc trưng của myoglobin tự nhiên",
                "Mô cơ đàn hồi, bề mặt khô ráo, không màng nhờn",
                "Không có tinh thể đá tuyết hoặc vết thâm tối"
            ],
            "aging": [
                "Oxy hóa myoglobin thành metmyoglobin sẫm màu",
                "Độ bóng và độ ẩm tự nhiên bắt đầu suy giảm",
                "Cần kiểm tra kỹ mùi và xử lý nhiệt kỹ"
            ],
            "frozen_damaged": [
                "Lớp tinh thể đá tuyết bám phủ bề mặt",
                "Mô xơ khô ráp do mất nước thăng hoa (Freezer Burn)",
                "Bao gói hở khí hoặc để ngăn đông quá thời hạn"
            ],
            "spoiled": [
                "Diện tích thâm sẫm / biến chất hoại tử vượt ngưỡng",
                "Dấu hiệu vi khuẩn phân hủy protein bề mặt",
                "Màng nhớt dính hoặc mùi ôi thiu bất thường"
            ]
        }

        raw_rec_map = {
            "fresh": "Thịt tươi đạt chuẩn an toàn vệ sinh thực phẩm. Thích hợp chế biến ngay mọi món ăn.",
            "aging": "Thịt đã bắt đầu giảm độ tươi. Nên tẩm ướp và nấu chín hoàn toàn (nhiệt độ tâm > 75°C) ngay hôm nay.",
            "frozen_damaged": "Thịt bị cháy đông / đá tuyết. Nên rã đông chậm trong ngăn mát, gọt bỏ mảng xơ khô và nấu món hầm/xay.",
            "spoiled": "CẢNH BÁO: Thịt đã biến chất, có dấu hiệu ươn hỏng. Tuyệt đối KHÔNG NÊN ĂN để phòng tránh ngộ độc cấp tính!"
        }

        return {
            "status": "success",
            "detected_type": "raw",
            "sub_category": detected_meat,
            "freshness_status": status,
            "status_title": status_titles.get(status, "Đã phân tích"),
            "status_description": status_descs.get(status, ""),
            "confidence": confidence,
            "risk_level": raw_risk_level,
            "indicators_found": raw_indicators_map.get(status, []),
            "recommendation": raw_rec_map.get(status, advice_dict.get(status, {}).get("headline", "")),
            "probabilities": probs,
            "detected_meat": detected_meat,
            "meat_name_vn": meat_names_vn.get(detected_meat, "Thịt tươi sống"),
            "color_metrics": {
                "avg_red": round(r_mean * 255, 1),
                "avg_green": round(g_mean * 255, 1),
                "avg_blue": round(b_mean * 255, 1),
                "hue_degrees": round(hue_degrees, 1),
                "saturation_pct": round(s_val * 100, 1),
                "brightness_pct": round(v_val * 100, 1),
                "red_green_ratio": round(rg_ratio, 2),
                "freshness_index": freshness_index_map.get(status, 60.0)
            },
            "safety_advice": advice_dict.get(status, advice_dict["aging"]),
            "sensory_checklist": [
                {
                    "criterion": "Độ đàn hồi",
                    "guide": "Ấn ngón tay vào thớ thịt rồi thả ra. Thịt tươi sẽ hồi lại ngay lập tức, không để lại vết lõm."
                },
                {
                    "criterion": "Mùi hương",
                    "guide": "Thịt tươi có mùi đặc trưng tự nhiên. Nếu phát hiện mùi chua, mùi hôi thối hoặc mùi kháng sinh, hãy loại bỏ."
                },
                {
                    "criterion": "Độ nhớt bề mặt",
                    "guide": "Bề mặt thịt tươi khô ráo, hơi se mặt. Nếu thấy lớp màng nhớt trơn trượt hoặc dính tay là dấu hiệu vi khuẩn phát triển."
                }
            ],
            "model_mode": self.model_mode
        }

    def detect_ice_and_discoloration(self, img_pil: Image.Image) -> Dict[str, Any]:
        """
        OpenCV HSV mask detector for ice frost (white_ratio) and dark spoilage discoloration (dark_ratio).
        - White mask: H: 0-180, S: 0-50, V: 200-255 (Frost/Ice crystals/Freezer burn)
        - Dark mask: H: 0-180, S: 0-255, V: 0-80 (Severe dark discoloration/Spoilage)
        """
        try:
            import cv2
            img_np = np.array(img_pil)
            if len(img_np.shape) == 2:
                img_bgr = cv2.cvtColor(img_np, cv2.COLOR_GRAY2BGR)
            elif img_np.shape[2] == 4:
                img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGR)
            else:
                img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

            hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

            # Phát hiện các mảng màu trắng (đá tuyết/cháy đông)
            lower_white = np.array([0, 0, 200])
            upper_white = np.array([180, 50, 255])
            white_mask = cv2.inRange(hsv, lower_white, upper_white)
            white_ratio = float(np.sum(white_mask == 255) / white_mask.size)

            # Phát hiện màu tối/sẫm (thịt ươn/hỏng)
            lower_dark = np.array([0, 0, 0])
            upper_dark = np.array([180, 255, 80])
            dark_mask = cv2.inRange(hsv, lower_dark, upper_dark)
            dark_ratio = float(np.sum(dark_mask == 255) / dark_mask.size)

            verdict = None
            if white_ratio > 0.15:
                verdict = "Frozen-Damaged (Phát hiện lớp đá tuyết hoặc mảng cháy đông > 15%)"
            elif dark_ratio > 0.40:
                verdict = "Spoiled (Phát hiện diện tích thịt thâm sẫm biến chất > 40%)"

            return {
                "white_ratio_pct": round(white_ratio * 100.0, 1),
                "dark_ratio_pct": round(dark_ratio * 100.0, 1),
                "white_threshold_exceeded": bool(white_ratio > 0.15),
                "dark_threshold_exceeded": bool(dark_ratio > 0.40),
                "guardrail_verdict": verdict
            }
        except Exception as e:
            print(f"[MeatGuard] OpenCV inspection warning: {e}")
            return {
                "white_ratio_pct": 0.0,
                "dark_ratio_pct": 0.0,
                "white_threshold_exceeded": False,
                "dark_threshold_exceeded": False,
                "guardrail_verdict": None
            }

    def classify_raw_vs_cooked(self, resized_img: Image.Image) -> Tuple[str, float]:
        """
        Classifies whether an image is raw meat or cooked/processed meat based on
        biochemical optical properties (denatured metmyoglobin, caramelization vs raw myoglobin).
        """
        img_np = np.array(resized_img, dtype=np.float32) / 255.0
        h, w, _ = img_np.shape
        margin_h, margin_w = int(h * 0.15), int(w * 0.15)
        core = img_np[margin_h:h - margin_h, margin_w:w - margin_w]

        r_mean = float(np.mean(core[:, :, 0]))
        g_mean = float(np.mean(core[:, :, 1]))
        b_mean = float(np.mean(core[:, :, 2]))

        h_val, s_val, v_val = colorsys.rgb_to_hsv(r_mean, g_mean, b_mean)
        hue_deg = h_val * 360.0
        rg_ratio = (r_mean + 1e-4) / (g_mean + 1e-4)

        # Raw characteristics:
        # High red content, vivid red hue (near 0 or 340-360), high R/G ratio > 1.35, Saturation > 0.28
        is_raw_hue = (hue_deg >= 340.0 or hue_deg <= 18.0)
        is_raw_color = (is_raw_hue and rg_ratio >= 1.35 and s_val >= 0.28)

        # Cooked characteristics:
        # Caramel, brown, golden (Hue 20 - 55), or pale boiled beige/cream with lower saturation
        is_cooked_hue = (20.0 <= hue_deg <= 55.0)
        is_boiled_pale = (s_val < 0.28 and v_val > 0.50 and rg_ratio < 1.30)
        is_processed_pale = (s_val < 0.30 and rg_ratio < 1.35)

        if is_raw_color:
            p_raw = min(0.96, 0.65 + (rg_ratio - 1.35) * 0.25 + s_val * 0.2)
            return "raw", round(p_raw * 100.0, 1)
        elif is_cooked_hue or is_boiled_pale or is_processed_pale:
            p_cooked = 0.92 if is_cooked_hue else 0.88
            return "cooked", round(p_cooked * 100.0, 1)
        else:
            if rg_ratio > 1.25 and (hue_deg <= 25 or hue_deg >= 335):
                return "raw", 75.0
            else:
                return "cooked", 75.0

    def detect_cooked_defects(self, img_pil: Image.Image) -> Dict[str, Any]:
        """
        OpenCV inspection tailored for cooked and processed meat:
        1. Green/cyan mold spores (HSV H: 35-95, S: 30-255, V: 30-220)
        2. Congealed white fat / White fungal fuzz (HSV H: 0-180, S: 0-40, V: 195-255)
        3. Dark rot / necrotic discoloration (HSV H: 0-180, S: 0-255, V: 0-55)
        4. Slime / bacterial film reflection analysis
        """
        try:
            import cv2
            img_np = np.array(img_pil)
            if len(img_np.shape) == 2:
                img_bgr = cv2.cvtColor(img_np, cv2.COLOR_GRAY2BGR)
            elif img_np.shape[2] == 4:
                img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGR)
            else:
                img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

            hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

            # 1. Mold mask (Green / olive / teal mold colonies)
            lower_mold = np.array([35, 30, 30])
            upper_mold = np.array([95, 255, 220])
            mold_mask = cv2.inRange(hsv, lower_mold, upper_mold)
            mold_ratio = float(np.sum(mold_mask == 255) / mold_mask.size)

            # 2. Congealed fat / White mold fuzz mask (Stark chalky white or congealed lard crust)
            lower_white = np.array([0, 0, 230])
            upper_white = np.array([180, 30, 255])
            white_mask = cv2.inRange(hsv, lower_white, upper_white)
            white_ratio = float(np.sum(white_mask == 255) / white_mask.size)

            # 3. Dark rot / necrosis
            lower_dark = np.array([0, 0, 0])
            upper_dark = np.array([180, 255, 55])
            dark_mask = cv2.inRange(hsv, lower_dark, upper_dark)
            dark_ratio = float(np.sum(dark_mask == 255) / dark_mask.size)

            # 4. Slime detection: specular highlights on abnormal background
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            glare_pixels = np.sum(gray > 240) / gray.size
            slime_detected = bool(glare_pixels > 0.08 and (mold_ratio > 0.015 or dark_ratio > 0.15))

            verdict = None
            if mold_ratio > 0.02:
                verdict = f"Mold Detected (Phát hiện đốm nấm mốc xanh/trắng {round(mold_ratio*100, 1)}%)"
            elif slime_detected:
                verdict = "Bacterial Slime (Phát hiện màng nhớt dịch bóng dính bất thường)"
            elif white_ratio > 0.18:
                verdict = f"Congealed Fat / Fridge Aging (Lớp mỡ đông trắng đục chiếm {round(white_ratio*100, 1)}%)"
            elif dark_ratio > 0.35:
                verdict = f"Severe Dark Discoloration (Vết thâm thiu biến chất {round(dark_ratio*100, 1)}%)"

            return {
                "mold_ratio_pct": round(mold_ratio * 100.0, 1),
                "white_ratio_pct": round(white_ratio * 100.0, 1),
                "dark_ratio_pct": round(dark_ratio * 100.0, 1),
                "slime_detected": slime_detected,
                "mold_threshold_exceeded": bool(mold_ratio > 0.02),
                "congealed_fat_exceeded": bool(white_ratio > 0.18),
                "dark_threshold_exceeded": bool(dark_ratio > 0.35),
                "guardrail_verdict": verdict
            }
        except Exception as e:
            print(f"[MeatGuard] OpenCV cooked inspection warning: {e}")
            return {
                "mold_ratio_pct": 0.0,
                "white_ratio_pct": 0.0,
                "dark_ratio_pct": 0.0,
                "slime_detected": False,
                "mold_threshold_exceeded": False,
                "congealed_fat_exceeded": False,
                "dark_threshold_exceeded": False,
                "guardrail_verdict": None
            }

    def analyze_cooked_meat(self, resized_img: Image.Image, sub_hint: Optional[str] = None) -> Dict[str, Any]:
        """
        Specialized evaluation engine for Cooked and Processed Meat:
        Evaluates Braised, Boiled, Fried/Grilled, and Processed (Sausage/Giò chả).
        """
        start_time = time.time()
        img_array = np.array(resized_img, dtype=np.float32) / 255.0
        h, w, _ = img_array.shape
        margin_h, margin_w = int(h * 0.15), int(w * 0.15)
        core = img_array[margin_h:h - margin_h, margin_w:w - margin_w]

        r_mean = float(np.mean(core[:, :, 0]))
        g_mean = float(np.mean(core[:, :, 1]))
        b_mean = float(np.mean(core[:, :, 2]))
        h_val, s_val, v_val = colorsys.rgb_to_hsv(r_mean, g_mean, b_mean)
        hue_degrees = h_val * 360.0
        rg_ratio = (r_mean + 1e-4) / (g_mean + 1e-4)

        # Sub-category determination
        sub_categories_vn = {
            "boiled_pork": "Thịt luộc (Boiled Meat)",
            "braised_pork": "Thịt kho / rim (Braised Meat)",
            "fried_grilled": "Thịt chiên / nướng (Fried & Grilled)",
            "processed_sausage": "Giò chả / Xúc xích (Processed Meat)",
            "cooked_general": "Thịt đã nấu chín"
        }

        detected_sub = sub_hint if sub_hint in sub_categories_vn else None
        if not detected_sub:
            if v_val > 0.65 and s_val < 0.30:
                detected_sub = "boiled_pork"
            elif 18.0 <= hue_degrees <= 42.0 and s_val > 0.35:
                detected_sub = "braised_pork"
            elif 25.0 <= hue_degrees <= 50.0 and s_val > 0.45:
                detected_sub = "fried_grilled"
            elif s_val < 0.28 and rg_ratio < 1.35:
                detected_sub = "processed_sausage"
            else:
                detected_sub = "cooked_general"

        # OpenCV inspection for cooked meat
        cv_inspection = self.detect_cooked_defects(resized_img)

        # Classification logic based on defects
        has_mold = cv_inspection["mold_threshold_exceeded"]
        has_slime = cv_inspection["slime_detected"]
        has_dark_rot = cv_inspection["dark_threshold_exceeded"]
        has_congealed_fat = cv_inspection["congealed_fat_exceeded"]

        # Hue distortion (shift to unnatural dull greenish-grey)
        is_greenish_spoil = (55.0 <= hue_degrees <= 110.0 and s_val > 0.20)

        if has_mold or has_slime or has_dark_rot or is_greenish_spoil:
            status = "spoiled"
            confidence = 91.5 if has_mold else 88.0
            probs = {"fresh": 0.02, "aging": 0.08, "frozen_damaged": 0.02, "spoiled": 0.88}
            risk_level = "danger"
            indicators = [
                "Phát hiện đốm nấm mốc trắng/xanh lá trên bề mặt" if has_mold else "Bề mặt có màng bóng nhờn dính nhớt bất thường",
                "Màu sắc ngả xám chì / lên men ôi thiu do vi khuẩn",
                "Nguy cơ cao sinh độc tố tụ cầu hoặc Bacillus cereus"
            ]
            recommendation = "CẢNH BÁO NGUY HIỂM: Phát hiện dấu hiệu lên men vi khuẩn hoặc nấm mốc. Tuyệt đối KHÔNG NÊN ĂN dù đã hâm nóng lại! Các độc tố vi khuẩn chịu nhiệt không bị tiêu hủy khi đun nấu lại thông thường."
            headline = "Thịt chín đã bị ôi thiu / Nhiễm khuẩn"
            storage_advice = "Vứt bỏ ngay vào thùng rác kín. Rửa sạch và tiệt trùng dụng cụ đựng, hộp bảo quản."
            cooking_advice = "Không được sử dụng lại dưới mọi hình thức đun nấu hay xào rán."
            risk_title = "Nguy hiểm (Tuyệt đối không ăn)"
            status_title = "Hỏng / Thiu / Nhiễm khuẩn (Spoiled / Moldy)"
            status_desc = "Món ăn đã biến chất vi sinh, xuất hiện màng nhớt hoặc khuẩn nấm. Nhiễm độc tố gây đau bụng, nôn mửa và ngộ độc tiêu hóa cấp tính."

        elif has_congealed_fat or (v_val < 0.40 and s_val < 0.25):
            status = "aging"
            confidence = 82.0
            probs = {"fresh": 0.15, "aging": 0.78, "frozen_damaged": 0.04, "spoiled": 0.03}
            risk_level = "medium"
            indicators = [
                "Lớp mỡ đông trắng đục do bảo quản tủ lạnh nhiều ngày",
                "Bề mặt bắt đầu se khô hoặc tách nước nhẹ",
                "Cần kiểm tra mùi chua và độ nhớt trước khi ăn"
            ]
            recommendation = "Thịt đã bảo quản tủ lạnh nhiều ngày. Hãy ngửi kỹ mùi và DÙNG ĐŨA KIỂM TRA ĐỘ NHỚT. Nếu không có mùi chua lạ, phải ĐUN SÔI KỸ tối thiểu 5 phút (nhiệt độ tâm > 85°C) trước khi dùng."
            headline = "Cần kiểm tra kỹ & Nấu sôi lại ngay"
            storage_advice = "Không nên tiếp tục trữ lạnh qua ngày mai. Dùng hết trong bữa ăn này."
            cooking_advice = "Phải hâm nóng sôi sùng sục ít nhất 3-5 phút (nhiệt độ tâm đạt tối thiểu 85°C)."
            risk_title = "Trung bình (Cần hâm sôi kỹ)"
            status_title = "Cần kiểm tra kỹ (Eat Soon / Questionable)"
            status_desc = "Thịt chín đã để tủ lạnh nhiều ngày, có lớp mỡ đông đục hoặc bề mặt se khô. Cần hâm kỹ trước khi tiêu thụ."

        else:
            status = "fresh"
            confidence = 94.0
            probs = {"fresh": 0.94, "aging": 0.04, "frozen_damaged": 0.01, "spoiled": 0.01}
            risk_level = "low"
            indicators = [
                "Màu sắc thơm ngon, tươi tắn chuẩn vị món ăn",
                "Bề mặt khô ráo, mỡ bóng tự nhiên, không có màng nhớt",
                "Không phát hiện dấu hiệu nấm mốc hoặc biến màu lạ"
            ]
            recommendation = "Món ăn đạt chất lượng an toàn, hương vị thơm ngon tự nhiên. Có thể thưởng thức ngay hoặc hâm nóng nhẹ."
            headline = "Món ăn đạt chuẩn thơm ngon an toàn"
            storage_advice = "Bảo quản trong hộp kín ở ngăn mát tủ lạnh (0-4°C) dùng trong 1-2 ngày."
            cooking_advice = "Có thể dùng ngay hoặc hâm nóng lại nhẹ bằng lò vi sóng/bếp."
            risk_title = "Thấp (An toàn)"
            status_title = "Đạt chuẩn an toàn (Good / Safe)"
            status_desc = "Món ăn có màu sắc tươi mới, bề mặt tự nhiên, không có dấu hiệu thiu hỏng hoặc nhớt mốc."

        return {
            "status": "success",
            "detected_type": "cooked",
            "sub_category": detected_sub,
            "meat_name_vn": sub_categories_vn.get(detected_sub, "Thịt đã nấu chín"),
            "freshness_status": status,
            "status_title": status_title,
            "status_description": status_desc,
            "confidence": confidence,
            "risk_level": risk_level,
            "indicators_found": indicators,
            "recommendation": recommendation,
            "probabilities": probs,
            "detected_meat": detected_sub,
            "color_metrics": {
                "avg_red": round(r_mean * 255, 1),
                "avg_green": round(g_mean * 255, 1),
                "avg_blue": round(b_mean * 255, 1),
                "hue_degrees": round(hue_degrees, 1),
                "saturation_pct": round(s_val * 100, 1),
                "brightness_pct": round(v_val * 100, 1),
                "red_green_ratio": round(rg_ratio, 2),
                "freshness_index": 92.0 if status == "fresh" else 55.0 if status == "aging" else 15.0
            },
            "safety_advice": {
                "headline": headline,
                "storage": storage_advice,
                "cooking": cooking_advice,
                "risk_level": risk_title
            },
            "sensory_checklist": [
                {
                    "criterion": "Mùi chua / ủng",
                    "guide": "Ngửi sát xem có mùi chua lên men, mùi ủng thiu hoặc mùi dầu mỡ bị ôi khét không."
                },
                {
                    "criterion": "Độ nhớt / kéo sợi",
                    "guide": "Dùng đũa hoặc thìa chạm vào bề mặt xem có cảm giác nhớt dính hoặc kéo sợi vi khuẩn không."
                },
                {
                    "criterion": "Nhiệt độ phòng",
                    "guide": "Món ăn đã để ngoài nhiệt độ phòng (25-35°C) quá 2 tiếng chưa? Đồ ăn để quá 2h nguy cơ vi khuẩn nhân đôi rất nhanh."
                },
                {
                    "criterion": "Đốm nấm mốc",
                    "guide": "Quan sát kỹ các góc cạnh xem có đốm sợi bông trắng mờ, chấm xanh rêu hoặc đốm xám mốc không."
                }
            ],
            "cv_inspection": cv_inspection,
            "model_mode": "cooked_vision_engine",
            "inference_time_ms": round((time.time() - start_time) * 1000, 1)
        }

    def _analyze_raw(
        self,
        resized_img: Image.Image,
        normalized_np: np.ndarray,
        meat_hint: Optional[str] = None,
        start_time: float = 0.0
    ) -> Dict[str, Any]:
        """
        Internal handler for raw meat analysis pipeline.
        """
        cv_inspection = self.detect_ice_and_discoloration(resized_img)

        if self.model_mode == "onnx_model" and self.model is not None:
            try:
                input_tensor = np.transpose(normalized_np, (2, 0, 1))[np.newaxis, ...].astype(np.float32)
                input_name = self.model.get_inputs()[0].name
                outputs = self.model.run(None, {input_name: input_tensor})
                logits = outputs[0][0]

                # Softmax across 4 classes
                exp_logits = np.exp(logits - np.max(logits))
                probs = exp_logits / np.sum(exp_logits)

                # Fuse OpenCV Guardrails:
                if cv_inspection["white_threshold_exceeded"] and probs[2] < 0.60:
                    probs[2] = max(probs[2], 0.85)
                    rem = (1.0 - probs[2]) / 3.0
                    probs[0], probs[1], probs[3] = rem, rem, rem

                if cv_inspection["dark_threshold_exceeded"] and probs[3] < 0.60:
                    probs[3] = max(probs[3], 0.88)
                    rem = (1.0 - probs[3]) / 3.0
                    probs[0], probs[1], probs[2] = rem, rem, rem

                # Re-normalize
                probs = probs / np.sum(probs)

                top_idx = int(np.argmax(probs))
                status = self.classes[top_idx]
                confidence_pct = round(float(probs[top_idx]) * 100.0, 1)

                # Color metrics
                img_array = np.array(resized_img, dtype=np.float32) / 255.0
                r_mean = float(np.mean(img_array[:, :, 0]))
                g_mean = float(np.mean(img_array[:, :, 1]))
                b_mean = float(np.mean(img_array[:, :, 2]))
                h_val, s_val, v_val = colorsys.rgb_to_hsv(r_mean, g_mean, b_mean)
                rg_ratio = (r_mean + 1e-4) / (g_mean + 1e-4)

                detected_meat = meat_hint if meat_hint in ["beef", "pork", "poultry"] else "beef"

                prob_dict = {
                    "fresh": round(float(probs[0]), 4),
                    "aging": round(float(probs[1]), 4),
                    "frozen_damaged": round(float(probs[2]), 4),
                    "spoiled": round(float(probs[3]), 4)
                }

                result = self._format_result(
                    status, confidence_pct, prob_dict, detected_meat,
                    r_mean, g_mean, b_mean, h_val * 360.0, s_val, v_val, rg_ratio
                )
                result["cv_inspection"] = cv_inspection
                result["model_mode"] = "onnx_model"
                result["inference_time_ms"] = round((time.time() - start_time) * 1000, 1)
                return result
            except Exception as e:
                print(f"[MeatGuard] ONNX inference error ({e}), falling back to heuristic...")

        # Fallback heuristic
        result = self._infer_with_heuristic(resized_img, meat_hint)
        result["cv_inspection"] = cv_inspection
        result["inference_time_ms"] = round((time.time() - start_time) * 1000, 1)
        return result

    def analyze(
        self,
        image: Image.Image,
        meat_hint: Optional[str] = None,
        meat_category: str = "auto"
    ) -> Dict[str, Any]:
        """
        Execute end-to-end analysis on the provided PIL Image.
        Supports both Raw Meat (Deep Learning ONNX + Guardrail) and Cooked/Processed Meat.
        - meat_category: "auto" | "raw" | "cooked"
        """
        start_time = time.time()
        resized_img, normalized_np = self.preprocess_image(image)

        # 1. Resolve raw vs cooked category
        if meat_category == "cooked":
            return self.analyze_cooked_meat(resized_img, sub_hint=meat_hint)
        elif meat_category == "raw":
            return self._analyze_raw(resized_img, normalized_np, meat_hint, start_time)
        else:
            # Auto-detect mode
            detected_type, auto_conf = self.classify_raw_vs_cooked(resized_img)
            if detected_type == "cooked":
                res = self.analyze_cooked_meat(resized_img, sub_hint=meat_hint)
                res["auto_detected"] = True
                res["auto_confidence"] = auto_conf
                return res
            else:
                res = self._analyze_raw(resized_img, normalized_np, meat_hint, start_time)
                res["auto_detected"] = True
                res["auto_confidence"] = auto_conf
                return res

