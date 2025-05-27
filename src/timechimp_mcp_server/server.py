"""
TimeChimp MCP Server

This server provides Model Context Protocol integration for TimeChimp time tracking.
It offers tools for managing time entries, projects, and generating reports.
"""

import asyncio
import json
import logging
import sys
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urljoin

import httpx
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TimeEntry(BaseModel):
    """Model for a time entry."""
    id: Optional[str] = None
    project_id: str
    task_id: Optional[str] = None
    description: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    billable: bool = True
    tags: List[str] = Field(default_factory=list)

class Project(BaseModel):
    """Model for a project."""
    id: str
    name: str
    client_name: Optional[str] = None
    description: Optional[str] = None
    billable_rate: Optional[float] = None
    active: bool = True

class TimeChimpClient:
    """Client for interacting with TimeChimp API."""
    
    def __init__(self, api_key: str, base_url: str = "https://v2.api.timechimp.com"):
        self.api_key = api_key
        self.base_url = base_url
        self.client = httpx.AsyncClient(
            headers={
                "api-key": api_key,
                "Content-Type": "application/json"
            }
        )
    
    async def get_projects(self) -> List[Project]:
        """Get all projects."""
        try:
            response = await self.client.get(f"{self.base_url}/projects")
            response.raise_for_status()
            data = response.json()
            
            # Handle different response formats
            projects_data = data if isinstance(data, list) else data.get("projects", data.get("data", []))
            
            projects = []
            for project_data in projects_data:
                # Map TimeChimp project fields to our model
                project = Project(
                    id=str(project_data.get("id", project_data.get("projectId", ""))),
                    name=project_data.get("name", project_data.get("projectName", "Unknown")),
                    client_name=project_data.get("clientName", project_data.get("client", {}).get("name")),
                    description=project_data.get("description", ""),
                    billable_rate=project_data.get("billableRate", project_data.get("rate")),
                    active=project_data.get("active", project_data.get("isActive", True))
                )
                projects.append(project)
            
            return projects
        except Exception as e:
            logger.error(f"Error fetching projects: {e}")
            return []
    
    async def create_time_entry(self, entry: TimeEntry) -> Dict[str, Any]:
        """Create a new time entry."""
        try:
            entry_data = {
                "projectId": entry.project_id,
                "description": entry.description,
                "startTime": entry.start_time.isoformat(),
                "billable": entry.billable
            }
            
            if entry.end_time:
                entry_data["endTime"] = entry.end_time.isoformat()
            if entry.duration_minutes:
                entry_data["duration"] = entry.duration_minutes
            if entry.task_id:
                entry_data["taskId"] = entry.task_id
            if entry.tags:
                entry_data["tags"] = entry.tags
            
            response = await self.client.post(
                f"{self.base_url}/time-entries",
                json=entry_data
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error creating time entry: {e}")
            raise
    
    async def get_time_entries(self, start_date: Optional[datetime] = None, 
                              end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Get time entries for a date range."""
        try:
            params = {}
            if start_date:
                params["startDate"] = start_date.date().isoformat()
            if end_date:
                params["endDate"] = end_date.date().isoformat()
            
            response = await self.client.get(
                f"{self.base_url}/time-entries",
                params=params
            )
            response.raise_for_status()
            data = response.json()
            
            # Handle different response formats
            return data if isinstance(data, list) else data.get("timeEntries", data.get("data", []))
        except Exception as e:
            logger.error(f"Error fetching time entries: {e}")
            return []
    
    async def update_time_entry(self, entry_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing time entry."""
        try:
            response = await self.client.patch(
                f"{self.base_url}/time-entries/{entry_id}",
                json=updates
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error updating time entry: {e}")
            raise
    
    async def delete_time_entry(self, entry_id: str) -> bool:
        """Delete a time entry."""
        try:
            response = await self.client.delete(f"{self.base_url}/time-entries/{entry_id}")
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Error deleting time entry: {e}")
            return False

class MCPMessage(BaseModel):
    """Base MCP message."""
    jsonrpc: str = "2.0"
    id: Optional[Union[str, int]] = None

class MCPRequest(MCPMessage):
    """MCP request message."""
    method: str
    params: Optional[Dict[str, Any]] = None

class MCPResponse(MCPMessage):
    """MCP response message."""
    result: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None

class MCPTool(BaseModel):
    """MCP tool definition."""
    name: str
    description: str
    inputSchema: Dict[str, Any]

class TimeChimpMCPServer:
    """MCP Server for TimeChimp integration."""
    
    def __init__(self, api_key: str):
        self.client = TimeChimpClient(api_key)
        self.tools = self._get_tools()
    
    def _get_tools(self) -> List[MCPTool]:
        """Get available tools."""
        return [
            MCPTool(
                name="create_time_entry",
                description="Create a new time entry in TimeChimp",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "project_id": {"type": "string", "description": "Project ID"},
                        "description": {"type": "string", "description": "Description of work done"},
                        "start_time": {"type": "string", "description": "Start time (ISO format)"},
                        "end_time": {"type": "string", "description": "End time (ISO format, optional)"},
                        "duration_minutes": {"type": "integer", "description": "Duration in minutes (optional)"},
                        "billable": {"type": "boolean", "description": "Whether entry is billable", "default": True},
                        "tags": {"type": "array", "items": {"type": "string"}, "description": "Tags for the entry"}
                    },
                    "required": ["project_id", "description", "start_time"]
                }
            ),
            MCPTool(
                name="get_projects",
                description="Get all available projects from TimeChimp",
                inputSchema={
                    "type": "object",
                    "properties": {}
                }
            ),
            MCPTool(
                name="get_time_entries",
                description="Get time entries for a specific date range",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "start_date": {"type": "string", "description": "Start date (YYYY-MM-DD)"},
                        "end_date": {"type": "string", "description": "End date (YYYY-MM-DD)"}
                    }
                }
            ),
            MCPTool(
                name="update_time_entry",
                description="Update an existing time entry",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "entry_id": {"type": "string", "description": "Time entry ID"},
                        "description": {"type": "string", "description": "Updated description"},
                        "duration_minutes": {"type": "integer", "description": "Updated duration"},
                        "billable": {"type": "boolean", "description": "Updated billable status"},
                        "tags": {"type": "array", "items": {"type": "string"}, "description": "Updated tags"}
                    },
                    "required": ["entry_id"]
                }
            ),
            MCPTool(
                name="delete_time_entry",
                description="Delete a time entry",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "entry_id": {"type": "string", "description": "Time entry ID to delete"}
                    },
                    "required": ["entry_id"]
                }
            ),
            MCPTool(
                name="start_timer",
                description="Start a new timer for time tracking",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "project_id": {"type": "string", "description": "Project ID"},
                        "description": {"type": "string", "description": "Description of work"},
                        "tags": {"type": "array", "items": {"type": "string"}, "description": "Tags for the entry"}
                    },
                    "required": ["project_id", "description"]
                }
            ),
            MCPTool(
                name="stop_timer",
                description="Stop the currently running timer",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "entry_id": {"type": "string", "description": "Timer entry ID to stop"}
                    },
                    "required": ["entry_id"]
                }
            ),
            MCPTool(
                name="generate_time_report",
                description="Generate a time tracking report for a date range",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "start_date": {"type": "string", "description": "Start date (YYYY-MM-DD)"},
                        "end_date": {"type": "string", "description": "End date (YYYY-MM-DD)"},
                        "project_id": {"type": "string", "description": "Optional project ID filter"}
                    },
                    "required": ["start_date", "end_date"]
                }
            )
        ]
    
    async def handle_request(self, request: MCPRequest) -> MCPResponse:
        """Handle MCP request."""
        try:
            if request.method == "tools/list":
                return MCPResponse(
                    id=request.id,
                    result={
                        "tools": [tool.model_dump() for tool in self.tools]
                    }
                )
            elif request.method == "tools/call":
                tool_name = request.params.get("name")
                arguments = request.params.get("arguments", {})
                
                if tool_name == "create_time_entry":
                    result = await self._create_time_entry(arguments)
                elif tool_name == "get_projects":
                    result = await self._get_projects()
                elif tool_name == "get_time_entries":
                    result = await self._get_time_entries(arguments)
                elif tool_name == "update_time_entry":
                    result = await self._update_time_entry(arguments)
                elif tool_name == "delete_time_entry":
                    result = await self._delete_time_entry(arguments)
                elif tool_name == "start_timer":
                    result = await self._start_timer(arguments)
                elif tool_name == "stop_timer":
                    result = await self._stop_timer(arguments)
                elif tool_name == "generate_time_report":
                    result = await self._generate_time_report(arguments)
                else:
                    return MCPResponse(
                        id=request.id,
                        error={"code": -32601, "message": f"Unknown tool: {tool_name}"}
                    )
                
                return MCPResponse(id=request.id, result=result)
            elif request.method == "initialize":
                return MCPResponse(
                    id=request.id,
                    result={
                        "protocolVersion": "2024-11-05",
                        "capabilities": {
                            "tools": {}
                        },
                        "serverInfo": {
                            "name": "timechimp-mcp-server",
                            "version": "0.1.0"
                        }
                    }
                )
            else:
                return MCPResponse(
                    id=request.id,
                    error={"code": -32601, "message": f"Unknown method: {request.method}"}
                )
        except Exception as e:
            logger.error(f"Error handling request: {e}")
            return MCPResponse(
                id=request.id,
                error={"code": -32603, "message": str(e)}
            )
    
    async def _create_time_entry(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new time entry."""
        try:
            start_time = datetime.fromisoformat(arguments["start_time"].replace("Z", "+00:00"))
            end_time = None
            if arguments.get("end_time"):
                end_time = datetime.fromisoformat(arguments["end_time"].replace("Z", "+00:00"))
            
            entry = TimeEntry(
                project_id=arguments["project_id"],
                description=arguments["description"],
                start_time=start_time,
                end_time=end_time,
                duration_minutes=arguments.get("duration_minutes"),
                billable=arguments.get("billable", True),
                tags=arguments.get("tags", [])
            )
            
            result = await self.client.create_time_entry(entry)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Time entry created successfully: {json.dumps(result, indent=2)}"
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error creating time entry: {str(e)}"
                    }
                ]
            }
    
    async def _get_projects(self) -> Dict[str, Any]:
        """Get all projects."""
        projects = await self.client.get_projects()
        projects_data = [project.model_dump() for project in projects]
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Projects: {json.dumps(projects_data, indent=2)}"
                }
            ]
        }
    
    async def _get_time_entries(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Get time entries for a date range."""
        start_date = None
        end_date = None
        
        if arguments.get("start_date"):
            start_date = datetime.fromisoformat(arguments["start_date"])
        if arguments.get("end_date"):
            end_date = datetime.fromisoformat(arguments["end_date"])
        
        entries = await self.client.get_time_entries(start_date, end_date)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Time entries: {json.dumps(entries, indent=2)}"
                }
            ]
        }
    
    async def _update_time_entry(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Update a time entry."""
        entry_id = arguments.pop("entry_id")
        updates = {k: v for k, v in arguments.items() if v is not None}
        
        result = await self.client.update_time_entry(entry_id, updates)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Time entry updated: {json.dumps(result, indent=2)}"
                }
            ]
        }
    
    async def _delete_time_entry(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Delete a time entry."""
        entry_id = arguments["entry_id"]
        success = await self.client.delete_time_entry(entry_id)
        
        if success:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Time entry {entry_id} deleted successfully"
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Failed to delete time entry {entry_id}"
                    }
                ]
            }
    
    async def _start_timer(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Start a new timer."""
        entry = TimeEntry(
            project_id=arguments["project_id"],
            description=arguments["description"],
            start_time=datetime.now(),
            tags=arguments.get("tags", [])
        )
        
        result = await self.client.create_time_entry(entry)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Timer started: {json.dumps(result, indent=2)}"
                }
            ]
        }
    
    async def _stop_timer(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Stop a running timer."""
        entry_id = arguments["entry_id"]
        updates = {"endTime": datetime.now().isoformat()}
        
        result = await self.client.update_time_entry(entry_id, updates)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Timer stopped: {json.dumps(result, indent=2)}"
                }
            ]
        }
    
    async def _generate_time_report(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a time tracking report."""
        start_date = datetime.fromisoformat(arguments["start_date"])
        end_date = datetime.fromisoformat(arguments["end_date"])
        
        entries = await self.client.get_time_entries(start_date, end_date)
        
        # Filter by project if specified
        if arguments.get("project_id"):
            entries = [e for e in entries if e.get("projectId") == arguments["project_id"]]
        
        # Calculate totals
        total_hours = sum(e.get("duration", 0) for e in entries) / 60
        billable_hours = sum(e.get("duration", 0) for e in entries if e.get("billable", True)) / 60
        
        report = {
            "period": f"{start_date.date()} to {end_date.date()}",
            "total_entries": len(entries),
            "total_hours": round(total_hours, 2),
            "billable_hours": round(billable_hours, 2),
            "non_billable_hours": round(total_hours - billable_hours, 2),
            "entries": entries
        }
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Time Report: {json.dumps(report, indent=2)}"
                }
            ]
        }
    
    async def run(self):
        """Run the MCP server."""
        logger.info("Starting TimeChimp MCP Server...")
        
        while True:
            try:
                # Read JSON-RPC message from stdin
                line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
                if not line:
                    break
                
                # Parse request
                try:
                    request_data = json.loads(line.strip())
                    request = MCPRequest(**request_data)
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"Invalid request: {e}")
                    continue
                
                # Handle request
                response = await self.handle_request(request)
                
                # Send response
                response_json = json.dumps(response.model_dump(exclude_none=True))
                print(response_json, flush=True)
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                logger.error(f"Error in main loop: {e}")

async def main():
    """Main entry point."""
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    api_key = os.getenv("TIMECHIMP_API_KEY")
    if not api_key:
        logger.error("TIMECHIMP_API_KEY environment variable is required")
        return
    
    server = TimeChimpMCPServer(api_key)
    await server.run()

if __name__ == "__main__":
    asyncio.run(main())
