# TimeChimp MCP Server

A Model Context Protocol (MCP) server for TimeChimp time tracking integration. This server provides AI assistants with the ability to interact with TimeChimp's time tracking functionality through a standardized protocol.

## Features

- **Time Entry Management**: Create, read, update, and delete time entries
- **Project Management**: Retrieve and manage projects
- **Timer Functionality**: Start and stop timers for real-time tracking
- **Reporting**: Generate comprehensive time tracking reports
- **Flexible Configuration**: Support for environment variables and configuration files

## Installation

### Prerequisites

- Python 3.9 or higher
- TimeChimp account with API access
- TimeChimp API key

### Windows Installation (Recommended)

1. **Get your TimeChimp API key first:**
   - Log in to your TimeChimp account
   - Go to Settings > API
   - Generate a new API key
   - Copy the key (you'll paste it during installation)

2. **Clone the repository:**
```cmd
git clone https://github.com/Sungdaddy/TimeChimpMCP.git
cd TimeChimpMCP
```

3. **Run the Windows installer:**
```cmd
install-windows.bat
```
*The installer will:*
- ✅ Check Python and pip installation
- ✅ Check Node.js for MCP Inspector (optional)
- ✅ Install all dependencies automatically
- ✅ **Prompt you to paste your API key directly**
- ✅ **Automatically configure the .env file**
- ✅ Optionally launch MCP Inspector immediately

4. **Test the installation (optional):**
```cmd
test-installation.bat
```

5. **Start using the server:**
```cmd
scripts\start-server.bat
# or test with MCP Inspector
scripts\test-with-inspector.bat
```

### Linux/macOS Installation

1. Clone the repository:
```bash
git clone https://github.com/Sungdaddy/TimeChimpMCP.git
cd TimeChimpMCP
```

2. Install the package:
```bash
pip install -e .
```

3. Edit your API key:
```bash
nano .env  # or your preferred editor
```

4. Start the server:
```bash
./scripts/start-server.sh
```

### Install from Source (Manual)

1. Clone the repository:
```bash
git clone https://github.com/Sungdaddy/TimeChimpMCP.git
cd TimeChimpMCP
```

2. Install the package:
```bash
pip install -e .
```

### Install for Development

1. Clone the repository and install with development dependencies:
```bash
git clone <repository-url>
cd timechimp-mcp-server
pip install -e ".[dev]"
```

## Configuration

### Environment Variables

The `.env` file is already included in the repository. Simply edit it and replace the placeholder with your actual API key:

```bash
# Edit the .env file
nano .env
# or use your preferred editor: code .env, vim .env, etc.
```

Replace `YOUR_API_KEY_HERE` with your actual TimeChimp API key:

```bash
TIMECHIMP_API_KEY=your_actual_api_key_goes_here
TIMECHIMP_BASE_URL=https://v2.api.timechimp.com
LOG_LEVEL=INFO
```

**Important:** Replace `YOUR_API_KEY_HERE` with your real TimeChimp API key.

### Getting Your TimeChimp API Key

1. Log in to your TimeChimp account
2. Navigate to Settings > API
3. Generate a new API key
4. Copy the key and replace `YOUR_API_KEY_HERE` in your `.env` file

## Usage

### Running the Server

Start the MCP server (runs continuously until stopped):

```bash
timechimp-mcp-server
```

Or with explicit API key:

```bash
timechimp-mcp-server --api-key your_api_key_here
```

**Important:** The server runs continuously and listens for MCP requests via stdio. To stop the server, press `Ctrl+C`.

### Available Tools

The server provides the following tools for AI assistants:

#### 1. Create Time Entry
Create a new time entry in TimeChimp.

**Parameters:**
- `project_id` (required): Project ID
- `description` (required): Description of work done
- `start_time` (required): Start time in ISO format
- `end_time` (optional): End time in ISO format
- `duration_minutes` (optional): Duration in minutes
- `billable` (optional): Whether entry is billable (default: true)
- `tags` (optional): Array of tags for the entry

**Example:**
```json
{
  "project_id": "proj_123",
  "description": "Working on feature implementation",
  "start_time": "2024-01-15T09:00:00Z",
  "end_time": "2024-01-15T11:30:00Z",
  "billable": true,
  "tags": ["development", "feature"]
}
```

#### 2. Get Projects
Retrieve all available projects from TimeChimp.

**Parameters:** None

#### 3. Get Time Entries
Retrieve time entries for a specific date range.

**Parameters:**
- `start_date` (optional): Start date in YYYY-MM-DD format
- `end_date` (optional): End date in YYYY-MM-DD format

#### 4. Update Time Entry
Update an existing time entry.

**Parameters:**
- `entry_id` (required): Time entry ID
- `description` (optional): Updated description
- `duration_minutes` (optional): Updated duration
- `billable` (optional): Updated billable status
- `tags` (optional): Updated tags

#### 5. Delete Time Entry
Delete a time entry.

**Parameters:**
- `entry_id` (required): Time entry ID to delete

#### 6. Start Timer
Start a new timer for time tracking.

**Parameters:**
- `project_id` (required): Project ID
- `description` (required): Description of work
- `tags` (optional): Array of tags for the entry

#### 7. Stop Timer
Stop a currently running timer.

**Parameters:**
- `entry_id` (required): Timer entry ID to stop

#### 8. Generate Time Report
Generate a comprehensive time tracking report for a date range.

**Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format
- `project_id` (optional): Optional project ID filter

## Integration with AI Assistants

This MCP server can be integrated with various AI assistants that support the Model Context Protocol:

### Claude Desktop

Add the server to your Claude Desktop configuration:

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

### Other MCP-Compatible Assistants

Follow the assistant's documentation for adding MCP servers, using:
- Command: `timechimp-mcp-server`
- Environment variables: `TIMECHIMP_API_KEY`

## Testing and Debugging

### Quick Start Scripts

**Windows:**
```cmd
# Start the MCP server (runs continuously)
scripts\start-server.bat

# Test with MCP Inspector (interactive testing)
scripts\test-with-inspector.bat

# Or use PowerShell versions
scripts\start-server.ps1
scripts\test-with-inspector.ps1
```

**Linux/macOS:**
```bash
# Start the MCP server (runs continuously)
./scripts/start-server.sh

# Test with MCP Inspector (interactive testing)
./scripts/test-with-inspector.sh
```

**Note:** The MCP server runs continuously until you manually stop it with `Ctrl+C`.

### MCP Inspector

Use the official MCP Inspector for visual testing and debugging:

```bash
# Quick start with Inspector
./scripts/test-with-inspector.sh

# Or manually with environment variables
npx @modelcontextprotocol/inspector \
  -e TIMECHIMP_API_KEY=your_api_key \
  python3 -m timechimp_mcp_server.main
```

The Inspector provides:
- **Visual Interface**: Test tools interactively at `http://localhost:6274`
- **Real-time Monitoring**: View server logs and responses

## Project Structure

```
├── config/                 # Configuration files
│   └── inspector.json     # MCP Inspector configuration
├── docs/                  # Documentation
│   ├── claude-integration.md
│   ├── mcp-inspector.md
│   └── usage.md
├── scripts/               # Utility scripts
│   ├── start-server.sh    # Server startup (Linux/macOS)
│   ├── start-server.bat   # Server startup (Windows)
│   ├── start-server.ps1   # Server startup (PowerShell)
│   ├── test-with-inspector.sh   # Testing (Linux/macOS)
│   ├── test-with-inspector.bat  # Testing (Windows)
│   └── test-with-inspector.ps1  # Testing (PowerShell)
├── src/                   # Source code
│   └── timechimp_mcp_server/
│       ├── __init__.py
│       ├── main.py        # Entry point
│       └── server.py      # Core MCP server
├── .env                   # Configuration file (edit with your API key)
├── install-windows.bat    # Windows installation script
├── test-installation.bat  # Installation verification script
├── pyproject.toml         # Project configuration
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Windows Troubleshooting

### Common Issues and Solutions

**1. "Python not found" error:**
- Install Python from https://www.python.org/downloads/
- **Important:** Check "Add Python to PATH" during installation
- Restart Command Prompt after installation

**2. "pip not found" error:**
- Python 3.4+ includes pip by default
- If missing, reinstall Python with "Add Python to PATH" checked

**3. PowerShell execution policy error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**4. "timechimp-mcp-server not found" error:**
- Run `pip install -e .` in the project directory
- Or use direct command: `python -m timechimp_mcp_server.main`

**5. Git clone issues:**
- Install Git from https://git-scm.com/download/win
- Or download ZIP from GitHub and extract

**6. Node.js/npx not found (for MCP Inspector):**
- Install Node.js from https://nodejs.org/
- Restart Command Prompt after installation