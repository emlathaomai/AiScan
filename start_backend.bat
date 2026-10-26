@echo off
title MeatGuard Backend Server
cd /d "%~dp0backend"
echo [MeatGuard] Dang khoi dong Backend FastAPI tai http://localhost:8000 ...
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
