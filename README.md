# Conversational AI Agent Playground

A web dashboard for managing and interacting with Agora's Conversational AI Agents. This application provides a user-friendly interface for creating, updating, and monitoring AI agents that can engage in real-time conversations with support for both traditional LLM and Multimodal Large Language Model (MLLM) configurations.

Targets **Agora Conversational AI Engine v2.9 / v2.10** features (managed presets, manual turn control, Gradium/Mistral/Generic HTTP TTS, LemonSlice avatar, and more). See the [platform release notes](https://docs.agora.io/en/ai/release-notes).

## Project Structure

```
convo_ai/
├── src/
│   ├── js/
│   │   ├── api.js                       # Core API integration with Agora
│   │   ├── asr.js                       # ASR vendor helpers
│   │   ├── audio.js                     # Audio processing and visualization
│   │   ├── camera-preview.js            # Local camera preview overlay
│   │   ├── conversational-ai-api.js     # RTM signaling, subtitles, manual SoS/EoS
│   │   ├── form-settings-persistence.js # Persist form settings across reloads
│   │   ├── subtitles.js                 # Live subtitles and chat history
│   │   ├── ui.js                        # UI components and event handlers
│   │   ├── utils.js                     # Config builders, validation, tokens
│   │   ├── AccessToken2.js              # Agora AccessToken2
│   │   ├── RtcTokenBuilder2.js           # Local RTC token builder
│   │   └── RtmTokenBuilder2.js           # Local RTM token builder
│   ├── css/
│   │   ├── styles.css
│   │   └── modern-ui-library.css
│   ├── lib/
│   │   ├── microsoftVoicesByLang.js
│   │   └── minimaxVoicesByLang.js
│   └── media/
├── DOCS/
│   ├── FEATURES.md
│   ├── SETUP.md
│   ├── API.md
│   ├── VENDORS.md
│   ├── ARCHITECTURE.md
│   └── BROWSER_COMPATIBILITY.md
├── index.html
├── README.md
└── GUIDE.md
```

## Quick Start

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AgoraIO-Community/ConvoAI-Playground.git
   cd ConvoAI-Playground
   ```

2. **Set up your API credentials:**

   - Click the "Set API Credentials" button
   - Enter your Agora Customer ID, Customer Secret, and App ID
   - Optionally enter your App Certificate (required for local token generation)

3. **Configure and create your agent:**
   - Choose your AI mode (LLM or MLLM)
   - Configure agent settings, TTS/ASR vendors, and optional features
   - Create your agent and start interacting

4. **SIP/Phone Management (Optional):**
   - Import and manage phone numbers
   - Initiate outbound calls with pipeline ID support
   - Use override checkbox to use complete configuration even with pipeline ID
   - Retrieve call records and status

For detailed setup instructions, see [SETUP.md](DOCS/SETUP.md).

## Documentation

- **[SETUP.md](DOCS/SETUP.md)** - Detailed setup and configuration guide
- **[FEATURES.md](DOCS/FEATURES.md)** - Complete list of features and capabilities
- **[API.md](DOCS/API.md)** - API endpoint documentation and integration details
- **[VENDORS.md](DOCS/VENDORS.md)** - TTS, ASR, and AI Avatar vendor configuration
- **[ARCHITECTURE.md](DOCS/ARCHITECTURE.md)** - Technical architecture and module details
- **[BROWSER_COMPATIBILITY.md](DOCS/BROWSER_COMPATIBILITY.md)** - Browser requirements and compatibility information
- **[GUIDE.md](GUIDE.md)** - Detailed usage guide and walkthrough

## Key Features

- **Dual AI Model Support**: Traditional LLM and Multimodal LLM (MLLM) configurations
  - **LLM Mode**: OpenAI, Anthropic, Gemini, Vertex AI, Amazon Bedrock, and custom LLM providers
  - **MLLM Mode**: OpenAI Realtime, xAI Grok, Gemini Live, Google Vertex AI, and custom WebSocket endpoints
- **Comprehensive TTS Support**: Microsoft, ElevenLabs, MiniMax, Deepgram, Murf, Cartesia, OpenAI, Hume AI, Rime, Fish Audio, Google, Amazon Polly, Sarvam, Gradium, Mistral, and Generic HTTP (OpenAI protocol)
- **Advanced ASR Integration**: Agora (ARES), Microsoft, Deepgram, OpenAI, Speechmatics, AssemblyAI, Amazon Transcribe, Google, Sarvam, and Custom ASR
- **AI Avatar Support**: Akool, LiveAvatar, Generic, LemonSlice, Anam, and deprecated HeyGen
  - LemonSlice is a first-class UI option that still sends `vendor: generic` with LemonSlice defaults
  - LiveAvatar forces 24 kHz TTS sample rate for supported vendors
- **Manual Turn Control (v2.9)**: Client-side Start of Speech (SoS) / End of Speech (EoS) via RTM when turn detection modes are set to Manual
- **Managed Credentials (v2.9)**: Optional ASR / LLM / TTS presets that set `credential_mode: managed`
- **Backend Pipeline ID**: Use a preconfigured pipeline, with optional override of LLM / TTS / ASR from the UI
- **MCP Servers (Model Context Protocol)**: Tool calling with http, sse, and streamable_http transports
- **SIP/Phone Management**: Import numbers, outbound SIP calls, call history, inbound/outbound config
- **Real-time Audio & Visual**: Waveform visualization, camera preview, device selection with persistence
- **Live Subtitles & Chat**: RTM and data-stream subtitle modes, chat history, copy/clear
- **Advanced Configuration**:
  - Turn Detection v2.4 SoS/EoS modes (vad, semantic, keywords, manual, disabled) and v2.6 interruption object
  - SAL (Speaker Adaptation Library), silence management, farewell graceful timeout
  - Geofence, RTC encryption, custom TTS/Avatar/LLM parameters
- **Local Token Generation**: Built-in Agora RTC + RTM token generator (60-minute TTL, PUBLISHER role)
- **Modern UI**: Drawers, tooltips, responsive layout, form settings persistence

For a complete feature list, see [FEATURES.md](DOCS/FEATURES.md).

## Token Generation

The application includes a built-in Agora token generator that creates RTC + RTM tokens locally. This feature allows you to generate tokens without relying on a server-side token service.

### How to Use Token Generation

1. **Set App Certificate** (Optional but required for token generation):
   - Open "Set API Credentials"
   - Enter your App Certificate (optional field with tooltip)
   - Save credentials

2. **Generate Tokens**:
   - **Agent RTC Token**: Click "Generate" next to the Agora RTC Token field in Agent Settings
   - **Avatar RTC Token**: Click "Generate" next to the Avatar RTC Token field in AI Avatar Settings
   - **Client RTC Token**: Click "Generate" next to the Client RTC Token field on the main page

3. **Token Configuration**:
   - All tokens use the channel name from Agent Settings
   - Token expiration: **60 minutes (3600 seconds)**
   - Privilege expiration: **60 minutes (3600 seconds)**
   - Role: PUBLISHER (allows publishing audio, video, and data streams)

### Requirements

- App ID (required)
- App Certificate (required for token generation)
- Channel Name (from Agent Settings)
- UID (Agent RTC UID, Avatar RTC UID, or Client RTC UID)

The token generator uses the `buildTokenWithRtm` method from the RtcTokenBuilder2 library, which creates tokens that support both RTC (Real-Time Communication) and RTM (Real-Time Messaging) services.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:

- Create an issue on GitHub
- Check the [GUIDE.md](GUIDE.md) for detailed usage instructions
- Review the demo video in the media folder
- Consult the [DOCS](DOCS/) folder for detailed documentation

---

**Agora Conversational AI Engine v2.9 / v2.10** — a comprehensive web dashboard for managing and interacting with Agora's Conversational AI Agents. Features include dual LLM/MLLM modes, 15+ TTS vendors, 10 ASR vendors, multiple AI Avatar vendors (including LemonSlice via generic), manual SoS/EoS turn control, managed credential presets, MCP servers, SIP/phone management, live subtitles, device management, and local RTC+RTM token generation.
