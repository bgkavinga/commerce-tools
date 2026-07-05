# Deep Agent Chat Application

A web-based AI agent built on LangChain's LangGraph "Deep Agents" framework, providing a multi-provider LLM chat interface with New Relic and Jira integration for Adobe Commerce investigation and monitoring.

## Features

- **Multi-provider LLM support**: Anthropic (Claude), OpenAI, OpenRouter, AWS Bedrock
- **Switchable providers**: Change LLM providers mid-conversation from the web UI
- **Flexible credentials**: Server-side env var defaults + user-supplied overrides
- **MCP tool integration**: Connects to New Relic NRQL and Jira ticket APIs
- **Conversation continuity**: Thread-based message history persisted via LangGraph checkpointer
- **Real-time streaming**: Token-by-token response streaming via Server-Sent Events
- **Tool visibility**: See tool calls and results as the agent works
- **One-click Docker deployment**: Multi-stage Dockerfile with Node.js + Python + built-in SPA

## Getting Started

### Local Development (no Docker)

**Prerequisites:**
- Node.js 18+
- Python 3.11+
- A valid API key for at least one LLM provider

**Setup:**

1. **Compile MCP servers** (at repo root):
   ```bash
   npm ci
   npx tsc
   ```

2. **Set up backend**:
   ```bash
   cd deep-agent/backend
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -e .
   ```

3. **Create `.env`** in `deep-agent/backend/`:
   ```bash
   cp ../..env.example .env
   # Edit .env with your API keys
   ```

4. **Run backend**:
   ```bash
   cd deep-agent/backend
   uvicorn app.main:app --reload --port 8000
   ```

5. **In another terminal, run frontend**:
   ```bash
   cd deep-agent/frontend
   npm install
   npm run dev
   ```

6. Open `http://localhost:5173` in your browser.

### Verification (Local)

1. Navigate to Settings (⚙️ button)
2. Confirm your LLM provider is listed and indicates which fields have server defaults
3. Send a chat message—you should see token-by-token streaming
4. Try asking about a Jira ticket or New Relic metrics (if credentials are configured)
5. Switch providers mid-conversation and send another message to verify continuity

### Docker Deployment

**Build** (from repo root):
```bash
docker build -f deep-agent/Dockerfile -t commerce-tools-deep-agent:local .
```

**Run**:
```bash
docker run -d \
  -p 8000:8000 \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  -e JIRA_BASE_URL="https://yourcompany.atlassian.net" \
  -e JIRA_EMAIL="your-email@example.com" \
  -e JIRA_API_TOKEN="..." \
  -e NEW_RELIC_API_KEY="..." \
  commerce-tools-deep-agent:local
```

Or use `--env-file`:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
docker run -d -p 8000:8000 --env-file deep-agent/.env.local commerce-tools-deep-agent:local
```

Then open `http://localhost:8000` in your browser.

**Health check**:
```bash
curl http://localhost:8000/api/health
# {"status":"ok"}
```

## Architecture

### Backend (Python + FastAPI)

- **app/config.py**: Pydantic Settings for all env vars
- **app/providers/**: Provider registry and implementations (Anthropic, OpenAI, OpenRouter, Bedrock)
- **app/mcp/client.py**: MCP tool loading via langchain-mcp-adapters (spawns Node.js stdio servers)
- **app/agent/factory.py**: Deep agent builder with LangGraph checkpointer
- **app/api/routes_*.py**: FastAPI routes
  - `GET /api/health` — health check
  - `GET /api/providers` — list available providers + server defaults
  - `POST /api/chat/stream` — chat endpoint with SSE streaming

### Frontend (React + Vite + TypeScript)

- **src/api/client.ts**: API client with SSE frame parsing
- **src/state/**: Store hooks for settings (localStorage) and chat (localStorage + per-thread)
- **src/components/**: React UI components
  - `ChatWindow.tsx` — main chat interface
  - `MessageList.tsx`, `MessageBubble.tsx` — message rendering
  - `ToolActivity.tsx` — tool call/result visualization
  - `ChatInput.tsx` — message input
  - `SettingsPanel.tsx` — provider selector + credential form
  - `ProviderSelector.tsx`, `ProviderCredentialForm.tsx` — settings sub-components

## Provider Configuration

### Environment Variables (Server Defaults)

Each provider can be pre-configured via env vars, making it zero-config if you run with env vars set:

| Provider | Key Fields |
|---|---|
| **Anthropic** | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `ANTHROPIC_BASE_URL` |
| **OpenAI** | `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL` |
| **OpenRouter** | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL` |
| **Bedrock** | `AWS_REGION`, `BEDROCK_MODEL_ID`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_PROFILE` |

### User Overrides (UI)

Users can override any field from the Settings panel. Overrides are stored **client-side only** (localStorage) and sent with each chat request—never persisted on the server.

To add a new provider later:
1. Create a new `providers/<name>_provider.py` with a `ProviderSpec` and factory function
2. Import it in `providers/registry.py` and add to the registry
3. The UI automatically renders the new provider and its fields

## API Contracts

### Chat Stream Request

```json
{
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "What's the status of PRO-234?",
  "provider": {
    "key": "anthropic",
    "overrides": {
      "api_key": "sk-ant-...",
      "model": "claude-opus-4-1"
    }
  }
}
```

### Chat Stream Response (Server-Sent Events)

```
event: thread
data: {"thread_id":"550e8400-e29b-41d4-a716-446655440000"}

event: token
data: {"content":"I'll look"}

event: tool_call
data: {"id":"call_1","name":"get_jira_issue","args":{"issue_key":"PRO-234"}}

event: tool_result
data: {"id":"call_1","name":"get_jira_issue","content":"PRO-234: Enable new checkout flow..."}

event: token
data: {"content":" into that ticket."}

event: done
data: {}
```

## Troubleshooting

### "Failed to load MCP tools" error on startup

- Check that Node.js is available in the container (`docker exec <container> which node`)
- Verify `dist/mcps/{newrelic,jira}/server.js` files exist
- Check env vars for `NEW_RELIC_API_KEY`, `JIRA_BASE_URL`, etc. are set or at least not causing syntax errors
- Review container logs: `docker logs <container>`

### Chat errors about missing credentials

- The backend will return a `400` error if a required field is missing (no server default + no user override)
- Check the Settings panel to see which fields show "server default" badge
- If no server default, you must provide a value in the UI before sending a chat message

### Provider switch not working

- Credentials are sent with every chat request, not cached server-side
- The UI switch is instantaneous; just send another message and it will use the new provider
- If the new provider has different required fields, a credential error will be raised and shown inline

## Development

### Backend

```bash
cd deep-agent/backend
# Linting / type checking
pip install ruff pytest
ruff check app/
# Run tests
pytest
```

### Frontend

```bash
cd deep-agent/frontend
# Type checking
npm run build
# Dev server with hot reload
npm run dev
```

## License

MIT (see root LICENSE file)
