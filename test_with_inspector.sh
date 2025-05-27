#!/bin/bash
# TimeChimp MCP Server - MCP Inspector Test Script

echo "🔍 Starting TimeChimp MCP Server with MCP Inspector..."
echo "📁 Working directory: $(pwd)"

# Check if .env file exists and load it
if [ -f ".env" ]; then
    echo "📄 Loading configuration from .env file"
    source .env
    echo "🔑 API Key: ${TIMECHIMP_API_KEY:0:10}..."
else
    echo "⚠️  No .env file found. Using environment variables."
fi

# Check if Node.js is available
if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/npx not found. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if Python dependencies are installed
if ! python3 -c "import src.timechimp_mcp_server.server" 2>/dev/null; then
    echo "⚠️  Python dependencies not found. Installing..."
    pip install -e .
fi

echo ""
echo "🚀 Starting MCP Inspector..."
echo "📊 Inspector UI will open at: http://localhost:6274"
echo "🔧 Proxy server will run at: http://localhost:6277"
echo ""
echo "💡 Available testing modes:"
echo "   1. Interactive UI - Use the web interface for visual testing"
echo "   2. CLI Mode - Add --cli flag for command-line testing"
echo ""

# Run MCP Inspector with environment variables
npx @modelcontextprotocol/inspector \
  -e TIMECHIMP_API_KEY="${TIMECHIMP_API_KEY}" \
  -e TIMECHIMP_BASE_URL="${TIMECHIMP_BASE_URL:-https://v2.api.timechimp.com}" \
  -e LOG_LEVEL="${LOG_LEVEL:-INFO}" \
  python3 -m timechimp_mcp_server.main 