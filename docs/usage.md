# TimeChimp MCP Server - Usage Guide

## 🎯 Quick Start

Your TimeChimp MCP Server is now fully configured and ready to use!

### API Key Configuration ✅
- **API Endpoint**: `https://v2.api.timechimp.com`
- **Authentication**: Configured via environment variables

## ⚙️ Configuration Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file with your TimeChimp API key:**
   ```bash
   # Edit .env file
   TIMECHIMP_API_KEY=your_actual_api_key_here
   TIMECHIMP_BASE_URL=https://v2.api.timechimp.com
   LOG_LEVEL=INFO
   ```

3. **Get your API key from TimeChimp:**
   - Log in to [TimeChimp web app](https://app.timechimp.com)
   - Go to Settings > API
   - Generate or copy your API key

## 🚀 Starting the Server

### Option 1: Using the startup script (Recommended)
```bash
cd /Users/armandswirc/timechimp-mcp-server
./start_server.sh
```

### Option 2: Direct command
```bash
/Users/armandswirc/Library/Python/3.9/bin/timechimp-mcp-server
```

### Option 3: Python module
```bash
cd /Users/armandswirc/timechimp-mcp-server
python3 -m timechimp_mcp_server.main
```

## 🔧 Integration with AI Assistants

### Claude Desktop Configuration

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "timechimp": {
      "command": "/path/to/timechimp-mcp-server/start_server.sh",
      "cwd": "/path/to/timechimp-mcp-server"
    }
  }
}
```

Or with direct command:

```json
{
  "mcpServers": {
    "timechimp": {
      "command": "timechimp-mcp-server",
      "env": {
        "TIMECHIMP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## 🛠 Available Tools

Once connected, you can use these tools with your AI assistant:

### 1. **get_projects**
Get all available projects from TimeChimp.
```
"Get my TimeChimp projects"
```

### 2. **create_time_entry**
Create a new time entry.
```
"Create a time entry for project X from 9:00 AM to 11:30 AM today for 'Working on feature implementation'"
```

### 3. **get_time_entries**
Get time entries for a date range.
```
"Show me my time entries for this week"
"Get time entries from May 20 to May 27"
```

### 4. **start_timer**
Start a new timer.
```
"Start a timer for project Y with description 'Code review'"
```

### 5. **stop_timer**
Stop a running timer.
```
"Stop timer with ID 12345"
```

### 6. **update_time_entry**
Update an existing time entry.
```
"Update time entry 12345 to be non-billable"
```

### 7. **delete_time_entry**
Delete a time entry.
```
"Delete time entry 12345"
```

### 8. **generate_time_report**
Generate a time tracking report.
```
"Generate a time report for this month"
"Create a report for project X from May 1 to May 31"
```

## 📊 Example Conversations

### Creating Your First Project
Since you don't have any projects yet, you'll need to create one in TimeChimp first:

1. Go to [TimeChimp web app](https://app.timechimp.com)
2. Create a new project
3. Then use the MCP server to interact with it

### Sample AI Conversation
```
You: "Show me my TimeChimp projects"
AI: Uses get_projects tool and shows your available projects

You: "Start a timer for project 'Website Development' with description 'Frontend coding'"
AI: Uses start_timer tool to begin tracking time

You: "Generate a time report for this week"
AI: Uses generate_time_report tool to create a summary
```

## 🔍 Troubleshooting

### Server Won't Start
- Check that the API key is correct in `.env`
- Ensure Python dependencies are installed: `pip install -e .`
- Verify the script is executable: `chmod +x start_server.sh`

### API Connection Issues
- Verify your TimeChimp API key is valid
- Check internet connectivity
- Ensure you're using the v2 API endpoint

### No Projects Found
- Create projects in the TimeChimp web interface first
- Projects must be active to appear in the API

## 📝 Development

### Installation
```bash
# Clone the repository
git clone https://github.com/Sungdaddy/TheChimp.git
cd TheChimp

# Install dependencies
pip install -e .

# Configure environment
cp .env.example .env
# Edit .env with your API key
```

### Adding to PATH (Optional)
To use `timechimp-mcp-server` from anywhere:

```bash
echo 'export PATH="/Users/armandswirc/Library/Python/3.9/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Testing the Server
```bash
cd /path/to/timechimp-mcp-server
python3 -c "
import asyncio
from src.timechimp_mcp_server.server import TimeChimpClient
async def test():
    client = TimeChimpClient('your_api_key_here')
    projects = await client.get_projects()
    print(f'Found {len(projects)} projects')
    await client.client.aclose()
asyncio.run(test())
"
```

## 🎉 You're All Set!

Your TimeChimp MCP Server is ready to help you track time efficiently through AI assistants. Start by creating some projects in TimeChimp, then use the AI tools to manage your time tracking seamlessly! 