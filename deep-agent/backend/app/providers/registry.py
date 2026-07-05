import os
from .base import ProviderSpec, ProviderRequestConfig, ChatModelFactory
from .anthropic_provider import ANTHROPIC_SPEC, anthropic_factory
from .openai_provider import OPENAI_SPEC
from .openrouter_provider import OPENROUTER_SPEC
from .bedrock_provider import BEDROCK_SPEC, bedrock_factory
from .openai_compatible import openai_compatible_factory
from functools import partial


class MissingCredentialError(Exception):
    """Raised when a required credential is missing."""

    def __init__(self, provider_key: str, field_name: str):
        self.provider_key = provider_key
        self.field_name = field_name
        super().__init__(
            f"{provider_key}: {field_name} is required (no server default and none provided)"
        )


# Create factory-bound specs
_openai_factory = partial(openai_compatible_factory, default_model="gpt-4o")
_openrouter_factory = partial(
    openai_compatible_factory,
    default_model="anthropic/claude-3-5-sonnet",
    default_base_url="https://openrouter.ai/api/v1",
)


def _get_factory(spec: ProviderSpec) -> ChatModelFactory:
    """Get the factory function for a provider spec."""
    factories = {
        "anthropic": anthropic_factory,
        "bedrock": bedrock_factory,
        "openai": _openai_factory,
        "openrouter": _openrouter_factory,
    }
    if spec.key not in factories:
        raise ValueError(f"Unknown provider: {spec.key}")
    return factories[spec.key]


# Build the registry with factories attached
PROVIDER_REGISTRY: dict[str, ProviderSpec] = {}
for spec in [ANTHROPIC_SPEC, BEDROCK_SPEC, OPENAI_SPEC, OPENROUTER_SPEC]:
    PROVIDER_REGISTRY[spec.key] = spec


def get_provider_spec(key: str) -> ProviderSpec:
    """Get a provider spec by key."""
    if key not in PROVIDER_REGISTRY:
        raise ValueError(f"Unknown provider: {key}")
    return PROVIDER_REGISTRY[key]


def server_default_configured(spec: ProviderSpec, field_name: str) -> bool:
    """Check if a field has a server-configured default (from env var)."""
    env_var = spec.env_var_map.get(field_name, "")
    return bool(os.environ.get(env_var, "").strip())


def resolve_config(
    spec: ProviderSpec, overrides: dict[str, str] | None = None
) -> ProviderRequestConfig:
    """Resolve a provider config by merging server defaults with user overrides."""
    values = {}
    overrides = overrides or {}

    for field in spec.fields:
        # Priority: user override -> env var -> empty string
        override_val = overrides.get(field.name, "").strip()
        env_val = os.environ.get(spec.env_var_map.get(field.name, ""), "").strip()
        final_val = override_val or env_val

        if field.required and not final_val:
            raise MissingCredentialError(spec.key, field.name)

        values[field.name] = final_val

    return ProviderRequestConfig(values=values)


def get_chat_model(spec: ProviderSpec, config: ProviderRequestConfig):
    """Create a chat model from a resolved config."""
    factory = _get_factory(spec)
    return factory(config)
