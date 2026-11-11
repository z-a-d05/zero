# DPIS Local Runner for PowerShell without Docker
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   DPIS - Diabetes Prediction Intelligence System" -ForegroundColor White
Write-Host "   Starting local environment without Docker..." -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Python Backend
Write-Host "[*] Starting Python FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$scriptDir\backend`" && python run_server.py"

# 2. Start Frontend
Write-Host "[*] Starting Vite React Frontend on http://localhost:3000..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$scriptDir\frontend`" && npm run dev"

# 3. Wait and Open Browser
Start-Sleep -Seconds 3
Write-Host "[*] Opening browser at http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`nSystem is running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "API Gateway Swagger: http://127.0.0.1:8000/api/docs" -ForegroundColor White

