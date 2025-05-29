# Climb, Swing, Build: Exploring Agora’s Convo AI Developer Jungle Gym

![Watch the demo video](./src/media/comvoai_demo.mp4)

Are you ready to dive headfirst into the fascinating world of real-time conversational AI, but find yourself overwhelmed by complex setups and steep learning curves? What if you could easily experiment with powerful speech-to-text, text-to-speech, and even integrate sophisticated large language models (LLMs) to build dynamic, interactive AI conversations right in your browser?

Get ready to revolutionize your approach to conversational AI prototyping with the **Convo AI Developer Jungle Gym**! This isn't just another demo; it's a meticulously crafted web application designed to empower developers like you to effortlessly explore, test, and iterate on cutting-edge AI interactions. Built with a focus on simplicity and powerful integration, Convo AI Developer Jungle Gym provides a robust environment to bridge the gap between raw audio, transcribed text, synthesized speech, and the intelligent responses of an LLM, all in real-time.

---

## Why Agora’s Conversational AI?

Agora’s Conversational AI platform stands out by delivering real-time, natural language interactions that seamlessly fit into a variety of scenarios such as customer support, virtual assistants, interactive entertainment, and more. The Convo AI Playground showcases these capabilities vividly by giving developers an immediate, hands-on experience.

### Benefits of Using Agora’s Conversational AI

- Real-time response and feedback loops  
- Easy integration with leading AI services (LLMs and TTS)  
- Scalable, secure APIs for production-grade implementations  

---

## Introducing Convo AI Playground

At Agora’s recent internal hackathon, we set out with a clear goal: build something that lets developers experience the power of real-time conversational AI firsthand. No downloads. No backends. Just browser, code, and API keys.

The result is **Convo AI Playground** — a lightweight, frontend-only web tool that empowers developers to create and test real-time AI agent interactions using Agora’s Conversational AI platform.

### What Is It?

![Main Interface](./src/media/1.png)

Convo AI Playground is a browser-based control center for spinning up, managing, and testing real-time Conversational AI agents using Agora’s RESTful API.

This layout allows developers to:

- Set up and manage conversational agents  
- Interact with them in real-time — all from a single screen  
- Use Agora RTC to speak directly to the agent  

No backend or build system required — just enter your config, hit create, and start talking.

---

## Project Structure Breakdown

### `index.html` — Interface Layout

![Agent Config Form](./src/media/2.png)

This file renders the interface where users:

- Input Agora app credentials and token  
- Configure Conversational AI parameters  
- Choose TTS and ASR settings  
- Join a voice channel to speak with the AI agent  

Tied directly to `ui.js` and `utils.js`.

---

### `api.js` — Agent Management via REST

![POST Request in DevTools](./src/media/3.png)  
*Creating an agent using the `/join` endpoint.*

![Agent Update in DevTools](./src/media/4.png)  
*Updating or stopping an agent session through REST API calls.*

Defines the `AgoraAPI` class:

- `createAgent()`  
- `updateAgent()`  
- `stopAgent()`  
- `queryAgent()` / `listAgents()`  

Wraps RESTful interactions with Agora's agent endpoints.

---

### `ui.js` — Event Wiring and Form Behavior

- Binds UI elements to behaviors  
- Handles credential input and saves to localStorage  
- Coordinates API interaction  

Keeps the interface in sync with agent settings.

---

### `audio.js` — Remote Audio Visualization

![Waveform + Volume Ring](./src/media/5.png)

Defines `AudioProcessor`:

- Uses Web Audio API for frequency analysis  
- Draws real-time waveform and volume ring  

Provides visual feedback from the agent's voice.

---

### `utils.js` — Form and Configuration Helpers

The `Utils` class:

- Manages localStorage credentials  
- Parses config form into API payloads  
- Validates required fields  

Ensures complete and correct agent configuration.

---

## Try It Yourself

### Use the Hosted Version

👉 [Visit](https://frank005.github.io/convo_ai)

### Run Locally

```bash
git clone https://github.com/frank005/convo_ai.git
cd convo_ai
run npx serve
```
Then, open the localhost page that is served in your browser.