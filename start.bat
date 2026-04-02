@echo off
echo =========================================
echo   AS Crystal - Starting Application
echo =========================================

echo.
echo [1/2] Starting Backend Server...
start "Crystal Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend...
start "Crystal Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo =========================================
echo   AS Crystal is starting up!
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo   Admin:    http://localhost:3000/admin
echo.
echo   Admin Login: admin@gmail.com
echo   Password:    Password@123
echo =========================================
pause
