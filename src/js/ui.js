// UI Module
import { Utils } from './utils.js';
import { microsoftVoicesByLang } from '../lib/microsoftVoicesByLang.js';
import { AgoraAPI } from './api.js';

export class UI {
    constructor() {
        this.mediaProcessor = null;
        this.agoraAPI = null;
        this.subtitleManager = null;
        this.params = {};
    }

    initialize(mediaProcessor, agoraAPI, subtitleManager = null) {
        this.mediaProcessor = mediaProcessor;
        this.agoraAPI = agoraAPI;
        this.subtitleManager = subtitleManager;
        this.setupEventListeners();
        this.checkCredentials();
        this.populateMicrosoftLangList();
        this.setupDrawerListeners();
        // Initialize TTS vendor blocks visibility
        this.handleTtsVendorChange();
        // Update base URL indicator
        this.updateBaseUrlIndicator();
    }

    setupEventListeners() {
        // TTS Vendor change handler
        document.getElementById("ttsVendor").addEventListener("change", () => this.handleTtsVendorChange());
        
        // Microsoft language change handler
        document.getElementById("microsoftLangSelect").addEventListener("change", () => this.handleMicrosoftLangChange());
        
        // ElevenLabs voice change handler
        document.getElementById("elevenLabsVoiceSelect").addEventListener("change", () => this.handleElevenLabsVoiceChange());

        // Add parameter field button
        document.getElementById("addParamBtn").addEventListener("click", () => this.addParamField());

        // Credentials modal
        document.getElementById("setCredsBtn").addEventListener("click", () => this.openCredsModal());
        document.getElementById("saveCredsBtn").addEventListener("click", () => this.saveCreds());
        


        // Volume widget
        document.getElementById("toggleVolumeBtn").addEventListener("click", () => this.toggleVolumeWidget());

        // Channel controls
        document.getElementById("joinChannel").addEventListener("click", () => this.joinChannel());
        document.getElementById("leaveChannel").addEventListener("click", () => this.leaveChannel());

        // Agent controls
        document.getElementById("createAgentBtn").addEventListener("click", () => this.createAgent());
        document.getElementById("updateAgentBtn").addEventListener("click", () => this.updateAgent());
        document.getElementById("stopAgentBtn").addEventListener("click", () => this.stopAgent());
        document.getElementById("queryAgentBtn").addEventListener("click", () => this.queryAgent());
        document.getElementById("listAgentsBtn").addEventListener("click", () => this.listAgents());
    }

    checkCredentials() {
        const { customerId, customerSecret, appId } = Utils.getStoredCredentials();
        if (!customerId || !customerSecret || !appId) {
            this.openCredsModal();
        }
    }

    openCredsModal() {
        const { customerId, customerSecret, appId } = Utils.getStoredCredentials();
        document.getElementById("customerId").value = customerId || '';
        document.getElementById("customerSecret").value = customerSecret || '';
        document.getElementById("appId").value = appId || '';
        
        document.getElementById("credsModal").classList.remove("hidden");
    }

    async saveCreds() {
        const customerId = document.getElementById("customerId").value.trim();
        const customerSecret = document.getElementById("customerSecret").value.trim();
        const appId = document.getElementById("appId").value.trim();

        if (!customerId || !customerSecret || !appId) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            Utils.saveCredentials(customerId, customerSecret, appId);
            
            document.getElementById("credsModal").classList.add("hidden");
            // Update the AgoraAPI instance with new appId
            this.agoraAPI = new AgoraAPI(appId);
            // Update base URL indicator
            this.updateBaseUrlIndicator();
        } catch (error) {
            alert(error.message);
        }
    }

    updateBaseUrlIndicator() {
        const indicator = document.getElementById("baseUrlIndicator");
        const currentUrl = this.agoraAPI.getBaseUrl();
        const defaultUrl = 'https://api.agora.io/api/conversational-ai-agent/v2';
        
        if (currentUrl !== defaultUrl) {
            // Extract domain from URL for display
            try {
                const url = new URL(currentUrl);
                const domain = url.hostname;
                indicator.textContent = `🔗 ${domain}`;
                indicator.classList.remove("hidden");
            } catch (e) {
                indicator.textContent = "🔗 Custom URL";
                indicator.classList.remove("hidden");
            }
        } else {
            indicator.classList.add("hidden");
        }
    }

    toggleVolumeWidget() {
        const widget = document.getElementById('aiVolumeWidget');
        const btn = document.getElementById('toggleVolumeBtn');
        const canvas = document.getElementById('audio-wave');
        
        if (widget.style.display === 'none' || widget.style.display === '') {
            widget.style.display = 'block';
            btn.textContent = 'Hide AI Interaction';
            // Resize canvas when widget is shown
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        } else {
            widget.style.display = 'none';
            btn.textContent = 'Show AI Interaction';
        }
    }

    async joinChannel() {
        const { appId } = Utils.getStoredCredentials();
        const channelName = document.getElementById("agoraChannelName").value.trim();
        const clientRtcUid = document.getElementById("clientRtcUid").value.trim();
        const clientRtcToken = document.getElementById("clientRtcToken").value.trim();
        const enableStringUid = document.getElementById("enableStringUid").checked;
        const agentId = document.getElementById("agentId").value.trim(); // Get agent ID from UI

        try {
            // Convert empty string to null for token
            const token = clientRtcToken || null;
            
            // Convert UID to integer unless string UID is enabled
            let uid = clientRtcUid;
            if (!enableStringUid && clientRtcUid) {
                uid = parseInt(clientRtcUid, 10);
                if (isNaN(uid)) {
                    throw new Error('Client UID must be a valid number when String UID is disabled');
                }
            }
            
            await this.mediaProcessor.joinChannel(appId, channelName, token, uid, this.subtitleManager, agentId);
            document.getElementById("joinChannel").disabled = true;
            document.getElementById("leaveChannel").disabled = false;
        } catch (error) {
            alert(error.message);
        }
    }

    async leaveChannel() {
        try {
            await this.mediaProcessor.leaveChannel();
            document.getElementById("joinChannel").disabled = false;
            document.getElementById("leaveChannel").disabled = true;
        } catch (error) {
            alert(error.message);
        }
    }

    handleTtsVendorChange() {
        const vendor = document.getElementById("ttsVendor").value;
        
        const msBlocks = [
            "microsoftRegionBlock", 
            "microsoftLangBlock", 
            "microsoftVoiceBlock",
            "microsoftTtsKeyBlock",
            "microsoftRateBlock",
            "microsoftSpeedBlock",
            "microsoftVolumeBlock",
            "microsoftSampleRateBlock"
        ];
        const elBlocks = [
            "elevenLabsModelBlock", 
            "elevenLabsVoiceBlock", 
            "elevenLabsVoiceIdBlock",
            "elevenLabsTtsKeyBlock",
            "elevenLabsSampleRateBlock",
            "elevenLabsStabilityBlock",
            "elevenLabsSimilarityBoostBlock",
            "elevenLabsStyleBlock",
            "elevenLabsUseSpeakerBoostBlock"
        ];
        const cartesiaBlocks = [
            "cartesiaTtsKeyBlock",
            "cartesiaModelBlock",
            "cartesiaVoiceBlock"
        ];
        const openaiBlocks = [
            "openaiTtsKeyBlock",
            "openaiModelBlock",
            "openaiVoiceBlock",
            "openaiInstructionsBlock",
            "openaiSpeedBlock"
        ];
        const humeaiBlocks = [
            "humeaiTtsKeyBlock",
            "humeaiVoiceIdBlock",
            "humeaiProviderBlock",
            "humeaiSpeedBlock",
            "humeaiTrailingSilenceBlock"
        ];

        msBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "microsoft");
            }
        });

        elBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "elevenlabs");
            }
        });

        cartesiaBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "cartesia");
            }
        });

        openaiBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "openai");
            }
        });

        humeaiBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "humeai");
            }
        });

        // Handle Microsoft language population when vendor changes to Microsoft
        if (vendor === "microsoft") {
            this.populateMicrosoftLangList();
        }

        // Check if AI Avatar is enabled and disable it if TTS is not configured
        const enableAvatar = document.getElementById('enableAvatar');
        if (enableAvatar && enableAvatar.checked && !vendor) {
            enableAvatar.checked = false;
            enableAvatar.dispatchEvent(new Event('change'));
        }
    }

    handleElevenLabsVoiceChange() {
        const voiceSel = document.getElementById("elevenLabsVoiceSelect").value;
        const voiceIdBlk = document.getElementById("elevenLabsVoiceIdBlock");
        voiceIdBlk.classList.toggle("hidden", voiceSel !== "other");
    }

    populateMicrosoftLangList() {
        const msLangSelect = document.getElementById("microsoftLangSelect");
        const currentLang = msLangSelect.value;
        const currentVoice = document.getElementById("microsoftVoiceSelect").value;
        msLangSelect.innerHTML = "";

        const languageCodes = Object.keys(microsoftVoicesByLang).sort();
        languageCodes.forEach((lang) => {
            const opt = document.createElement("option");
            opt.value = lang;
            opt.textContent = lang;
            if (lang === currentLang || (!currentLang && lang === "English (United States)")) {
                opt.selected = true;
            }
            msLangSelect.appendChild(opt);
        });

        this.handleMicrosoftLangChange(currentVoice);
    }

    handleMicrosoftLangChange(selectedVoice = null) {
        const lang = document.getElementById("microsoftLangSelect").value;
        const voiceSelect = document.getElementById("microsoftVoiceSelect");
        const currentVoice = selectedVoice || voiceSelect.value;
        voiceSelect.innerHTML = "";

        const voices = microsoftVoicesByLang[lang] || [];
        voices.forEach((v) => {
            const opt = document.createElement("option");
            opt.value = v.shortName;
            opt.textContent = `${v.friendlyName} (${v.shortName})`;
            if (v.shortName === currentVoice) {
                opt.selected = true;
            }
            voiceSelect.appendChild(opt);
        });
    }

    addParamField() {
        const container = document.getElementById("param-container");
        const paramId = "param-" + Object.keys(this.params).length;

        const div = document.createElement("div");
        div.classList.add("flex", "gap-2", "items-center");
        div.id = paramId;

        div.innerHTML = `
            <select class="border p-2 w-1/5 rounded bg-gray-800 text-white">
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
            </select>
            <input type="text" placeholder="Key" class="border p-2 w-1/4 rounded bg-gray-800 text-white">
            <input type="text" placeholder="Value" class="border p-2 w-2/5 rounded bg-gray-800 text-white" id="${paramId}-value">
            <button class="text-red-500">❌</button>
        `;

        // Add event listeners
        const select = div.querySelector('select');
        const keyInput = div.querySelector('input[placeholder="Key"]');
        const valueInput = div.querySelector('input[placeholder="Value"]');
        const removeBtn = div.querySelector('button');

        select.addEventListener('change', () => this.updateParam(paramId, select, 'type'));
        keyInput.addEventListener('input', () => this.updateParam(paramId, keyInput, 'key'));
        valueInput.addEventListener('input', () => this.updateParam(paramId, valueInput, 'value'));
        removeBtn.addEventListener('click', () => this.removeParam(paramId));

        container.appendChild(div);
        this.params[paramId] = { key: "", type: "string", value: "" };
    }

    updateParam(id, input, fieldType) {
        if (fieldType === "key") this.params[id].key = input.value;
        
        if (fieldType === "type") {
            this.params[id].type = input.value;
            let valueInput = document.getElementById(`${id}-value`);

            if (input.value === "array") {
                valueInput.placeholder = "Comma-separated values";
            } else if (input.value === "object") {
                valueInput.placeholder = "Enter JSON";
                valueInput.value = "{}";
            } else {
                valueInput.placeholder = "Value";
                valueInput.value = "";
            }
        }

        if (fieldType === "value") {
            let type = this.params[id].type;
            if (type === "array") {
                this.params[id].value = input.value.split(",").map(v => v.trim());
            } else if (type === "number") {
                this.params[id].value = Number(input.value);
            } else if (type === "object") {
                try {
                    this.params[id].value = JSON.parse(input.value);
                    input.style.borderColor = "green";
                } catch (e) {
                    input.style.borderColor = "red";
                }
            } else {
                this.params[id].value = input.value;
            }
        }
    }

    removeParam(id) {
        document.getElementById(id).remove();
        delete this.params[id];
    }

    async createAgent() {
        const output = document.getElementById("agentResponse");
        output.textContent = "Creating...";

        try {
            const formData = Utils.getFormData();
            Utils.validateFormData(formData);
            const customParams = Utils.getCustomParams();
            const agentConfig = Utils.buildAgentConfig(formData, customParams);

            const { customerId, customerSecret } = Utils.getStoredCredentials();
            const data = await this.agoraAPI.createAgent(customerId, customerSecret, agentConfig);
            
            output.textContent = JSON.stringify(data, null, 2);
            if (data.agent_id) {
                document.getElementById("agentId").value = data.agent_id;
            }
        } catch (error) {
            output.textContent = `Error: ${error.message}`;
        }
    }

    async updateAgent() {
        const output = document.getElementById("agentResponse");
        output.textContent = "Updating...";

        try {
            const { customerId, customerSecret } = Utils.getStoredCredentials();
            const agentId = document.getElementById("agentId").value.trim();
            const formData = Utils.getFormData();
            const customParams = Utils.getCustomParams();
            const config = Utils.buildAgentConfig(formData, customParams);
            
            // Check if MLLM is enabled
            const enableMllm = document.getElementById('enableMllm').checked;
            
            let updatePayload;
            if (enableMllm) {
                // Include token and mllm params (using custom parameters)
                updatePayload = {
                    properties: {
                        token: config.properties.token,
                        mllm: {
                            ...(Object.keys(customParams).length > 0 ? { params: customParams } : {}) // Only include params if customParams is not empty
                        }
                    }
                };
            } else {
                // Include token, llm.system_messages, and llm.params (customParams)
                updatePayload = {
                    properties: {
                        token: config.properties.token,
                        llm: {
                            system_messages: config.properties.llm.system_messages,
                            params: config.properties.llm.params
                        }
                    }
                };
            }
            
            const data = await this.agoraAPI.updateAgent(customerId, customerSecret, agentId, updatePayload);
            output.textContent = JSON.stringify(updatePayload, null, 2);
        } catch (error) {
            output.textContent = `Error: ${error.message}`;
        }
    }

    async stopAgent() {
        const output = document.getElementById("agentResponse");
        output.textContent = "Stopping...";

        try {
            const { customerId, customerSecret } = Utils.getStoredCredentials();
            const agentId = document.getElementById("agentId").value.trim();

            const data = await this.agoraAPI.stopAgent(customerId, customerSecret, agentId);
            output.textContent = Object.keys(data).length === 0 
                ? "Agent stopped (empty JSON response)."
                : JSON.stringify(data, null, 2);
        } catch (error) {
            output.textContent = `Error: ${error.message}`;
        }
    }

    async queryAgent() {
        const output = document.getElementById("queryResponse");
        output.textContent = "Querying agent status...";

        try {
            const { customerId, customerSecret } = Utils.getStoredCredentials();
            const agentId = document.getElementById("agentId").value.trim();

            const data = await this.agoraAPI.queryAgent(customerId, customerSecret, agentId);
            output.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            output.textContent = `Error: ${error.message}`;
        }
    }

    async listAgents() {
        const output = document.getElementById("queryResponse");
        output.textContent = "Retrieving agents...";

        try {
            const { customerId, customerSecret } = Utils.getStoredCredentials();
            const data = await this.agoraAPI.listAgents(customerId, customerSecret);
            output.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            output.textContent = `Error: ${error.message}`;
        }
    }

    openDrawer(drawerId) {
        // Close all drawers first
        ['llmDrawer', 'advDrawer', 'ttsDrawer', 'mllmDrawer', 'avatarDrawer'].forEach(id => {
            const drawer = document.getElementById(id);
            const backdrop = document.getElementById(id + 'Backdrop');
            if (drawer) drawer.classList.add('hidden');
            if (backdrop) backdrop.classList.add('hidden');
        });
        // Find the button that triggered this drawer
        let btnId = '';
        if (drawerId === 'llmDrawer') btnId = 'llmSettingsBtn';
        if (drawerId === 'advDrawer') btnId = 'advConfigBtn';
        if (drawerId === 'ttsDrawer') btnId = 'ttsSettingsBtn';
        if (drawerId === 'mllmDrawer') btnId = 'mllmSettingsBtn';
        if (drawerId === 'avatarDrawer') btnId = 'avatarSettingsBtn';
        const btn = document.getElementById(btnId);
        const drawer = document.getElementById(drawerId);
        // Use the same absolute positioning logic for all drawers
        const btnRect = btn.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        let top = (btnRect.top + scrollTop);
        // Default: right of button
        let left = btnRect.right + 16 + scrollLeft;
        drawer.style.position = 'absolute';
        drawer.style.top = top + 'px';
        drawer.style.left = left + 'px';
        drawer.style.transform = '';
        drawer.style.marginLeft = '0';
        // Clamp if overflowing viewport
        setTimeout(() => {
            const drawerRect = drawer.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            if (drawerRect.right > viewportWidth) {
                // Shift left so it fits
                left = viewportWidth - drawerRect.width - 24;
                drawer.style.left = left + 'px';
            }
        }, 0);
        drawer.classList.remove('hidden');
        document.getElementById(drawerId + 'Backdrop').classList.remove('hidden');
    }

    closeDrawer(drawerId) {
        document.getElementById(drawerId).classList.add('hidden');
        document.getElementById(drawerId + 'Backdrop').classList.add('hidden');
    }

    setupDrawerListeners() {
        // LLM
        document.getElementById('llmSettingsBtn').addEventListener('click', () => this.openDrawer('llmDrawer'));
        document.getElementById('llmDrawerBackdrop').addEventListener('click', () => this.closeDrawer('llmDrawer'));
        document.querySelector('#llmDrawer .drawer-close').addEventListener('click', () => this.closeDrawer('llmDrawer'));
        // Advanced Config
        document.getElementById('advConfigBtn').addEventListener('click', () => this.openDrawer('advDrawer'));
        document.getElementById('advDrawerBackdrop').addEventListener('click', () => this.closeDrawer('advDrawer'));
        document.querySelector('#advDrawer .drawer-close').addEventListener('click', () => this.closeDrawer('advDrawer'));
        // TTS
        document.getElementById('ttsSettingsBtn').addEventListener('click', () => this.openDrawer('ttsDrawer'));
        document.getElementById('ttsDrawerBackdrop').addEventListener('click', () => this.closeDrawer('ttsDrawer'));
        document.querySelector('#ttsDrawer .drawer-close').addEventListener('click', () => this.closeDrawer('ttsDrawer'));
        // AI Avatar
        document.getElementById('avatarSettingsBtn').addEventListener('click', () => this.openDrawer('avatarDrawer'));
        document.getElementById('avatarDrawerBackdrop').addEventListener('click', () => this.closeDrawer('avatarDrawer'));
        document.querySelector('#avatarDrawer .drawer-close').addEventListener('click', () => this.closeDrawer('avatarDrawer'));

        // Advanced Config dynamic sections
        const turnDetectionCheckbox = document.getElementById('turnDetectionEnabled');
        const turnDetectionConfig = document.getElementById('turnDetectionConfig');
        const parametersCheckbox = document.getElementById('parametersEnabled');
        const parametersConfig = document.getElementById('parametersConfig');

        // Initial state
        turnDetectionConfig.classList.toggle('hidden', !turnDetectionCheckbox.checked);
        parametersConfig.classList.toggle('hidden', !parametersCheckbox.checked);

        turnDetectionCheckbox.addEventListener('change', () => {
            turnDetectionConfig.classList.toggle('hidden', !turnDetectionCheckbox.checked);
        });
        parametersCheckbox.addEventListener('change', () => {
            parametersConfig.classList.toggle('hidden', !parametersCheckbox.checked);
        });
    }
} 