# 🔍 MCP Inspector Integration Guide

## 🎯 Overview

MCP Inspector is a powerful visual testing tool for debugging and testing MCP servers. This guide shows you how to use it with your TimeChimp MCP Server for development, testing, and debugging.

## 🚀 Quick Start

### **Local Development Testing**

Test your TimeChimp MCP Server locally using MCP Inspector:

```bash
# Navigate to your project directory
cd /Users/armandswirc/timechimp-mcp-server

# Install dependencies if not already done
pip install -e .

# Run MCP Inspector with your server
npx @modelcontextprotocol/inspector python3 -m timechimp_mcp_server.main
```

### **With Environment Variables**

Pass your TimeChimp API key and configuration:

```bash
npx @modelcontextprotocol/inspector \
  -e TIMECHIMP_API_KEY=TC_1Q0e1E3I1M2m0e363Y0C162e0G0e3A0e1o2O2m3M3U3U3I1c2S0S2i3g2i943 \
  -e TIMECHIMP_BASE_URL=https://v2.api.timechimp.com \
  -e LOG_LEVEL=DEBUG \
  python3 -m timechimp_mcp_server.main
```

### **Using the Startup Script**

```bash
npx @modelcontextprotocol/inspector ./start_server.sh
```

## 🌐 **Testing Replit Deployment**

### **HTTP Server Testing**

Test your Replit-hosted web server:

```bash
# Test the HTTP endpoint directly
npx @modelcontextprotocol/inspector --cli https://your-repl-name.your-username.repl.co/mcp --method tools/list

# Interactive UI mode for HTTP server
npx @modelcontextprotocol/inspector https://your-repl-name.your-username.repl.co/mcp
```

## 🛠 **Available Testing Features**

### **1. Tools Testing**

The Inspector will show all 8 TimeChimp tools:

- ✅ `create_time_entry` - Create new time entries
- ✅ `get_projects` - Retrieve all projects  
- ✅ `get_time_entries` - Get entries for date ranges
- ✅ `update_time_entry` - Modify existing entries
- ✅ `delete_time_entry` - Remove entries
- ✅ `start_timer` - Begin time tracking
- ✅ `stop_timer` - End time tracking
- ✅ `generate_time_report` - Create detailed reports

### **2. Interactive Tool Testing**

Use the Inspector UI to:

1. **View tool schemas** - See required parameters and descriptions
2. **Test tool calls** - Fill in parameters and execute tools
3. **View responses** - See JSON responses and error handling
4. **Monitor logs** - Watch real-time server logs and notifications

### **3. CLI Mode for Automation**

```bash
# List all available tools
npx @modelcontextprotocol/inspector --cli python3 -m timechimp_mcp_server.main --method tools/list

# Test getting projects
npx @modelcontextprotocol/inspector --cli \
  -e TIMECHIMP_API_KEY=your_api_key \
  python3 -m timechimp_mcp_server.main \
  --method tools/call \
  --tool-name get_projects

# Test creating a time entry
npx @modelcontextprotocol/inspector --cli \
  -e TIMECHIMP_API_KEY=your_api_key \
  python3 -m timechimp_mcp_server.main \
  --method tools/call \
  --tool-name create_time_entry \
  --tool-arg project_id=123 \
  --tool-arg start_time="2024-01-15T09:00:00" \
  --tool-arg end_time="2024-01-15T11:00:00" \
  --tool-arg description="Testing with MCP Inspector"

# Test time report generation
npx @modelcontextprotocol/inspector --cli \
  -e TIMECHIMP_API_KEY=your_api_key \
  python3 -m timechimp_mcp_server.main \
  --method tools/call \
  --tool-name generate_time_report \
  --tool-arg start_date="2024-01-01" \
  --tool-arg end_date="2024-01-31"
```

## 📊 **Development Workflow**

### **1. Development Testing Loop**

```bash
# 1. Make changes to your server code
# 2. Test with Inspector
npx @modelcontextprotocol/inspector \
  -e TIMECHIMP_API_KEY=your_api_key \
  python3 -m timechimp_mcp_server.main

# 3. Open browser at http://localhost:6274
# 4. Test tools interactively
# 5. Check logs and responses
# 6. Iterate and improve
```

### **2. Configuration Export**

The Inspector can export configurations for Claude Desktop:

1. **Open Inspector UI** at `http://localhost:6274`
2. **Configure your server** with the correct command and environment
3. **Click "Server Entry"** to copy configuration
4. **Paste into Claude Desktop config**

Example exported configuration:
```json
{
  "command": "python3",
  "args": ["-m", "timechimp_mcp_server.main"],
  "env": {
    "TIMECHIMP_API_KEY": "your-api-key",
    "TIMECHIMP_BASE_URL": "https://v2.api.timechimp.com",
    "LOG_LEVEL": "INFO"
  }
}
```

## 🔧 **Advanced Configuration**

### **Custom Inspector Configuration**

Create `inspector-config.json`:

```json
{
  "mcpServers": {
    "timechimp-local": {
      "command": "python3",
      "args": ["-m", "timechimp_mcp_server.main"],
      "env": {
        "TIMECHIMP_API_KEY": "your-api-key",
        "TIMECHIMP_BASE_URL": "https://v2.api.timechimp.com",
        "LOG_LEVEL": "DEBUG"
      }
    },
    "timechimp-replit": {
      "type": "sse",
      "url": "https://your-repl-name.your-username.repl.co/mcp"
    }
  }
}
```

Use the configuration:
```bash
npx @modelcontextprotocol/inspector --config inspector-config.json --server timechimp-local
```

### **Custom Ports**

```bash
CLIENT_PORT=8080 SERVER_PORT=9000 npx @modelcontextprotocol/inspector python3 -m timechimp_mcp_server.main
```

## 🧪 **Testing Scenarios**

### **1. API Connection Testing**

```bash
# Test with valid API key
npx @modelcontextprotocol/inspector \
  -e TIMECHIMP_API_KEY=valid_key \
  python3 -m timechimp_mcp_server.main

# Test with invalid API key (should show errors)
npx @modelcontextprotocol/inspector \
  -e TIMECHIMP_API_KEY=invalid_key \
  python3 -m timechimp_mcp_server.main
```

### **2. Error Handling Testing**

Use the Inspector UI to test:
- Invalid project IDs
- Malformed date formats
- Missing required parameters
- Network timeouts

### **3. Performance Testing**

```bash
# Test with debug logging
npx @modelcontextprotocol/inspector \
  -e TIMECHIMP_API_KEY=your_key \
  -e LOG_LEVEL=DEBUG \
  python3 -m timechimp_mcp_server.main
```

## 📱 **Inspector UI Features**

### **Main Interface**

1. **Server Connection Panel** - Configure transport and connection
2. **Tools Tab** - Test all TimeChimp tools interactively
3. **Notifications Panel** - View server logs and messages
4. **Configuration Panel** - Adjust timeouts and settings

### **Tool Testing Interface**

For each TimeChimp tool, you can:
- ✅ View parameter schemas
- ✅ Fill in test data
- ✅ Execute tools
- ✅ View JSON responses
- ✅ Copy responses for debugging

### **Real-time Monitoring**

- 📊 Request/response timing
- 🔍 JSON message inspection
- 📝 Server log streaming
- ⚠️ Error highlighting

## 🔍 **Debugging Tips**

### **Common Issues**

1. **API Key Problems**
   - Check environment variable is set
   - Verify key format in Inspector logs

2. **Connection Issues**
   - Check TimeChimp API endpoint
   - Verify network connectivity
   - Look for timeout errors

3. **Tool Parameter Issues**
   - Use Inspector schema validation
   - Check required vs optional parameters
   - Verify date/time formats

### **Debug Commands**

```bash
# Verbose logging
npx @modelcontextprotocol/inspector \
  -e LOG_LEVEL=DEBUG \
  -e TIMECHIMP_API_KEY=your_key \
  python3 -m timechimp_mcp_server.main

# Test specific tool with CLI
npx @modelcontextprotocol/inspector --cli \
  -e TIMECHIMP_API_KEY=your_key \
  python3 -m timechimp_mcp_server.main \
  --method tools/call \
  --tool-name get_projects
```

## 🎯 **Best Practices**

### **Development**
1. **Always test locally** before deploying to Replit
2. **Use Inspector UI** for interactive development
3. **Use CLI mode** for automated testing
4. **Export configurations** for easy Claude Desktop setup

### **Testing**
1. **Test all tools** individually
2. **Test error scenarios** (invalid inputs, network issues)
3. **Verify API responses** match expected formats
4. **Check performance** with debug logging

### **Debugging**
1. **Start with simple tools** (like `get_projects`)
2. **Check API connectivity** first
3. **Use verbose logging** for troubleshooting
4. **Test incrementally** as you add features

## 🚀 **Integration with Development Tools**

### **VS Code Integration**

Add to your VS Code tasks:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Test TimeChimp MCP with Inspector",
      "type": "shell",
      "command": "npx",
      "args": [
        "@modelcontextprotocol/inspector",
        "-e", "TIMECHIMP_API_KEY=${env:TIMECHIMP_API_KEY}",
        "python3", "-m", "timechimp_mcp_server.main"
      ],
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
```

### **GitHub Actions Testing**

```yaml
name: Test MCP Server
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: pip install -e .
      - run: |
          npx @modelcontextprotocol/inspector --cli \
            -e TIMECHIMP_API_KEY=${{ secrets.TIMECHIMP_API_KEY }} \
            python3 -m timechimp_mcp_server.main \
            --method tools/list
```

## 🎉 **Ready to Inspect!**

Your TimeChimp MCP Server is now ready for comprehensive testing with MCP Inspector! Use it to:

- ✅ **Develop** new features interactively
- ✅ **Test** all tools and error scenarios  
- ✅ **Debug** API connectivity and responses
- ✅ **Export** configurations for Claude Desktop
- ✅ **Automate** testing with CLI mode

Happy debugging! 🔍🚀 