@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "node_modules\.bin\vite.cmd" (
  echo 项目依赖尚未安装，请先在此目录运行 pnpm install。
  pause
  exit /b 1
)

start "Safe Aim Guard" /min /d "%~dp0" cmd /k "node_modules\.bin\vite.cmd --host 127.0.0.1 --port 5173 --strictPort"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5173/"
