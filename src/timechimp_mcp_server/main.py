"""
Main entry point for the TimeChimp MCP Server.
"""

import asyncio
import os
import sys
from typing import Optional

import click
from dotenv import load_dotenv

from .server import TimeChimpMCPServer


@click.command()
@click.option(
    "--api-key",
    envvar="TIMECHIMP_API_KEY",
    help="TimeChimp API key (can also be set via TIMECHIMP_API_KEY environment variable)",
)
@click.option(
    "--base-url",
    envvar="TIMECHIMP_BASE_URL",
    default="https://api.timechimp.com/v1",
    help="TimeChimp API base URL",
)
@click.option(
    "--env-file",
    type=click.Path(exists=True),
    help="Path to .env file to load environment variables from",
)
def main(api_key: Optional[str], base_url: str, env_file: Optional[str]) -> None:
    """
    Start the TimeChimp MCP Server.
    
    This server provides Model Context Protocol integration for TimeChimp time tracking.
    It offers tools for managing time entries, projects, and generating reports.
    
    The API key can be provided via the --api-key option or the TIMECHIMP_API_KEY
    environment variable.
    """
    # Load environment variables
    if env_file:
        load_dotenv(env_file)
    else:
        load_dotenv()
    
    # Get API key from environment if not provided
    if not api_key:
        api_key = os.getenv("TIMECHIMP_API_KEY")
    
    if not api_key:
        click.echo(
            "Error: TimeChimp API key is required. "
            "Set it via --api-key option or TIMECHIMP_API_KEY environment variable.",
            err=True,
        )
        sys.exit(1)
    
    # Create and run the server
    server = TimeChimpMCPServer(api_key)
    
    try:
        asyncio.run(server.run())
    except KeyboardInterrupt:
        click.echo("\n🛑 Server stopped by user (Ctrl+C).", err=True)
    except Exception as e:
        click.echo(f"❌ Error running server: {e}", err=True)
        sys.exit(1)


if __name__ == "__main__":
    main() 