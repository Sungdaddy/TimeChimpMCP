#!/usr/bin/env python3
"""
Web server wrapper for TimeChimp MCP Server on Replit.
This allows the MCP server to be accessed over HTTP instead of stdio.
"""

import asyncio
import json
import os
from flask import Flask, request, jsonify, render_template_string
from src.timechimp_mcp_server.server import TimeChimpMCPServer, MCPRequest

app = Flask(__name__)
mcp_server = None

# HTML template for the web interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>TimeChimp MCP Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .status { padding: 15px; border-radius: 5px; margin: 20px 0; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .endpoint { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #007bff; }
        code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        .tools { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin: 20px 0; }
        .tool { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; }
        .tool h3 { margin-top: 0; color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐵 TimeChimp MCP Server</h1>
        
        <div class="status {{ status_class }}">
            <strong>Status:</strong> {{ status_message }}
        </div>
        
        <div class="info">
            <h3>📡 API Endpoint</h3>
            <div class="endpoint">
                <strong>POST</strong> <code>{{ base_url }}/mcp</code>
                <br><small>Send MCP JSON-RPC requests to this endpoint</small>
            </div>
        </div>
        
        <div class="info">
            <h3>🛠 Available Tools</h3>
            <div class="tools">
                {% for tool in tools %}
                <div class="tool">
                    <h3>{{ tool.name }}</h3>
                    <p>{{ tool.description }}</p>
                </div>
                {% endfor %}
            </div>
        </div>
        
        <div class="info">
            <h3>🔗 Claude Desktop Integration</h3>
            <p>Add this to your Claude Desktop configuration:</p>
            <pre><code>{
  "mcpServers": {
    "timechimp": {
      "command": "curl",
      "args": ["-X", "POST", "{{ base_url }}/mcp", "-H", "Content-Type: application/json", "-d", "@-"]
    }
  }
}</code></pre>
        </div>
        
        <div class="info">
            <h3>📚 Documentation</h3>
            <p>For detailed usage instructions, see the <a href="https://github.com/Sungdaddy/TheChimp" target="_blank">GitHub repository</a>.</p>
        </div>
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    """Display the web interface."""
    global mcp_server
    
    # Check server status
    if mcp_server is None:
        status_class = "error"
        status_message = "Server not initialized - check environment variables"
        tools = []
    else:
        status_class = "success"
        status_message = "Server running and ready to accept requests"
        tools = mcp_server.tools
    
    base_url = request.url_root.rstrip('/')
    
    return render_template_string(
        HTML_TEMPLATE,
        status_class=status_class,
        status_message=status_message,
        tools=tools,
        base_url=base_url
    )

@app.route('/mcp', methods=['POST'])
def handle_mcp():
    """Handle MCP JSON-RPC requests."""
    global mcp_server
    
    if mcp_server is None:
        return jsonify({
            "jsonrpc": "2.0",
            "error": {
                "code": -32603,
                "message": "Server not initialized - check TIMECHIMP_API_KEY environment variable"
            }
        }), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "jsonrpc": "2.0",
                "error": {
                    "code": -32700,
                    "message": "Parse error - invalid JSON"
                }
            }), 400
        
        # Handle the request asynchronously
        request_obj = MCPRequest(**data)
        response = asyncio.run(mcp_server.handle_request(request_obj))
        
        return jsonify(response.model_dump(exclude_none=True))
        
    except Exception as e:
        return jsonify({
            "jsonrpc": "2.0",
            "id": data.get("id") if data else None,
            "error": {
                "code": -32603,
                "message": f"Internal error: {str(e)}"
            }
        }), 500

@app.route('/health')
def health():
    """Health check endpoint."""
    global mcp_server
    
    if mcp_server is None:
        return jsonify({"status": "error", "message": "Server not initialized"}), 500
    
    return jsonify({
        "status": "healthy",
        "server": "timechimp-mcp-server",
        "version": "0.1.0",
        "tools_count": len(mcp_server.tools)
    })

def initialize_server():
    """Initialize the MCP server with environment variables."""
    global mcp_server
    
    api_key = os.getenv('TIMECHIMP_API_KEY')
    if not api_key:
        print("❌ TIMECHIMP_API_KEY environment variable not found")
        print("   Please set it in the Replit Secrets tab")
        return False
    
    try:
        mcp_server = TimeChimpMCPServer(api_key)
        print(f"✅ TimeChimp MCP Server initialized with API key: {api_key[:10]}...")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize server: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Starting TimeChimp MCP Web Server...")
    
    # Initialize the MCP server
    if initialize_server():
        print("🌐 Server ready at http://0.0.0.0:5000")
        print("📡 MCP endpoint: http://0.0.0.0:5000/mcp")
    else:
        print("⚠️  Server starting without MCP functionality")
    
    # Start the Flask app
    app.run(host='0.0.0.0', port=5000, debug=False) 