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

        return {
            "freshness_status": status,
            "status_title": status_titles.get(status, "Đã phân tích"),
            "status_description": status_descs.get(status, ""),
            "confidence": confidence,
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

    def analyze(self, image: Image.Image, meat_hint: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute end-to-end analysis on the provided PIL Image.
        """
        start_time = time.time()
        resized_img, normalized_np = self.preprocess_image(image)

        # Check if neural model is available
        if self.model_mode == "onnx_model" and self.model is not None:
            try:
                input_tensor = np.transpose(normalized_np, (2, 0, 1))[np.newaxis, ...].astype(np.float32)
                input_name = self.model.get_inputs()[0].name
                outputs = self.model.run(None, {input_name: input_tensor})
                logits = outputs[0][0]

                # Softmax across 4 classes
                exp_logits = np.exp(logits - np.max(logits))
                probs = exp_logits / np.sum(exp_logits)

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
                result["model_mode"] = "onnx_model"
                result["inference_time_ms"] = round((time.time() - start_time) * 1000, 1)
                return result
            except Exception as e:
                print(f"[MeatGuard] ONNX inference error ({e}), falling back to heuristic...")

        # Fallback heuristic
        result = self._infer_with_heuristic(resized_img, meat_hint)
        result["inference_time_ms"] = round((time.time() - start_time) * 1000, 1)
        return result
