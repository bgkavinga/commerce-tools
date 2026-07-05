from typing import Any, Callable, Literal
from pydantic import BaseModel
from langchain_core.language_models import BaseChatModel


class CredentialField(BaseModel):
    """A credential field in a provider spec."""

    name: str
    label: str
    type: Literal["text", "secret", "select"]
    required: bool = False
    options: list[str] | None = None
    placeholder: str | None = None


class ProviderRequestConfig(BaseModel):
    """Resolved configuration for a chat request (server defaults + user overrides)."""

    values: dict[str, str]


ChatModelFactory = Callable[[ProviderRequestConfig], BaseChatModel]


class ProviderSpec(BaseModel):
    """Specification for an LLM provider."""

    key: str
    label: str
    default_model: str
    fields: list[CredentialField]
    env_var_map: dict[str, str]  # field name -> env var name

    class Config:
        arbitrary_types_allowed = True
