from langchain_openai import ChatOpenAI

from .base import ProviderRequestConfig


def openai_compatible_factory(
    config: ProviderRequestConfig,
    *,
    default_model: str,
    default_base_url: str | None = None,
) -> ChatOpenAI:
    """Create a ChatOpenAI model from resolved config (works for OpenAI and OpenRouter)."""
    values = config.values
    return ChatOpenAI(
        model=values.get("model", default_model),
        api_key=values.get("api_key"),
        base_url=values.get("base_url") or default_base_url,
    )
