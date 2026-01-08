# Conversational AI Agent Playground

A web dashboard for managing and interacting with Agora's Conversational AI Agents. This application provides a user-friendly interface for creating, updating, and monitoring AI agents that can engage in real-time conversations with support for both traditional LLM and cutting-edge Multimodal Large Language Model (MLLM) configurations.

## Project Structure

```
convo_ai_studio/
├── src/
│   ├── js/
│   │   ├── api.js                    # Core API integration with Agora
│   │   ├── audio.js                  # Audio processing and visualization
│   │   ├── conversational-ai-api.js  # Conversational AI API handling
│   │   ├── subtitles.js              # Live subtitles and chat history
│   │   ├── ui.js                     # UI components and event handlers
│   │   └── utils.js                  # Utility functions and helpers
│   ├── css/
│   │   ├── styles.css                # Application styles
│   │   └── modern-ui-library.css     # Modern UI component library
│   ├── lib/
│   │   └── microsoftVoicesByLang.js # Microsoft TTS voice definitions
│   └── media/
│       ├── comvoai_demo.mp4         # Demo video
│       └── *.png                     # Screenshots
├── DOCS/
│   ├── FEATURES.md                   # Complete feature list
│   ├── SETUP.md                      # Detailed setup instructions
│   ├── API.md                        # API endpoint documentation
│   ├── VENDORS.md                    # Vendor configuration guide
│   ├── ARCHITECTURE.md               # Technical architecture
│   └── BROWSER_COMPATIBILITY.md      # Browser requirements
├── index.html                        # Main application interface
├── README.md                         # This file
└── GUIDE.md                          # Detailed usage guide
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
  - **LLM Mode**: Support for OpenAI, Anthropic, Gemini, Vertex AI, and custom LLM providers
  - **MLLM Mode**: Real-time multimodal conversations with OpenAI Realtime API and Google Vertex AI
  - Vertex AI MLLM support with native audio, ADC credentials, and project configuration
- **Comprehensive TTS Support**: Microsoft, ElevenLabs, Cartesia, OpenAI, Hume AI, Rime, Fish Audio, Groq, Google, PlayHT, Sarvam, and Amazon Polly TTS
- **Advanced ASR Integration**: Agora (ARES), Microsoft, Deepgram, OpenAI, Speechmatics, AssemblyAI, Amazon Transcribe, Google, Sarvam, and Custom ASR with extensive language support
- **AI Avatar Support**: Akool and HeyGen avatar vendors with real-time video streaming
  - HeyGen-specific settings: quality control, idle timeout, and activity timeout
  - Automatic client UID configuration for avatar-agent communication
- **MCP Servers (Model Context Protocol)**: Tool calling support with multiple server configurations
  - Configure multiple MCP servers with custom endpoints
  - Support for http, sse, and streamable_http transport protocols
  - Tool availability and allowed tools configuration
  - Automatic enable_tools flag in advanced_features when enabled
- **SIP/Phone Management**: Complete phone number and call management
  - Import, update, and manage phone numbers
  - Initiate outbound calls via SIP with pipeline ID support
  - Override checkbox to use complete configuration even with pipeline ID
  - Retrieve call records and status
  - Inbound and outbound configuration with allowed addresses
- **Real-time Audio & Visual**: Comprehensive multimedia experience
  - Live audio visualization with waveform display
  - Camera integration with preview overlay and device selection
  - Multi-camera device selection and configuration
  - Microphone and camera device management with persistent storage
  - Permission management with automatic fallback
- **Live Subtitles & Chat**: Real-time conversation tracking
  - Real-time subtitle display with overlay functionality
  - Live chat history with message timestamps
  - RTM and Data Stream subtitle modes
  - Copy and clear functionality for chat history
- **Advanced Configuration**: Extensive customization options
  - **VAD & Turn Detection**: Agora VAD, Server VAD, and Semantic VAD
  - **SAL (Speaker Adaptation Library)**: Voice print locking and recognition
    - Locking mode: Seamless voice locking in 10 seconds
    - Recognition mode: Voice recognition with speaker identification
    - Sample URL management for voiceprints
  - Silence management with configurable timeouts and actions
  - Farewell configuration with graceful timeout
  - Custom parameters with type validation (string, number, array, object)
- **Smart Validation**: Context-aware validation for agent creation and SIP calls
- **Local Token Generation**: Built-in Agora RTC + RTM token generator
  - One-click token generation for agent, avatar, and client UIDs
  - 30-minute token expiration with PUBLISHER role
- **Modern UI Design**: Professional interface with enhanced user experience
  - Beautiful gradient buttons and modern form inputs
  - Enhanced visual styling with smooth animations
  - Responsive design with proper overflow handling
  - Comprehensive tooltips and help text

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
   - Token expiration: 30 minutes (1800 seconds)
   - Privilege expiration: 30 minutes (1800 seconds)
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

**Agora ConversationalAI Backend v2.0** - A comprehensive web dashboard for managing and interacting with Agora's Conversational AI Agents. Features include:

- **Dual AI Model Support**: Traditional LLM and Multimodal LLM (MLLM) with Vertex AI integration
- **MCP Servers**: Model Context Protocol support for tool calling with multiple server configurations
- **Comprehensive Vendor Support**: 10+ TTS vendors, 9+ ASR vendors, and 2 AI Avatar vendors
- **Advanced Features**: AIVAD, RTM, SAL (Speaker Adaptation Library), custom parameters, and more
- **SIP/Phone Management**: Complete phone number and call management with pipeline support
- **Real-time Capabilities**: Live subtitles, chat history, audio visualization, and camera integration
- **Device Management**: Advanced microphone and camera selection with permission handling
- **Modern UI**: Professional design with gradient buttons, tooltips, and responsive layout
- **Local Token Generation**: Built-in RTC + RTM token generator for secure authentication
- **Smart Validation**: Context-aware validation and error handling throughout the application
