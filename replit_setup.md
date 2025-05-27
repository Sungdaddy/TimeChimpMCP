# TimeChimp MCP Server - Replit Setup Guide

## 🌐 Replit Deployment

### Quick Setup Commands

Run these commands in the Replit Shell:

```bash
# Install dependencies
pip install -e .

# Test the installation
python3 -c "from src.timechimp_mcp_server.server import TimeChimpMCPServer; print('✅ Installation successful')"

# Test API connection (make sure to set secrets first)
python3 -c "
import asyncio
import os
from src.timechimp_mcp_server.server import TimeChimpClient

async def test():
    api_key = os.getenv('TIMECHIMP_API_KEY')
    if not api_key:
        print('❌ TIMECHIMP_API_KEY not found in environment')
        return
    
    client = TimeChimpClient(api_key)
    try:
        projects = await client.get_projects()
        print(f'✅ Connected! Found {len(projects)} projects')
    except Exception as e:
        print(f'❌ Connection failed: {e}')
    finally:
        await client.client.aclose()

asyncio.run(test())
"
```

### Running the Server

```bash
# Option 1: Direct command
python3 -m timechimp_mcp_server.main

# Option 2: Using the startup script
chmod +x start_server.sh
./start_server.sh
```

### Replit Configuration

Create a `.replit` file in your project root:

```toml
[deployment]
run = ["python3", "-m", "timechimp_mcp_server.main"]

[interpreter]
command = ["python3", "-m", "timechimp_mcp_server.main"]
```

### Environment Variables in Replit

Set these in the Secrets tab:
- `TIMECHIMP_API_KEY`: Your TimeChimp API key
- `TIMECHIMP_BASE_URL`: https://v2.api.timechimp.com
- `LOG_LEVEL`: INFO

### Exposing the Server

For external access, you may need to modify the server to listen on HTTP instead of stdio. Create a web wrapper:

```python
# web_server.py
from flask import Flask, request, jsonify
import asyncio
import json
from src.timechimp_mcp_server.server import TimeChimpMCPServer, MCPRequest

app = Flask(__name__)
server = None

@app.route('/mcp', methods=['POST'])
async def handle_mcp():
    try:
        data = request.get_json()
        request_obj = MCPRequest(**data)
        response = await server.handle_request(request_obj)
        return jsonify(response.model_dump(exclude_none=True))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    import os
    api_key = os.getenv('TIMECHIMP_API_KEY')
    server = TimeChimpMCPServer(api_key)
    app.run(host='0.0.0.0', port=5000)
``` 