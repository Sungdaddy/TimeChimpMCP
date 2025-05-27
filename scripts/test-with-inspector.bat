@echo off
REM TimeChimp MCP Server - MCP Inspector Test Script for Windows

echo 🔍 Starting TimeChimp MCP Server with MCP Inspector...
echo 📁 Working directory: %CD%

REM Check if .env file exists and load it
if exist ".env" (
    echo 📄 Loading configuration from .env file
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if "%%a"=="TIMECHIMP_API_KEY" set TIMECHIMP_API_KEY=%%b
        if "%%a"=="TIMECHIMP_BASE_URL" set TIMECHIMP_BASE_URL=%%b
        if "%%a"=="LOG_LEVEL" set LOG_LEVEL=%%b
    )
    
    REM Check if API key is still the placeholder or empty
    if "%TIMECHIMP_API_KEY%"=="YOUR_API_KEY_HERE" (
        echo ⚠️  API key not configured! Please edit .env file first.
        echo    Replace YOUR_API_KEY_HERE with your actual TimeChimp API key.
        echo.
        choice /C YN /M "Do you want to open the .env file now"
        if errorlevel 2 goto exit_script
        if errorlevel 1 (
            notepad .env
            echo.
            echo Please restart this script after saving your API key.
            pause
            goto exit_script
        )
    )
    
    if "%TIMECHIMP_API_KEY%"=="" (
        echo ⚠️  API key is empty! Please edit .env file first.
        echo    Add your actual TimeChimp API key to TIMECHIMP_API_KEY.
        echo.
        choice /C YN /M "Do you want to open the .env file now"
        if errorlevel 2 goto exit_script
        if errorlevel 1 (
            notepad .env
            echo.
            echo Please restart this script after saving your API key.
            pause
            goto exit_script
        )
    )
    
    echo 🔑 API Key: %TIMECHIMP_API_KEY:~0,10%...
) else (
    echo ⚠️  No .env file found. Using environment variables.
)

REM Check if Node.js is available
where npx >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js/npx not found. Please install Node.js first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python dependencies are installed
python -c "import src.timechimp_mcp_server.server" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Python dependencies not found. Installing...
    pip install -e .
)

echo.
echo 🚀 Starting MCP Inspector...
echo 📊 Inspector UI will open at: http://localhost:6274
echo 🔧 Proxy server will run at: http://localhost:6277
echo.
echo 💡 Available testing modes:
echo    1. Interactive UI - Use the web interface for visual testing
echo    2. CLI Mode - Add --cli flag for command-line testing
echo.

REM Set default values if not set
if "%TIMECHIMP_BASE_URL%"=="" set TIMECHIMP_BASE_URL=https://v2.api.timechimp.com
if "%LOG_LEVEL%"=="" set LOG_LEVEL=INFO

REM Run MCP Inspector with environment variables
npx @modelcontextprotocol/inspector -e TIMECHIMP_API_KEY=%TIMECHIMP_API_KEY% -e TIMECHIMP_BASE_URL=%TIMECHIMP_BASE_URL% -e LOG_LEVEL=%LOG_LEVEL% python -m timechimp_mcp_server.main

:exit_script 