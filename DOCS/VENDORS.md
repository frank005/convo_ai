# Vendor Configuration

This document provides detailed configuration information for all supported vendors including TTS (Text-to-Speech), ASR (Automatic Speech Recognition), and AI Avatar providers.

## TTS Vendor Support

### Microsoft TTS

Microsoft Azure Text-to-Speech service with extensive voice library and global region support.

**Required Fields:**

- API Key
- Region
- Language
- Voice

**Optional Parameters:**

- `rate`: Speaking rate (0.5–2.0)
- `speed`: Alternate speaking rate (0.5–2.0)
- `volume`: Audio volume (0–100)
- `sample_rate`: Audio sampling rate in Hz (e.g., 24000)

**Features:**

- 30+ global regions
- Extensive voice library with language-specific options
- Skip pattern support for natural speech

### ElevenLabs TTS

High-quality voice cloning and customization with advanced voice parameters.

**Required Fields:**

- API Key
- Model ID
- Voice ID

**Optional Parameters:**

- `sample_rate`: Audio sampling rate in Hz (e.g., 24000)
- `stability`: Voice stability (0–1)
- `similarity_boost`: Similarity boost (0–1)
- `style`: Voice style (0–1)
- `use_speaker_boost`: Enable speaker boost (boolean)

**Features:**

- High-quality voice cloning
- Custom voice IDs
- Advanced voice parameter control

### Cartesia TTS

Ultra-fast, low-latency text-to-speech with real-time streaming capabilities.

**Required Fields:**

- API Key
- Model ID
- Voice ID

**Default Model:** "sonic-2"

**Features:**

- Ultra-fast, low-latency TTS
- Real-time streaming capabilities
- Custom voice configuration

### OpenAI TTS

High-quality neural voice synthesis with multiple voice options.

**Required Fields:**

- API Key
- Model
- Voice

**Default Values:**

- Model: "gpt-4o-mini-tts"
- Voice: "coral"

**Optional Parameters:**

- `instructions`: Voice control instructions
- `speed`: Speaking rate (0.25–4.0)

**Features:**

- High-quality neural synthesis
- Multiple voice options: coral, alloy, echo, fable, onyx, nova, shimmer
- Speed control and voice instruction support

### Hume AI TTS

High-quality voice synthesis with customizable speed and silence control.

**Required Fields:**

- API Key
- Voice ID

**Default Values:**

- Provider: "HUME_AI"
- Speed: 1.0
- Trailing Silence: 0.35

**Optional Parameters:**

- `provider`: Provider name (default: "HUME_AI")
- `speed`: Speaking rate (0.1–5.0)
- `trailing_silence`: Trailing silence duration in seconds (0–2.0)

**Features:**

- High-quality voice synthesis
- Customizable speed and silence control

## AI Avatar Vendor Support

### Akool Avatar

High-quality AI avatar generation with real-time video streaming.

**Required Fields:**

- API Key
- Avatar ID
- Avatar RTC UID

**Optional Fields:**

- Avatar RTC Token

**Features:**

- High-quality AI avatar generation
- Real-time video streaming
- Professional visual placeholder

### HeyGen Avatar

Advanced avatar generation with quality control and timeout management.

**Required Fields:**

- API Key
- Avatar ID
- Avatar RTC UID

**Optional Fields:**

- Avatar RTC Token

**Optional Parameters:**

- `quality`: Video quality (low: 360p, medium: 480p, high: 720p)
- `disable_idle_timeout`: Whether to disable idle timeout (boolean)
- `activity_idle_timeout`: Activity idle timeout in seconds (default: 60)

**Features:**

- Advanced avatar generation
- Quality control options
- Timeout management
- Professional visual placeholder

## ASR Vendor Support

### Agora ASR

Built-in speech recognition with multiple language support.

**Required Fields:**

- None (uses default Agora configuration)

**Language Support:**

- en-US (English - United States)
- es-ES (Spanish - Spain)
- ja-JP (Japanese - Japan)
- ko-KR (Korean - Korea)
- ar-AE (Arabic - United Arab Emirates)
- hi-IN (Hindi - India)

**Features:**

- Built-in speech recognition
- No additional API keys required

### Microsoft ASR

High-accuracy speech recognition with comprehensive language coverage.

**Required Fields:**

- API Key
- Region
- Language

**Language Support:**

- Comprehensive language coverage
- Region-specific configuration

**Features:**

- High-accuracy recognition
- Custom models support
- Region-specific configuration

### Deepgram ASR

Real-time streaming speech recognition with advanced models.

**Required Fields:**

- API Key
- URL
- Model
- Language

**Default Values:**

- URL: "wss://api.deepgram.com/v1/listen"
- Model: "nova-2"
- Language: "en"

**Available Models:**

- nova-2 (recommended)
- nova
- enhanced
- base

**Features:**

- Real-time streaming
- Advanced models
- Multi-language support with custom URLs

## Related Documentation

- [SETUP.md](./SETUP.md) - Configuration setup instructions
- [FEATURES.md](./FEATURES.md) - Complete feature list including vendor capabilities
