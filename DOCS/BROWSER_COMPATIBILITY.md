# Browser Compatibility & Requirements

This document outlines browser compatibility requirements and necessary APIs for the Conversational AI Agent Playground.

## Supported Browsers

### Modern Browsers

The application is designed to work with modern browsers that support the latest web standards:

- **Chrome** (latest versions)
- **Firefox** (latest versions)
- **Safari** (latest versions)
- **Edge** (latest versions)

### Recommended Versions

For the best experience, use the latest stable version of your preferred browser. The application requires modern JavaScript features and APIs that may not be available in older browser versions.

## Required APIs

The application relies on several browser APIs for core functionality:

### Web Audio API

**Purpose:** Audio processing and visualization

**Used For:**

- Real-time audio waveform display
- Volume indicator visualization
- Audio context and analyzer setup
- Multi-vendor audio support

**Browser Support:** Widely supported in modern browsers

### WebRTC

**Purpose:** Real-time communication

**Used For:**

- Real-time audio/video streaming
- Agent communication
- Channel joining and leaving
- RTC data channel communication

**Browser Support:** Supported in all modern browsers

### localStorage API

**Purpose:** Persistent storage

**Used For:**

- API credential storage
- Device selection persistence
- Configuration preferences
- Session data

**Browser Support:** Universally supported in modern browsers

### MediaDevices API

**Purpose:** Camera and microphone access

**Used For:**

- Microphone device enumeration
- Camera device enumeration
- Device selection and configuration
- Permission management

**Browser Support:** Supported in all modern browsers with HTTPS (required for camera access)

### WebSocket API

**Purpose:** Real-time bidirectional communication

**Used For:**

- MLLM WebSocket connections
- Real-time data streaming
- OpenAI Realtime API integration

**Browser Support:** Widely supported in modern browsers

## Feature-Specific Requirements

### Camera Support

**Required For:**

- Image input functionality
- Device selection for cameras
- Camera preview overlay
- Periodic screenshot capture

**Requirements:**

- HTTPS connection (required for camera access)
- Camera permission granted by user
- Compatible camera device

### Microphone Support

**Required For:**

- Audio input functionality
- Device selection for microphones
- Real-time audio processing
- Voice activity detection

**Requirements:**

- Microphone permission granted by user
- Compatible microphone device

### WebSocket Support

**Required For:**

- MLLM real-time communication
- Real-time multimodal conversations
- Streaming audio and text processing

**Requirements:**

- WebSocket API support
- Network connectivity
- Secure connection (WSS) for production

### Permission Support

**Required For:**

- Microphone access
- Camera access
- Device enumeration

**Requirements:**

- Browser permission API support
- User consent for device access
- HTTPS connection (for camera/microphone)

## Responsive Design

The application is optimized for various screen sizes and orientations:

- **Desktop:** Full-featured interface with all controls
- **Tablet:** Responsive layout with touch-friendly controls
- **Mobile:** Optimized interface with essential features
- **Orientation:** Supports both portrait and landscape modes

## Security Considerations

### HTTPS Requirement

- **Camera Access:** Requires HTTPS connection
- **Microphone Access:** Requires HTTPS connection (recommended)
- **WebSocket:** WSS (secure WebSocket) recommended for production

### Credential Storage

- Credentials stored in localStorage (browser-specific)
- Not shared across browsers or devices
- Users should manage credentials securely

## Troubleshooting

### Camera Not Working

- Ensure HTTPS connection is active
- Check browser permissions for camera access
- Verify camera device is not in use by another application
- Check browser console for error messages

### Microphone Not Working

- Check browser permissions for microphone access
- Verify microphone device is not muted
- Ensure microphone is not in use by another application
- Check browser console for error messages

### WebSocket Connection Issues

- Verify network connectivity
- Check firewall settings
- Ensure WebSocket endpoint is accessible
- Check browser console for connection errors

### Device Selection Issues

- Grant browser permissions when prompted
- Use retry button if devices don't load initially
- Check browser console for permission errors
- Verify devices are not in use by other applications

## Related Documentation

- [SETUP.md](./SETUP.md) - Setup instructions including device configuration
- [FEATURES.md](./FEATURES.md) - Complete feature list
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture details
