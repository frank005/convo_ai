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
- **Comprehensive TTS Support**: Microsoft, ElevenLabs, Cartesia, OpenAI, Hume AI, Rime, Fish Audio, Groq, and Google TTS
- **Advanced ASR Integration**: Agora, Microsoft, and Deepgram speech recognition with custom model support
- **AI Avatar Support**: Akool and HeyGen avatar vendors with real-time video streaming
- **SIP/Phone Management**: Outbound call functionality with phone number management
  - Initiate outbound calls via SIP
  - Pipeline ID support with override option for complete configuration
  - Phone number import, update, and management
  - Call records and status retrieval
- **Real-time Audio & Visual**: Live audio visualization, camera integration, and device selection
- **Live Subtitles & Chat**: Real-time subtitle display and chat history management
- **Advanced Configuration**: VAD, turn detection, silence management, SAL (Speaker Adaptation Library), farewell configuration, and custom parameters
- **Smart Validation**: Context-aware validation for agent creation and SIP calls based on pipeline configuration
- **Local Token Generation**: Built-in Agora RTC + RTM token generator with one-click token generation for agent, avatar, and client UIDs
- **Modern UI Design**: Beautiful gradient buttons, modern form inputs, and enhanced visual styling with smooth animations

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

**Agora ConversationalAI Backend v2.0** - Enhanced with MLLM support, AI Avatar functionality, SIP/Phone Management, advanced configuration options, new TTS/ASR vendors, comprehensive real-time multimodal capabilities, and device selection management. Features professional SVG placeholders, seamless video stream integration, improved chat interface with proper overflow handling and responsive design, robust device selection with permission management and error recovery, pipeline ID override functionality, smart validation system, comprehensive phone number management capabilities, and a modern UI library with gradient buttons, enhanced form styling, and smooth animations.
