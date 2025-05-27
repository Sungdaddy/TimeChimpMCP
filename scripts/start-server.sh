#!/bin/bash
# TimeChimp MCP Server Startup Script

echo "🚀 Starting TimeChimp MCP Server..."
echo "📁 Working directory: $(pwd)"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "📄 Loading configuration from .env file"
    source .env
    echo "🔑 API Key: ${TIMECHIMP_API_KEY:0:10}..."
else
    echo "⚠️  No .env file found. Make sure TIMECHIMP_API_KEY is set in environment."
fi

# Try to find the timechimp-mcp-server command
if command -v timechimp-mcp-server &> /dev/null; then
    echo "🌐 Starting MCP server on stdio..."
    timechimp-mcp-server
elif [ -f "/Users/armandswirc/Library/Python/3.9/bin/timechimp-mcp-server" ]; then
    echo "🌐 Starting MCP server on stdio (local installation)..."
    /Users/armandswirc/Library/Python/3.9/bin/timechimp-mcp-server
else
    echo "❌ timechimp-mcp-server not found. Please install with: pip install -e ."
    echo "   Or run directly with: python3 -m timechimp_mcp_server.main"
    exit 1
fi 