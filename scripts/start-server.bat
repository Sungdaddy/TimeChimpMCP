@echo off
REM TimeChimp MCP Server Startup Script for Windows

echo 🚀 Starting TimeChimp MCP Server...
echo 📁 Working directory: %CD%
echo.
echo ⚠️  IMPORTANT: This server will run continuously until you stop it manually.
echo    To stop the server, press Ctrl+C in this window.
echo.

REM Check if .env file exists
if exist ".env" (
    echo 📄 Loading configuration from .env file
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if "%%a"=="TIMECHIMP_API_KEY" set TIMECHIMP_API_KEY=%%b
        if "%%a"=="TIMECHIMP_BASE_URL" set TIMECHIMP_BASE_URL=%%b
        if "%%a"=="LOG_LEVEL" set LOG_LEVEL=%%b
    )
    echo 🔑 API Key: %TIMECHIMP_API_KEY:~0,10%...
) else (
    echo ⚠️  No .env file found. Make sure TIMECHIMP_API_KEY is set in environment.
)

echo.
echo 🌐 Starting MCP server (continuous mode)...
echo 💡 The server is now ready to accept MCP requests via stdio.
echo 🛑 Press Ctrl+C to stop the server when you're done.
echo.

REM Try to find the timechimp-mcp-server command
where timechimp-mcp-server >nul 2>&1
if %errorlevel% == 0 (
    timechimp-mcp-server
) else (
    echo ⚠️  timechimp-mcp-server command not found, using python module...
    python -m timechimp_mcp_server.main
)

echo.
echo 🛑 Server stopped.
pause 