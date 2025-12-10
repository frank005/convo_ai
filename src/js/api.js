// API Module for Agora Conversational AI
window.AgoraAPI = class AgoraAPI {
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

    async listAgents(customerId, customerSecret, params = {}) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const queryParams = new URLSearchParams();
        
        // Add query parameters if provided
        if (params.channel) queryParams.append('channel', params.channel);
        if (params.from_time !== undefined && params.from_time !== null) queryParams.append('from_time', params.from_time);
        if (params.to_time !== undefined && params.to_time !== null) queryParams.append('to_time', params.to_time);
        if (params.state !== undefined && params.state !== null && params.state !== '') queryParams.append('state', params.state);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.cursor) queryParams.append('cursor', params.cursor);
        
        const url = `${this.baseUrl}/projects/${this.appId}/agents${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
        // Try to use Conversational AI toolkit first if available and subtitles are enabled
        if (window.subtitleManager && window.subtitleManager.isEnabled && window.ConversationalAIAPI) {
            try {
                const conversationalAI = window.ConversationalAIAPI.getInstance();
                if (conversationalAI && conversationalAI.isReady()) {
                    console.log('Using Conversational AI toolkit interrupt method');
                    await conversationalAI.interrupt(agentId);
                    return { 
                        success: true, 
                        method: 'conversational-ai-toolkit',
                        agent_id: agentId,
                        timestamp: Date.now()
                    };
                }
            } catch (toolkitError) {
                console.warn('Conversational AI toolkit interrupt failed, falling back to REST API:', toolkitError);
            }
        }

        // Fallback to REST API method
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/agents/${encodeURIComponent(agentId)}/interrupt`;
        try {
            console.log('Using REST API interrupt method');
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({})
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            const result = await response.json();
            result.method = 'rest-api';
            return result;
        } catch (error) {
            throw new Error(`Failed to interrupt agent: ${error.message}`);
        }
    }

    // Outbound Call APIs
    async startOutboundCall(customerId, customerSecret, callConfig) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/call`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(callConfig)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to start outbound call: ${error.message}`);
        }
    }

    async getOutboundCallStatus(customerId, customerSecret, agentId) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/calls/${agentId}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to get outbound call status: ${error.message}`);
        }
    }

    async hangUpOutboundCall(customerId, customerSecret, agentId) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/projects/${this.appId}/calls/${agentId}/hangup`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to hang up outbound call: ${error.message}`);
        }
    }

    async getCallRecords(customerId, customerSecret, params = {}) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const queryParams = new URLSearchParams();
        if (params.number) queryParams.append('number', params.number);
        if (params.from_time) queryParams.append('from_time', params.from_time);
        if (params.to_time) queryParams.append('to_time', params.to_time);
        if (params.type) queryParams.append('type', params.type);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.cursor) queryParams.append('cursor', params.cursor);
        
        const url = `${this.baseUrl}/projects/${this.appId}/call${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to get call records: ${error.message}`);
        }
    }

    // Phone Number Management APIs
    async listPhoneNumbers(customerId, customerSecret) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/phone-numbers`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to list phone numbers: ${error.message}`);
        }
    }

    async importPhoneNumber(customerId, customerSecret, importConfig) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/phone-numbers`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(importConfig)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to import phone number: ${error.message}`);
        }
    }

    async getPhoneNumberInfo(customerId, customerSecret, phoneNumber) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/phone-numbers/${encodeURIComponent(phoneNumber)}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to get phone number info: ${error.message}`);
        }
    }

    async updatePhoneNumber(customerId, customerSecret, phoneNumber, updateConfig) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/phone-numbers/${encodeURIComponent(phoneNumber)}`;

        try {
            const response = await fetch(url, {
                method: "PATCH",
                headers,
                body: JSON.stringify(updateConfig)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to update phone number: ${error.message}`);
        }
    }

    async deletePhoneNumber(customerId, customerSecret, phoneNumber) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this.baseUrl}/phone-numbers/${encodeURIComponent(phoneNumber)}`;

        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }
            // Handle empty response (204 No Content) or response with no body
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const text = await response.text();
                return text ? JSON.parse(text) : { success: true };
            }
            // Return success object for empty responses
            return { success: true, message: "Phone number deleted successfully" };
        } catch (error) {
            throw new Error(`Failed to delete phone number: ${error.message}`);
        }
    }
} 