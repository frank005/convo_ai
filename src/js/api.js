// API Module for Agora Conversational AI
export class AgoraAPI {
    constructor(appId) {
        this.appId = appId;
        // Get base URL from localStorage or use default
        this.baseUrl = localStorage.getItem('agoraBaseUrl') || 'https://api.agora.io/api/conversational-ai-agent/v2';
    }

    // Method to update base URL
    updateBaseUrl(newBaseUrl) {
        this.baseUrl = newBaseUrl;
        localStorage.setItem('agoraBaseUrl', newBaseUrl);
    }

    // Method to get current base URL
    getBaseUrl() {
        return this.baseUrl;
    }

    // Method to reset to default base URL
    resetBaseUrl() {
        const defaultUrl = 'https://api.agora.io/api/conversational-ai-agent/v2';
        this.baseUrl = defaultUrl;
        localStorage.removeItem('agoraBaseUrl');
        return defaultUrl;
    }

    getAuthHeaders(customerId, customerSecret) {
        if (!customerId || !customerSecret || !this.appId) {
            throw new Error("Missing required credentials");
        }
        const encoded = btoa(`${customerId}:${customerSecret}`);
        return {
            "Content-Type": "application/json",
            "Authorization": `Basic ${encoded}`
        };
    }

    async createAgent(customerId, customerSecret, agentConfig) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/join`;

        // If agentConfig.properties.advanced_features.enable_rtm is true and agentConfig.properties.agent_rtm_uid is set,
        // also add agent_rtm_uid to the top-level of the request body (for compatibility)
        let body = { ...agentConfig };
        const adv = agentConfig.properties && agentConfig.properties.advanced_features;
        if (adv && adv.enable_rtm && agentConfig.properties.agent_rtm_uid) {
            body.agent_rtm_uid = agentConfig.properties.agent_rtm_uid;
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body)
            });
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to create agent: ${error.message}`);
        }
    }

    async updateAgent(customerId, customerSecret, agentId, updatePayload) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/agents/${agentId}/update`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(updatePayload)
            });
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to update agent: ${error.message}`);
        }
    }

    async stopAgent(customerId, customerSecret, agentId) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/agents/${agentId}/leave`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers
            });
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to stop agent: ${error.message}`);
        }
    }

    async queryAgent(customerId, customerSecret, agentId) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/agents/${agentId}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to query agent: ${error.message}`);
        }
    }

    async listAgents(customerId, customerSecret) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/agents`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to list agents: ${error.message}`);
        }
    }

    async getAgentHistory(customerId, customerSecret, agentId) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/agents/${agentId}/history`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to get agent history: ${error.message}`);
        }
    }

    async broadcastMessage(customerId, customerSecret, agentId, text, priority, interruptable) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/agents/${encodeURIComponent(agentId)}/speak`;
        const body = { text, priority, interruptable };
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to broadcast message: ${error.message}`);
        }
    }

    async interruptAgent(customerId, customerSecret, agentId) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/agents/${encodeURIComponent(agentId)}/interrupt`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({})
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to interrupt agent: ${error.message}`);
        }
    }
} 