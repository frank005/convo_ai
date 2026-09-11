# API Integration

The application integrates with Agora's Conversational AI API endpoints to manage agents and handle real-time communication.

## Core Agent Operations

### Create Agent

Create a new conversational AI agent.

- **Endpoint:** `POST /api/conversational-ai-agent/v2/projects/{appId}/join`
- **GPT-Live:** `POST https://partner.ai.agora.io/preview/api/conversational-ai-agent/v2/projects/{appId}/join` with header `agora-feature: live-models`
- **Description:** Creates a new agent and joins it to the specified channel

### Update Agent

Update an existing agent's configuration.

- **Endpoint:** `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/update`
- **Description:** Updates the configuration of an existing agent

### Stop Agent

Stop and remove an agent from the channel.

- **Endpoint:** `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/leave`
- **Description:** Gracefully stops the agent and removes it from the channel

### Query Agent Status

Retrieve the current status and configuration of an agent.

- **Endpoint:** `GET /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}`
- **Description:** Returns detailed information about the agent's current state

### List All Agents

Get a list of all active agents in your project.

- **Endpoint:** `GET /api/conversational-ai-agent/v2/projects/{appId}/agents`
- **Description:** Returns a list of all agents across your project

### Get Agent History

Retrieve conversation history for an agent.

- **Endpoint:** `GET /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/history`
- **Description:** Returns the conversation history for the specified agent

## Communication & Control

### Send Broadcast Message (Speak)

Send text for the agent to speak, bypassing the LLM.

- **Endpoint:** `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/speak`
- **Description:** Plays the text through TTS with priority (`INTERRUPT` / `APPEND` / `IGNORE`) and interruptability
- **Maximum Message Size:** 512 bytes
- **Playground:** REST `/speak` with toolkit `speak` over RTM when subtitles/RTM are ready

### Interrupt Agent

Manually interrupt an agent's current response.

- **Endpoint:** `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/interrupt`
- **Description:** Immediately terminates the agent's current response
- **Features:** Status confirmation and error handling

### Manual Turn Control (SoS / EoS) — client RTM (v2.9)

The playground sends manual turn boundaries over **Agora Signaling (RTM)** (not REST), matching ConvoAI turn detection when SoS/EoS mode is `manual`:

| Action | RTM message type (playground) |
|--------|-------------------------------|
| Start of Speech | `user.manual_sos` |
| End of Speech | `user.manual_eos` |

**Requirements:** Turn Detection enabled with Manual mode, RTM enabled, `data_channel: rtm`. Platform client toolkits (Android / iOS / Web) also expose `manualSOS` / `manualEOS` helpers in v2.10; this playground uses the RTM message path directly.

See [Manually control start and end of speech](https://docs.agora.io/en/ai/develop/manual-turn-control) (or the current Agora docs path for manual SoS/EoS).

### Send Custom Instruction (Think)

Inject custom text into the agent pipeline.

- **Endpoint:** `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/think`
- **Description:** Sends instruction text with optional action overrides
- **Default:** `on_listening_action` is **`interrupt`**. Set **`inject`** to queue without interrupting, or **`append`** (v2.12) to wait until the current turn's LLM output finishes, then start a new turn. `on_thinking_action` and `on_speaking_action` also accept `append`.
- **Playground:** REST `/think` with toolkit `think` over RTM when subtitles/RTM are ready.

### Query Conversation Turns

Per-turn latency and lifecycle metrics for a session (last 7 days).

- **Endpoint:** `GET /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/turns`
- **Query parameters:** `page_index` (default 1), `page_size` (default 50, max 50)
- **Response:** `agent_id`, `name`, `channel`, `total_turn_count`, `pagination` (`page_index`, `total_pages`, `is_last_page`), `turns[]`
- **Playground:** Use "Fetch all pages" to merge every page when `total_turn_count` > 50

### Join API — greeting interruption

- `properties.llm.greeting_configs.interruptable` (boolean): whether user speech can interrupt greeting playback.

### HTTP status codes and error reasons

Status codes include **401**, **429**, and **500**.

`reason` values include `ServiceNotEnabled`, `AccountSuspended`, `ResourceAllocationFailed`, `InvalidRequestBody`, `MissingRequiredField`, and `InvalidFieldValue`.

**Deprecated:** `InvalidRequest` — use `InvalidRequestBody`, `MissingRequiredField`, or `InvalidFieldValue` instead.

All REST calls in `src/js/api.js` format error bodies through `Utils.formatConvoAiApiError()` when the response includes a JSON `reason` (or deprecated `InvalidRequest`).

### Notification events

- **112 turns finished:** post-session batched turn data (alternative to paginated REST query).

See [release notes](https://docs.agora.io/en/ai/release-notes) for platform changelog details (v2.12 custom `llm.tools`, generated filler words, think `append`, MLLM MCP, Gemini ASR; v2.11 Typecast TTS, Azure OpenAI Realtime MLLM, ARES `asr.keywords`; v2.10 Gradium / Mistral / `generic_http` TTS).

### Avatar payload notes

- **LemonSlice** playground option still sends REST `avatar.vendor: "generic"` with LemonSlice `api_base_url` / `avatar_id: lemonslice`, plus optional LemonSlice params (`video_encoding`, `model`, `activity_idle_timeout`, `response_done_timeout`, `agent_prompt`, `agent_idle_prompt`, `aspect_ratio`).
- **LiveAvatar** requires 24 kHz TTS for supported vendors; **LemonSlice** forces TTS sample rate from the LemonSlice Sample Rate control (default 24000) via `Utils.enforceAvatarTtsSampleRate()`.

## Authentication

All API requests require authentication using your Agora credentials:

- **Customer ID**: Your Agora Customer ID
- **Customer Secret**: Your Agora Customer Secret
- **App ID**: Your Agora Application ID

Credentials are managed through the "Set API Credentials" button in the application interface and stored securely in localStorage.

## Related Documentation

- [SETUP.md](./SETUP.md) - Initial setup and configuration
- [FEATURES.md](./FEATURES.md) - Complete feature list including broadcast and interruption capabilities
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture and API layer details
