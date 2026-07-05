"""Chat streaming endpoint."""

import json
import uuid
from typing import AsyncGenerator

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse

from app.providers.registry import (
    get_provider_spec,
    resolve_config,
    get_chat_model,
    MissingCredentialError,
)
from app.agent.factory import build_agent
from .schemas import ChatRequest

router = APIRouter(prefix="/api", tags=["chat"])


async def chat_stream_generator(
    request: ChatRequest, tools, thread_id: str
) -> AsyncGenerator[str, None]:
    """Generate chat stream events."""
    try:
        # Resolve provider and configuration
        spec = get_provider_spec(request.provider.key)
        config = resolve_config(spec, request.provider.overrides)
        chat_model = get_chat_model(spec, config)

        # Build agent
        agent = build_agent(chat_model, tools)

        # Emit thread ID on first frame
        yield f"event: thread\ndata: {json.dumps({'thread_id': thread_id})}\n\n"

        # Stream events from the agent
        async for event in agent.astream_events(
            {"messages": [("user", request.message)]},
            config={"configurable": {"thread_id": thread_id}},
            version="v2",
        ):
            event_type = event.get("event")

            if event_type == "on_chat_model_stream":
                chunk = event.get("data", {}).get("chunk", {})
                if hasattr(chunk, "content") and chunk.content:
                    yield f"event: token\ndata: {json.dumps({'content': chunk.content})}\n\n"

            elif event_type == "on_tool_start":
                tool_call_data = event.get("data", {}).get("input", {})
                metadata = event.get("metadata", {})
                tool_name = metadata.get("name", "")
                tool_id = metadata.get("tool_call_id", str(uuid.uuid4()))
                yield f"event: tool_call\ndata: {json.dumps({'id': tool_id, 'name': tool_name, 'args': tool_call_data})}\n\n"

            elif event_type == "on_tool_end":
                metadata = event.get("metadata", {})
                tool_name = metadata.get("name", "")
                tool_id = metadata.get("tool_call_id", str(uuid.uuid4()))
                output = event.get("data", {}).get("output", "")
                # Truncate long outputs
                if isinstance(output, str) and len(output) > 2000:
                    output = output[:2000] + "..."
                yield f"event: tool_result\ndata: {json.dumps({'id': tool_id, 'name': tool_name, 'content': str(output)})}\n\n"

        yield "event: done\ndata: {}\n\n"

    except MissingCredentialError as e:
        error_msg = str(e)
        yield f"event: error\ndata: {json.dumps({'message': error_msg})}\n\n"

    except Exception as e:
        error_msg = f"Error: {type(e).__name__}: {str(e)}"
        yield f"event: error\ndata: {json.dumps({'message': error_msg})}\n\n"


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest, http_request: Request):
    """Stream chat responses with tool execution."""
    # Generate or use provided thread ID
    thread_id = request.thread_id or str(uuid.uuid4())

    # Validate message
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Get tools from app state
    tools = http_request.app.state.tools

    return StreamingResponse(
        chat_stream_generator(request, tools, thread_id),
        media_type="text/event-stream",
    )
