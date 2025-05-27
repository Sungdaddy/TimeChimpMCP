# TimeChimp MCP Server Startup Script for Windows PowerShell

Write-Host "🚀 Starting TimeChimp MCP Server..." -ForegroundColor Green
Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Cyan

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

# Try to find the timechimp-mcp-server command
try {
    $null = Get-Command timechimp-mcp-server -ErrorAction Stop
    Write-Host "🌐 Starting MCP server on stdio..." -ForegroundColor Green
    & timechimp-mcp-server
} catch {
    Write-Host "❌ timechimp-mcp-server not found. Please install with: pip install -e ." -ForegroundColor Red
    Write-Host "   Or run directly with: python -m timechimp_mcp_server.main" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
} 