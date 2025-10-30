# Building Real-Time Voice AI Agents with Agora and Claude

When you want to build a voice AI agent that can actually have natural conversations—not just respond to isolated commands—you need three things working in perfect harmony: real-time audio streaming, speech processing, and a capable LLM. This guide shows you how to wire them together using Agora's Conversational AI platform with Claude as your reasoning engine.

## Why This Architecture?

Traditional voice AI setups suffer from a critical flaw: they treat audio as an afterthought. You record audio, send it somewhere for transcription, pass text to an LLM, convert the response back to speech, and stream it back. Each step adds latency. By the time your agent responds, the conversation feels robotic.

Agora's Conversational AI platform solves this by managing the entire conversation pipeline as a real-time stream. The agent lives in Agora's infrastructure, handling audio input/output, speech recognition, and text-to-speech automatically. You simply plug in your LLM endpoint (Claude, in this case) and configure how the conversation should flow.

This playground application demonstrates that architecture in action. Instead of building everything from scratch, you can experiment with different configurations, test various Claude prompts, and tune the conversation behavior—all from a browser interface.

## Architecture Overview

The application follows a client-server-agent pattern:

**Client (Your Browser)**
- Joins an Agora RTC channel
- Publishes audio from your microphone
- Receives audio from the agent
- Optionally displays real-time transcriptions via RTM

**Agent (Agora Infrastructure)**
- Listens to audio in the same RTC channel
- Transcribes speech using ASR (Agora, Microsoft, or Deepgram)
- Sends transcribed text to your LLM endpoint (Claude)
- Converts Claude's text response to speech via TTS
- Publishes audio back to the channel

**Claude (Your LLM Endpoint)**
- Receives conversation context from the agent
- Generates intelligent responses
- Returns text to be spoken by the agent

### Key Components

Let's examine the modular architecture:

```
convo_ai/
├── src/js/
│   ├── api.js                    # Agora REST API client
│   ├── utils.js                  # Configuration builders
│   ├── conversational-ai-api.js  # RTM transcription handler
│   ├── audio.js                  # Audio visualization
│   ├── subtitles.js              # Live captions
│   └── ui.js                     # UI orchestration
└── index.html                    # Main interface
```

**`api.js`** - The REST API Layer

This module wraps all Agora Conversational AI endpoints:

```javascript
// Core agent lifecycle
await api.createAgent(customerId, customerSecret, agentConfig);
await api.updateAgent(customerId, customerSecret, agentId, updatePayload);
await api.stopAgent(customerId, customerSecret, agentId);

// Monitoring and control
await api.queryAgent(customerId, customerSecret, agentId);
await api.listAgents(customerId, customerSecret);
await api.broadcastMessage(customerId, customerSecret, agentId, text, priority, interruptable);
await api.interruptAgent(customerId, customerSecret, agentId);
```

Why separate these into a dedicated module? Two reasons. First, authentication happens at the API boundary—every request needs proper credentials and encoding. Second, error handling for network operations differs from UI logic. Keeping them separate makes both testable.

**`utils.js`** - Configuration Management

The agent configuration is complex—it includes ASR settings, TTS parameters, LLM endpoints, and advanced features. `Utils` handles this:

```javascript
// Extract form data
const formData = Utils.getFormData();

// Validate required fields
Utils.validateFormData(formData);

// Build ASR configuration
const asrConfig = Utils.buildAsrConfig(formData);

// Build complete agent configuration
const customParams = Utils.getCustomParams();
const agentConfig = Utils.buildAgentConfig(formData, customParams);
```

The builder pattern here prevents configuration errors. Instead of manually constructing the JSON object each time, the utility validates inputs and assembles the structure correctly.

**`conversational-ai-api.js`** - Real-Time Transcription

This is where RTM (Real-Time Messaging) gets interesting. When you enable transcription, the agent publishes transcription messages to an RTM channel:

```javascript
// Initialize the API with RTM and RTC engines
ConversationalAIAPI.init({
    rtcEngine: agoraRTCClient,
    rtmEngine: agoraRTMClient,
    renderMode: 'text',
    enableLog: true,
    expectedAgentId: 'my-agent'
});

// Subscribe to transcription updates
const api = ConversationalAIAPI.getInstance();
api.on(EConversationalAIAPIEvents.TRANSCRIPTION_UPDATED, (chatHistory) => {
    // Handle transcription updates
    chatHistory.forEach(message => {
        console.log(`${message.data.speaker}: ${message.data.text}`);
    });
});

// Subscribe to channel messages
await api.subscribeMessage(channelName);
```

This gives you live captions for both user and agent speech. The `CovSubRenderController` handles deduplication and manages temporary vs. final transcriptions.

**`audio.js`** - Audio Visualization

The `MediaProcessor` class manages the RTC connection and provides real-time audio visualization:

```javascript
const processor = new MediaProcessor();

// Join channel with audio
await processor.joinChannel(appId, channelName, token, uid, subtitleManager, agentId);

// Audio visualization runs automatically using Web Audio API
// Creates frequency analysis and waveform display
```

Why visualize audio? It provides immediate feedback that the agent is speaking, helping users understand when to listen vs. when to talk. The visualization uses Web Audio API's frequency analysis to create a responsive waveform.

**`subtitles.js`** - Live Caption System

The `SubtitleManager` supports two modes:

1. **RTM Mode**: Requires RTM signaling enabled on your Agora AppID. Provides full bidirectional transcription with message receipts and status updates.

2. **Data Stream Mode**: Uses RTC data streams instead of RTM. Simpler setup, but no message receipts or broadcast capabilities.

Both modes handle deduplication, manage temporary vs. final transcriptions, and provide a clean chat history UI.

## Setting Up Claude as Your LLM

Claude (via Anthropic's API) serves as the conversational intelligence. Here's how to configure it:

### Step 1: Get Your Anthropic API Key

1. Create an account at [Anthropic Console](https://console.anthropic.com/)
2. Navigate to API Keys section
3. Generate a new API key
4. Keep it secure—you'll need it for the LLM configuration

### Step 2: Configure the LLM Endpoint

In the application's LLM Settings section:

**LLM URL**: `https://api.anthropic.com/v1/messages`

**API Key**: Your Anthropic API key

**Model**: Choose your Claude model:
- `claude-3-5-sonnet-20241022` (Recommended - Best balance of intelligence and speed)
- `claude-3-5-haiku-20241022` (Fastest - Great for simple conversations)
- `claude-3-opus-20240229` (Highest intelligence - Best for complex tasks)

Why choose Sonnet? For voice conversations, you need fast responses without sacrificing quality. Sonnet delivers responses in ~2-3 seconds while maintaining strong reasoning capabilities. Opus is too slow for natural conversation flow, while Haiku sometimes lacks nuance in complex scenarios.

### Step 3: Configure System Messages

The system message defines your agent's personality and capabilities:

```
You are a helpful AI voice assistant. Keep responses concise since they will be spoken aloud. 
Avoid lengthy explanations unless specifically asked. Use natural conversational language.
```

This matters because Claude's default behavior optimizes for text chat. Without guidance, it might produce overly verbose responses that feel unnatural when spoken. The system message recalibrates it for voice.

**Greeting Message**: What the agent says when the first user joins
```
Hello! I'm your AI assistant. How can I help you today?
```

**Failure Message**: What the agent says when encountering errors
```
I'm sorry, I'm having trouble processing that right now. Could you try again?
```

### Step 4: Configure Custom Parameters

Claude's API requires specific parameters that Agora's standard LLM configuration doesn't include. Use the Custom Parameters section:

**Parameter 1:**
- Type: `number`
- Key: `max_tokens`
- Value: `1024`

Why? Claude's API requires `max_tokens` to limit response length. For voice conversations, 1024 tokens (~800 words) provides enough space for detailed responses without endless rambling.

**Parameter 2 (Optional but Recommended):**
- Type: `number`
- Key: `temperature`
- Value: `1.0`

Temperature controls randomness. `1.0` (default) provides natural variety in responses. Lower values (0.7) make responses more focused but potentially repetitive. Higher values (1.2) increase creativity but may reduce coherence.

**Parameter 3 (For Advanced Use):**
- Type: `array`
- Key: `stop_sequences`
- Value: `[Human:, Assistant:]`

Stop sequences tell Claude when to stop generating. Useful if you're implementing multi-turn conversation patterns in your system messages.

### Understanding Claude's Request Format

Agora sends requests to your LLM endpoint in this format:

```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "temperature": 1.0,
  "system": "You are a helpful AI voice assistant...",
  "messages": [
    {"role": "user", "content": "What's the weather like today?"}
  ]
}
```

The agent automatically maintains conversation context by including previous messages in the `messages` array. You can control how much history to include via the `max_history` setting (default: 32 messages).

Why 32 messages? Each message consumes tokens from your context window. 32 messages typically covers 5-10 conversation turns while leaving room for your system message and response generation. Adjust this based on your conversation depth needs.

## Complete Configuration Example

Here's a working configuration for a Claude-powered agent:

**Agent Settings:**
- Unique Name: `claude-assistant-001`
- Channel Name: `my-voice-channel`
- Agent RTC UID: `8888` (arbitrary but should be consistent)
- Remote RTC UIDs: `*` (allows any user to talk to the agent)
- Idle Timeout: `300` (agent stops after 5 minutes of inactivity)

**LLM Configuration:**
- Provider: Anthropic (via API)
- URL: `https://api.anthropic.com/v1/messages`
- API Key: `sk-ant-api03-...` (your actual key)
- Model: `claude-3-5-sonnet-20241022`
- System Message: 
  ```
  You are Emma, a friendly AI assistant who helps users with their questions. 
  Speak naturally and conversationally. Keep responses under 50 words unless 
  the user asks for detailed explanations.
  ```
- Greeting: `Hi, I'm Emma! What can I help you with?`
- Max History: `32`

**Custom Parameters:**
```json
{
  "max_tokens": 1024,
  "temperature": 1.0
}
```

**TTS Configuration (Microsoft Azure):**
- Vendor: `microsoft`
- Region: `eastus`
- Voice: `en-US-AriaNeural`
- Rate: `1.0` (normal speed)
- Volume: `80`

Why Microsoft TTS? Azure Neural Voices offer high-quality, natural-sounding speech with low latency. The `en-US-AriaNeural` voice provides warm, conversational tone suitable for assistant interactions.

**ASR Configuration:**
- Vendor: `ares` (Agora's built-in ASR)
- Language: `en-US`

For production, consider Microsoft ASR or Deepgram for higher accuracy, especially in noisy environments. Agora ASR works well for testing but has limitations with accents and background noise.

## Advanced Configuration

### Voice Activity Detection (VAD)

VAD determines when a user has stopped speaking. This is critical for conversation flow:

**Agora VAD (Default):**
```javascript
{
  type: "agora_vad",
  interrupt_mode: "interrupt",
  interrupt_duration_ms: 160,
  silence_duration_ms: 640,
  threshold: 0.5
}
```

- `interrupt_duration_ms`: How long before user speech interrupts the agent (160ms feels immediate)
- `silence_duration_ms`: How long of silence before considering speech finished (640ms prevents cutting off mid-sentence)
- `threshold`: Audio level sensitivity (0.5 works for most environments)

**Why these defaults?** 160ms interruption delay feels natural—like a real person pausing when you start talking. 640ms silence detection prevents the agent from jumping in too quickly during natural pauses.

**Server VAD (MLLM + OpenAI only):**
```javascript
{
  type: "server_vad",
  interrupt_mode: "interrupt",
  create_response: true,
  interrupt_response: true
}
```

Server VAD uses the LLM to understand semantic turn-taking. It knows the difference between "umm..." (still thinking) and actual speech completion. Only available when using OpenAI's Realtime API.

### Interruption Behavior

Control how the agent handles interruptions:

**Interrupt Mode Options:**
- `interrupt`: Stop immediately when user speaks (natural for Q&A)
- `append`: Finish current response, then process new input (better for storytelling)
- `ignore`: Don't accept interruptions until response completes (useful for critical information)

Choose `interrupt` for most voice assistants—users expect to be able to cut in naturally.

### Silence Management

Prevent awkward silence when users don't respond:

```javascript
{
  silence_config: {
    timeout_ms: 10000,
    action: "speak",
    content: "Are you still there? Let me know if you need anything."
  }
}
```

After 10 seconds of silence, the agent prompts the user. Set this based on your use case:
- Q&A bot: 5-8 seconds
- Meditation guide: 30+ seconds  
- Customer service: 10-15 seconds

### Input/Output Modalities

Standard configuration uses text and audio:

```javascript
input_modalities: ["text", "audio"],
output_modalities: ["text", "audio"]
```

For multimodal conversations (MLLM mode), add image input:

```javascript
input_modalities: ["text", "audio", "image"]
```

This enables camera integration where the agent can see what you see. Useful for:
- Technical support ("show me the error message")
- Accessibility assistance ("what's in this image?")
- Educational apps ("help me solve this math problem")

## Real-Time Transcription Setup

Transcription provides visibility into what's being said—essential for debugging and user experience.

### RTM Mode (Full Featured)

**Requirements:**
1. RTM signaling enabled on your Agora AppID
2. RTM token (combined RTC+RTM token)
3. Client UID configured

**Enable in UI:**
1. Toggle "Enable Live Subtitles" 
2. Select "RTM Mode" radio button
3. Application auto-configures required settings:
   - Enables RTM in Advanced Features
   - Sets data channel to "rtm"
   - Enables transcript parameters
   - Enables metrics and error messages

**What you get:**
- Bidirectional transcription (both user and agent)
- Message receipts and status updates
- Broadcast message capabilities
- Agent state monitoring (listening, thinking, speaking)

### Data Stream Mode (Simplified)

**Requirements:**
1. Only RTC (no RTM needed)
2. Transcript enabled in parameters

**Enable in UI:**
1. Toggle "Enable Live Subtitles"
2. Select "Data Stream Mode" radio button  
3. Application auto-enables transcript

**What you get:**
- Agent transcription only
- Simpler setup (no RTM configuration)
- Slightly higher latency than RTM

Choose RTM mode for production applications where you need full conversation monitoring. Use Data Stream mode for quick testing or when RTM isn't available.

## Building Agent Configurations Programmatically

While the UI works great for testing, production deployments need programmatic configuration. Here's how to construct the agent config:

```javascript
// Build ASR configuration
const asrConfig = {
  vendor: 'ares',
  language: 'en-US'
};

// Build TTS configuration  
const ttsConfig = {
  vendor: 'microsoft',
  params: {
    key: process.env.AZURE_SPEECH_KEY,
    region: 'eastus',
    voice_name: 'en-US-AriaNeural',
    rate: 1.0,
    volume: 80
  }
};

// Build LLM configuration
const llmConfig = {
  url: 'https://api.anthropic.com/v1/messages',
  api_key: process.env.ANTHROPIC_API_KEY,
  system_messages: [
    { 
      role: "system", 
      content: "You are a helpful AI assistant. Keep responses concise."
    }
  ],
  greeting_message: "Hi! How can I help you?",
  failure_message: "Sorry, I encountered an error. Please try again.",
  max_history: 32,
  input_modalities: ["text", "audio"],
  output_modalities: ["text", "audio"],
  params: {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    temperature: 1.0
  }
};

// Build turn detection
const turnDetection = {
  type: "agora_vad",
  interrupt_mode: "interrupt",
  interrupt_duration_ms: 160,
  silence_duration_ms: 640,
  threshold: 0.5
};

// Build complete agent configuration
const agentConfig = {
  name: "claude-assistant-001",
  properties: {
    channel: "my-voice-channel",
    token: process.env.AGORA_RTC_TOKEN,
    agent_rtc_uid: "8888",
    remote_rtc_uids: ["*"],
    enable_string_uid: false,
    idle_timeout: 300,
    asr: asrConfig,
    tts: ttsConfig,
    llm: llmConfig,
    turn_detection: turnDetection,
    advanced_features: {
      enable_rtm: true
    },
    parameters: {
      data_channel: "rtm",
      transcript: {
        enable: true,
        protocol_version: "v2"
      }
    }
  }
};

// Create the agent via API
const response = await fetch(
  `https://api.agora.io/api/conversational-ai-agent/v2/projects/${APP_ID}/join`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${CUSTOMER_ID}:${CUSTOMER_SECRET}`)}`
    },
    body: JSON.stringify(agentConfig)
  }
);

const result = await response.json();
console.log('Agent created:', result.agent_id);
```

## Testing Your Configuration

### Quick Test Flow

1. **Set Credentials**: Click "Set API Credentials" and enter your Agora Customer ID, Secret, and App ID

2. **Configure Agent**: Fill in agent settings (channel, UID, etc.)

3. **Configure Claude**: Set up LLM section with Anthropic API details

4. **Configure Voice**: Choose TTS vendor and voice

5. **Create Agent**: Click "Create Agent" button

6. **Join Channel**: Click "Join Channel" button to start voice chat

7. **Test Conversation**: Speak naturally and verify the agent responds appropriately

### Debugging Common Issues

**Agent Not Responding:**
- Check Claude API key is valid
- Verify `max_tokens` parameter is set
- Check browser console for errors
- Ensure you're speaking clearly (check microphone levels)

**Slow Response Time:**
- Switch from Opus to Sonnet or Haiku
- Reduce `max_history` to minimize context size
- Check your network latency to Anthropic's API

**Agent Cuts Off Mid-Sentence:**
- Increase `interrupt_duration_ms` (try 300-500ms)
- Check microphone sensitivity (might be picking up background noise)

**Transcription Not Showing:**
- Verify RTM is enabled on your AppID
- Check that transcript is enabled in parameters
- Ensure data_channel is set to "rtm"
- Check browser console for RTM connection errors

**Poor Speech Recognition:**
- Consider upgrading from Agora ASR to Microsoft or Deepgram
- Adjust VAD threshold (lower for quiet environments)
- Check microphone quality and positioning

## Production Considerations

### API Key Management

Never hardcode API keys in client-side code. The playground stores credentials in localStorage for convenience, but production apps should:

1. Store credentials server-side
2. Create agents via backend API
3. Pass only the agent ID to frontend
4. Use token authentication for RTC/RTM connections

### Token Generation

Generate RTC tokens with appropriate privileges:

```javascript
// Server-side token generation
const token = RtcTokenBuilder.buildTokenWithUid(
  appId,
  appCertificate,
  channelName,
  uid,
  role, // PUBLISHER for client, SUBSCRIBER for agent monitoring
  privilegeExpireTime // Unix timestamp
);
```

For RTM transcription, generate combined tokens that work for both RTC and RTM.

### Scaling Considerations

Each agent consumes resources. Plan capacity:
- 1 agent = ~1 LLM request every 3-5 seconds during active conversation
- TTS/ASR usage scales with speech duration
- RTM messages: ~10-20 messages per minute per agent

Monitor your usage:
```javascript
// Enable metrics collection
parameters: {
  enable_metrics: true,
  enable_error_message: true
}
```

### Error Handling

Implement comprehensive error handling:

```javascript
try {
  const result = await api.createAgent(customerId, customerSecret, agentConfig);
  if (result.error) {
    // Handle API error
    console.error('Agent creation failed:', result.error);
  }
} catch (error) {
  // Handle network error
  console.error('Network error:', error);
}
```

Common errors:
- `401 Unauthorized`: Check Customer ID/Secret
- `400 Bad Request`: Verify agent configuration structure
- `429 Too Many Requests`: Implement rate limiting
- `503 Service Unavailable`: Retry with exponential backoff

## Use Cases and Examples

### Customer Support Bot

**Configuration:**
```javascript
system_messages: [{
  role: "system",
  content: `You are a customer support agent for TechCo. 
  You help users troubleshoot technical issues.
  Always be empathetic and patient.
  If you can't solve an issue, offer to escalate to a human agent.`
}],
interrupt_mode: "interrupt", // Let users interrupt to clarify
silence_timeout: 8000 // Give users time to explain issues
```

**Why:** Customer support requires quick back-and-forth. Enable interruptions so users can correct misunderstandings immediately. Longer silence timeout accommodates users thinking through their problem.

### Educational Tutor

**Configuration:**
```javascript
system_messages: [{
  role: "system",
  content: `You are a patient tutor helping students learn mathematics.
  Use the Socratic method - ask guiding questions rather than giving answers directly.
  Encourage critical thinking.`
}],
interrupt_mode: "append", // Let explanations complete
input_modalities: ["text", "audio", "image"] // Enable showing work
```

**Why:** Educational content needs to complete. Use append mode so explanations don't get cut off. Enable image input so students can show their work for visual feedback.

### Meditation Guide

**Configuration:**
```javascript
system_messages: [{
  role: "system", 
  content: `You guide users through meditation sessions.
  Speak slowly and calmly with long pauses between instructions.
  Keep language simple and soothing.`
}],
interrupt_mode: "ignore", // Don't break meditation flow
silence_timeout: 30000, // Long pauses are normal
tts: {
  params: {
    rate: 0.8, // Slower speech
    volume: 60 // Softer volume
  }
}
```

**Why:** Meditation requires uninterrupted flow. Ignore interruptions and extend silence timeout significantly. Slower speech rate creates calming effect.

## What's Next?

You now understand how to build voice AI agents with Agora and Claude. Here are logical next steps:

**Experiment with Prompts:** The system message dramatically affects conversation quality. Test different personalities and instruction styles.

**Try MLLM Mode:** Enable multimodal input to let Claude see what you see. Requires OpenAI Realtime API but unlocks visual understanding.

**Implement Custom Logic:** Use the broadcast API to send dynamic context to your agent based on application state.

**Build Production Integration:** Move from playground to production by implementing server-side agent management and proper credential handling.

**Monitor Performance:** Enable metrics collection and track conversation quality, latency, and error rates.

The power of this architecture is its modularity. Swap Claude for GPT-4, change TTS providers, adjust VAD behavior—all without rewriting core logic. Start with the configuration that makes sense for your use case, then iterate based on real conversation data.

Voice AI isn't magic. It's audio streams, text processing, and thoughtful configuration working together. You now have all the pieces to build natural voice conversations.

