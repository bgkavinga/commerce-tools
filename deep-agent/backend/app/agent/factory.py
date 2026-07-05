"""Factory for creating deep agents."""

from langchain_core.language_models import BaseChatModel
from langchain_core.tools import BaseTool
from langgraph.checkpoint.memory import MemorySaver
from deepagents import create_deep_agent

from .prompts import DEEP_AGENT_SYSTEM_PROMPT


# Module-level checkpointer for conversation continuity
_checkpointer = MemorySaver()


def build_agent(model: BaseChatModel, tools: list[BaseTool]):
    """Build a deep agent with the given model and tools."""
    return create_deep_agent(
        model=model,
        tools=tools,
        system_prompt=DEEP_AGENT_SYSTEM_PROMPT,
        checkpointer=_checkpointer,
    )
