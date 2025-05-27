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

### Install from Source

1. Clone the repository:
```bash
git clone <repository-url>
cd timechimp-mcp-server
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

Create a `.env` file in your project directory or set the following environment variables:

```bash
TIMECHIMP_API_KEY=your_timechimp_api_key_here
TIMECHIMP_BASE_URL=https://api.timechimp.com/v1  # Optional, defaults to this URL
```

### Getting Your TimeChimp API Key

1. Log in to your TimeChimp account
2. Navigate to Settings > API
3. Generate a new API key
4. Copy the key and set it as the `TIMECHIMP_API_KEY` environment variable

## Usage

### Running the Server

Start the MCP server:

```bash
timechimp-mcp-server
```

Or with explicit API key:

```bash
timechimp-mcp-server --api-key your_api_key_here
```

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

### MCP Inspector

Use the official MCP Inspector for visual testing and debugging:

```bash
# Quick start with Inspector
./test_with_inspector.sh

# Or manually with environment variables
npx @modelcontextprotocol/inspector \
  -e TIMECHIMP_API_KEY=your_api_key \
  python3 -m timechimp_mcp_server.main
```

The Inspector provides:
- **Visual Interface**: Test tools interactively at `http://localhost:6274`
- **Real-time Monitoring**: View server logs and responses
- **Configuration Export**: Generate Claude Desktop configurations
- **CLI Mode**: Automated testing and scripting

### Testing Commands

```bash
# Test with Inspector UI
./test_with_inspector.sh

# Test specific tool with CLI
npx @modelcontextprotocol/inspector --cli \
  -e TIMECHIMP_API_KEY=your_key \
  python3 -m timechimp_mcp_server.main \
  --method tools/call \
  --tool-name get_projects

# Use configuration file
npx @modelcontextprotocol/inspector \
  --config inspector-config.json \
  --server timechimp-local
```

For detailed testing instructions, see [MCP_INSPECTOR.md](MCP_INSPECTOR.md).

## Development

### Project Structure

```
timechimp-mcp-server/
├── src/
│   └── timechimp_mcp_server/
│       ├── __init__.py
│       ├── main.py          # CLI entry point
│       └── server.py        # Main server implementation
├── pyproject.toml           # Project configuration
├── README.md               # This file
└── .env.example           # Environment variables example
```

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black src/
isort src/
```

### Type Checking

```bash
mypy src/
```

## API Reference

### TimeChimp API Integration

This server integrates with the TimeChimp REST API. The following endpoints are used:

- `GET /projects` - Retrieve projects
- `POST /time-entries` - Create time entries
- `GET /time-entries` - Retrieve time entries
- `PATCH /time-entries/{id}` - Update time entries
- `DELETE /time-entries/{id}` - Delete time entries

### Error Handling

The server includes comprehensive error handling:

- API connection errors are logged and returned as tool errors
- Invalid parameters are validated and rejected with helpful messages
- Authentication errors are clearly reported
- Network timeouts are handled gracefully

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For issues and questions:

1. Check the [Issues](https://github.com/your-repo/timechimp-mcp-server/issues) page
2. Create a new issue with detailed information
3. Include logs and error messages when reporting bugs

## Changelog

### v0.1.0
- Initial release
- Basic time entry management
- Project retrieval
- Timer functionality
- Report generation
- MCP protocol integration 