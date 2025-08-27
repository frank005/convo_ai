# Conversational AI Agent Playground

A modern web dashboard for managing and interacting with Agora's Conversational AI Agents. This application provides a user-friendly interface for creating, updating, and monitoring AI agents that can engage in real-time conversations with support for both traditional LLM and cutting-edge Multimodal Large Language Model (MLLM) configurations.

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
  - Support for OpenAI, Anthropic, Gemini, and custom LLM providers
  - Configurable system messages and greeting/failure messages
  - Custom parameter injection for advanced model control
  - Flexible vendor-specific request formatting

- **Multimodal LLM (MLLM) Mode** ⭐ **NEW**
  - Real-time multimodal conversations with OpenAI Realtime API
  - Support for text, audio, and image inputs simultaneously
  - Advanced turn detection with semantic VAD
  - Automatic response generation and interruption handling
  - Configurable conversation history management

### Real-time Audio & Visual Experience
- **Live Audio Visualization**
  - Real-time audio waveform display
  - Dynamic volume indicator with scaling rings
  - Toggle-able AI interaction widget
  - Audio configuration for multiple vendors

- **Device Selection** ⭐ **NEW**
  - **Microphone Selection**: Choose from available microphones with persistent storage
  - **Camera Selection**: Pre-configure camera devices even when image input is disabled
  - **Permission Management**: Automatic permission requests with clear user feedback
  - **Error Recovery**: Fallback to default devices if selected devices fail
  - **Real-time Updates**: Automatic track restart when devices are changed while in channel
  - **User-Friendly Interface**: Clean modal with retry functionality and helpful messages

- **Camera Integration** ⭐ **NEW**
  - Periodic screenshot capture for image analysis
  - Multi-camera device selection and configuration
  - Privacy-aware camera setup with user consent
  - Image-based visual analysis (not video streaming)
  - **Camera Preview Overlay** ⭐ **NEW**
    - Draggable local camera preview when image input is enabled
    - Shows what the user is sending to the AI agent
    - Automatically hides when camera is muted
    - Position persistence across sessions
    - Touch-friendly mobile support

- **AI Avatar Support** ⭐ **NEW**
  - Visual AI avatar representation with neural network design
  - Professional SVG placeholder with brain/neural network icon
  - Seamless transition from placeholder to live video stream
  - Support for Akool and HeyGen avatar vendors
  - Real-time video subscription and playback
  - Automatic placeholder restoration when video stream ends

- **Live Subtitles & Chat History** ⭐ **NEW**
  - Real-time subtitle display with overlay functionality
  - Live chat history with message timestamps
  - Improved chat message display with proper overflow handling
  - Timestamps always visible and properly positioned
  - Responsive design that adapts to different screen sizes
  - Better text wrapping for long messages
  - Optimized spacing and margins for improved readability
  - Copy and clear functionality for chat history management
  - Demo and test subtitle functionality

### Comprehensive TTS Support
- **Microsoft TTS**
  - Global region selection (30+ regions)
  - Extensive voice library with language-specific options
  - Advanced parameters: rate, speed, volume, sample rate
  - Skip pattern support for natural speech

- **ElevenLabs TTS**
  - High-quality voice cloning and customization
  - Model and voice selection with custom voice IDs
  - Advanced parameters: stability, similarity boost, style, speaker boost
  - Configurable sample rates

- **Cartesia TTS** ⭐ **NEW**
  - Ultra-fast, low-latency text-to-speech
  - Real-time streaming capabilities
  - Sonic-2 model with custom voice configuration

- **OpenAI TTS** ⭐ **NEW**
  - High-quality neural voice synthesis
  - Multiple voice options (coral, alloy, echo, fable, onyx, nova, shimmer)
  - Speed control and voice instruction support

### Advanced ASR Integration
- **Agora ASR**
  - Built-in speech recognition with multiple language support
  - Languages: en-US, es-ES, ja-JP, ko-KR, ar-AE, hi-IN

- **Microsoft ASR** ⭐ **NEW**
  - High-accuracy speech recognition
  - Comprehensive language coverage
  - Region-specific configuration

- **Deepgram ASR** ⭐ **NEW**
  - Real-time streaming speech recognition
  - Advanced models (nova-2, nova, enhanced, base)
  - Multi-language support with custom URLs

### Advanced Configuration & Control
- **Turn Detection & VAD**
  - Multiple VAD types: Agora VAD, Server VAD, Semantic VAD
  - Configurable interrupt modes: interrupt, append, ignore
  - Advanced parameters: interrupt duration, prefix padding, silence duration, threshold
  - MLLM-specific options: create response, interrupt response, eagerness

- **AI Avatar Configuration** ⭐ **NEW**
  - Vendor selection: Akool and HeyGen support
  - API key and avatar ID configuration
  - RTC UID and token management for avatar channel access
  - HeyGen-specific settings: quality, idle timeout, activity timeout
  - Automatic client UID configuration for avatar-agent communication
  - Visual placeholder with professional neural network design
  - Token requirement validation and setup guidance

- **Advanced Features**
  - AIVAD (AI Voice Activity Detection) for intelligent interruption handling
  - RTM (Real-Time Messaging) for advanced signaling and custom data delivery
  - Metrics collection and error message handling
  - Data channel configuration (RTC datastream or RTM)
  - Experimental features modal with advanced RTC parameters

- **Silence Management** ⭐ **NEW**
  - Configurable silence timeout with speak/think actions
  - Custom silence reminder messages
  - Automatic agent prompting for continued interaction

- **Camera Integration** ⭐ **NEW**
  - Multi-camera device selection and configuration
  - Privacy-aware camera setup with user consent
  - Periodic screenshot capture for image analysis
  - Integration with MLLM image processing capabilities
  - **Device Selection Integration** ⭐ **NEW**
    - Seamless integration with device selection modal
    - Pre-configuration support for camera devices
    - Automatic application of selected devices when image input is enabled

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
  - Experimental features modal (Konami code: ↑↑↓↓←→←→BA)

- **Real-time Monitoring**
  - Agent status tracking
  - Conversation history retrieval
  - Performance metrics (with RTM enabled)
  - Error message collection
  - Signaling requirements validation

- **Visual Enhancements** ⭐ **NEW**
  - Professional SVG placeholder design for AI Avatar
  - Neural network icon with connection lines
  - Smooth transitions between placeholder and live video
  - Responsive design with proper element sizing
  - Enhanced user experience with clear visual feedback
  - Live subtitles and chat history with proper overflow handling
  - Optimized message display and timestamp visibility
  - Camera configuration modal with privacy controls
  - Agora token requirement modal for AI Avatar setup

## Project Structure

```
convo_ai/
├── src/
│   ├── js/
│   │   ├── api.js                    # Core API integration with Agora
│   │   ├── audio.js                  # Audio processing and visualization
│   │   ├── conversational-ai-api.js  # Conversational AI API handling
│   │   ├── subtitles.js              # Live subtitles and chat history
│   │   ├── ui.js                     # UI components and event handlers
│   │   └── utils.js                  # Utility functions and helpers
│   ├── css/
│   │   └── styles.css                # Application styles
│   ├── lib/
│   │   └── microsoftVoicesByLang.js # Microsoft TTS voice definitions
│   └── media/
│       ├── comvoai_demo.mp4         # Demo video
│       └── *.png                     # Screenshots
├── index.html                        # Main application interface
├── README.md                         # This file
└── GUIDE.md                          # Detailed usage guide
```

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/frank005/convo_ai.git
   cd convo_ai
   ```

2. **Set up your API credentials:**
   - Click the "Set API Credentials" button
   - Enter your Agora Customer ID, Customer Secret, and App ID
   - Credentials are stored securely in localStorage

3. **Choose your AI mode:**
   - **LLM Mode**: Traditional text-based conversations
   - **MLLM Mode**: Multimodal conversations with real-time audio/image processing

4. **Configure your agent:**
   - Enter a unique name for your agent
   - Set the Agora channel name and RTC UID
   - Configure remote RTC UIDs (comma-separated or * for all)
   - Set idle timeout for automatic agent cleanup
   - Choose input/output modalities
   - Configure ASR vendor and language settings

5. **Set up AI model configuration:**
   - **For LLM Mode**: Configure LLM settings, TTS settings, and custom parameters
   - **For MLLM Mode**: Configure MLLM WebSocket URL, API key, and conversation settings

6. **Advanced configuration (optional):**
   - Enable AIVAD for intelligent interruption handling
   - Configure RTM for advanced signaling
   - Set up turn detection and VAD parameters
   - Configure silence management
   - Add custom parameters for advanced model control

7. **AI Avatar setup (optional):** ⭐ **NEW**
   - Enable AI Avatar checkbox in AI Avatar Settings
   - Select avatar vendor (Akool or HeyGen)
   - Configure API key and avatar ID
   - Set RTC UID and token for avatar channel access
   - Configure vendor-specific settings (quality, timeouts)
   - Visual placeholder will appear until video stream is active

8. **Device selection setup (optional):** ⭐ **NEW**
   - Click "Device Settings" button in the top bar
   - Select preferred microphone from available devices
   - Pre-configure camera device (works even when image input is disabled)
   - Grant microphone and camera permissions when prompted
   - Use retry button if devices don't load initially
   - Device selections are automatically applied when joining channels

9. **Camera setup (optional):** ⭐ **NEW**
   - Enable image input modality for camera integration
   - Select camera device from available options
   - Acknowledge privacy terms for camera access
   - Configure periodic screenshot capture for image analysis

10. **Live subtitles setup (optional):** ⭐ **NEW**
    - Enable live subtitles in the AI Interaction widget
    - Ensure signaling (RTM) is enabled on your Agora AppID
    - Configure subtitle overlay and chat history display
    - Test subtitle functionality with demo and test buttons

## API Integration

The application integrates with Agora's Conversational AI API endpoints:

### Core Agent Operations
- `POST /api/conversational-ai-agent/v2/projects/{appId}/join` - Create new agent
- `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/update` - Update agent
- `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/leave` - Stop agent
- `GET /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}` - Query agent status
- `GET /api/conversational-ai-agent/v2/projects/{appId}/agents` - List all agents
- `GET /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/history` - Get agent history

### Communication & Control
- `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/broadcast` - Send broadcast message
- `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/interrupt` - Interrupt agent

## Advanced Features

### Multimodal LLM (MLLM) Support
- **Real-time WebSocket Communication**
  - Direct connection to OpenAI Realtime API
  - Streaming audio and text processing
  - Image analysis and response generation

- **Advanced Turn Detection**
  - Server VAD: Server-side voice activity detection
  - Semantic VAD: Context-aware conversation flow
  - Configurable eagerness levels for response timing

- **Conversation Management**
  - Configurable history length (default: 32 messages)
  - Automatic greeting for first user in channel
  - Real-time response generation and interruption

### Voice Activity Detection (VAD)
- **Multiple VAD Types**
  - Agora VAD: Built-in voice activity detection
  - Server VAD: Server-side processing (MLLM + OpenAI only)
  - Semantic VAD: Context-aware detection (MLLM + OpenAI only)

- **Configurable Parameters**
  - Interrupt duration: Time before interruption triggers (default: 160ms)
  - Prefix padding: Forward padding for speech capture (default: 800ms)
  - Silence duration: Time before assuming speech end (default: 640ms)
  - Threshold: Voice detection sensitivity (0.0-1.0, default: 0.5)

### Turn Detection & Interruption
- **Interrupt Modes**
  - Interrupt: Stop current response and process input immediately
  - Append: Complete current response before processing new input
  - Ignore: Discard interrupting input

- **MLLM-Specific Options**
  - Create Response: Auto-generate response on VAD stop
  - Interrupt Response: Auto-interrupt ongoing responses
  - Eagerness: Response timing control (low, auto, high)

### Silence Management
- **Configurable Timeout**
  - Silence timeout: Maximum silent duration (0-60000ms)
  - Action types: speak (TTS announcement) or think (LLM context)
  - Custom silence reminder messages

### Advanced Features
- **AIVAD (AI Voice Activity Detection)**
  - Intelligent interruption handling
  - Currently available for English
  - Enhanced conversation flow management

- **RTM (Real-Time Messaging)**
  - Advanced signaling service
  - Custom information delivery
  - Metrics collection and error handling
  - Data channel configuration

### Custom Parameters
- **Flexible Configuration**
  - Add custom key-value pairs for LLM/MLLM configuration
  - Support for string, number, boolean, array, and object types
  - JSON validation and formatting
  - Parameter injection into API requests

## TTS Vendor Support

### Microsoft TTS
- **Required Fields:** API Key, Region, Language, Voice
- **Optional Parameters:**
  - `rate`: Speaking rate (0.5–2.0)
  - `speed`: Alternate speaking rate (0.5–2.0)
  - `volume`: Audio volume (0–100)
  - `sample_rate`: Audio sampling rate in Hz (e.g., 24000)
- **Features:** 30+ global regions, extensive voice library, skip pattern support

### ElevenLabs TTS
- **Required Fields:** API Key, Model ID, Voice ID
- **Optional Parameters:**
  - `sample_rate`: Audio sampling rate in Hz (e.g., 24000)
  - `stability`: Voice stability (0–1)
  - `similarity_boost`: Similarity boost (0–1)
  - `style`: Voice style (0–1)
  - `use_speaker_boost`: Enable speaker boost (boolean)
- **Features:** High-quality voice cloning, custom voice IDs

### Cartesia TTS
- **Required Fields:** API Key, Model ID, Voice ID
- **Default Model:** "sonic-2"
- **Features:** Ultra-fast, low-latency TTS with real-time streaming

### OpenAI TTS
- **Required Fields:** API Key, Model, Voice
- **Default Values:** Model "gpt-4o-mini-tts", Voice "coral"
- **Optional Parameters:**
  - `instructions`: Voice control instructions
  - `speed`: Speaking rate (0.25–4.0)
- **Features:** High-quality neural synthesis, multiple voice options

### Hume AI TTS
- **Required Fields:** API Key, Voice ID
- **Default Values:** Provider "HUME_AI", Speed 1.0, Trailing Silence 0.35
- **Optional Parameters:**
  - `provider`: Provider name (default: "HUME_AI")
  - `speed`: Speaking rate (0.1–5.0)
  - `trailing_silence`: Trailing silence duration in seconds (0–2.0)
- **Features:** High-quality voice synthesis with customizable speed and silence control

## AI Avatar Vendor Support ⭐ **NEW**

### Akool Avatar
- **Required Fields:** API Key, Avatar ID, Avatar RTC UID
- **Optional Fields:** Avatar RTC Token
- **Features:** High-quality AI avatar generation with real-time video streaming

### HeyGen Avatar
- **Required Fields:** API Key, Avatar ID, Avatar RTC UID
- **Optional Fields:** Avatar RTC Token
- **Optional Parameters:**
  - `quality`: Video quality (low: 360p, medium: 480p, high: 720p)
  - `disable_idle_timeout`: Whether to disable idle timeout (boolean)
  - `activity_idle_timeout`: Activity idle timeout in seconds (default: 60)
- **Features:** Advanced avatar generation with quality control and timeout management

## ASR Vendor Support

### Agora ASR
- **Required Fields:** None (uses default Agora configuration)
- **Language Support:** en-US, es-ES, ja-JP, ko-KR, ar-AE, hi-IN
- **Features:** Built-in speech recognition

### Microsoft ASR
- **Required Fields:** API Key, Region, Language
- **Language Support:** Comprehensive language coverage
- **Features:** High-accuracy recognition with custom models

### Deepgram ASR
- **Required Fields:** API Key, URL, Model, Language
- **Default Values:** URL "wss://api.deepgram.com/v1/listen", Model "nova-2", Language "en"
- **Features:** Real-time streaming with advanced models

## Architecture

The application follows a modular architecture:

1. **Core API Layer** (`api.js`)
   - Handles all communication with Agora's API
   - Manages authentication and request formatting
   - Provides clean interfaces for agent operations
   - Supports broadcast, interrupt, and history functionality

2. **Conversational AI API** (`conversational-ai-api.js`)
   - Manages real-time messaging and transcription handling
   - Handles RTM (Real-Time Messaging) communication
   - Processes transcription updates and chat history
   - Manages message types and conversation flow
   - Handles MLLM WebSocket connections and data processing

3. **Subtitles & Chat** (`subtitles.js`)
   - Manages live subtitle display and overlay
   - Handles chat history rendering and updates
   - Processes transcription data for display
   - Manages copy/clear functionality for chat history
   - Handles temporary and final message states

4. **Audio Processing** (`audio.js`)
   - Manages real-time audio visualization
   - Handles audio context and analyzer setup
   - Provides smooth animations and visual feedback
   - Supports multiple audio vendors
   - Manages volume indicators and waveform display

5. **UI Components** (`ui.js`)
   - Manages all user interface interactions
   - Handles form validation and submission
   - Controls widget visibility and state
   - Provides collapsible configuration sections
   - Manages vendor-specific field visibility
   - Handles MLLM mode switching and configuration
   - Manages AI Avatar integration and video streams
   - **Device Selection Management** ⭐ **NEW**
     - Handles device enumeration and permission requests
     - Manages device selection modal and user interactions
     - Provides error recovery and fallback mechanisms
     - Handles real-time track restart with new devices

6. **Utilities** (`utils.js`)
   - Provides helper functions for common operations
   - Manages parameter handling and validation
   - Handles data formatting and transformation
   - Supports JSON configuration management
   - Manages credential storage and retrieval
   - Handles camera integration and image processing
   - **Device Management** ⭐ **NEW**
     - Manages device ID storage and retrieval
     - Handles device validation and fallback logic
     - Provides device selection persistence across sessions

## Browser Compatibility

- **Modern Browsers:** Chrome, Firefox, Safari, Edge (latest versions)
- **Required APIs:** Web Audio API, WebRTC, localStorage, MediaDevices API
- **Camera Support:** For image input functionality and device selection
- **Microphone Support:** For audio input and device selection
- **WebSocket Support:** For MLLM real-time communication
- **Permission Support:** For microphone and camera access
- **Responsive Design:** Optimized for various screen sizes and orientations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the [GUIDE.md](GUIDE.md) for detailed usage instructions
- Review the demo video in the media folder

---

**Agora ConversationalAI Backend v1.6** - Enhanced with MLLM support, AI Avatar functionality, advanced configuration options, new TTS/ASR vendors, comprehensive real-time multimodal capabilities, and device selection management. Features professional SVG placeholders, seamless video stream integration, improved chat interface with proper overflow handling and responsive design, and robust device selection with permission management and error recovery. 