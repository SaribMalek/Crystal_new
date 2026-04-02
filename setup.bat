@echo off
echo =========================================
echo   AS Crystal - Database Setup
echo =========================================
echo.
echo Setting up MySQL database...
cd /d %~dp0backend
node config/setupDb.js
echo.
echo =========================================
echo   Setup Complete!
echo   Admin: admin@gmail.com / Password@123
echo =========================================
pause
