// API Module for Agora Conversational AI
window.AgoraAPI = class AgoraAPI {
    static PRODUCTION_BASE_URL = 'https://api.agora.io/api/conversational-ai-agent/v2';
    // GPT-Live REST join is an early-access preview and must use this host, not api.agora.io.
    static GPT_LIVE_PREVIEW_BASE_URL = 'https://partner.ai.agora.io/preview/api/conversational-ai-agent/v2';

    constructor(appId) {
        this.appId = appId;
        // Get base URL from localStorage or use default
        this.baseUrl = localStorage.getItem('agoraBaseUrl') || AgoraAPI.PRODUCTION_BASE_URL;
        this.gptLiveAgent = false;
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
        const defaultUrl = AgoraAPI.PRODUCTION_BASE_URL;
        this.baseUrl = defaultUrl;
        localStorage.removeItem('agoraBaseUrl');
        return defaultUrl;
    }

    _isGptLiveVendor(vendor) {
        return vendor === 'openai_gpt_live' || vendor === 'openai-gpt-live';
    }

    _isGptLiveSession() {
        if (this.gptLiveAgent) return true;
        const enableMllm = document.getElementById('enableMllm');
        const mllmVendor = document.getElementById('mllmVendor');
        return !!(enableMllm && enableMllm.checked && mllmVendor && this._isGptLiveVendor(mllmVendor.value));
    }

    _agentRestBaseUrl() {
        return this._isGptLiveSession() ? AgoraAPI.GPT_LIVE_PREVIEW_BASE_URL : this.baseUrl;
    }

    getAuthHeaders(customerId, customerSecret, options = {}) {
        if (!customerId || !customerSecret || !this.appId) {
            throw new Error("Missing required credentials");
        }
        const encoded = btoa(`${customerId}:${customerSecret}`);
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Basic ${encoded}`
        };
        const liveModels = options.liveModels != null ? options.liveModels : this._isGptLiveSession();
        if (liveModels) {
            headers["agora-feature"] = "live-models";
        }
        return headers;
    }

    setLiveModelsHeader(enabled) {
        this.liveModelsHeader = !!enabled;
        this.gptLiveAgent = !!enabled;
    }

    /**
     * Format API error payloads (JSON reason/status) for display. Uses Utils when loaded.
     */
    _formatConvoAiErrorBody(raw) {
        const msg = raw == null ? '' : (typeof raw === 'string' ? raw : JSON.stringify(raw));
        if (typeof window !== 'undefined' && window.Utils && typeof window.Utils.formatConvoAiApiError === 'function') {
            return window.Utils.formatConvoAiApiError({ message: msg });
        }
        return msg;
    }

    async _readResponseBody(response) {
        const text = await response.text();
        if (!text) {
            return { text: '', json: null };
        }
        try {
            return { text, json: JSON.parse(text) };
        } catch (_e) {
            return { text, json: null };
        }
    }

    _errorPayloadForFormat(response, json, text) {
        if (json && typeof json === 'object') {
            const payload = { ...json };
            if (!payload.status && response.status) {
                payload.status = response.status;
            }
            return JSON.stringify(payload);
        }
        return text || response.statusText || `HTTP ${response.status}`;
    }

    async _handleResponse(response, operation) {
        const { text, json } = await this._readResponseBody(response);
        if (!response.ok) {
            const raw = this._errorPayloadForFormat(response, json, text);
            throw new Error(`${operation}: ${this._formatConvoAiErrorBody(raw)}`);
        }
        if (json != null) {
            return json;
        }
        if (!text) {
            return {};
        }
        try {
            return JSON.parse(text);
        } catch (_e) {
            throw new Error(`${operation}: Invalid JSON response`);
        }
    }

    _wrapRequestError(operation, error) {
        const message = error && error.message ? error.message : String(error);
        if (message.startsWith(`${operation}:`)) {
            return error instanceof Error ? error : new Error(message);
        }
        return new Error(`${operation}: ${this._formatConvoAiErrorBody(message)}`);
    }

    async createAgent(customerId, customerSecret, agentConfig) {
        const mllmVendor = agentConfig && agentConfig.properties && agentConfig.properties.mllm
            ? agentConfig.properties.mllm.vendor
            : '';
        const isGptLive = this._isGptLiveVendor(mllmVendor);
        this.setLiveModelsHeader(isGptLive);
        const headers = this.getAuthHeaders(customerId, customerSecret, { liveModels: isGptLive });
        const baseUrl = isGptLive ? AgoraAPI.GPT_LIVE_PREVIEW_BASE_URL : this.baseUrl;
        const url = `${baseUrl}/projects/${this.appId}/join`;

        // If agentConfig.properties.advanced_features.enable_rtm is true and agentConfig.properties.agent_rtm_uid is set,
        // also add agent_rtm_uid to the top-level of the request body (for compatibility)
        let body = { ...agentConfig };
        const adv = agentConfig.properties && agentConfig.properties.advanced_features;
        if (adv && adv.enable_rtm && agentConfig.properties.agent_rtm_uid) {
            body.agent_rtm_uid = agentConfig.properties.agent_rtm_uid;
        }

        const operation = 'Failed to create agent';
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body)
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async updateAgent(customerId, customerSecret, agentId, updatePayload) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this._agentRestBaseUrl()}/projects/${this.appId}/agents/${agentId}/update`;

        const operation = 'Failed to update agent';
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(updatePayload)
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async stopAgent(customerId, customerSecret, agentId) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this._agentRestBaseUrl()}/projects/${this.appId}/agents/${agentId}/leave`;

        const operation = 'Failed to stop agent';
        try {
            const response = await fetch(url, {
                method: "POST",
                headers
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async queryAgent(customerId, customerSecret, agentId) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this._agentRestBaseUrl()}/projects/${this.appId}/agents/${agentId}`;

        const operation = 'Failed to query agent';
        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
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
        
        const url = `${this._agentRestBaseUrl()}/projects/${this.appId}/agents${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        const operation = 'Failed to list agents';
        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async getAgentHistory(customerId, customerSecret, agentId) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this._agentRestBaseUrl()}/projects/${this.appId}/agents/${agentId}/history`;

        const operation = 'Failed to get agent history';
        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async getConversationTurns(customerId, customerSecret, agentId, params = {}) {
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const queryParams = new URLSearchParams();
        if (params.page_index !== undefined && params.page_index !== null) {
            queryParams.append('page_index', params.page_index);
        }
        if (params.page_size !== undefined && params.page_size !== null) {
            queryParams.append('page_size', Math.min(50, Math.max(1, params.page_size)));
        }
        const qs = queryParams.toString();
        const url = `${this._agentRestBaseUrl()}/projects/${this.appId}/agents/${agentId}/turns${qs ? `?${qs}` : ''}`;

        const operation = 'Failed to query conversation turns';
        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    /**
     * Fetch all conversation turn pages. Merges turns[] across pages.
     */
    async getAllConversationTurns(customerId, customerSecret, agentId, params = {}) {
        const pageSize = Math.min(50, Math.max(1, params.page_size || 50));
        let pageIndex = 1;
        let mergedTurns = [];
        let lastPage = null;

        while (true) {
            const page = await this.getConversationTurns(customerId, customerSecret, agentId, {
                page_index: pageIndex,
                page_size: pageSize
            });
            lastPage = page;
            if (Array.isArray(page.turns)) {
                mergedTurns = mergedTurns.concat(page.turns);
            }
            if (!page.pagination || page.pagination.is_last_page) {
                break;
            }
            pageIndex += 1;
            if (page.pagination.total_pages && pageIndex > page.pagination.total_pages) {
                break;
            }
        }

        return {
            ...(lastPage || {}),
            turns: mergedTurns,
            _fetch_all_pages: true,
            _pages_fetched: pageIndex
        };
    }

    async sendCustomInstruction(customerId, customerSecret, agentId, instruction, options = {}) {
        if (window.subtitleManager && window.subtitleManager.isEnabled && window.ConversationalAIAPI) {
            try {
                const conversationalAI = window.ConversationalAIAPI.getInstance();
                if (conversationalAI && conversationalAI.isReady() && typeof conversationalAI.think === 'function') {
                    const agoraRtcUidElement = document.getElementById('agoraRtcUid');
                    const agentRtcUid = agoraRtcUidElement ? agoraRtcUidElement.value.trim() : null;
                    if (agentRtcUid) {
                        await conversationalAI.think(agentRtcUid, {
                            text: instruction,
                            onListeningAction: options.on_listening_action,
                            onThinkingAction: options.on_thinking_action,
                            onSpeakingAction: options.on_speaking_action,
                            interruptable: options.interruptable,
                            metadata: options.metadata
                        });
                        return {
                            success: true,
                            method: 'conversational-ai-toolkit',
                            agent_id: agentId,
                            agent_rtc_uid: agentRtcUid,
                            timestamp: Date.now()
                        };
                    }
                }
            } catch (toolkitError) {
                console.warn('Conversational AI toolkit think failed, falling back to REST API:', toolkitError);
            }
        }
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this._agentRestBaseUrl()}/projects/${this.appId}/agents/${encodeURIComponent(agentId)}/think`;
        const body = {
            text: instruction,
            ...(options.on_listening_action ? { on_listening_action: options.on_listening_action } : {}),
            ...(options.on_thinking_action ? { on_thinking_action: options.on_thinking_action } : {}),
            ...(options.on_speaking_action ? { on_speaking_action: options.on_speaking_action } : {}),
            ...(typeof options.interruptable === 'boolean' ? { interruptable: options.interruptable } : {}),
            ...(options.metadata && typeof options.metadata === 'object' ? { metadata: options.metadata } : {})
        };
        const operation = 'Failed to send custom instruction';
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body)
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async broadcastMessage(customerId, customerSecret, agentId, text, priority, interruptable) {
        if (window.subtitleManager && window.subtitleManager.isEnabled && window.ConversationalAIAPI) {
            try {
                const conversationalAI = window.ConversationalAIAPI.getInstance();
                if (conversationalAI && conversationalAI.isReady() && typeof conversationalAI.speak === 'function') {
                    const agoraRtcUidElement = document.getElementById('agoraRtcUid');
                    const agentRtcUid = agoraRtcUidElement ? agoraRtcUidElement.value.trim() : null;
                    if (agentRtcUid) {
                        const toolkitPriority = String(priority || 'INTERRUPT').toLowerCase();
                        await conversationalAI.speak(agentRtcUid, {
                            text,
                            priority: toolkitPriority === 'interrupt' ? 'interrupted' : toolkitPriority,
                            interruptable
                        });
                        return {
                            success: true,
                            method: 'conversational-ai-toolkit',
                            agent_id: agentId,
                            agent_rtc_uid: agentRtcUid,
                            timestamp: Date.now()
                        };
                    }
                }
            } catch (toolkitError) {
                console.warn('Conversational AI toolkit speak failed, falling back to REST API:', toolkitError);
            }
        }
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this._agentRestBaseUrl()}/projects/${this.appId}/agents/${encodeURIComponent(agentId)}/speak`;
        const body = { text, priority, interruptable };
        const operation = 'Failed to broadcast message';
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body)
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async interruptAgent(customerId, customerSecret, agentId) {
        // Try to use Conversational AI toolkit first if available and subtitles are enabled
        if (window.subtitleManager && window.subtitleManager.isEnabled && window.ConversationalAIAPI) {
            try {
                const conversationalAI = window.ConversationalAIAPI.getInstance();
                if (conversationalAI && conversationalAI.isReady()) {
                    console.log('Using Conversational AI toolkit interrupt method');
                    // Get agent RTC UID from UI instead of using agent ID
                    const agoraRtcUidElement = document.getElementById('agoraRtcUid');
                    const agentRtcUid = agoraRtcUidElement ? agoraRtcUidElement.value.trim() : null;
                    if (!agentRtcUid) {
                        throw new Error('Agent RTC UID is required. Please enter it in the Agent RTC UID field.');
                    }
                    await conversationalAI.interrupt(agentRtcUid);
                    return { 
                        success: true, 
                        method: 'conversational-ai-toolkit',
                        agent_id: agentId,
                        agent_rtc_uid: agentRtcUid,
                        timestamp: Date.now()
                    };
                }
            } catch (toolkitError) {
                console.warn('Conversational AI toolkit interrupt failed, falling back to REST API:', toolkitError);
            }
        }

        // Fallback to REST API method
        const headers = this.getAuthHeaders(customerId, customerSecret);
        const url = `${this._agentRestBaseUrl()}/projects/${this.appId}/agents/${encodeURIComponent(agentId)}/interrupt`;
        const operation = 'Failed to interrupt agent';
        try {
            console.log('Using REST API interrupt method');
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({})
            });
            const result = await this._handleResponse(response, operation);
            result.method = 'rest-api';
            return result;
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    // Outbound Call APIs
    async startOutboundCall(customerId, customerSecret, callConfig) {
        const headers = this.getAuthHeaders(customerId, customerSecret, { liveModels: false });
        const url = `${this.baseUrl}/projects/${this.appId}/call`;

        const operation = 'Failed to start outbound call';
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(callConfig)
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async getOutboundCallStatus(customerId, customerSecret, agentId) {
        const headers = this.getAuthHeaders(customerId, customerSecret, { liveModels: false });
        const url = `${this.baseUrl}/projects/${this.appId}/calls/${agentId}`;

        const operation = 'Failed to get outbound call status';
        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async hangUpOutboundCall(customerId, customerSecret, agentId) {
        const headers = this.getAuthHeaders(customerId, customerSecret, { liveModels: false });
        const url = `${this.baseUrl}/projects/${this.appId}/calls/${agentId}/hangup`;

        const operation = 'Failed to hang up outbound call';
        try {
            const response = await fetch(url, {
                method: "POST",
                headers
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async getCallRecords(customerId, customerSecret, params = {}) {
        const headers = this.getAuthHeaders(customerId, customerSecret, { liveModels: false });
        const queryParams = new URLSearchParams();
        if (params.number) queryParams.append('number', params.number);
        if (params.from_time) queryParams.append('from_time', params.from_time);
        if (params.to_time) queryParams.append('to_time', params.to_time);
        if (params.type) queryParams.append('type', params.type);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.cursor) queryParams.append('cursor', params.cursor);
        
        const url = `${this.baseUrl}/projects/${this.appId}/call${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        const operation = 'Failed to get call records';
        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    // Phone Number Management APIs
    async listPhoneNumbers(customerId, customerSecret) {
        const headers = this.getAuthHeaders(customerId, customerSecret, { liveModels: false });
        const url = `${this.baseUrl}/phone-numbers`;

        const operation = 'Failed to list phone numbers';
        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async importPhoneNumber(customerId, customerSecret, importConfig) {
        const headers = this.getAuthHeaders(customerId, customerSecret, { liveModels: false });
        const url = `${this.baseUrl}/phone-numbers`;

        const operation = 'Failed to import phone number';
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(importConfig)
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async getPhoneNumberInfo(customerId, customerSecret, phoneNumber) {
        const headers = this.getAuthHeaders(customerId, customerSecret, { liveModels: false });
        const url = `${this.baseUrl}/phone-numbers/${encodeURIComponent(phoneNumber)}`;

        const operation = 'Failed to get phone number info';
        try {
            const response = await fetch(url, {
                method: "GET",
                headers
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async updatePhoneNumber(customerId, customerSecret, phoneNumber, updateConfig) {
        const headers = this.getAuthHeaders(customerId, customerSecret, { liveModels: false });
        const url = `${this.baseUrl}/phone-numbers/${encodeURIComponent(phoneNumber)}`;

        const operation = 'Failed to update phone number';
        try {
            const response = await fetch(url, {
                method: "PATCH",
                headers,
                body: JSON.stringify(updateConfig)
            });
            return await this._handleResponse(response, operation);
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }

    async deletePhoneNumber(customerId, customerSecret, phoneNumber) {
        const headers = this.getAuthHeaders(customerId, customerSecret, { liveModels: false });
        const url = `${this.baseUrl}/phone-numbers/${encodeURIComponent(phoneNumber)}`;

        const operation = 'Failed to delete phone number';
        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers
            });
            const result = await this._handleResponse(response, operation);
            if (response.status === 204 || !result || Object.keys(result).length === 0) {
                return { success: true, message: "Phone number deleted successfully" };
            }
            return result;
        } catch (error) {
            throw this._wrapRequestError(operation, error);
        }
    }
} 