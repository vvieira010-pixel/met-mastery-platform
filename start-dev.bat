@echo off
setlocal
title MET Mastery - Local Platform

rem Always run the checkout that contains this launcher.
cd /d "%~dp0"

echo Starting MET Mastery from:
echo   %CD%
echo.

if not exist "%~dp0node_modules\.bin\tsx.cmd" (
  echo ERROR: Dependencies are not installed in this checkout.
  echo Run npm install from:
  echo   %~dp0
  pause
  exit /b 1
)

start "MET Mastery server" cmd /k "cd /d "%~dp0" ^&^& "%~dp0node_modules\.bin\tsx.cmd" "%~dp0server.ts""

rem Give Express/Vite a moment to bind before opening the app.
timeout /t 3 /nobreak >nul
start "MET Mastery" "http://localhost:3000"

echo.
echo Platform started at http://localhost:3000
echo Close the server window to stop it.
endlocal
