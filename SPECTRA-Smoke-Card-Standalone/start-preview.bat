@echo off
cd /d "%~dp0"
start "" "http://127.0.0.1:43191/index.html"
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 43191 --bind 127.0.0.1
) else (
  python -m http.server 43191 --bind 127.0.0.1
)
