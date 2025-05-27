@echo off
setlocal enabledelayedexpansion
REM TimeChimp MCP Server - Windows Installation Script

echo ========================================
echo   TimeChimp MCP Server - Windows Setup
echo ========================================
echo.

REM Check if Python is installed
echo 🔍 Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.9 or higher first.
    echo    Visit: https://www.python.org/downloads/
    echo    Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo ✅ Python found: 
python --version

REM Check if pip is available
echo 🔍 Checking pip installation...
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip not found. Please ensure pip is installed with Python.
    echo.
    pause
    exit /b 1
)

echo ✅ pip found: 
pip --version

REM Check if Node.js is available (for MCP Inspector)
echo 🔍 Checking Node.js installation...
where npx >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Node.js/npx not found. MCP Inspector will not be available.
    echo    To use MCP Inspector, install Node.js from: https://nodejs.org/
    echo    You can continue without it and install Node.js later.
    echo.
    set NODE_AVAILABLE=false
) else (
    echo ✅ Node.js found: 
    node --version
    set NODE_AVAILABLE=true
)

echo.
echo 📦 Installing TimeChimp MCP Server...
pip install -e .

if %errorlevel% neq 0 (
    echo ❌ Installation failed. Please check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Installation completed successfully!

REM Prompt for API key during installation
echo.
echo 🔑 API Key Configuration
echo ========================================
echo.
echo To use the TimeChimp MCP Server, you need your TimeChimp API key.
echo.
echo 📝 How to get your API key:
echo    1. Log in to your TimeChimp account
echo    2. Go to Settings ^> API
echo    3. Generate a new API key
echo    4. Copy the key
echo.
set /p API_KEY="Please paste your TimeChimp API key here: "

REM Validate that something was entered
if "%API_KEY%"=="" (
    echo.
    echo ⚠️  No API key provided. You can configure it later by editing .env file.
    echo    Replace YOUR_API_KEY_HERE with your actual API key.
    goto skip_api_config
)

REM Update the .env file with the provided API key
echo.
echo 🔧 Configuring .env file with your API key...

REM Create a temporary file with the updated content
echo # TimeChimp MCP Server Configuration > .env.tmp
echo # API key configured during installation >> .env.tmp
echo. >> .env.tmp
echo TIMECHIMP_API_KEY=%API_KEY% >> .env.tmp
echo TIMECHIMP_BASE_URL=https://v2.api.timechimp.com >> .env.tmp
echo LOG_LEVEL=INFO >> .env.tmp

REM Replace the original .env file
move .env.tmp .env >nul

echo ✅ API key configured successfully!
echo 🔑 API Key: %API_KEY:~0,10%...

:skip_api_config

echo.
echo 🎉 Setup Complete!
echo.
echo 🔧 Available commands:
echo    • scripts\start-server.bat     - Start the MCP server
echo    • scripts\start-server.ps1     - Start with PowerShell
echo    • scripts\test-with-inspector.bat - Test with MCP Inspector
echo    • scripts\test-with-inspector.ps1 - Test with PowerShell

if "%NODE_AVAILABLE%"=="true" (
    if not "%API_KEY%"=="" (
        echo.
        choice /C YN /M "Do you want to start the MCP Inspector now"
        if errorlevel 2 goto skip_inspector
        if errorlevel 1 (
            echo.
            echo 🚀 Starting MCP Inspector...
            echo 📊 Inspector UI will open at: http://localhost:6274
            echo 🔧 Press Ctrl+C to stop the inspector when done.
            echo.
            timeout /t 3 /nobreak >nul
            call scripts\test-with-inspector.bat
        )
        :skip_inspector
        echo.
        echo 💡 To start the MCP Inspector later, run: scripts\test-with-inspector.bat
    ) else (
        echo.
        echo 💡 Configure your API key first, then run: scripts\test-with-inspector.bat
    )
) else (
    echo.
    echo 💡 Install Node.js from https://nodejs.org/ to use the MCP Inspector.
    if not "%API_KEY%"=="" (
        echo    Then run: scripts\test-with-inspector.bat
    ) else (
        echo    Configure your API key first, then run: scripts\test-with-inspector.bat
    )
)

echo.
echo ✅ Installation and setup completed!
pause 