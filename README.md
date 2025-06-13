# Conversational AI Agent Playground

A modern web dashboard for managing and interacting with Agora's Conversational AI Agents. This application provides a user-friendly interface for creating, updating, and monitoring AI agents that can engage in real-time conversations.

## Features

- **Agent Management**
  - Create new AI agents with customizable parameters
  - Update existing agents
  - Stop running agents
  - Query agent status
  - List all active agents
  - Retrieve agent conversation history

- **Real-time Audio Visualization**
  - Live audio waveform visualization
  - Volume indicator with dynamic scaling
  - Toggle-able AI interaction widget
  - Audio configuration for different vendors

- **Flexible Configuration**
  - Support for multiple TTS vendors (Microsoft, ElevenLabs)
  - Customizable LLM parameters
  - Configurable ASR language settings
  - Token-based authentication
  - Advanced VAD (Voice Activity Detection) settings
  - Turn detection and interruption handling
  - Custom parameter management
  - Advanced TTS parameter support (see below)

- **Broadcast & Control**
  - Send broadcast messages to agents
  - Configure message priority and interruptability
  - Interrupt agent responses
  - Copy JSON configurations for create/update operations

## Project Structure

```
convo_ai/
├── src/
│   ├── js/
│   │   ├── api.js         # API integration with Agora
│   │   ├── audio.js       # Audio processing and visualization
│   │   ├── ui.js          # UI components and event handlers
│   │   └── utils.js       # Utility functions
│   ├── css/
│   │   └── styles.css     # Application styles
│   └── index.html         # Main HTML file
├── lib/
│   └── microsoftVoicesByLang.js  # Microsoft TTS voice definitions
└── README.md
```

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/frank005/convo_ai.git
   cd convo_ai
   ```

2. Set up your API credentials:
   - Click the "Set API Credentials" button
   - Enter your Agora Customer ID, Customer Secret, and App ID
   - Credentials are stored securely in localStorage

3. Configure your agent:
   - Enter a unique name for your agent
   - Set the Agora channel name and RTC UID
   - Configure LLM settings (API key, URL, model)
   - Choose TTS vendor and voice settings
   - (Optional) Set advanced TTS parameters for Microsoft or ElevenLabs. Only filled fields are sent in the config.
   - Configure VAD and turn detection settings
   - Add any custom parameters as needed

## API Integration

The application integrates with Agora's Conversational AI API endpoints:

- `POST /api/conversational-ai-agent/v2/projects/{appId}/join` - Create new agent
- `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/update` - Update agent
- `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/leave` - Stop agent
- `GET /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}` - Query agent status
- `GET /api/conversational-ai-agent/v2/projects/{appId}/agents` - List all agents
- `GET /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/history` - Get agent history
- `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/broadcast` - Send broadcast message
- `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/interrupt` - Interrupt agent

## Advanced Features

### Voice Activity Detection (VAD)
- Configurable interrupt duration
- Adjustable prefix padding
- Customizable silence duration
- Threshold sensitivity control

### Turn Detection
- Interrupt mode: Stop and process input immediately
- Append mode: Complete current response before processing
- Ignore mode: Discard interrupting input

### Broadcast Messages
- Support for different priority levels
- Configurable interruptability
- Maximum message size of 512 bytes
- Real-time status feedback

### Custom Parameters
- Add custom key-value pairs for LLM configuration
- Support for array and object parameter types
- JSON configuration export
- Parameter validation and formatting

## Architecture

The application follows a modular architecture:

1. **API Layer** (`api.js`)
   - Handles all communication with Agora's API
   - Manages authentication and request formatting
   - Provides clean interfaces for agent operations
   - Supports broadcast and interrupt functionality

2. **Audio Processing** (`audio.js`)
   - Manages real-time audio visualization
   - Handles audio context and analyzer setup
   - Provides smooth animations and visual feedback
   - Supports multiple audio vendors

3. **UI Components** (`ui.js`)
   - Manages all user interface interactions
   - Handles form validation and submission
   - Controls widget visibility and state
   - Provides collapsible configuration sections

4. **Utilities** (`utils.js`)
   - Provides helper functions for common operations
   - Manages parameter handling and validation
   - Handles data formatting and transformation
   - Supports JSON configuration management

## Development

To modify or extend the application:

1. The code is organized into logical modules in the `src/js` directory
2. Styles are centralized in `src/css/styles.css`
3. Each module has clear responsibilities and interfaces
4. The application uses modern JavaScript features and async/await for API calls
5. UI components use Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Advanced TTS Options

The playground supports advanced, optional configuration for both Microsoft and ElevenLabs TTS vendors. Only fields you fill out are sent in the agent configuration (empty/blank fields are omitted from the JSON).

**Microsoft TTS Optional Parameters:**
- `rate`: Speaking rate (0.5–2.0, optional)
- `speed`: Alternate speaking rate (0.5–2.0, optional)
- `volume`: Audio volume (0–100, optional)
- `sample_rate`: Audio sampling rate in Hz (e.g., 24000, optional)

**ElevenLabs TTS Optional Parameters:**
- `sample_rate`: Audio sampling rate in Hz (e.g., 24000, optional)
- `stability`: Voice stability (0–1, optional)
- `similarity_boost`: Similarity boost (0–1, optional)
- `style`: Voice style (0–1, optional)
- `use_speaker_boost`: Enable speaker boost (boolean, optional)

**UI Improvements:**
- Tooltips for all TTS fields, including new options
- TTS key field is vendor-specific and only shown for the selected vendor
- Skip Patterns tooltip is now concise and positioned to avoid overflow

**Note:** Only the parameters you fill out are sent to the API. Defaults are not sent unless explicitly set. 