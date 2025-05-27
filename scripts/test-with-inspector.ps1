# TimeChimp MCP Server - MCP Inspector Test Script for Windows PowerShell

Write-Host "🔍 Starting TimeChimp MCP Server with MCP Inspector..." -ForegroundColor Green
Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Cyan

# Check if .env file exists and load it
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
    Write-Host "⚠️  No .env file found. Using environment variables." -ForegroundColor Yellow
}

# Check if Node.js is available
try {
    $null = Get-Command npx -ErrorAction Stop
} catch {
    Write-Host "❌ Node.js/npx not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Visit: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python dependencies are installed
try {
    python -c "import src.timechimp_mcp_server.server" 2>$null
} catch {
    Write-Host "⚠️  Python dependencies not found. Installing..." -ForegroundColor Yellow
    pip install -e .
}

Write-Host ""
Write-Host "🚀 Starting MCP Inspector..." -ForegroundColor Green
Write-Host "📊 Inspector UI will open at: http://localhost:6274" -ForegroundColor Cyan
Write-Host "🔧 Proxy server will run at: http://localhost:6277" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Available testing modes:" -ForegroundColor Yellow
Write-Host "   1. Interactive UI - Use the web interface for visual testing"
Write-Host "   2. CLI Mode - Add --cli flag for command-line testing"
Write-Host ""

# Set default values if not set
if (-not $env:TIMECHIMP_BASE_URL) {
    $env:TIMECHIMP_BASE_URL = "https://v2.api.timechimp.com"
}
if (-not $env:LOG_LEVEL) {
    $env:LOG_LEVEL = "INFO"
}

# Run MCP Inspector with environment variables
& npx @modelcontextprotocol/inspector -e "TIMECHIMP_API_KEY=$env:TIMECHIMP_API_KEY" -e "TIMECHIMP_BASE_URL=$env:TIMECHIMP_BASE_URL" -e "LOG_LEVEL=$env:LOG_LEVEL" python -m timechimp_mcp_server.main 