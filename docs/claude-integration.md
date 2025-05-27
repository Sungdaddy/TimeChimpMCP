# 🤖 Claude Desktop Integration Guide

## 🌐 Connecting Replit-Hosted MCP Server to Claude Desktop on Mac

This guide shows you how to connect your TimeChimp MCP Server running on Replit to Claude Desktop on your Mac.

## 📋 Prerequisites

1. **Replit Account**: Your TimeChimp MCP Server deployed on Replit
2. **Claude Desktop**: Installed on your Mac
3. **Replit URL**: Your deployed server's public URL

## 🚀 Step-by-Step Setup

### Step 1: Get Your Replit Server URL

1. **Deploy your Repl** by clicking the "Run" button in Replit
2. **Copy the public URL** - it will look like: `https://your-repl-name.your-username.repl.co`
3. **Test the server** by visiting the URL in your browser - you should see the TimeChimp MCP Server interface

### Step 2: Create HTTP MCP Bridge Script

Since Claude Desktop expects stdio communication but your Replit server uses HTTP, we need a bridge script.

Create this file on your Mac:

**Location**: `~/timechimp-mcp-bridge.py`

```python
#!/usr/bin/env python3
"""
HTTP to stdio bridge for TimeChimp MCP Server on Replit.
This script allows Claude Desktop to communicate with the HTTP-based MCP server.
"""

import json
import sys
import requests
import asyncio
from typing import Dict, Any

# Replace with your actual Replit URL
REPLIT_URL = "https://your-repl-name.your-username.repl.co"
MCP_ENDPOINT = f"{REPLIT_URL}/mcp"

def send_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """Send a request to the Replit MCP server."""
    try:
        response = requests.post(
            MCP_ENDPOINT,
            json=data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {
            "jsonrpc": "2.0",
            "id": data.get("id"),
            "error": {
                "code": -32603,
                "message": f"HTTP request failed: {str(e)}"
            }
        }

def main():
    """Main stdio bridge loop."""
    try:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            
            try:
                # Parse the JSON-RPC request
                request_data = json.loads(line)
                
                # Forward to Replit server
                response_data = send_request(request_data)
                
                # Send response back to Claude
                print(json.dumps(response_data), flush=True)
                
            except json.JSONDecodeError as e:
                error_response = {
                    "jsonrpc": "2.0",
                    "error": {
                        "code": -32700,
                        "message": f"Parse error: {str(e)}"
                    }
                }
                print(json.dumps(error_response), flush=True)
                
    except KeyboardInterrupt:
        pass
    except Exception as e:
        error_response = {
            "jsonrpc": "2.0",
            "error": {
                "code": -32603,
                "message": f"Bridge error: {str(e)}"
            }
        }
        print(json.dumps(error_response), flush=True)

if __name__ == "__main__":
    main()
```

### Step 3: Make the Bridge Script Executable

```bash
chmod +x ~/timechimp-mcp-bridge.py
```

### Step 4: Configure Claude Desktop

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "timechimp": {
      "command": "python3",
      "args": ["/Users/YOUR_USERNAME/timechimp-mcp-bridge.py"]
    }
  }
}
```

**Replace `YOUR_USERNAME`** with your actual Mac username.

### Step 5: Update Bridge Script with Your Replit URL

Edit `~/timechimp-mcp-bridge.py` and replace:
```python
REPLIT_URL = "https://your-repl-name.your-username.repl.co"
```

With your actual Replit URL.

## 🔧 Alternative: Direct curl Method (Simpler)

If you prefer a simpler approach without a bridge script:

**Claude Desktop Config**:
```json
{
  "mcpServers": {
    "timechimp": {
      "command": "bash",
      "args": ["-c", "while IFS= read -r line; do curl -s -X POST 'https://your-repl-name.your-username.repl.co/mcp' -H 'Content-Type: application/json' -d \"$line\"; done"]
    }
  }
}
```

## 🧪 Testing the Integration

### Step 1: Restart Claude Desktop
Close and reopen Claude Desktop to load the new configuration.

### Step 2: Test Basic Functionality
In Claude Desktop, try:
```
"Show me my TimeChimp projects"
```

### Step 3: Test Time Entry Creation
```
"Create a time entry for project 'Development' from 9:00 AM to 11:00 AM today for 'Working on features'"
```

## 🔍 Troubleshooting

### Bridge Script Issues
```bash
# Test the bridge script manually
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | python3 ~/timechimp-mcp-bridge.py
```

### Replit Server Issues
1. **Check if server is running**: Visit your Replit URL in browser
2. **Check logs**: Look at Replit console for errors
3. **Verify environment variables**: Ensure `TIMECHIMP_API_KEY` is set in Replit Secrets

### Claude Desktop Issues
1. **Check config file syntax**: Validate JSON format
2. **Check file paths**: Ensure bridge script path is correct
3. **Check permissions**: Ensure bridge script is executable

### Network Issues
```bash
# Test direct connection to Replit server
curl -X POST "https://your-repl-name.your-username.repl.co/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

## 📊 Monitoring and Logs

### Replit Server Logs
Check the Replit console for server logs and errors.

### Bridge Script Logs
Add logging to the bridge script for debugging:

```python
import logging
logging.basicConfig(filename='/tmp/timechimp-bridge.log', level=logging.DEBUG)
```

### Claude Desktop Logs
Check Claude Desktop logs for MCP-related errors.

## 🎯 Best Practices

1. **Keep Replit Always Running**: Use Replit's "Always On" feature for production use
2. **Monitor API Usage**: Keep track of TimeChimp API rate limits
3. **Secure Your Environment**: Never commit API keys to public repositories
4. **Regular Updates**: Keep your server and dependencies updated

## 🚀 Advanced Configuration

### Custom Domain (Optional)
If you have a custom domain, you can point it to your Replit deployment for a cleaner URL.

### Load Balancing (Optional)
For high availability, consider deploying to multiple platforms and using a load balancer.

### Caching (Optional)
Implement caching in the bridge script to reduce API calls:

```python
import time
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_request(method, params_hash):
    # Cache GET requests for a short time
    pass
```

## 🎉 You're Connected!

Once configured, you can use natural language with Claude Desktop to:
- ✅ View your TimeChimp projects
- ✅ Create and manage time entries
- ✅ Start and stop timers
- ✅ Generate time reports
- ✅ Update and delete entries

Your TimeChimp MCP Server is now running in the cloud on Replit and connected to Claude Desktop on your Mac! 🎊 