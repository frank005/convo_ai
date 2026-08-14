# Setup Guide

This guide will walk you through setting up and configuring the Conversational AI Agent Playground.

## Prerequisites

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AgoraIO-Community/ConvoAI-Playground.git
   cd ConvoAI-Playground
   ```

## Initial Configuration

### 1. Set up API Credentials

- Click the "Set API Credentials" button
- Enter your Agora Customer ID, Customer Secret, and App ID
- Optionally enter your App Certificate (required for local token generation)
- Credentials are stored in localStorage for convenience during testing

### 2. Choose Your AI Mode

The application supports two AI modes:

- **LLM Mode**: Traditional text-based conversations (LLM + TTS + ASR)
- **MLLM Mode**: Multimodal realtime conversations (OpenAI Realtime, Azure OpenAI Realtime, xAI Grok, Gemini Live, Vertex AI, or custom WebSocket)

### 3. Configure Your Agent

Basic agent configuration:

- Enter a unique name for your agent
- Set the Agora channel name and RTC UID
- Configure remote RTC UIDs (comma-separated or `*` for all; avatar mode requires specific UIDs, not `*`)
- Set idle timeout for automatic agent cleanup
- Choose input/output modalities
- Optionally set a **Backend Pipeline ID** (and override LLM / TTS / ASR checkboxes if you still want UI values)
- Optionally use **managed presets** (v2.9) for ASR / LLM / TTS (`credential_mode: managed`)

### 4. Set up AI Model Configuration

**For LLM Mode:**

- Configure LLM settings (URL, API key, model params, MCP servers)
- Configure TTS settings (vendor + voice)
- Configure ASR settings (vendor + language)
- Add custom parameters for advanced model control

**For MLLM Mode:**

- Select MLLM vendor (OpenAI, Azure OpenAI Realtime, xAI, Gemini Live, Vertex AI, or Custom)
- Configure WebSocket URL / API key (or Vertex ADC credentials)
- Configure turn detection under the MLLM / Turn Detection controls (required for Azure OpenAI Realtime)

### 5. Advanced Configuration (Optional)

- **Turn Detection (v2.4)**: Configure Start of Speech / End of Speech modes (`vad`, `semantic`, `keywords`, `manual`, `disabled`)
- **Interruption (v2.6)**: Pipeline interruption object (when not using deprecated pre-v2.4 controls)
- **Manual Turn Control (v2.9)**: Set SoS and/or EoS to Manual, enable RTM (`data_channel: rtm`), then use Start (SoS) / End (EoS) buttons
- Enable RTM for signaling, metrics, and error messages
- Configure silence management and farewell graceful timeout
- Add custom LLM / TTS / Avatar parameters
- Configure geofence or RTC encryption if needed

For more details, see [FEATURES.md](./FEATURES.md).

## Optional Features Setup

### AI Avatar Setup

Enable visual AI avatar representation:

1. Enable AI Avatar checkbox in AI Avatar Settings
2. Select avatar vendor:
   - **Akool**
   - **LiveAvatar by HeyGen** (current HeyGen path; playground forces 24 kHz TTS when selected)
   - **Generic** (custom avatar providers)
   - **LemonSlice** (UI option; REST still sends `vendor: generic` with LemonSlice defaults)
   - **Anam**
   - **HeyGen (Deprecated)** (legacy Interactive Avatar)
3. Configure API key and avatar ID (LemonSlice hardcodes `avatar_id: lemonslice` and asks for an image source instead)
4. Set Avatar RTC UID and optional token
5. Configure vendor-specific settings (LiveAvatar quality/timeouts, Anam sample rate/quality/encoding, LemonSlice identity + encoding/model/timeouts/prompts + TTS sample rate default 24000)
6. Visual placeholder appears until the avatar video stream is active

For detailed vendor configuration, see [VENDORS.md](./VENDORS.md).

### Manual Turn Control (SoS / EoS)

1. Enable **Turn Detection** and set Start of Speech and/or End of Speech mode to **Manual**
2. Enable **RTM** and set data channel to **rtm**
3. Create/join the agent
4. Use **Start (SoS)** / **End (EoS)** in the Manual Turn Control panel

Requires Agora Signaling (RTM) enabled on your App ID.

### Device Selection Setup

Configure your microphone and camera devices:

1. Click "Device Settings" in the top bar
2. Select preferred microphone from available devices
3. Pre-configure camera device (works even when image input is disabled)
4. Grant microphone and camera permissions when prompted
5. Use retry if devices don't load initially
6. Selections persist and apply when joining channels

### Camera Setup

Enable camera integration for image analysis:

1. Enable image input modality
2. Select camera device from available options
3. Acknowledge privacy terms for camera access
4. Configure periodic screenshot capture for image analysis

### Live Subtitles Setup

Enable real-time subtitle display:

1. Enable live subtitles in the AI Interaction widget
2. Ensure Signaling (RTM) is enabled on your Agora App ID (for RTM subtitle mode)
3. Configure subtitle overlay and chat history display
4. Test subtitle functionality with demo and test buttons

### SIP / Phone Management

1. Expand **SIP Calling and Phone Number Management**
2. Import or update phone numbers
3. Start outbound calls (optionally with pipeline ID)
4. Query call history / hang up as needed

## Next Steps

- Review [FEATURES.md](./FEATURES.md) for a complete list of features
- Check [VENDORS.md](./VENDORS.md) for vendor-specific configuration details
- See [API.md](./API.md) for API integration information
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical architecture details
- See platform [release notes](https://docs.agora.io/en/ai/release-notes) for ConvoAI v2.11 / v2.10 / v2.9 changes
