// Utilities Module
export class Utils {
    static getStoredCredentials() {
        return {
            customerId: localStorage.getItem("customerId") || "",
            customerSecret: localStorage.getItem("customerSecret") || "",
            appId: localStorage.getItem("appId") || ""
        };
    }

    static saveCredentials(customerId, customerSecret, appId) {
        if (!customerId || !customerSecret || !appId) {
            throw new Error("All credentials are required");
        }
        localStorage.setItem("customerId", customerId);
        localStorage.setItem("customerSecret", customerSecret);
        localStorage.setItem("appId", appId);
    }

    static getFormData() {
        return {
            uniqueName: document.getElementById("uniqueName").value.trim(),
            channel: document.getElementById("agoraChannelName").value.trim(),
            rtcUid: document.getElementById("agoraRtcUid").value.trim(),
            token: document.getElementById("agoraRtcToken").value.trim(),
            llmApiKey: document.getElementById("llmApiKey").value.trim(),
            llmUrl: document.getElementById("llmUrl").value.trim(),
            ttsKey: document.getElementById("ttsKey").value.trim(),
            gMsg: document.getElementById("gMsg").value.trim(),
            fMsg: document.getElementById("fMsg").value.trim(),
            sMsgContent: document.getElementById("sMsgContent").value.trim(),
            asr: document.getElementById("asrLang").value,
            vendor: document.getElementById("ttsVendor").value,
            isStringUid: document.getElementById('enableStringUid').checked,
            llmModel: document.getElementById("llmModel").value
        };
    }

    static validateFormData(data) {
        const required = ['uniqueName', 'channel', 'rtcUid', 'llmApiKey', 'llmUrl', 'ttsKey'];
        const missing = required.filter(field => !data[field]);
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    }

    static getCustomParams() {
        const params = {};
        const container = document.getElementById("param-container");
        const paramElements = container.children;

        for (let element of paramElements) {
            const inputs = element.querySelectorAll('input, select');
            const key = inputs[1].value;
            const type = inputs[0].value;
            const value = inputs[2].value;

            if (key && value) {
                params[key] = this.parseParamValue(type, value);
            }
        }

        return params;
    }

    static parseParamValue(type, value) {
        switch (type) {
            case 'array':
                return value.split(',').map(v => v.trim());
            case 'number':
                return Number(value);
            case 'object':
                try {
                    return JSON.parse(value);
                } catch (e) {
                    throw new Error(`Invalid JSON in object parameter: ${value}`);
                }
            default:
                return value;
        }
    }

    static buildAgentConfig(formData, customParams) {
        const config = {
            name: formData.uniqueName,
            properties: {
                channel: formData.channel,
                token: formData.token,
                agent_rtc_uid: formData.rtcUid,
                enable_string_uid: formData.isStringUid,
                idle_timeout: 120,
                remote_rtc_uids: ["*"],
                advanced_features: {
                    enable_bhvs: true,
                    enable_aivad: true
                },
                asr: {
                    language: formData.asr
                },
                vad: {
                    silence_duration_ms: 480
                },
                llm: {
                    url: formData.llmUrl,
                    api_key: formData.llmApiKey,
                    system_messages: [
                        { role: "system", content: formData.sMsgContent }
                    ],
                    greeting_message: formData.gMsg,
                    failure_message: formData.fMsg,
                    max_history: 10,
                    params: {
                        model: formData.llmModel,
                        max_completion_tokens: 1000,
                        ...customParams
                    }
                }
            }
        };

        // Add TTS configuration based on vendor
        if (formData.vendor === "microsoft") {
            config.properties.tts = {
                vendor: "microsoft",
                params: {
                    key: formData.ttsKey,
                    region: document.getElementById("ttsRegion").value,
                    voice_name: document.getElementById("microsoftVoiceSelect").value,
                    rate: 1,
                    volume: 70
                }
            };
        } else {
            const modelId = document.getElementById("elevenLabsModelId").value;
            const voiceSel = document.getElementById("elevenLabsVoiceSelect").value;
            const finalVoiceId = voiceSel === "other" 
                ? document.getElementById("elevenLabsVoiceId").value.trim()
                : voiceSel;

            config.properties.tts = {
                vendor: "elevenlabs",
                params: {
                    key: formData.ttsKey,
                    model_id: modelId,
                    voice_id: finalVoiceId,
                }
            };
        }

        return config;
    }
} 