"""
MeatGuard - AI Meat Freshness Analyzer
Supports:
1. PyTorch / ONNX Deep Learning Model (if weights are supplied in backend/models)
2. Smart Heuristic Mock Fallback (RGB/HSV colorimetric analysis of meat tissue)
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
        self._initialize_model()

    def _initialize_model(self):
        """
        Attempt to load ONNX or PyTorch model weights from models_dir.
        If missing or libraries unavailable, seamlessly fall back to heuristic mock.
        """
        onnx_file = os.path.join(self.models_dir, "meat_freshness_model.onnx")
        pytorch_file = os.path.join(self.models_dir, "meat_freshness_model.pt")

        if os.path.exists(onnx_file):
            try:
                import onnxruntime as ort
                self.model = ort.InferenceSession(onnx_file)
                self.model_mode = "onnx_model"
                print(f"[MeatGuard] Successfully loaded ONNX model: {onnx_file}")
                return
            except Exception as e:
                print(f"[MeatGuard] Failed to load ONNX model ({e}), falling back...")

        if os.path.exists(pytorch_file):
            try:
                import torch
                self.model = torch.load(pytorch_file, map_location="cpu")
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
        2. Crop central 60% ROI (Region of Interest) where meat sample is positioned.
        3. Resize to 224x224 standard computer vision input size.
        4. Normalize for ImageNet standard (Mean: [0.485, 0.456, 0.406], Std: [0.229, 0.224, 0.225]).
        """
        # Ensure RGB
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Central crop
        w, h = image.size
        crop_ratio = 0.70
        crop_w, crop_h = int(w * crop_ratio), int(h * crop_ratio)
        left = (w - crop_w) // 2
        top = (h - crop_h) // 2
        cropped_img = image.crop((left, top, left + crop_w, top + crop_h))

        # Resize to 224x224
        resized_img = cropped_img.resize((224, 224), Image.Resampling.LANCZOS)

        # Convert to numpy array & normalize
        img_np = np.array(resized_img, dtype=np.float32) / 255.0
        # ImageNet normalization
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        normalized_np = (img_np - mean) / std

        return resized_img, normalized_np

    def _infer_with_heuristic(self, resized_img: Image.Image, meat_hint: Optional[str] = None) -> Dict[str, Any]:
        """
        Intelligent Biometric / Colorimetric Meat Evaluation:
        Analyzes tissue oxidation states based on myoglobin biochemistry:
        - Oxymyoglobin (Fresh): Bright cherry red / vivid pink, high red ratio, healthy saturation.
        - Metmyoglobin (Aging): Brownish oxidation, reduced redness, hue shifts to amber/brown.
        - Microbial Degradation / Sulfmyoglobin (Spoiled): Dull grayish, pale greenish, or mucus gloss.
        """
        img_array = np.array(resized_img, dtype=np.float32) / 255.0  # (224, 224, 3)

        # Sample the center 50% core of the 224x224 patch to avoid boundary noise
        h, w, _ = img_array.shape
        margin_h, margin_w = int(h * 0.25), int(w * 0.25)
        core_patch = img_array[margin_h:h - margin_h, margin_w:w - margin_w]

        # Mean RGB channels
        r_mean = float(np.mean(core_patch[:, :, 0]))
        g_mean = float(np.mean(core_patch[:, :, 1]))
        b_mean = float(np.mean(core_patch[:, :, 2]))

        # Convert RGB to HSV
        h_val, s_val, v_val = colorsys.rgb_to_hsv(r_mean, g_mean, b_mean)
        hue_degrees = h_val * 360.0  # 0 to 360

        # R to G ratio and Red dominance index
        rg_ratio = (r_mean + 1e-4) / (g_mean + 1e-4)
        rb_ratio = (r_mean + 1e-4) / (b_mean + 1e-4)
        red_dominance = (r_mean * 2.0) - (g_mean + b_mean)

        # Detect Meat Type if not hinted
        detected_meat = meat_hint if meat_hint in ["beef", "pork", "poultry"] else None
        if not detected_meat:
            if v_val > 0.65 and r_mean < 0.70 and s_val < 0.40:
                detected_meat = "poultry"  # Chicken / Poultry (pale pink/peach)
            elif r_mean > 0.55 and rg_ratio > 1.35 and s_val > 0.38:
                detected_meat = "beef"     # Beef (deep red, high saturation)
            else:
                detected_meat = "pork"     # Pork (light rose pink)

        # Evaluate freshness score based on biological markers
        # Baseline freshness points: 0.0 (severely spoiled) to 1.0 (ultra fresh)
        freshness_score = 0.5

        # 1. Redness & hue checks
        # True meat hue is around 350°-360° (or 0°-20° red)
        # Metmyoglobin / aging meat shifts to 25°-45° (brown/yellow)
        # Spoiled shifts to 50°-130° (yellow-green/green) or drops saturation drastically < 0.15 (grayish decay)
        is_red_hue = (hue_degrees >= 340 or hue_degrees <= 22)
        is_brown_hue = (22 < hue_degrees <= 45)
        is_green_or_abnormal = (45 < hue_degrees <= 160)

        if is_red_hue and rg_ratio >= 1.25 and s_val >= 0.28:
            # Strong indication of fresh oxymyoglobin
            freshness_score = 0.75 + min(0.22, (rg_ratio - 1.25) * 0.15 + (s_val - 0.28) * 0.2)
        elif is_brown_hue or (rg_ratio < 1.25 and rg_ratio >= 1.05):
            # Moderate oxidation, aging phase
            freshness_score = 0.45 + (rg_ratio - 1.05) * 0.1
        elif is_green_or_abnormal or s_val < 0.18 or r_mean < g_mean:
            # Bacterial discoloration or gray slime
            freshness_score = max(0.08, 0.30 - (s_val * 0.2) - (0.1 if is_green_or_abnormal else 0.0))
        else:
            # Intermediate state
            freshness_score = 0.50

        # Adjust slightly for poultry which has naturally lower redness
        if detected_meat == "poultry":
            # Fresh poultry is light cream-pink (high value, moderate saturation)
            if v_val >= 0.58 and s_val >= 0.18 and not is_green_or_abnormal:
                freshness_score = max(freshness_score, 0.78)
            elif is_green_or_abnormal or v_val < 0.45:
                freshness_score = min(freshness_score, 0.25)

        # Ensure bounds [0.05, 0.98]
        freshness_score = max(0.05, min(0.98, freshness_score))

        # Generate realistic softmax-like probability distribution
        if freshness_score >= 0.65:
            # Fresh dominant
            p_fresh = 0.72 + (freshness_score - 0.65) * 0.8
            p_fresh = min(0.96, p_fresh)
            remaining = 1.0 - p_fresh
            p_aging = remaining * 0.80
            p_spoiled = remaining * 0.20
            status = "fresh"
            status_vn = "Tươi (Fresh)"
            status_desc = "Thịt tươi ngon, mô cơ săn chắc, màu sắc tự nhiên, an toàn để chế biến tiêu thụ."
        elif freshness_score >= 0.40:
            # Aging dominant
            p_aging = 0.65 + (0.65 - freshness_score) * 0.5
            p_aging = min(0.88, p_aging)
            remaining = 1.0 - p_aging
            p_fresh = remaining * 0.55
            p_spoiled = remaining * 0.45
            status = "aging"
            status_vn = "Bắt đầu suy giảm (Half-Fresh / Aging)"
            status_desc = "Thịt đã bắt đầu oxy hóa metmyoglobin, giảm độ tươi. Cần chế biến ngay trong ngày và xử lý nhiệt kỹ."
        else:
            # Spoiled dominant
            p_spoiled = 0.75 + (0.40 - freshness_score) * 0.6
            p_spoiled = min(0.97, p_spoiled)
            remaining = 1.0 - p_spoiled
            p_aging = remaining * 0.80
            p_fresh = remaining * 0.20
            status = "spoiled"
            status_vn = "Ươn / Hỏng (Spoiled)"
            status_desc = "Thịt đã biến chất, có dấu hiệu ươn hỏng hoặc nhiễm khuẩn bề mặt. Tuyệt đối KHÔNG nên ăn để tránh ngộ độc thực phẩm."

        # Normalize probabilities to sum exactly to 1.0
        total_p = p_fresh + p_aging + p_spoiled
        p_fresh = round(p_fresh / total_p, 4)
        p_aging = round(p_aging / total_p, 4)
        p_spoiled = round(p_spoiled / total_p, 4)

        # Confidence percentage
        confidence_map = {"fresh": p_fresh, "aging": p_aging, "spoiled": p_spoiled}
        confidence_pct = round(confidence_map[status] * 100.0, 1)

        # Vietnamese advice and recommendations
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
            "spoiled": {
                "headline": "Cảnh báo nguy cơ ngộ độc",
                "storage": "Vứt bỏ ngay lập tức vào thùng rác kín. Khử khuẩn các dụng cụ và bề mặt dao thớt đã tiếp xúc.",
                "cooking": "Nhiệt độ đun nấu thông thường không thể loại bỏ hoàn toàn độc tố vi khuẩn (như tụ cầu vàng, độc tố Salmonella).",
                "risk_level": "Nguy hiểm (Tuyệt đối không ăn)"
            }
        }

        meat_names_vn = {
            "beef": "Thịt bò (Beef)",
            "pork": "Thịt lợn / heo (Pork)",
            "poultry": "Gia cầm / Gà (Poultry)",
            "unknown": "Thịt tươi sống"
        }

        return {
            "freshness_status": status,
            "status_title": status_vn,
            "status_description": status_desc,
            "confidence": confidence_pct,
            "probabilities": {
                "fresh": p_fresh,
                "aging": p_aging,
                "spoiled": p_spoiled
            },
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
                "freshness_index": round(freshness_score * 100, 1)
            },
            "safety_advice": advice_dict[status],
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
                # Transpose to (1, 3, 224, 224)
                input_tensor = np.transpose(normalized_np, (2, 0, 1))[np.newaxis, ...].astype(np.float32)
                input_name = self.model.get_inputs()[0].name
                outputs = self.model.run(None, {input_name: input_tensor})
                logits = outputs[0][0]
                # Softmax
                exp_logits = np.exp(logits - np.max(logits))
                probs = exp_logits / np.sum(exp_logits)
                
                classes = ["fresh", "aging", "spoiled"]
                top_idx = int(np.argmax(probs))
                status = classes[top_idx]

                result = self._infer_with_heuristic(resized_img, meat_hint)
                result["freshness_status"] = status
                result["probabilities"] = {
                    "fresh": round(float(probs[0]), 4),
                    "aging": round(float(probs[1]), 4),
                    "spoiled": round(float(probs[2]), 4)
                }
                result["confidence"] = round(float(probs[top_idx]) * 100.0, 1)
                result["model_mode"] = "onnx_model"
                result["inference_time_ms"] = round((time.time() - start_time) * 1000, 1)
                return result
            except Exception as e:
                print(f"[MeatGuard] ONNX inference error ({e}), falling back to heuristic...")

        # Fallback heuristic
        result = self._infer_with_heuristic(resized_img, meat_hint)
        result["inference_time_ms"] = round((time.time() - start_time) * 1000, 1)
        return result
