@echo off
echo.
echo ===== Recipe Generator Setup =====
echo.
echo This script will help you set up the Recipe Generator app.
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version

echo.
echo Installing dependencies...
cd backend

REM Check if node_modules exists
if exist "node_modules\" (
    echo node_modules already exists, skipping npm install
) else (
    echo Running npm install...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
)

echo.
echo ===== Setup Complete! =====
echo.
echo Next steps:
echo 1. Get Gemini API key from: https://makersuite.google.com/app/apikey
echo 2. Edit backend\.env and add your API key
echo 3. Run: npm start
echo 4. Open: http://localhost:3000
echo.
pause
