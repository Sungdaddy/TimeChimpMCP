# TimeChimp MCP Server Startup Script for Windows PowerShell

Write-Host "🚀 Starting TimeChimp MCP Server..." -ForegroundColor Green
Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: This server will run continuously until you stop it manually." -ForegroundColor Yellow
Write-Host "   To stop the server, press Ctrl+C in this window." -ForegroundColor Yellow
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "📄 Loading configuration from .env file" -ForegroundColor Yellow
    
    # Load environment variables from .env file
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    
    $apiKey = $env:TIMECHIMP_API_KEY
    if ($apiKey) {
        $maskedKey = $apiKey.Substring(0, [Math]::Min(10, $apiKey.Length)) + "..."
        Write-Host "🔑 API Key: $maskedKey" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  No .env file found. Make sure TIMECHIMP_API_KEY is set in environment." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 Starting MCP server (continuous mode)..." -ForegroundColor Green
Write-Host "💡 The server is now ready to accept MCP requests via stdio." -ForegroundColor Cyan
Write-Host "🛑 Press Ctrl+C to stop the server when you're done." -ForegroundColor Yellow
Write-Host ""

# Try to find the timechimp-mcp-server command
try {
    $null = Get-Command timechimp-mcp-server -ErrorAction Stop
    & timechimp-mcp-server
} catch {
    Write-Host "⚠️  timechimp-mcp-server command not found, using python module..." -ForegroundColor Yellow
    & python -m timechimp_mcp_server.main
}

Write-Host ""
Write-Host "🛑 Server stopped." -ForegroundColor Red
Read-Host "Press Enter to exit" 