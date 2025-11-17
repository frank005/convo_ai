# Architecture

The application follows a modular architecture with clear separation of concerns. Each module handles specific functionality while maintaining clean interfaces for integration.

## Architecture Overview

The application is organized into six main modules:

1. **Core API Layer** - Handles all Agora API communication
2. **Conversational AI API** - Manages real-time messaging and MLLM connections
3. **Subtitles & Chat** - Handles live subtitle display and chat history
4. **Audio Processing** - Manages real-time audio visualization
5. **UI Components** - Controls all user interface interactions
6. **Utilities** - Provides helper functions and common operations

## Module Details

### 1. Core API Layer (`api.js`)

Handles all communication with Agora's API and manages authentication.

**Responsibilities:**

- All communication with Agora's API
- Authentication and request formatting
- Clean interfaces for agent operations
- Broadcast, interrupt, and history functionality

**Key Features:**

- Request/response handling
- Error management
- Credential management

### 2. Conversational AI API (`conversational-ai-api.js`)

Manages real-time messaging, transcription handling, and MLLM WebSocket connections.

**Responsibilities:**

- Real-time messaging and transcription handling
- RTM (Real-Time Messaging) communication
- Transcription updates and chat history
- Message types and conversation flow
- MLLM WebSocket connections and data processing

**Key Features:**

- RTM message processing
- Transcription data handling
- WebSocket connection management
- MLLM-specific data processing

### 3. Subtitles & Chat (`subtitles.js`)

Manages live subtitle display, chat history rendering, and user interaction.

**Responsibilities:**

- Live subtitle display and overlay
- Chat history rendering and updates
- Transcription data processing for display
- Copy/clear functionality for chat history
- Temporary and final message states

**Key Features:**

- Real-time subtitle updates
- Chat history management
- Message state handling
- User interaction controls

### 4. Audio Processing (`audio.js`)

Manages real-time audio visualization and audio context setup.

**Responsibilities:**

- Real-time audio visualization
- Audio context and analyzer setup
- Smooth animations and visual feedback
- Multiple audio vendor support
- Volume indicators and waveform display

**Key Features:**

- Web Audio API integration
- Real-time waveform rendering
- Volume level visualization
- Multi-vendor audio support

### 5. UI Components (`ui.js`)

Manages all user interface interactions and component state.

**Responsibilities:**

- All user interface interactions
- Form validation and submission
- Widget visibility and state
- Collapsible configuration sections
- Vendor-specific field visibility
- MLLM mode switching and configuration
- AI Avatar integration and video streams
- **Device Selection Management** ⭐ **NEW**
  - Device enumeration and permission requests
  - Device selection modal and user interactions
  - Error recovery and fallback mechanisms
  - Real-time track restart with new devices

**Key Features:**

- Dynamic form rendering
- State management
- User interaction handling
- Device management
- Video stream integration

### 6. Utilities (`utils.js`)

Provides helper functions for common operations and data management.

**Responsibilities:**

- Helper functions for common operations
- Parameter handling and validation
- Data formatting and transformation
- JSON configuration management
- Credential storage and retrieval
- Camera integration and image processing
- **Device Management** ⭐ **NEW**
  - Device ID storage and retrieval
  - Device validation and fallback logic
  - Device selection persistence across sessions

**Key Features:**

- Data validation
- Configuration management
- Local storage operations
- Device persistence

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

### MLLM Flow

1. MLLM mode selected (UI Components)
2. WebSocket connection established (Conversational AI API)
3. Audio/Image data streamed (Conversational AI API)
4. Responses received and processed (Conversational AI API)
5. Audio output synthesized (TTS vendors)
6. Visual feedback provided (UI Components, Audio Processing)

## Integration Points

- **API Layer ↔ UI Components**: Form submission and status updates
- **Conversational AI API ↔ Subtitles**: Transcription data flow
- **Audio Processing ↔ UI Components**: Visualization updates
- **Utilities ↔ All Modules**: Common functions and data management
- **Device Management ↔ UI Components**: Device selection and configuration

## Browser APIs Used

- **Web Audio API**: Audio processing and visualization
- **WebRTC**: Real-time communication
- **MediaDevices API**: Camera and microphone access
- **WebSocket API**: MLLM real-time communication
- **localStorage API**: Credential and configuration persistence

## Related Documentation

- [SETUP.md](./SETUP.md) - Setup and configuration
- [API.md](./API.md) - API endpoint documentation
- [FEATURES.md](./FEATURES.md) - Complete feature list
- [BROWSER_COMPATIBILITY.md](./BROWSER_COMPATIBILITY.md) - Browser requirements
