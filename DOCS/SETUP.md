# Setup Guide

This guide will walk you through setting up and configuring the Conversational AI Agent Playground.

## Prerequisites

1. **Clone the repository:**
   ```bash
   git clone https://github.com/frank005/convo_ai.git
   cd convo_ai
   ```

## Initial Configuration

### 1. Set up API Credentials

- Click the "Set API Credentials" button
- Enter your Agora Customer ID, Customer Secret, and App ID
- Credentials are stored securely in localStorage

### 2. Choose Your AI Mode

The application supports two AI modes:

- **LLM Mode**: Traditional text-based conversations
- **MLLM Mode**: Multimodal conversations with real-time audio/image processing

### 3. Configure Your Agent

Basic agent configuration:

- Enter a unique name for your agent
- Set the Agora channel name and RTC UID
- Configure remote RTC UIDs (comma-separated or \* for all)
- Set idle timeout for automatic agent cleanup
- Choose input/output modalities
- Configure ASR vendor and language settings

### 4. Set up AI Model Configuration

Configuration differs based on your selected AI mode:

**For LLM Mode:**

- Configure LLM settings
- Configure TTS settings
- Add custom parameters for advanced model control

**For MLLM Mode:**

- Configure MLLM WebSocket URL
- Set API key
- Configure conversation settings

### 5. Advanced Configuration (Optional)

Advanced features you can enable:

- Enable AIVAD for intelligent interruption handling
- Configure RTM for advanced signaling
- Set up turn detection and VAD parameters
- Configure silence management
- Add custom parameters for advanced model control

For more details on advanced features, see [FEATURES.md](./FEATURES.md).

## Optional Features Setup

### AI Avatar Setup

Enable visual AI avatar representation:

1. Enable AI Avatar checkbox in AI Avatar Settings
2. Select avatar vendor (Akool or HeyGen)
3. Configure API key and avatar ID
4. Set RTC UID and token for avatar channel access
5. Configure vendor-specific settings (quality, timeouts)
6. Visual placeholder will appear until video stream is active

For detailed vendor configuration, see [VENDORS.md](./VENDORS.md).

### Device Selection Setup

Configure your microphone and camera devices:

1. Click "Device Settings" button in the top bar
2. Select preferred microphone from available devices
3. Pre-configure camera device (works even when image input is disabled)
4. Grant microphone and camera permissions when prompted
5. Use retry button if devices don't load initially
6. Device selections are automatically applied when joining channels

### Camera Setup

Enable camera integration for image analysis:

1. Enable image input modality for camera integration
2. Select camera device from available options
3. Acknowledge privacy terms for camera access
4. Configure periodic screenshot capture for image analysis

### Live Subtitles Setup

Enable real-time subtitle display:

1. Enable live subtitles in the AI Interaction widget
2. Ensure signaling (RTM) is enabled on your Agora AppID
3. Configure subtitle overlay and chat history display
4. Test subtitle functionality with demo and test buttons

## Next Steps

- Review [FEATURES.md](./FEATURES.md) for a complete list of features
- Check [VENDORS.md](./VENDORS.md) for vendor-specific configuration details
- See [API.md](./API.md) for API integration information
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical architecture details
