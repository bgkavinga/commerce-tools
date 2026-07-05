"""MCP tool client setup."""

from pathlib import Path
from langchain_mcp_adapters.client import MultiServerMCPClient
from app.config import settings


def build_mcp_config() -> dict:
    """Build configuration for MCP servers."""
    mcp_dist = settings.mcp_dist_dir
    return {
        "newrelic": {
            "transport": "stdio",
            "command": "node",
            "args": [str(mcp_dist / "mcps" / "newrelic" / "server.js")],
            "env": {
                "NEW_RELIC_API_KEY": settings.new_relic_api_key or "",
                "NEW_RELIC_REGION": settings.new_relic_region or "us",
                "NEW_RELIC_ACCOUNT_ID": settings.new_relic_account_id or "",
            },
        },
        "jira": {
            "transport": "stdio",
            "command": "node",
            "args": [str(mcp_dist / "mcps" / "jira" / "server.js")],
            "env": {
                "JIRA_BASE_URL": settings.jira_base_url or "",
                "JIRA_EMAIL": settings.jira_email or "",
                "JIRA_API_TOKEN": settings.jira_api_token or "",
            },
        },
    }


async def load_mcp_tools():
    """Load MCP tools from configured servers."""
    client = MultiServerMCPClient(build_mcp_config())
    tools = await client.get_tools()
    return client, tools
