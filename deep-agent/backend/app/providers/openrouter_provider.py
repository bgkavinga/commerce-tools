from .base import CredentialField, ProviderSpec


OPENROUTER_SPEC = ProviderSpec(
    key="openrouter",
    label="OpenRouter",
    default_model="anthropic/claude-3-5-sonnet",
    fields=[
        CredentialField(
            name="api_key",
            label="API Key",
            type="secret",
            required=True,
            placeholder="sk-or-...",
        ),
        CredentialField(
            name="model",
            label="Model",
            type="text",
            required=False,
            placeholder="anthropic/claude-3-5-sonnet",
        ),
        CredentialField(
            name="base_url",
            label="Base URL (optional)",
            type="text",
            required=False,
            placeholder="https://openrouter.ai/api/v1",
        ),
    ],
    env_var_map={
        "api_key": "OPENROUTER_API_KEY",
        "model": "OPENROUTER_MODEL",
        "base_url": "OPENROUTER_BASE_URL",
    },
)
