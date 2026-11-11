@echo off
title DPIS - Diabetes Prediction Intelligence System
color 0b
echo ======================================================================
echo    DPIS - Diabetes Prediction Intelligence System
echo    Launching local servers without Docker...
echo ======================================================================
echo.

REM 1. Start Python Backend in a dedicated window
echo [*] Starting Python Backend (FastAPI) on http://127.0.0.1:8000 ...
start "DPIS Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && python run_server.py"

REM 2. Start Vite Frontend in a dedicated window
echo [*] Starting React Frontend (Vite) on http://localhost:3000 ...
start "DPIS Frontend (React)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

REM 3. Wait briefly for servers to initialize, then launch the browser
timeout /t 3 /nobreak >nul
echo [*] Launching web browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ======================================================================
echo  DPIS is now live!
echo  - Web Application:       http://localhost:3000
echo  - API Docs (Swagger):    http://127.0.0.1:8000/api/docs
echo ======================================================================
echo.
pause

