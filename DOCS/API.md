# API Integration

The application integrates with Agora's Conversational AI API endpoints to manage agents and handle real-time communication.

## Core Agent Operations

### Create Agent

Create a new conversational AI agent.

- **Endpoint:** `POST /api/conversational-ai-agent/v2/projects/{appId}/join`
- **Description:** Creates a new agent and joins it to the specified channel

### Update Agent

Update an existing agent's configuration.

- **Endpoint:** `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/update`
- **Description:** Updates the configuration of an existing agent

### Stop Agent

Stop and remove an agent from the channel.

- **Endpoint:** `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/leave`
- **Description:** Gracefully stops the agent and removes it from the channel

### Query Agent Status

Retrieve the current status and configuration of an agent.

- **Endpoint:** `GET /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}`
- **Description:** Returns detailed information about the agent's current state

### List All Agents

Get a list of all active agents in your project.

- **Endpoint:** `GET /api/conversational-ai-agent/v2/projects/{appId}/agents`
- **Description:** Returns a list of all agents across your project

### Get Agent History

Retrieve conversation history for an agent.

- **Endpoint:** `GET /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/history`
- **Description:** Returns the conversation history for the specified agent

## Communication & Control

### Send Broadcast Message

Send a broadcast message to agents with priority control.

- **Endpoint:** `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/broadcast`
- **Description:** Sends a broadcast message to the agent with configurable interruptability settings
- **Maximum Message Size:** 512 bytes
- **Features:** Priority control, interruptability settings, real-time status feedback

### Interrupt Agent

Manually interrupt an agent's current response.

- **Endpoint:** `POST /api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/interrupt`
- **Description:** Immediately terminates the agent's current response
- **Features:** Status confirmation and error handling

## Authentication

All API requests require authentication using your Agora credentials:

- **Customer ID**: Your Agora Customer ID
- **Customer Secret**: Your Agora Customer Secret
- **App ID**: Your Agora Application ID

Credentials are managed through the "Set API Credentials" button in the application interface and stored securely in localStorage.

## Related Documentation

- [SETUP.md](./SETUP.md) - Initial setup and configuration
- [FEATURES.md](./FEATURES.md) - Complete feature list including broadcast and interruption capabilities
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture and API layer details
