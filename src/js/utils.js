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
            llmModel: document.getElementById("llmModel").value,
            inputModalities: [
                "text",
                ...(document.getElementById("inputImage").checked ? ["image"] : [])
            ],
            outputModalities: [
                ...(document.getElementById("outputText").checked ? ["text"] : []),
                ...(document.getElementById("outputAudio").checked ? ["audio"] : [])
            ],
            vadEnabled: document.getElementById("vadEnabled").checked,
            turnDetectionEnabled: document.getElementById("turnDetectionEnabled").checked,
            parametersEnabled: document.getElementById("parametersEnabled").checked,
            vadConfig: {
                interrupt_duration_ms: document.getElementById("vadInterruptDuration").value || null,
                prefix_padding_ms: document.getElementById("vadPrefixPadding").value || null,
                silence_duration_ms: document.getElementById("vadSilenceDuration").value || null,
                threshold: document.getElementById("vadThreshold").value || null
            },
            turnDetection: {
                interrupt_mode: document.getElementById("interruptMode").value
            },
            parameters: {
                silence_config: {
                    timeout_ms: document.getElementById("silenceTimeout").value || null,
                    action: document.getElementById("silenceAction").value,
                    content: document.getElementById("silenceContent").value || null
                }
            }
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
        // Prepare VAD config: only include fields with values, always send silence_duration_ms
        let vad = { silence_duration_ms: 480 };
        if (formData.vadEnabled) {
            if (formData.vadConfig.interrupt_duration_ms !== null && formData.vadConfig.interrupt_duration_ms !== "") {
                vad.interrupt_duration_ms = parseInt(formData.vadConfig.interrupt_duration_ms, 10);
            }
            if (formData.vadConfig.prefix_padding_ms !== null && formData.vadConfig.prefix_padding_ms !== "") {
                vad.prefix_padding_ms = parseInt(formData.vadConfig.prefix_padding_ms, 10);
            }
            if (formData.vadConfig.silence_duration_ms !== null && formData.vadConfig.silence_duration_ms !== "") {
                vad.silence_duration_ms = parseInt(formData.vadConfig.silence_duration_ms, 10);
            }
            if (formData.vadConfig.threshold !== null && formData.vadConfig.threshold !== "") {
                vad.threshold = parseFloat(formData.vadConfig.threshold);
            }
        }

        // Prepare system messages
        const systemMessages = [
            { role: "system", content: formData.sMsgContent }
        ];

        // Add image handling system message if image input is enabled
        if (formData.inputModalities.includes("image")) {
            systemMessages.push({
                role: "system",
                content: "We will be sending you images so when you receive an image and the user specifically asks about it, comment on it based on the request from the user"
            });
        }

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
                vad,
                ...(formData.turnDetectionEnabled ? { turn_detection: formData.turnDetection } : {}),
                ...(formData.parametersEnabled ? { parameters: formData.parameters } : {}),
                llm: {
                    url: formData.llmUrl,
                    api_key: formData.llmApiKey,
                    system_messages: systemMessages,
                    greeting_message: formData.gMsg,
                    failure_message: formData.fMsg,
                    max_history: 10,
                    input_modalities: formData.inputModalities,
                    output_modalities: formData.outputModalities,
                    params: {
                        model: formData.llmModel,
                        max_completion_tokens: 1000,
                        ...customParams
                    }
                }
            }
        };

        // Add TTS configuration based on vendor
        // Handle skipPatterns logic
        const skipPatternsSelect = document.getElementById("skipPatterns");
        let skipPatterns = Array.from(skipPatternsSelect.selectedOptions).map(opt => opt.value).filter(v => v !== "");
        if (skipPatterns.length === 0) skipPatterns = null;
        else skipPatterns = skipPatterns.map(Number);

        if (formData.vendor === "microsoft") {
            config.properties.tts = {
                vendor: "microsoft",
                params: {
                    key: formData.ttsKey,
                    region: document.getElementById("ttsRegion").value,
                    voice_name: document.getElementById("microsoftVoiceSelect").value,
                    ...(document.getElementById("microsoftRate")?.value ? { rate: parseFloat(document.getElementById("microsoftRate").value) } : {}),
                    ...(document.getElementById("microsoftSpeed")?.value ? { speed: parseFloat(document.getElementById("microsoftSpeed").value) } : {}),
                    ...(document.getElementById("microsoftVolume")?.value ? { volume: parseFloat(document.getElementById("microsoftVolume").value) } : {}),
                    ...(document.getElementById("microsoftSampleRate")?.value ? { sample_rate: parseInt(document.getElementById("microsoftSampleRate").value, 10) } : {}),
                    ...(skipPatterns ? { skipPatterns } : {})
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
                    key: document.getElementById("elevenLabsTtsKey").value,
                    model_id: modelId,
                    voice_id: finalVoiceId,
                    ...(document.getElementById("elevenLabsSampleRate")?.value ? { sample_rate: parseInt(document.getElementById("elevenLabsSampleRate").value, 10) } : {}),
                    ...(document.getElementById("elevenLabsStability")?.value ? { stability: parseFloat(document.getElementById("elevenLabsStability").value) } : {}),
                    ...(document.getElementById("elevenLabsSimilarityBoost")?.value ? { similarity_boost: parseFloat(document.getElementById("elevenLabsSimilarityBoost").value) } : {}),
                    ...(document.getElementById("elevenLabsStyle")?.value ? { style: parseFloat(document.getElementById("elevenLabsStyle").value) } : {}),
                    ...(document.getElementById("elevenLabsUseSpeakerBoost")?.checked ? { use_speaker_boost: true } : {}),
                    ...(skipPatterns ? { skipPatterns } : {})
                }
            };
        }

        return config;
    }
} 