@echo off
cd /d "%~dp0"
start "SPECTRA OCEAN SERVER" /min python -m http.server 4192 --directory "%~dp0"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:4192/"
