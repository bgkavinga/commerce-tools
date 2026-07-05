from langchain_anthropic import ChatAnthropic

from .base import CredentialField, ProviderRequestConfig, ProviderSpec


def anthropic_factory(config: ProviderRequestConfig) -> ChatAnthropic:
    """Create a ChatAnthropic model from resolved config."""
    values = config.values
    return ChatAnthropic(
        model=values.get("model", "claude-sonnet-4-5-20250929"),
        api_key=values.get("api_key"),
        base_url=values.get("base_url") or None,
    )


ANTHROPIC_SPEC = ProviderSpec(
    key="anthropic",
    label="Anthropic (Claude)",
    default_model="claude-sonnet-4-5-20250929",
    fields=[
        CredentialField(
            name="api_key",
            label="API Key",
            type="secret",
            required=True,
            placeholder="sk-ant-...",
        ),
        CredentialField(
            name="model",
            label="Model",
            type="text",
            required=False,
            placeholder="claude-sonnet-4-5-20250929",
        ),
        CredentialField(
            name="base_url",
            label="Base URL (optional)",
            type="text",
            required=False,
            placeholder="https://api.anthropic.com",
        ),
    ],
    env_var_map={
        "api_key": "ANTHROPIC_API_KEY",
        "model": "ANTHROPIC_MODEL",
        "base_url": "ANTHROPIC_BASE_URL",
    },
)
