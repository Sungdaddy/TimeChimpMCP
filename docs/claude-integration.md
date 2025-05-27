# 🤖 Claude Desktop Integration Guide

## 🌐 Connecting TimeChimp MCP Server to Claude Desktop

This guide shows you how to integrate your locally running TimeChimp MCP Server with Claude Desktop.

## 📋 Prerequisites

1. **TimeChimp MCP Server**: Installed and configured locally
2. **Claude Desktop**: Installed on your system
3. **TimeChimp API Key**: Configured in your `.env` file

## 🚀 Step-by-Step Setup

### Step 1: Install TimeChimp MCP Server

**Windows:**
```cmd
git clone https://github.com/Sungdaddy/TimeChimpMCP.git
cd TimeChimpMCP
install-windows.bat
```

**Linux/macOS:**
```bash
git clone https://github.com/Sungdaddy/TimeChimpMCP.git
cd TimeChimpMCP
pip install -e .
```

### Step 2: Configure Your API Key

Edit the `.env` file and add your TimeChimp API key:
```bash
TIMECHIMP_API_KEY=your_actual_api_key_here
TIMECHIMP_BASE_URL=https://v2.api.timechimp.com
LOG_LEVEL=INFO
```

### Step 3: Test the MCP Server

**Windows:**
```cmd
scripts\test-with-inspector.bat
```

**Linux/macOS:**
```bash
./scripts/test-with-inspector.sh
```

### Step 4: Configure Claude Desktop

**Location**: 
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "timechimp": {
      "command": "timechimp-mcp-server",
      "env": {
        "TIMECHIMP_API_KEY": "your_actual_api_key_here"
      }
    }
  }
}
```

**Alternative (if command not in PATH):**
```json
{
  "mcpServers": {
    "timechimp": {
      "command": "python",
      "args": ["-m", "timechimp_mcp_server.main"],
      "cwd": "/path/to/TimeChimpMCP",
      "env": {
        "TIMECHIMP_API_KEY": "your_actual_api_key_here"
      }
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

### Step 4: Test Timer Functions
```
"Start a timer for project 'Development' with description 'Code review'"
```

## 🔍 Troubleshooting

### MCP Server Issues

**Test the server directly:**
```bash
# Windows
scripts\start-server.bat

# Linux/macOS
./scripts/start-server.sh
```

**Check installation:**
```bash
# Windows
test-installation.bat

# All platforms
python -c "import src.timechimp_mcp_server.server; print('✅ MCP Server OK')"
```

### Claude Desktop Issues

**Check config file syntax:**
- Validate JSON format using an online JSON validator
- Ensure file paths are correct for your system
- Verify API key is properly set

**Check Claude Desktop logs:**
- **Windows**: Check Event Viewer or Claude Desktop console
- **macOS**: Check Console app for Claude Desktop logs
- **Linux**: Check system logs or run Claude Desktop from terminal

### API Connection Issues

**Test API connectivity:**
```bash
python -c "
import os
import asyncio
from src.timechimp_mcp_server.server import TimeChimpClient

async def test():
    client = TimeChimpClient(os.getenv('TIMECHIMP_API_KEY'))
    try:
        projects = await client.get_projects()
        print(f'✅ API OK - Found {len(projects)} projects')
    except Exception as e:
        print(f'❌ API Error: {e}')
    finally:
        await client.client.aclose()

asyncio.run(test())
"
```

### Environment Variables

**Check environment variables are loaded:**
```bash
# Windows
echo %TIMECHIMP_API_KEY%

# Linux/macOS
echo $TIMECHIMP_API_KEY
```

## 🎯 Available Tools in Claude

Once integrated, you can use these commands in Claude Desktop:

- **"Show my projects"** - List all TimeChimp projects
- **"Create a time entry"** - Add new time entries
- **"Show time entries for today"** - View today's entries
- **"Start a timer"** - Begin time tracking
- **"Stop the timer"** - End time tracking
- **"Generate a time report"** - Create time reports
- **"Update time entry [ID]"** - Modify existing entries
- **"Delete time entry [ID]"** - Remove entries

## 🔧 Advanced Configuration

### Custom Base URL
If using a different TimeChimp instance:
```json
{
  "mcpServers": {
    "timechimp": {
      "command": "timechimp-mcp-server",
      "env": {
        "TIMECHIMP_API_KEY": "your_api_key",
        "TIMECHIMP_BASE_URL": "https://your-instance.timechimp.com"
      }
    }
  }
}
```

### Debug Mode
For troubleshooting:
```json
{
  "mcpServers": {
    "timechimp": {
      "command": "timechimp-mcp-server",
      "env": {
        "TIMECHIMP_API_KEY": "your_api_key",
        "LOG_LEVEL": "DEBUG"
      }
    }
  }
}
``` 