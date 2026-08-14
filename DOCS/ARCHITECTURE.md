# Architecture

The application follows a modular architecture with clear separation of concerns. Each module handles specific functionality while maintaining clean interfaces for integration.

## Architecture Overview

The application is organized into these main modules:

1. **Core API Layer** (`api.js`) — Agora REST agent / SIP / phone operations
2. **Conversational AI API** (`conversational-ai-api.js`) — RTM signaling, transcripts, manual SoS/EoS
3. **Subtitles & Chat** (`subtitles.js`) — Live subtitle display and chat history
4. **Audio Processing** (`audio.js`) — Real-time audio visualization
5. **UI Components** (`ui.js`) — Forms, drawers, vendor visibility, agent controls
6. **Utilities** (`utils.js`) — Config builders, validation, local token generation
7. **ASR helpers** (`asr.js`) — ASR vendor UI/config helpers
8. **Camera preview** (`camera-preview.js`) — Local camera overlay
9. **Form persistence** (`form-settings-persistence.js`) — Persist selected settings across reloads
10. **Token builders** (`RtcTokenBuilder2.js`, `RtmTokenBuilder2.js`, `AccessToken2.js`)

## Module Details

### 1. Core API Layer (`api.js`)

Handles all communication with Agora's API and manages authentication.

**Responsibilities:**

- Agent join / update / leave / query / list / history / turns
- Broadcast, interrupt, and think endpoints
- SIP / phone number management REST calls
- Error formatting via `Utils.formatConvoAiApiError()`

### 2. Conversational AI API (`conversational-ai-api.js`)

Manages real-time messaging, transcription handling, and client signaling.

**Responsibilities:**

- RTM (Real-Time Messaging) communication
- Transcription updates and chat history hooks
- Manual turn control publish (`user.manual_sos` / `user.manual_eos`) and result handling
- Message types and conversation flow

### 3. Subtitles & Chat (`subtitles.js`)

Manages live subtitle display, chat history rendering, and wrappers around manual turn helpers.

### 4. Audio Processing (`audio.js`)

Real-time audio visualization (Web Audio API waveform / volume).

### 5. UI Components (`ui.js`)

Form validation and submission, vendor-specific field visibility (TTS / ASR / Avatar / MLLM), Manual Turn Control buttons, device settings, avatar video integration.

### 6. Utilities (`utils.js`)

- `getFormData` / `validateFormData` / `buildAgentConfig`
- TTS / ASR / Avatar / MLLM / turn-detection payload builders
- LiveAvatar 24 kHz TTS enforcement
- Credential storage and local RTC+RTM token generation (60-minute TTL)

### 7–10. Supporting modules

- `asr.js` — ASR drawer behavior
- `camera-preview.js` — draggable local preview
- `form-settings-persistence.js` — sync form values across sessions
- Token builder libs — local Agora token minting when App Certificate is set

## Data Flow

### Agent Creation Flow

1. User fills out configuration form (UI Components)
2. Form validation occurs (Utilities)
3. API request formatted (Core API Layer)
4. Request sent to Agora API (Core API Layer)
5. Response processed and agent created (Core API Layer)
6. UI updated with agent status (UI Components)

### Real-time Communication Flow

1. Audio/Video captured from user devices (UI Components)
2. Audio processed for visualization (Audio Processing)
3. Data sent to Agora RTC/RTM (Conversational AI API)
4. Transcription received (Conversational AI API)
5. Subtitles displayed (Subtitles & Chat)
6. Chat history updated (Subtitles & Chat)

### Manual Turn Control Flow

1. User sets SoS/EoS mode to Manual and enables RTM
2. Agent starts with `turn_detection.config.*.mode: manual`
3. UI Start/End buttons publish RTM SoS/EoS messages
4. Engine treats client signals as turn boundaries

### MLLM Flow

1. MLLM mode selected (UI Components)
2. Agent joins with MLLM vendor configuration (Core API Layer)
3. Realtime audio/image path handled by the engine / client
4. Turn detection follows MLLM-specific modes when enabled (required for Azure OpenAI Realtime)

## Integration Points

- **API Layer ↔ UI Components**: Form submission and status updates
- **Conversational AI API ↔ Subtitles**: Transcription data flow
- **Audio Processing ↔ UI Components**: Visualization updates
- **Utilities ↔ All Modules**: Common functions and data management
- **Device / Camera modules ↔ UI Components**: Preview and device selection

## Related Documentation

- [FEATURES.md](./FEATURES.md)
- [API.md](./API.md)
- [VENDORS.md](./VENDORS.md)
- [SETUP.md](./SETUP.md)
