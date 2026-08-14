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

### Gradium TTS (v2.10)

Enterprise Gradium voice generation over WebSocket.

**Required Fields:**

- API Key
- URL (default `wss://api.gradium.ai/api/speech/tts`)
- Voice ID

**Optional Parameters:**

- `model_name`: TTS model (default `default`)
- `sample_rate`: Output sample rate in Hz (default `16000`)

### Mistral TTS (v2.10)

Mistral text-to-speech models.

**Required Fields:**

- API Key
- Model (default `voxtral-mini-tts-2603`)
- Voice

### Typecast TTS (v2.11)

Expressive Typecast voices. Additional vendor params can be passed through TTS custom parameters.

**Required Fields:**

- API Key (`params.api_key`)
- Voice ID (`params.voice_id`, e.g. `tc_60e5426de8b95f1d3000d7b5`)
- Model (`params.model`, e.g. `ssfm-v30`)

**Docs:** [Typecast TTS](https://docs.agora.io/en/ai/models/tts/typecast)

### Generic HTTP TTS (v2.10)

Connect a custom or third-party TTS service that implements the OpenAI TTS protocol (`vendor: generic_http`).

**Required:**

- `tts.url`: OpenAI-compatible speech endpoint
- Authentication via `tts.headers.Authorization` and/or `tts.params.api_key` (headers win if both are set)
- `tts.params` object (required by the API)

**Common params:**

- `model`, `voice`, `speed`, `sample_rate`, `response_format` (`pcm`), `instruction`

**Docs:** [Generic TTS](https://docs.agora.io/en/ai/models/tts/generic-http)

### MiniMax TTS

WebSocket streaming TTS with voice and audio settings.

**Required Fields:**

- API Key
- Group ID
- Model
- Voice ID
- URL (default `wss://api.minimax.io/ws/v1/t2a_v2`)

**Optional:**

- Sample rate (default 24000; LiveAvatar forces 24000)

Supports language-grouped voice picker and v2.9 managed presets (`minimax_speech_2_6_turbo`, `minimax_speech_2_8_turbo`).

### Deepgram TTS

**Required:** API Key, Model  
**Optional:** `base_url`, `sample_rate`

### Murf TTS

**Required:** API Key  
**Optional / defaults:** WebSocket `base_url`, `voiceId`, `locale`, `model`, `rate`, `pitch`, `sample_rate`

### Rime TTS

**Required:** API Key  
**Also used:** `speaker`, `modelId`, `samplingRate` (4000–44100)

### Fish Audio TTS

**Required:** API Key, `reference_id`, `backend`

### Google TTS

**Required:** Service account credentials JSON, voice name  
**Optional:** `AudioConfig.speaking_rate`, `AudioConfig.sample_rate_hertz`

### Amazon Polly TTS

**Required:** AWS access key, secret key, region, voice, engine (`neural`, `standard`, `long-form`, `generative`)

### Sarvam TTS

**Required:** API subscription key, speaker (or custom speaker ID), `target_language_code`  
**Optional:** pitch, pace, loudness, sample rate

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

## MLLM Vendor Support

Playground MLLM vendors: `openai`, `azure`, `xai`, `gemini`, `vertexai`, `custom`.

### OpenAI Realtime

**Vendor name:** `openai`  
WebSocket realtime multimodal conversations. Supports richer turn-detection modes including `semantic_vad`.

### Azure OpenAI Realtime (v2.11)

Azure-hosted OpenAI Realtime API. Enabling MLLM still disables ASR, LLM, and TTS.

**Vendor name:** `azure`

**Required fields:**

- API Key
- WebSocket URL (e.g. `wss://your-resource-name.openai.azure.com/openai/v1/realtime?model=gpt-realtime-2`)
- `mllm.turn_detection` (`agora_vad`, `server_vad`, or `semantic_vad`). The playground defaults to `server_vad` if the Turn Detection toggle is off.

**Optional params:**

- `model` (e.g. `gpt-realtime-2`)
- `voice` (e.g. `alloy`)
- `instructions`
- `input_audio_transcription` (`language`, `model`, `prompt`)

**Docs:** [Azure OpenAI Realtime API](https://docs.agora.io/en/ai/models/mllm/azure)

### xAI Grok

Real-time multimodal via xAI Realtime WebSocket.

**Vendor name:** `xai`

**Required fields:**

- API Key
- WebSocket URL (default: `wss://api.x.ai/v1/realtime`)

**Optional parameters:**

- `voice` (default: `eve`)

**Notes:** Turn detection supports `agora_vad` and `server_vad` only (no `semantic_vad`).

### Gemini Live

**Vendor name:** `gemini`  
Realtime Gemini Live WebSocket configuration from the MLLM drawer.

### Vertex AI

**Vendor name:** `vertexai`  
ADC credentials, project ID, location, voice, and instructions for native-audio MLLM.

### Custom MLLM

**Vendor name:** `custom`  
Bring your own realtime WebSocket endpoint and API key compatible with the playground's MLLM path.

## AI Avatar Vendor Support

### Generic Avatar

Provider-agnostic avatar integration.

**Vendor name:** `generic`

**Required in playground:**

- API Key
- API Base URL
- Avatar ID
- Avatar RTC UID (same as other avatar vendors)
- App credentials and channel name (filled automatically from the main form)

**Optional:**

- Avatar RTC Token (generate like other vendors)

**Docs:** [Generic avatar](https://docs.agora.io/en/ai/models/avatar/generic)

### LemonSlice Avatar (v2.10)

First-class playground option for LemonSlice. The REST payload still uses `vendor: "generic"` with LemonSlice defaults.

**UI vendor:** `lemonslice` → **API vendor:** `generic`

**Prefills / fixed params:**

- `api_base_url`: `https://lemonslice.com/api/liveai/agora`
- `avatar_id`: `lemonslice`

**Required:**

- API Key
- Avatar RTC UID
- Exactly one of `agent_image_url`, `agent_id`, or `agent_image_base64`

**Optional (LemonSlice Agora docs):**

- Avatar RTC Token
- `aspect_ratio`: `2x3` (default), `9x16`, or `1x1`
- `video_encoding`: `H264`, `VP8`, or `AV1`
- `model`: `lite`, `flash`, or `pro` (omit for flagship)
- `activity_idle_timeout`: seconds (LemonSlice default 120; `0` disables)
- `response_done_timeout`: seconds without new audio before marking response complete
- `agent_prompt` / `agent_idle_prompt`: speaking / idle demeanor prompts

**TTS sample rate:** When LemonSlice is selected, the playground forces TTS sample rate to the LemonSlice Sample Rate control (**default 24000**, options 16000 / 24000 / 48000). MiniMax and several other vendors need 24000 for reliable lip-sync.

**Docs:** [LemonSlice Agora](https://lemonslice.com/docs/agora) · [Agora LemonSlice page](https://docs.agora.io/en/ai/models/avatar/lemonslice)

### Akool Avatar

High-quality AI avatar generation with real-time video streaming.

**Required Fields:**

- API Key
- Avatar ID
- Avatar RTC UID

**Optional Fields:**

- Avatar RTC Token

### LiveAvatar by HeyGen

Current HeyGen LiveAvatar integration (`vendor: liveavatar`).

**Required:** API Key, Avatar ID, Avatar RTC UID  
**Optional:** Avatar RTC Token, quality, disable idle timeout, activity idle timeout (UI default **120** seconds)

**Note:** This playground forces **24 kHz** TTS sample rate for supported TTS vendors when LiveAvatar is selected.

### HeyGen Avatar (Deprecated)

Legacy Interactive Avatar path (`vendor: heygen`). Prefer **LiveAvatar** for new integrations.

**Required Fields:**

- API Key
- Avatar ID
- Avatar RTC UID

**Optional Fields:**

- Avatar RTC Token
- Quality, disable idle timeout, activity idle timeout (UI default **120** seconds)

### Anam Avatar

**Vendor name:** `anam`

**Required:** API Key, Avatar ID (Agora `avatar_id`), Avatar RTC UID  
**Also sent:** `sample_rate`, `quality`, `video_encoding`, `agora_token`, `agora_uid`

## ASR Vendor Support

Playground ASR vendors: `ares`, `microsoft`, `deepgram`, `openai`, `speechmatics`, `assemblyai`, `amazon`, `google`, `sarvam`, `custom`.

### Agora ASR (ARES)

Built-in speech recognition.

**Vendor name:** `ares`

Supports dozens of locales (ar-*, zh-*, en-US/en-IN, es-ES, fr-FR, de-DE, hi-IN, ja-JP, ko-KR, and more — see the ASR language dropdown). No third-party ASR key required.

**Keywords (v2.11):** Optional `asr.keywords` array (max 128) to improve recognition of brand names, product names, personal names, and jargon. Only valid when `asr.vendor` is `ares` or unset. This is separate from keyword interruption.

**Docs:** [Improve ASR accuracy with keywords](https://docs.agora.io/en/ai/build/shape-the-conversation/asr-keywords)

### Microsoft ASR

High-accuracy speech recognition with region and language configuration; phrase list support for selected locales in the UI.

### Deepgram ASR

Real-time streaming speech recognition with models such as nova-3 / nova-2 and optional custom URL. Strong multi-language coverage via ISO language codes.

### OpenAI ASR

OpenAI speech-to-text configuration from the ASR drawer.

### Speechmatics / AssemblyAI / Amazon Transcribe / Google / Sarvam / Custom

Additional ASR vendors exposed in the playground dropdown. Configure vendor-specific keys, languages, and endpoints in the ASR settings panel. Custom ASR accepts a provider URL and parameters suitable for your integration.

## Related Documentation

- [FEATURES.md](./FEATURES.md) - Feature list including turn control and SIP
- [SETUP.md](./SETUP.md) - Setup steps
- [API.md](./API.md) - REST and RTM control surfaces
- [Platform release notes](https://docs.agora.io/en/ai/release-notes)
