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
        const ttsVendor = document.getElementById("ttsVendor").value;
        let ttsKey = "";
        
        // Get the appropriate TTS key based on vendor
        if (ttsVendor === "microsoft") {
            ttsKey = document.getElementById("ttsKey").value.trim();
        } else if (ttsVendor === "elevenlabs") {
            ttsKey = document.getElementById("elevenLabsTtsKey").value.trim();
        } else if (ttsVendor === "cartesia") {
            ttsKey = document.getElementById("cartesiaTtsKey").value.trim();
        } else if (ttsVendor === "openai") {
            ttsKey = document.getElementById("openaiTtsKey").value.trim();
        }

        // Get new v1.6 fields
        const remoteRtcUids = document.getElementById("remoteRtcUids").value.trim();
        const idleTimeout = document.getElementById("idleTimeout").value.trim();
        
        // Get advanced features
        const enableAivad = document.getElementById("enableAivad").checked;
        const enableMllm = document.getElementById("enableMllm").checked;
        const enableRtm = document.getElementById("enableRtm").checked;
        
        // Get turn detection settings
        const turnDetectionEnabled = document.getElementById("turnDetectionEnabled").checked;
        const turnDetectionType = document.getElementById("turnDetectionType").value;
        const turnInterruptMode = document.getElementById("interruptMode").value;
        const turnInterruptDuration = document.getElementById("turnInterruptDuration").value || null;
        const turnPrefixPadding = document.getElementById("turnPrefixPadding").value || null;
        const turnSilenceDuration = document.getElementById("turnSilenceDuration").value || null;
        const turnThreshold = document.getElementById("turnThreshold").value || null;
        const turnCreateResponse = document.getElementById("turnCreateResponse").value === "true";
        const turnInterruptResponse = document.getElementById("turnInterruptResponse").value === "true";
        const turnEagerness = document.getElementById("turnEagerness").value;
        
        // Get parameters settings
        const parametersEnabled = document.getElementById("parametersEnabled").checked;
        const silenceTimeout = document.getElementById("silenceTimeout").value || null;
        const silenceAction = document.getElementById("silenceAction").value;
        const silenceContent = document.getElementById("silenceContent").value || null;
        const dataChannel = document.getElementById("dataChannel").value;
        const enableMetrics = document.getElementById("enableMetrics").checked;
        const enableErrorMessage = document.getElementById("enableErrorMessage").checked;
        // Transcript config
        const transcriptEnableSet = document.getElementById("transcriptEnableSet").checked;
        const transcriptEnable = document.getElementById("transcriptEnable").value === 'true';
        const transcriptProtocolVersionSet = document.getElementById("transcriptProtocolVersionSet").checked;
        const transcriptProtocolVersion = document.getElementById("transcriptProtocolVersion").value;
        const transcriptEnableWordsSet = document.getElementById("transcriptEnableWordsSet").checked;
        const transcriptEnableWords = document.getElementById("transcriptEnableWords").value === 'true';
        const transcriptRedundantSet = document.getElementById("transcriptRedundantSet").checked;
        const transcriptRedundant = document.getElementById("transcriptRedundant").value === 'true';
        
        // Get MLLM settings
        const mllmUrl = document.getElementById("mllmUrl").value.trim();
        const mllmApiKey = document.getElementById("mllmApiKey").value.trim();
        const mllmGreetingMessage = document.getElementById("mllmGreetingMessage").value.trim();
        const mllmVendor = document.getElementById("mllmVendor").value;
        const mllmStyle = document.getElementById("mllmStyle").value;
        const mllmMaxHistory = document.getElementById("mllmMaxHistory").value || null;
        
        // Get input/output modalities
        const inputModalities = [
            ...(document.getElementById("inputText").checked ? ["text"] : []),
            ...(document.getElementById("inputAudio").checked ? ["audio"] : []),
            ...(document.getElementById("inputImage").checked ? ["image"] : [])
        ];
        
        const outputModalities = [
            ...(document.getElementById("outputText").checked ? ["text"] : []),
            ...(document.getElementById("outputAudio").checked ? ["audio"] : [])
        ];

        return {
            uniqueName: document.getElementById("uniqueName").value.trim(),
            channel: document.getElementById("agoraChannelName").value.trim(),
            rtcUid: document.getElementById("agoraRtcUid").value.trim(),
            token: document.getElementById("agoraRtcToken").value.trim(),
            remoteRtcUids: remoteRtcUids,
            idleTimeout: idleTimeout,
            llmApiKey: document.getElementById("llmApiKey").value.trim(),
            llmUrl: document.getElementById("llmUrl").value.trim(),
            ttsKey: ttsKey,
            gMsg: document.getElementById("gMsg").value.trim(),
            fMsg: document.getElementById("fMsg").value.trim(),
            sMsgContent: document.getElementById("sMsgContent").value.trim(),
            asrVendor: document.getElementById("asrVendor").value,
            vendor: ttsVendor,
            isStringUid: document.getElementById('enableStringUid').checked,
            llmModel: document.getElementById("llmModel").value,
            inputModalities: inputModalities,
            outputModalities: outputModalities,
            
            // Advanced features
            enableAivad: enableAivad,
            enableMllm: enableMllm,
            enableRtm: enableRtm,
            // RTM UID
            agentRtmUid: document.getElementById('agentRtmUid') ? document.getElementById('agentRtmUid').value.trim() : '',
            
            // MLLM settings
            mllmUrl: mllmUrl,
            mllmApiKey: mllmApiKey,
            mllmGreetingMessage: mllmGreetingMessage,
            mllmVendor: mllmVendor,
            mllmStyle: mllmStyle,
            mllmMaxHistory: mllmMaxHistory,
            
            // Turn detection
            turnDetectionEnabled: turnDetectionEnabled,
            turnDetectionType: turnDetectionType,
            turnInterruptMode: turnInterruptMode,
            turnInterruptDuration: turnInterruptDuration,
            turnPrefixPadding: turnPrefixPadding,
            turnSilenceDuration: turnSilenceDuration,
            turnThreshold: turnThreshold,
            turnCreateResponse: turnCreateResponse,
            turnInterruptResponse: turnInterruptResponse,
            turnEagerness: turnEagerness,
            
            // Parameters
            parametersEnabled: parametersEnabled,
            silenceTimeout: silenceTimeout,
            silenceAction: silenceAction,
            silenceContent: silenceContent,
            dataChannel: dataChannel,
            enableMetrics: enableMetrics,
            enableErrorMessage: enableErrorMessage,
            // Transcript config
            transcriptEnableSet: transcriptEnableSet,
            transcriptEnable: transcriptEnable,
            transcriptProtocolVersionSet: transcriptProtocolVersionSet,
            transcriptProtocolVersion: transcriptProtocolVersion,
            transcriptEnableWordsSet: transcriptEnableWordsSet,
            transcriptEnableWords: transcriptEnableWords,
            transcriptRedundantSet: transcriptRedundantSet,
            transcriptRedundant: transcriptRedundant
        };
    }

    static validateFormData(data) {
        const required = ['uniqueName', 'channel', 'rtcUid', 'remoteRtcUids'];
        const missing = required.filter(field => !data[field]);
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        // Validate MLLM configuration if enabled
        if (data.enableMllm) {
            if (!data.mllmUrl) {
                throw new Error('MLLM URL is required when MLLM is enabled');
            }
            if (!data.mllmApiKey) {
                throw new Error('MLLM API Key is required when MLLM is enabled');
            }
        } else {
            // Validate LLM configuration if MLLM is not enabled
            if (!data.llmApiKey) {
                throw new Error('LLM API Key is required');
            }
            if (!data.llmUrl) {
                throw new Error('LLM URL is required');
            }

            // Validate TTS configuration based on vendor
            const ttsVendor = data.vendor;
            if (ttsVendor === 'microsoft') {
                if (!data.ttsKey) {
                    throw new Error('Microsoft TTS Key is required');
                }
            } else if (ttsVendor === 'elevenlabs') {
                const elevenLabsTtsKey = document.getElementById('elevenLabsTtsKey').value.trim();
                const elevenLabsModelId = document.getElementById('elevenLabsModelId').value.trim();
                const elevenLabsVoiceSelect = document.getElementById('elevenLabsVoiceSelect').value;
                const elevenLabsVoiceId = document.getElementById('elevenLabsVoiceId').value.trim();
                
                if (!elevenLabsTtsKey) {
                    throw new Error('ElevenLabs TTS Key is required');
                }
                if (!elevenLabsModelId) {
                    throw new Error('ElevenLabs Model ID is required');
                }
                if (elevenLabsVoiceSelect === 'other' && !elevenLabsVoiceId) {
                    throw new Error('ElevenLabs Voice ID is required when "Other" is selected');
                }
            } else if (ttsVendor === 'cartesia') {
                const cartesiaTtsKey = document.getElementById('cartesiaTtsKey').value.trim();
                const cartesiaModelId = document.getElementById('cartesiaModelId').value.trim();
                const cartesiaVoiceId = document.getElementById('cartesiaVoiceId').value.trim();
                
                if (!cartesiaTtsKey) {
                    throw new Error('Cartesia API Key is required');
                }
                if (!cartesiaModelId) {
                    throw new Error('Cartesia Model ID is required');
                }
                if (!cartesiaVoiceId) {
                    throw new Error('Cartesia Voice ID is required');
                }
            } else if (ttsVendor === 'openai') {
                const openaiTtsKey = document.getElementById('openaiTtsKey').value.trim();
                const openaiModel = document.getElementById('openaiModel').value.trim();
                const openaiVoice = document.getElementById('openaiVoice').value.trim();
                
                if (!openaiTtsKey) {
                    throw new Error('OpenAI API Key is required');
                }
                if (!openaiModel) {
                    throw new Error('OpenAI Model is required');
                }
                if (!openaiVoice) {
                    throw new Error('OpenAI Voice is required');
                }
            }

            // Validate ASR configuration based on vendor
            const asrVendor = data.asrVendor;
            if (asrVendor === 'microsoft') {
                const microsoftAsrKey = document.getElementById('microsoftAsrKey').value.trim();
                const microsoftAsrLang = document.getElementById('microsoftAsrLangSelect').value;
                if (!microsoftAsrKey) {
                    throw new Error('Microsoft ASR Key is required');
                }
                if (!microsoftAsrLang) {
                    throw new Error('Microsoft ASR Language is required');
                }
            } else if (asrVendor === 'deepgram') {
                const deepgramAsrUrl = document.getElementById('deepgramAsrUrl').value.trim();
                const deepgramAsrKey = document.getElementById('deepgramAsrKey').value.trim();
                const deepgramAsrModel = document.getElementById('deepgramAsrModel').value.trim();
                const deepgramAsrLang = document.getElementById('deepgramAsrLang').value.trim();
                if (!deepgramAsrUrl) {
                    throw new Error('Deepgram ASR URL is required');
                }
                if (!deepgramAsrKey) {
                    throw new Error('Deepgram ASR Key is required');
                }
                if (!deepgramAsrModel) {
                    throw new Error('Deepgram ASR Model is required');
                }
                if (!deepgramAsrLang) {
                    throw new Error('Deepgram ASR Language is required');
                }
            }
        }

        // Validate turn detection configuration
        if (data.turnDetectionEnabled) {
            if (data.turnDetectionType === 'server_vad' || data.turnDetectionType === 'semantic_vad') {
                if (!data.enableMllm) {
                    throw new Error(`${data.turnDetectionType} is only available when MLLM is enabled`);
                }
            }
        }

        // Validate parameters configuration
        if (data.parametersEnabled) {
            if (data.silenceTimeout && data.silenceTimeout !== "0") {
                if (!data.silenceContent) {
                    throw new Error('Silence content is required when silence timeout is enabled');
                }
            }
            if (data.dataChannel === 'rtm' && !data.enableRtm) {
                throw new Error('RTM must be enabled to use RTM data channel');
            }
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

    static buildAsrConfig(formData) {
        const vendor = formData.asrVendor;
        
        if (vendor === 'ares') {
            return {
                vendor: 'ares',
                language: document.getElementById('agoraAsrLang').value
            };
        } else if (vendor === 'microsoft') {
            return {
                vendor: 'microsoft',
                params: {
                    key: document.getElementById('microsoftAsrKey').value,
                    region: document.getElementById('microsoftAsrRegion').value,
                    language: document.getElementById('microsoftAsrLangSelect').value
                }
            };
        } else if (vendor === 'deepgram') {
            return {
                vendor: 'deepgram',
                params: {
                    url: document.getElementById('deepgramAsrUrl').value,
                    key: document.getElementById('deepgramAsrKey').value,
                    model: document.getElementById('deepgramAsrModel').value,
                    language: document.getElementById('deepgramAsrLang').value
                }
            };
        }
        
        // Default to ARES if vendor is not recognized
        return {
            vendor: 'ares',
            language: document.getElementById('agoraAsrLang').value
        };
    }

    static buildAgentConfig(formData, customParams) {
        // Parse remote RTC UIDs
        let remoteRtcUids = ["*"];
        if (formData.remoteRtcUids && formData.remoteRtcUids.trim() !== "*") {
            remoteRtcUids = formData.remoteRtcUids.split(',').map(uid => uid.trim());
        }

        // Parse idle timeout
        const idleTimeout = formData.idleTimeout ? parseInt(formData.idleTimeout, 10) : 30;

        // Prepare advanced features
        const advancedFeatures = {};
        if (formData.enableAivad) {
            advancedFeatures.enable_aivad = true;
        }
        if (formData.enableMllm) {
            advancedFeatures.enable_mllm = true;
        }
        if (formData.enableRtm) {
            advancedFeatures.enable_rtm = true;
        }

        // Prepare turn detection config
        let turnDetection = null;
        if (formData.turnDetectionEnabled) {
            turnDetection = {
                type: formData.turnDetectionType,
                interrupt_mode: formData.turnInterruptMode
            };
            
            // Add VAD parameters if they have values
            if (formData.turnInterruptDuration) {
                turnDetection.interrupt_duration_ms = parseFloat(formData.turnInterruptDuration);
            }
            if (formData.turnPrefixPadding) {
                turnDetection.prefix_padding_ms = parseInt(formData.turnPrefixPadding, 10);
            }
            if (formData.turnSilenceDuration) {
                turnDetection.silence_duration_ms = parseInt(formData.turnSilenceDuration, 10);
            }
            if (formData.turnThreshold) {
                turnDetection.threshold = parseFloat(formData.turnThreshold);
            }
            
            // Add MLLM-specific parameters
            if (formData.turnDetectionType === 'server_vad' || formData.turnDetectionType === 'semantic_vad') {
                turnDetection.create_response = formData.turnCreateResponse;
                turnDetection.interrupt_response = formData.turnInterruptResponse;
            }
            if (formData.turnDetectionType === 'semantic_vad') {
                turnDetection.eagerness = formData.turnEagerness;
            }
        }

        // Prepare parameters config
        let parameters = null;
        if (formData.parametersEnabled) {
            parameters = {
                data_channel: formData.dataChannel
            };
            
            // Add silence config if enabled
            if (formData.silenceTimeout && formData.silenceTimeout !== "0") {
                parameters.silence_config = {
                    timeout_ms: parseInt(formData.silenceTimeout, 10),
                    action: formData.silenceAction,
                    content: formData.silenceContent
                };
            }
            
            // Add RTM metrics if RTM is enabled
            if (formData.enableRtm) {
                if (formData.enableMetrics) {
                    parameters.enable_metrics = true;
                }
                if (formData.enableErrorMessage) {
                    parameters.enable_error_message = true;
                }
            }
            // Add transcript config if any field is set
            const transcript = {};
            if (formData.transcriptEnableSet) transcript.enable = formData.transcriptEnable;
            if (formData.transcriptProtocolVersionSet) transcript.protocol_version = formData.transcriptProtocolVersion;
            if (formData.transcriptEnableWordsSet) transcript.enable_words = formData.transcriptEnableWords;
            if (formData.transcriptRedundantSet) transcript.redundant = formData.transcriptRedundant;
            if (Object.keys(transcript).length > 0) {
                parameters.transcript = transcript;
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
                remote_rtc_uids: remoteRtcUids,
                enable_string_uid: formData.isStringUid,
                idle_timeout: idleTimeout,
                ...(formData.enableRtm && formData.agentRtmUid ? { agent_rtm_uid: formData.agentRtmUid } : {}),
                ...(Object.keys(advancedFeatures).length > 0 ? { advanced_features: advancedFeatures } : {}),
                ...(formData.enableMllm ? {} : { asr: this.buildAsrConfig(formData) }), // Only include ASR if MLLM is not enabled
                ...(turnDetection ? { turn_detection: turnDetection } : {}),
                ...(parameters ? { parameters: parameters } : {}),
                ...(formData.enableMllm ? {} : { // Only include LLM/TTS if MLLM is not enabled
                    llm: {
                        url: formData.llmUrl,
                        api_key: formData.llmApiKey,
                        system_messages: systemMessages,
                        greeting_message: formData.gMsg,
                        failure_message: formData.fMsg,
                        max_history: 32,
                        input_modalities: formData.inputModalities,
                        output_modalities: formData.outputModalities,
                        params: {
                            model: formData.llmModel,
                            ...customParams
                        }
                    }
                }),
                ...(formData.enableMllm ? { // Include MLLM if enabled
                    mllm: {
                        url: formData.mllmUrl,
                        api_key: formData.mllmApiKey,
                        ...(formData.mllmGreetingMessage ? { greeting_message: formData.mllmGreetingMessage } : {}),
                        ...(formData.mllmVendor ? { vendor: formData.mllmVendor } : {}),
                        ...(formData.mllmStyle ? { style: formData.mllmStyle } : {}),
                        ...(formData.mllmMaxHistory ? { max_history: parseInt(formData.mllmMaxHistory, 10) } : {}),
                        input_modalities: ["text", "audio"], // MLLM always uses text and audio
                        output_modalities: ["text", "audio"], // MLLM always outputs text and audio
                        ...(Object.keys(customParams).length > 0 ? { params: customParams } : {}) // Only include params if customParams is not empty
                    }
                } : {}),
                //add chorus scenario for websdk fix for now
                parameters: {
                    audio_scenario: "chorus"
                }
            }
        };

        // Add TTS configuration based on vendor (only if MLLM is not enabled)
        if (!formData.enableMllm) {
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
            } else if (formData.vendor === "elevenlabs") {
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
            } else if (formData.vendor === "cartesia") {
                config.properties.tts = {
                    vendor: "cartesia",
                    params: {
                        api_key: document.getElementById("cartesiaTtsKey").value,
                        model_id: document.getElementById("cartesiaModelId").value,
                        voice: {
                            mode: "id",
                            id: document.getElementById("cartesiaVoiceId").value
                        },
                        ...(skipPatterns ? { skipPatterns } : {})
                    }
                };
            } else if (formData.vendor === "openai") {
                config.properties.tts = {
                    vendor: "openai",
                    params: {
                        api_key: document.getElementById("openaiTtsKey").value,
                        model: document.getElementById("openaiModel").value,
                        voice: document.getElementById("openaiVoice").value,
                        ...(document.getElementById("openaiInstructions")?.value ? { instructions: document.getElementById("openaiInstructions").value } : {}),
                        ...(document.getElementById("openaiSpeed")?.value ? { speed: parseFloat(document.getElementById("openaiSpeed").value) } : {}),
                        ...(skipPatterns ? { skipPatterns } : {})
                    }
                };
            }
        }

        return config;
    }
} 