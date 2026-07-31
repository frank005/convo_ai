## Features

### Core Agent Management

- **Create, Update, Stop Agents**
  - Create new AI agents with customizable parameters
  - Update existing agents with new configurations
  - Stop running agents gracefully
  - Query agent status and retrieve detailed information
  - List all active agents across your project
  - Retrieve agent conversation history

### Dual AI Model Support

- **Traditional LLM Mode**

  - Support for OpenAI, Anthropic, Gemini, Vertex AI, and custom LLM providers
  - Configurable system messages and greeting/failure messages
  - **Greeting interruption:** `properties.llm.greeting_configs.interruptable`
  - Custom parameter injection for advanced model control
  - Flexible vendor-specific request formatting
  - MCP (Model Context Protocol) servers support for tool calling
  - Amazon Bedrock support with access key and secret configuration
  - Claude Anthropic headers configuration

- **Multimodal LLM (MLLM) Mode**
  - Real-time multimodal conversations with OpenAI Realtime API
  - **xAI Grok** via `wss://api.x.ai/v1/realtime`
  - **Gemini Live** realtime WebSocket support
  - **Custom** MLLM WebSocket endpoints
  - Google Vertex AI MLLM support with native audio
    - ADC credentials configuration
    - Project ID and location settings
    - Voice selection and custom instructions
    - Automatic transcription for agent and user
  - Support for text, audio, and image inputs simultaneously
  - Streaming audio and text processing
  - Image analysis and response generation
  - Advanced turn detection with semantic VAD (OpenAI Realtime)
  - Automatic response generation and interruption handling
  - Configurable conversation history management
  - Configurable history length (default: 32 messages)
  - Automatic greeting for first user in channel
  - MLLM-specific options: create response, interrupt response, eagerness

### Backend Pipeline & Managed Credentials

- **Backend Pipeline ID**: Point the agent at a preconfigured pipeline; optionally override LLM / TTS / ASR from the playground UI
- **Managed presets (v2.9)**: ASR / LLM / TTS presets that set `credential_mode: managed` (OpenAI / MiniMax TTS presets and related managed options)

### Real-time Audio & Visual Experience

- **Live Audio Visualization**

  - Real-time audio waveform display
  - Dynamic volume indicator with scaling rings
  - Toggle-able AI interaction widget
  - Audio configuration for multiple vendors

- **Device Selection**

  - **Microphone Selection**: Choose from available microphones with persistent storage
  - **Camera Selection**: Pre-configure camera devices even when image input is disabled
  - **Permission Management**: Automatic permission requests with clear user feedback
  - **Error Recovery**: Fallback to default devices if selected devices fail
  - **Real-time Updates**: Automatic track restart when devices are changed while in channel
  - **User-Friendly Interface**: Clean modal with retry functionality and helpful messages
  - Seamless integration with device selection modal
  - Pre-configuration support for camera devices
  - Automatic application of selected devices when image input is enabled

- **Camera Integration**

  - Multi-camera device selection and configuration
  - Privacy-aware camera setup with user consent
  - Periodic screenshot capture for image analysis
  - Image-based visual analysis (not video streaming)
  - Integration with MLLM image processing capabilities
  - **Camera Preview Overlay**
    - Draggable local camera preview when image input is enabled
    - Shows what the user is sending to the AI agent
    - Automatically hides when camera is muted
    - Position persistence across sessions
    - Touch-friendly mobile support
  - Camera configuration modal with privacy controls

- **AI Avatar Support**

  - Visual AI avatar representation with neural network design
  - Professional SVG placeholder with brain/neural network icon
  - Seamless transition from placeholder to live video stream
  - Support for Akool, LiveAvatar, Generic, LemonSlice, Anam, and deprecated HeyGen avatar vendors
  - Real-time video subscription and playback
  - Automatic placeholder restoration when video stream ends
  - **AI Avatar Configuration**
    - Vendor selection: Akool, LiveAvatar, Generic, LemonSlice, Anam, HeyGen (deprecated)
    - API key and avatar ID configuration
    - RTC UID and token management for avatar channel access
    - LemonSlice-specific settings: identity (agent ID / image URL / base64), aspect ratio, video encoding, model, idle/response timeouts, speaking/idle prompts; TTS sample rate forced (default 24000)
    - Anam-specific settings: sample rate, quality, video encoding
    - LiveAvatar / HeyGen settings: quality, idle timeout, activity timeout
    - LiveAvatar and LemonSlice force TTS sample rate for supported TTS vendors
    - Automatic client UID configuration for avatar-agent communication
    - Token requirement validation and setup guidance
    - Agora token requirement modal for AI Avatar setup
    - Avatar custom parameters (JSON merge into `avatar.params`)
  - Professional SVG placeholder design with neural network icon and connection lines
  - Smooth transitions between placeholder and live video
  - Responsive design with proper element sizing

- **Live Subtitles & Chat History**
  - Real-time subtitle display with overlay functionality
  - Live chat history with message timestamps
  - Improved chat message display with proper overflow handling
  - Timestamps always visible and properly positioned
  - Responsive design that adapts to different screen sizes
  - Better text wrapping for long messages
  - Optimized spacing and margins for improved readability
  - Copy and clear functionality for chat history management
  - Demo and test subtitle functionality
  - Optimized message display and timestamp visibility

### Comprehensive TTS Support

Dropdown vendors (see [VENDORS.md](./VENDORS.md) for field details):

- **Microsoft**, **ElevenLabs**, **MiniMax**, **Deepgram**, **Murf**, **Cartesia**, **OpenAI**
- **Hume AI**, **Rime**, **Fish Audio**, **Google**, **Amazon Polly**, **Sarvam**
- **Gradium (v2.10)**, **Mistral (v2.10)**, **Generic HTTP / OpenAI protocol (v2.10)**
- Shared: skip patterns, TTS custom parameters, LiveAvatar 24 kHz enforcement when applicable

### Advanced ASR Integration

Dropdown vendors:

- **Agora (ARES)**, **Microsoft**, **Deepgram**, **OpenAI**, **Speechmatics**
- **AssemblyAI**, **Amazon Transcribe**, **Google**, **Sarvam**, **Custom**

### Voice Activity Detection (VAD) & Turn Detection

- **Turn Detection v2.4 (primary path)**
  - Start of Speech modes: `vad`, `semantic`, `keywords`, `manual`, `disabled`
  - End of Speech modes: `vad`, `manual`, `semantic`
  - Keyword lists and disabled-strategy options where applicable
  - Configurable VAD timing: interrupt duration, prefix padding, silence duration, threshold

- **Interruption object (v2.6)**
  - Pipeline interruption configuration (preferred over legacy interrupt modes when not using Deprecated Features)

- **Deprecated Features toggle**
  - Pre-v2.4 interrupt modes and AIVAD-style controls for compatibility testing

- **Manual Turn Control (v2.9)**
  - Client Start (SoS) / End (EoS) buttons
  - Publishes RTM messages `user.manual_sos` / `user.manual_eos`
  - Requires SoS/EoS mode Manual + RTM / `data_channel: rtm`

- **MLLM turn detection**
  - Modes: `agora_vad`, `server_vad`, `semantic_vad` (vendor-dependent; e.g. xAI does not support `semantic_vad`)
  - Create Response / Interrupt Response / Eagerness options

### Silence Management

- **Configurable Timeout**
  - Silence timeout: Maximum silent duration (0-60000ms)
  - Action types: speak (TTS announcement) or think (LLM context)
  - Custom silence reminder messages
  - Automatic agent prompting for continued interaction

### SIP / Phone Management

- Import, update, and manage phone numbers
- Start outbound SIP calls (optional pipeline ID + override full config)
- Hang up / query call history
- Inbound and outbound configuration with allowed addresses

### Advanced Features

- **AIVAD (AI Voice Activity Detection)** — available via Deprecated Features path / English scenarios

- **RTM (Real-Time Messaging)**

  - Advanced signaling service
  - Custom information delivery
  - Metrics collection and error handling
  - Data channel configuration (RTC datastream or RTM)
  - Required for Manual Turn Control and RTM subtitle mode

- **MCP Servers (Model Context Protocol)**

  - Tool calling support with multiple server configurations
  - Configure multiple MCP servers with unique names and endpoints
  - Transport protocol options: http, sse, streamable_http
  - Tool availability toggle (is_tool_call_available)
  - Allowed tools configuration (comma-separated list or "*" for all)
  - Automatic enable_tools flag in advanced_features when enabled
  - mcp_servers array added to LLM configuration in JSON output

- **SAL (Speaker Adaptation Library)**

  - Voice print locking and recognition capabilities
  - **Locking Mode**: Seamless voice locking in 10 seconds
    - Seamless mode: Auto-recognition without pre-registered voiceprints
    - Personalized mode: Pre-registered voiceprints (1-3 URLs)
  - **Recognition Mode**: Voice recognition with speaker identification
    - Requires voiceprint URLs for speaker identification
    - Processes speaker information via vpids in metadata
  - Sample URL management for voiceprints
  - File requirements: 16kHz, 16-bit, mono PCM, 10-15 seconds duration
  - Maximum file size: 2 MB per voiceprint

- **Custom Parameters**

  - Flexible configuration for LLM/MLLM, TTS, and Avatar
  - Add custom key-value pairs for advanced model control
  - Support for string, number, boolean, array, and object types
  - JSON validation and formatting
  - Parameter injection into API requests

- **Farewell / Geofence / RTC Encryption**
  - Graceful farewell timeout
  - Geofence region constraints
  - RTC encryption mode, key, and salt

- **Form settings persistence**
  - Selected form values persist across reloads via `form-settings-persistence.js`

- **Experimental Features**
  - Experimental features modal with advanced RTC parameters
  - Access via Konami code: ↑↑↓↓←→←→BA

### Broadcast & Communication

- **Message Broadcasting**

  - Send broadcast messages to agents with priority control
  - Configurable interruptability settings
  - Real-time status feedback
  - Maximum message size of 512 bytes

- **Agent Interruption**
  - Manual agent interruption capability
  - Immediate response termination
  - Status confirmation and error handling

- **Think (Custom Instruction)**
  - Inject instruction text into the agent pipeline
  - Configurable `on_listening_action` / `on_speaking_action` and metadata

- **Query Conversation Turns**
  - Paginated turn metrics (last 7 days)
  - Optional fetch-all-pages merge in the playground

### Input/Output Modalities

- **Input Modalities**

  - Text input (always enabled)
  - Audio input with real-time processing
  - Image input with camera integration

- **Output Modalities**
  - Text output with rich formatting
  - Audio output with vendor-specific synthesis
  - Multi-modal responses in MLLM mode

### Developer Tools

- **Configuration Management**

  - JSON export for create and update operations
  - Custom parameter management with type validation
  - Copy-to-clipboard functionality
  - Form validation and error handling

- **Real-time Monitoring**

  - Agent status tracking
  - Conversation history retrieval
  - Query agents / agent list with filters and pagination
  - Performance metrics (with RTM enabled)
  - Error message collection
  - Signaling requirements validation

- **Visual Enhancements**
  - Enhanced user experience with clear visual feedback
  - Responsive design with proper element sizing
  - Live subtitles and chat history with proper overflow handling
