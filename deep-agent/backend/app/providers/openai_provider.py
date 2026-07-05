from .base import CredentialField, ProviderSpec


OPENAI_SPEC = ProviderSpec(
    key="openai",
    label="OpenAI (GPT)",
    default_model="gpt-4o",
    fields=[
        CredentialField(
            name="api_key",
            label="API Key",
            type="secret",
            required=True,
            placeholder="sk-...",
        ),
        CredentialField(
            name="model",
            label="Model",
            type="text",
            required=False,
            placeholder="gpt-4o",
        ),
        CredentialField(
            name="base_url",
            label="Base URL (optional)",
            type="text",
            required=False,
            placeholder="https://api.openai.com/v1",
        ),
    ],
    env_var_map={
        "api_key": "OPENAI_API_KEY",
        "model": "OPENAI_MODEL",
        "base_url": "OPENAI_BASE_URL",
    },
)
