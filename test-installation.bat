@echo off
REM Test script to verify TimeChimp MCP Server installation

echo ========================================
echo   TimeChimp MCP Server - Installation Test
echo ========================================
echo.

echo 🔍 Testing Python installation...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python test failed
    goto test_failed
)
echo ✅ Python OK

echo.
echo 🔍 Testing pip installation...
pip --version
if %errorlevel% neq 0 (
    echo ❌ pip test failed
    goto test_failed
)
echo ✅ pip OK

echo.
echo 🔍 Testing TimeChimp MCP Server installation...
python -c "import src.timechimp_mcp_server.server; print('✅ MCP Server module imported successfully')"
if %errorlevel% neq 0 (
    echo ❌ MCP Server import failed
    goto test_failed
)

echo.
echo 🔍 Testing timechimp-mcp-server command...
where timechimp-mcp-server >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ timechimp-mcp-server command found
) else (
    echo ⚠️  timechimp-mcp-server command not found (this is OK, can use python -m instead)
)

echo.
echo 🔍 Testing .env file...
if exist ".env" (
    echo ✅ .env file exists
    
    REM Load the API key to check if it's configured
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if "%%a"=="TIMECHIMP_API_KEY" set TEST_API_KEY=%%b
    )
    
    if "%TEST_API_KEY%"=="YOUR_API_KEY_HERE" (
        echo ⚠️  API key not configured yet (still using placeholder)
        echo    Run install-windows.bat again to configure your API key
    ) else if "%TEST_API_KEY%"=="" (
        echo ⚠️  API key is empty
        echo    Run install-windows.bat again to configure your API key
    ) else (
        echo ✅ API key appears to be configured
        echo 🔑 API Key: %TEST_API_KEY:~0,10%...
    )
) else (
    echo ❌ .env file missing
    goto test_failed
)

echo.
echo 🔍 Testing Node.js (optional for MCP Inspector)...
where npx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js/npx found - MCP Inspector available
) else (
    echo ⚠️  Node.js/npx not found - MCP Inspector not available
)

echo.
echo ========================================
echo ✅ All tests passed! Installation looks good.
echo ========================================
echo.
echo 💡 Next steps:
echo    1. Configure your API key in .env file if not done yet
echo    2. Run: scripts\start-server.bat
echo    3. Or test with: scripts\test-with-inspector.bat
echo.
goto end

:test_failed
echo.
echo ========================================
echo ❌ Some tests failed. Please check the installation.
echo ========================================
echo.
echo 💡 Try running: install-windows.bat
echo.

:end
pause 