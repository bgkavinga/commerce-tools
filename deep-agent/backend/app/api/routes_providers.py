"""Provider listing endpoint."""

from fastapi import APIRouter
from app.config import settings
from app.providers.registry import (
    PROVIDER_REGISTRY,
    server_default_configured,
)
from .schemas import (
    ProvidersResponse,
    ProviderResponse,
    CredentialFieldResponse,
)

router = APIRouter(prefix="/api", tags=["providers"])


@router.get("/providers")
async def list_providers() -> ProvidersResponse:
    """List available LLM providers and their fields."""
    providers = []
    for spec in PROVIDER_REGISTRY.values():
        fields = []
        for field in spec.fields:
            fields.append(
                CredentialFieldResponse(
                    name=field.name,
                    label=field.label,
                    type=field.type,
                    required=field.required,
                    options=field.options,
                    placeholder=field.placeholder,
                    server_default_configured=server_default_configured(spec, field.name),
                )
            )
        providers.append(
            ProviderResponse(
                key=spec.key,
                label=spec.label,
                default_model=spec.default_model,
                fields=fields,
            )
        )

    # Determine default provider
    default_provider = settings.deep_agent_default_provider
    if default_provider not in PROVIDER_REGISTRY:
        default_provider = next(iter(PROVIDER_REGISTRY.keys()), "anthropic")

    return ProvidersResponse(default_provider=default_provider, providers=providers)
