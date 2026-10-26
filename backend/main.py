"""
MeatGuard - FastAPI Backend Server
Provides API endpoints for meat freshness analysis and health diagnostics.
"""

import io
import time
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

from model_loader import MeatFreshnessAnalyzer

app = FastAPI(
    title="MeatGuard API - AI Meat Freshness Scanner",
    description="API cung cấp nhận diện và đánh giá độ tươi sống của thịt (Bò, Lợn, Gia cầm) qua hình ảnh.",
    version="1.0.0"
)

# Enable CORS for Frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Analyzer (loads model or gracefully falls back to Heuristic Mock Mode)
analyzer = MeatFreshnessAnalyzer(models_dir="models")


@app.get("/")
def root():
    return {
        "app": "MeatGuard - AI Meat Freshness Scanner",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs"
    }


@app.get("/api/health")
def health_check():
    """
    Health check endpoint returning backend status and active inference mode.
    """
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "model_mode": analyzer.model_mode,
        "supported_categories": ["auto", "raw", "cooked"],
        "supported_meats": ["beef", "pork", "poultry", "auto_detect"],
        "supported_cooked_meats": ["boiled_pork", "braised_pork", "fried_grilled", "processed_sausage"],
        "version": "1.1.0"
    }


@app.post("/api/analyze")
async def analyze_meat(
    file: UploadFile = File(...),
    meat_category: str = Form("auto"),
    meat_hint: Optional[str] = Form(None)
):
    """
    Endpoint receives image file via multipart/form-data and optional meat_hint.
    Returns detailed freshness status, confidence, probabilities, color metrics, and safety checklist.
    """
    # 1. Validate file presence
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng cung cấp file ảnh cần phân tích."
        )

    # 2. Validate MIME type
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Định dạng file không hợp lệ ({file.content_type}). Vui lòng tải file ảnh (JPEG, PNG, WEBP)."
        )

    try:
        # Read image content
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File ảnh rỗng. Vui lòng chọn ảnh hợp lệ."
            )

        if len(contents) > 20 * 1024 * 1024:  # 20MB limit
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Kích thước ảnh quá lớn (vượt quá 20MB). Vui lòng chọn ảnh nhỏ hơn."
            )

        # Open and verify PIL image
        try:
            image = Image.open(io.BytesIO(contents))
            image.verify()  # Verify integrity
            # Reopen because verify() closes the stream
            image = Image.open(io.BytesIO(contents))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể đọc dữ liệu ảnh. Ảnh có thể bị lỗi hoặc định dạng không hỗ trợ."
            )

        # 3. Analyze image
        analysis_result = analyzer.analyze(image, meat_hint=meat_hint, meat_category=meat_category)
        analysis_result["filename"] = file.filename
        analysis_result["image_size"] = {"width": image.width, "height": image.height}

        return JSONResponse(status_code=status.HTTP_200_OK, content=analysis_result)

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[MeatGuard Error] Unexpected error during analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Đã xảy ra lỗi nội bộ trong quá trình phân tích ảnh: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
