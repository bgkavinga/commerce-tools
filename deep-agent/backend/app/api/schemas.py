"""API request and response schemas."""

from pydantic import BaseModel, Field
from typing import Optional


class ProviderOverrides(BaseModel):
    """Provider configuration overrides for a chat request."""

    key: str = Field(..., description="Provider key (e.g., 'anthropic', 'openai')")
    overrides: dict[str, str] = Field(
        default_factory=dict, description="Field overrides (api_key, model, etc.)"
    )


class ChatRequest(BaseModel):
    """Request to send a chat message."""

    thread_id: Optional[str] = Field(
        default=None, description="Conversation thread ID (generated if not provided)"
    )
    message: str = Field(..., description="User message")
    provider: ProviderOverrides = Field(..., description="Active provider and overrides")


class CredentialFieldResponse(BaseModel):
    """Schema for a provider credential field."""

    name: str
    label: str
    type: str  # "text", "secret", "select"
    required: bool
    options: Optional[list[str]] = None
    placeholder: Optional[str] = None
    server_default_configured: bool = Field(
        ..., description="Whether a server-side default is configured for this field"
    )


class ProviderResponse(BaseModel):
    """Schema for a provider in the /api/providers response."""

    key: str
    label: str
    default_model: str
    fields: list[CredentialFieldResponse]


class ProvidersResponse(BaseModel):
    """Response from GET /api/providers."""

    default_provider: str = Field(
        ..., description="Key of the default provider to show on load"
    )
    providers: list[ProviderResponse]


class HealthResponse(BaseModel):
    """Response from GET /api/health."""

    status: str
