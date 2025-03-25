# Conversational AI Agent Playground

A modern web dashboard for managing and interacting with Agora's Conversational AI Agents. This application provides a user-friendly interface for creating, updating, and monitoring AI agents that can engage in real-time conversations.

## Features

- **Agent Management**
  - Create new AI agents with customizable parameters
  - Update existing agents
  - Stop running agents
  - Query agent status
  - List all active agents

- **Real-time Audio Visualization**
  - Live audio waveform visualization
  - Volume indicator with dynamic scaling
  - Toggle-able AI interaction widget

- **Flexible Configuration**
  - Support for multiple TTS vendors (Microsoft, ElevenLabs)
  - Customizable LLM parameters
  - Configurable ASR language settings
  - Token-based authentication

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
   - Add any custom parameters as needed

## API Integration

The application integrates with Agora's Conversational AI API endpoints:

- `POST /api/conversational-ai-agent/v2/projects/{appId}/join` - Create new agent
- `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/update` - Update agent
- `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/leave` - Stop agent
- `GET /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}` - Query agent status
- `GET /api/conversational-ai-agent/v2/projects/{appId}/agents` - List all agents

## Architecture

The application follows a modular architecture:

1. **API Layer** (`api.js`)
   - Handles all communication with Agora's API
   - Manages authentication and request formatting
   - Provides clean interfaces for agent operations

2. **Audio Processing** (`audio.js`)
   - Manages real-time audio visualization
   - Handles audio context and analyzer setup
   - Provides smooth animations and visual feedback

3. **UI Components** (`ui.js`)
   - Manages all user interface interactions
   - Handles form validation and submission
   - Controls widget visibility and state

4. **Utilities** (`utils.js`)
   - Provides helper functions for common operations
   - Manages parameter handling and validation
   - Handles data formatting and transformation

## Development

To modify or extend the application:

1. The code is organized into logical modules in the `src/js` directory
2. Styles are centralized in `src/css/styles.css`
3. Each module has clear responsibilities and interfaces
4. The application uses modern JavaScript features and async/await for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 