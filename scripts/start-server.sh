#!/bin/bash
# TimeChimp MCP Server Startup Script

echo "🚀 Starting TimeChimp MCP Server..."
echo "📁 Working directory: $(pwd)"
echo ""
echo "⚠️  IMPORTANT: This server will run continuously until you stop it manually."
echo "   To stop the server, press Ctrl+C in this terminal."
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "📄 Loading configuration from .env file"
    source .env
    echo "🔑 API Key: ${TIMECHIMP_API_KEY:0:10}..."
else
    echo "⚠️  No .env file found. Make sure TIMECHIMP_API_KEY is set in environment."
fi

echo ""
echo "🌐 Starting MCP server (continuous mode)..."
echo "💡 The server is now ready to accept MCP requests via stdio."
echo "🛑 Press Ctrl+C to stop the server when you're done."
echo ""

# Try to find the timechimp-mcp-server command
if command -v timechimp-mcp-server &> /dev/null; then
    timechimp-mcp-server
elif [ -f "/Users/armandswirc/Library/Python/3.9/bin/timechimp-mcp-server" ]; then
    /Users/armandswirc/Library/Python/3.9/bin/timechimp-mcp-server
else
    echo "⚠️  timechimp-mcp-server command not found, using python module..."
    python3 -m timechimp_mcp_server.main
fi

echo ""
echo "�� Server stopped." 