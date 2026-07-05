import os
from pathlib import Path
from pydantic_settings import BaseSettings


def _get_mcp_dist_dir() -> Path:
    """Get MCP dist directory, handling both local dev and Docker."""
    # Check env var first
    if mcp_dist_env := os.getenv("MCP_DIST_DIR"):
        return Path(mcp_dist_env)
    # Try Docker path
    docker_path = Path("/app/mcp-dist/dist")
    if docker_path.exists():
        return docker_path
    # Fall back to local dev path (3 levels up from app/config.py)
    local_path = Path(__file__).resolve().parents[3] / "dist"
    return local_path


def _get_static_dir() -> Path:
    """Get static directory, handling both local dev and Docker."""
    # Check env var first
    if static_env := os.getenv("STATIC_DIR"):
        return Path(static_env)
    # Try Docker path
    docker_path = Path("/app/static")
    if docker_path.exists():
        return docker_path
    # Fall back to local dev path
    local_path = Path(__file__).resolve().parents[1] / "static"
    return local_path


class Settings(BaseSettings):
    """Application configuration from environment variables."""

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    # Paths (computed in __init__)
    mcp_dist_dir: Path = None
    static_dir: Path = None

    # Default provider
    deep_agent_default_provider: str = "anthropic"

    # Anthropic
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-5-20250929"
    anthropic_base_url: str = ""

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    openai_base_url: str = ""

    # OpenRouter
    openrouter_api_key: str = ""
    openrouter_model: str = "anthropic/claude-3-5-sonnet"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # AWS Bedrock
    aws_region: str = "us-east-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_profile: str = ""
    bedrock_model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"

    # New Relic MCP
    new_relic_api_key: str = ""
    new_relic_region: str = "us"
    new_relic_account_id: str = ""

    # Jira MCP
    jira_base_url: str = ""
    jira_email: str = ""
    jira_api_token: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    def model_post_init(self, __context):
        """Called after model initialization to set computed fields."""
        if self.mcp_dist_dir is None:
            self.mcp_dist_dir = _get_mcp_dist_dir()
        if self.static_dir is None:
            self.static_dir = _get_static_dir()


settings = Settings()
