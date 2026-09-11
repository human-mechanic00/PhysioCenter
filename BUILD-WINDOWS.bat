@echo off
chcp 65001 >nul
echo ========================================
echo PhysioCenter - Build Windows Installer
echo ========================================
echo.
where node >nul 2>nul || (echo Node.js is required only on this build computer. & pause & exit /b 1)
where npm >nul 2>nul || (echo npm is required only on this build computer. & pause & exit /b 1)
echo Installing dependencies...
npm install
if errorlevel 1 (echo npm install failed. & pause & exit /b 1)
echo.
echo Building PhysioCenter Setup.exe...
npm run build
if errorlevel 1 (echo Build failed. & pause & exit /b 1)
echo.
echo SUCCESS. Check the dist folder for PhysioCenter-Setup-1.0.0.exe
echo.
pause
