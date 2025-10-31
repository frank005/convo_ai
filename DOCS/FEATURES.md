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

- **Multimodal LLM (MLLM) Mode**
  - Real-time multimodal conversations with OpenAI Realtime API
  - Direct WebSocket connection to OpenAI Realtime API
  - Support for text, audio, and image inputs simultaneously
  - Streaming audio and text processing
  - Image analysis and response generation
  - Advanced turn detection with semantic VAD
  - Automatic response generation and interruption handling
  - Configurable conversation history management
  - Configurable history length (default: 32 messages)
  - Automatic greeting for first user in channel
  - Real-time response generation and interruption
  - MLLM-specific options: create response, interrupt response, eagerness

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
  - Support for Akool and HeyGen avatar vendors
  - Real-time video subscription and playback
  - Automatic placeholder restoration when video stream ends
  - **AI Avatar Configuration**
    - Vendor selection: Akool and HeyGen support
    - API key and avatar ID configuration
    - RTC UID and token management for avatar channel access
    - HeyGen-specific settings: quality, idle timeout, activity timeout
    - Automatic client UID configuration for avatar-agent communication
    - Token requirement validation and setup guidance
    - Agora token requirement modal for AI Avatar setup
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

- **Cartesia TTS**

  - Ultra-fast, low-latency text-to-speech
  - Real-time streaming capabilities
  - Sonic-2 model with custom voice configuration

- **OpenAI TTS**
  - High-quality neural voice synthesis
  - Multiple voice options (coral, alloy, echo, fable, onyx, nova, shimmer)
  - Speed control and voice instruction support

### Advanced ASR Integration

- **Agora ASR**

  - Built-in speech recognition with multiple language support
  - Languages: en-US, es-ES, ja-JP, ko-KR, ar-AE, hi-IN

- **Microsoft ASR**

  - High-accuracy speech recognition
  - Comprehensive language coverage
  - Region-specific configuration

- **Deepgram ASR**
  - Real-time streaming speech recognition
  - Advanced models (nova-2, nova, enhanced, base)
  - Multi-language support with custom URLs

### Voice Activity Detection (VAD) & Turn Detection

- **Multiple VAD Types**

  - Agora VAD: Built-in voice activity detection
  - Server VAD: Server-side voice activity detection (MLLM + OpenAI only)
  - Semantic VAD: Context-aware conversation flow (MLLM + OpenAI only)

- **Configurable Parameters**

  - Interrupt duration: Time before interruption triggers (default: 160ms)
  - Prefix padding: Forward padding for speech capture (default: 800ms)
  - Silence duration: Time before assuming speech end (default: 640ms)
  - Threshold: Voice detection sensitivity (0.0-1.0, default: 0.5)

- **Interrupt Modes**

  - Interrupt: Stop current response and process input immediately
  - Append: Complete current response before processing new input
  - Ignore: Discard interrupting input

- **MLLM-Specific Turn Detection Options**
  - Create Response: Auto-generate response on VAD stop
  - Interrupt Response: Auto-interrupt ongoing responses
  - Eagerness: Response timing control (low, auto, high)
  - Configurable eagerness levels for response timing

### Silence Management

- **Configurable Timeout**
  - Silence timeout: Maximum silent duration (0-60000ms)
  - Action types: speak (TTS announcement) or think (LLM context)
  - Custom silence reminder messages
  - Automatic agent prompting for continued interaction

### Advanced Features

- **AIVAD (AI Voice Activity Detection)**

  - Intelligent interruption handling
  - Currently available for English
  - Enhanced conversation flow management

- **RTM (Real-Time Messaging)**

  - Advanced signaling service
  - Custom information delivery
  - Metrics collection and error handling
  - Data channel configuration (RTC datastream or RTM)
  - Performance metrics collection (with RTM enabled)
  - Signaling requirements validation

- **Custom Parameters**

  - Flexible configuration for LLM/MLLM
  - Add custom key-value pairs for advanced model control
  - Support for string, number, boolean, array, and object types
  - JSON validation and formatting
  - Parameter injection into API requests

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
  - Performance metrics (with RTM enabled)
  - Error message collection
  - Signaling requirements validation

- **Visual Enhancements**
  - Enhanced user experience with clear visual feedback
  - Responsive design with proper element sizing
  - Live subtitles and chat history with proper overflow handling
