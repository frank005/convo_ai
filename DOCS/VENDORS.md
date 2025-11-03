# Vendor Configuration

This document provides detailed configuration information for all supported vendors including TTS (Text-to-Speech), ASR (Automatic Speech Recognition), and AI Avatar providers.

## TTS Vendor Support

### Skip Patterns (All TTS Vendors)

All TTS vendors support skip patterns to exclude bracketed content from speech synthesis. This prevents the agent from vocalizing structural prompts, tone indicators, action descriptions, and system messages.

**Available Skip Patterns:**

1. Skip content in Chinese parentheses `（）`
2. Skip content in Chinese square brackets `【】`
3. Skip content in parentheses `( )`
4. Skip content in square brackets `[ ]`
5. Skip content in curly braces `{ }`

**Usage:** Configure skip patterns in the TTS settings. Multiple patterns can be selected simultaneously.

**Note:** When skip patterns are enabled:
- The agent's short-term memory contains the complete, unfiltered LLM text
- Real-time subtitles exclude filtered content during TTS playback
- Complete text is restored after each sentence finishes

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

**Vendor Name:** `humeai`

**Required Fields:**

- API Key
- Voice ID

**Optional Parameters:**

- `provider`: Provider name (default: "HUME_AI")
- `speed`: Speaking rate (configurable)
- `trailing_silence`: Trailing silence duration (configurable)

**Features:**

- High-quality voice synthesis
- Customizable speed and silence control
- Emotional tone control

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

**Vendor Name:** `ares`

**Required Fields:**

- None (uses default Agora configuration)

**Language Support:**

Agora ASR (ARES) supports 36 languages including:
- ar-AE (Arabic - UAE), ar-EG (Arabic - Egypt), ar-JO (Arabic - Jordan), ar-SA (Arabic - Saudi Arabia)
- bn-IN (Bengali - India)
- zh-CN (Chinese - Simplified), zh-HK (Chinese - Hong Kong), zh-TW (Chinese - Traditional)
- nl-NL (Dutch - Netherlands)
- en-IN (English - India), en-US (English - US)
- fil-PH (Filipino - Philippines)
- fr-FR (French - France)
- de-DE (German - Germany)
- gu-IN (Gujarati - India)
- he-IL (Hebrew - Israel)
- hi-IN (Hindi - India)
- id-ID (Indonesian - Indonesia)
- it-IT (Italian - Italy)
- ja-JP (Japanese - Japan)
- kn-IN (Kannada - India)
- ko-KR (Korean - Korea)
- ms-MY (Malay - Malaysia)
- fa-IR (Persian - Iran)
- pt-PT (Portuguese - Portugal)
- ru-RU (Russian - Russia)
- es-ES (Spanish - Spain)
- ta-IN (Tamil - India), te-IN (Telugu - India)
- th-TH (Thai - Thailand)
- uk-UA (Ukrainian - Ukraine)
- vi-VN (Vietnamese - Vietnam)

**Features:**

- Built-in speech recognition
- No additional API keys required
- Good for testing and prototyping
- Default language: en-US

### Microsoft ASR

High-accuracy speech recognition with comprehensive language coverage.

**Vendor Name:** `microsoft`

**Required Fields:**

- API Key
- Region
- Language

**Language Support:**

Microsoft ASR supports 100+ languages and variants including:
- Multiple Arabic dialects (AE, BH, DZ, EG, IQ, JO, KW, LY, MA, OM, QA, SA, SY, TN, YE)
- All major European languages (English, Spanish, French, German, Italian, Portuguese, etc.)
- Asian languages (Chinese, Japanese, Korean, Hindi, Bengali, Tamil, Telugu, etc.)
- African languages (Afrikaans, Amharic, Swahili, Yoruba, Zulu, etc.)
- Many regional variants (e.g., en-US, en-GB, en-AU, en-CA, en-IN, etc.)

**Phrase List Support:**

Certain languages support phrase lists to improve recognition accuracy:
- ar-SA, de-CH, de-DE, en-AU, en-CA, en-GB, en-IE, en-IN, en-US, en-ZA

**Features:**

- High-accuracy recognition (90%+ accuracy in optimal conditions)
- Extensive language and regional support
- Custom phrase lists for improved accuracy
- Robust noise handling
- Accent-adaptive recognition
- Region-specific configuration for optimal latency

### Deepgram ASR

Real-time streaming speech recognition with advanced models and lowest latency.

**Vendor Name:** `deepgram`

**Required Fields:**

- API Key
- URL (default: "wss://api.deepgram.com/v1/listen")
- Model
- Language

**Default Values:**

- URL: "wss://api.deepgram.com/v1/listen"
- Model: "nova-2"
- Language: "en"

**Available Models:**

- nova-2 (recommended - most accurate)
- nova (faster, good accuracy)
- enhanced (balanced)
- base (fastest, lower accuracy)

**Language Support:**

Deepgram supports 50+ languages with 2-letter ISO codes:
- af (Afrikaans), am (Amharic), ar (Arabic), az (Azerbaijani)
- bg (Bulgarian), bn (Bengali), ca (Catalan), cs (Czech), cy (Welsh)
- da (Danish), de (German), el (Greek), en (English), es (Spanish), et (Estonian), eu (Basque)
- fa (Persian), fi (Finnish), fil (Filipino), fr (French)
- ga (Irish), gl (Galician), gu (Gujarati)
- he (Hebrew), hi (Hindi), hr (Croatian), hu (Hungarian), hy (Armenian)
- id (Indonesian), is (Icelandic), it (Italian)
- ja (Japanese), jv (Javanese)
- ka (Georgian), kk (Kazakh), km (Khmer), kn (Kannada), ko (Korean)
- lo (Lao), lt (Lithuanian), lv (Latvian)
- mk (Macedonian), ml (Malayalam), mn (Mongolian), mr (Marathi), ms (Malay), my (Burmese)
- ne (Nepali), nl (Dutch), no (Norwegian)
- pa (Punjabi), pl (Polish), ps (Pashto), pt (Portuguese)
- ro (Romanian), ru (Russian)
- si (Sinhala), sk (Slovak), sl (Slovenian), sq (Albanian), sr (Serbian), su (Sundanese), sv (Swedish), sw (Swahili)
- ta (Tamil), te (Telugu), th (Thai), tr (Turkish)
- uk (Ukrainian), ur (Urdu), uz (Uzbek)
- vi (Vietnamese)
- zh (Chinese)

**Features:**

- Lowest latency (50-150ms transcription)
- Real-time streaming with WebSocket
- Advanced models for optimal accuracy
- Extensive multi-language support
- Custom URLs for specialized endpoints
- Excellent accuracy even in noisy environments

## Related Documentation

- [SETUP.md](./SETUP.md) - Configuration setup instructions
- [FEATURES.md](./FEATURES.md) - Complete feature list including vendor capabilities
