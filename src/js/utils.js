// Utilities Module
window.Utils = class Utils {
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
        } else if (ttsVendor === "rime") {
            ttsKey = document.getElementById("rimeTtsKey") ? document.getElementById("rimeTtsKey").value.trim() : '';
        // } else if (ttsVendor === "minimax") { // COMMENTED OUT: Not in Agora 2.0 official docs
        //     ttsKey = document.getElementById("minimaxTtsKey") ? document.getElementById("minimaxTtsKey").value.trim() : '';
        } else if (ttsVendor === "fishaudio") {
            ttsKey = document.getElementById("fishaudioTtsKey") ? document.getElementById("fishaudioTtsKey").value.trim() : '';
        } else if (ttsVendor === "groq") {
            ttsKey = document.getElementById("groqTtsKey") ? document.getElementById("groqTtsKey").value.trim() : '';
        } else if (ttsVendor === "google") {
            ttsKey = document.getElementById("googleTtsCredentials") ? document.getElementById("googleTtsCredentials").value.trim() : '';
        // } else if (ttsVendor === "playht") { // COMMENTED OUT: Not in Agora 2.0 official docs
        //     ttsKey = document.getElementById("playhtTtsKey") ? document.getElementById("playhtTtsKey").value.trim() : '';
        } else if (ttsVendor === "amazon") {
            // Amazon Polly uses access key and secret key, not a single ttsKey
            // We'll handle this in buildAgentConfig
            ttsKey = '';
        }

        // Get new v1.6 fields
        const remoteRtcUids = document.getElementById("remoteRtcUids").value.trim();
        const idleTimeout = document.getElementById("idleTimeout").value.trim();
        
        // Get advanced features
        const enableAivad = document.getElementById("enableAivad").checked;
        const enableMllm = document.getElementById("enableMllm").checked;
        const enableRtm = document.getElementById("enableRtm").checked;
        const enableSal = document.getElementById("enableSal") ? document.getElementById("enableSal").checked : false;
        
        // Get turn detection settings
        const turnDetectionEnabled = document.getElementById("turnDetectionEnabled").checked;
        const turnDetectionType = document.getElementById("turnDetectionType").value;
        const turnInterruptMode = document.getElementById("interruptMode").value;
        const turnInterruptKeywords = document.getElementById("interruptKeywords") ? document.getElementById("interruptKeywords").value.trim() : '';
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
        // Farewell config
        const farewellGracefulEnabled = document.getElementById("farewellGracefulEnabled") ? document.getElementById("farewellGracefulEnabled").checked : false;
        const farewellGracefulTimeout = document.getElementById("farewellGracefulTimeout") ? document.getElementById("farewellGracefulTimeout").value || null : null;
        // SAL config
        const salMode = document.getElementById("salMode") ? document.getElementById("salMode").value : null;
        const salSampleUrls = document.getElementById("salSampleUrls") ? document.getElementById("salSampleUrls").value.trim() : '';
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
        
        // Get Vertex AI specific settings
        const vertexaiAdcCredentials = document.getElementById("vertexaiAdcCredentials") ? document.getElementById("vertexaiAdcCredentials").value.trim() : '';
        const vertexaiProjectId = document.getElementById("vertexaiProjectId") ? document.getElementById("vertexaiProjectId").value.trim() : '';
        const vertexaiLocation = document.getElementById("vertexaiLocation") ? document.getElementById("vertexaiLocation").value.trim() : '';
        const vertexaiModel = document.getElementById("vertexaiModel") ? document.getElementById("vertexaiModel").value.trim() : '';
        const vertexaiVoice = document.getElementById("vertexaiVoice") ? document.getElementById("vertexaiVoice").value.trim() : '';
        const vertexaiInstructions = document.getElementById("vertexaiInstructions") ? document.getElementById("vertexaiInstructions").value.trim() : '';
        
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

        // Get AI Avatar settings
        const enableAvatar = document.getElementById("enableAvatar").checked;
        const avatarVendor = document.getElementById("avatarVendor").value;
        const avatarApiKey = document.getElementById("avatarApiKey").value.trim();
        const avatarId = document.getElementById("avatarId").value.trim();
        const avatarRtcUid = document.getElementById("avatarRtcUid").value.trim();
        const avatarRtcToken = document.getElementById("avatarRtcToken").value.trim();
        const heygenQuality = document.getElementById("heygenQuality").value;
        const heygenDisableIdleTimeout = document.getElementById("heygenDisableIdleTimeout").checked;
        const heygenActivityIdleTimeout = document.getElementById("heygenActivityIdleTimeout").value || null;

        return {
            uniqueName: document.getElementById("uniqueName").value.trim(),
            channel: document.getElementById("agoraChannelName").value.trim(),
            rtcUid: document.getElementById("agoraRtcUid").value.trim(),
            token: document.getElementById("agoraRtcToken").value.trim(),
            remoteRtcUids: remoteRtcUids,
            idleTimeout: idleTimeout,
            llmApiKey: document.getElementById("llmApiKey").value.trim(),
            llmUrl: document.getElementById("llmUrl").value.trim(),
            llmAccessKey: document.getElementById("llmAccessKey") ? document.getElementById("llmAccessKey").value.trim() : '',
            llmSecret: document.getElementById("llmSecret") ? document.getElementById("llmSecret").value.trim() : '',
            llmHeaders: document.getElementById("llmHeaders") ? document.getElementById("llmHeaders").value.trim() : '',
            llmVendor: document.getElementById("llmVendor") ? document.getElementById("llmVendor").value.trim() : '',
            llmStyle: document.getElementById("llmStyle") ? document.getElementById("llmStyle").value.trim() : '',
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
            enableSal: enableSal,
            // RTM UID
            agentRtmUid: document.getElementById('agentRtmUid') ? document.getElementById('agentRtmUid').value.trim() : '',
            
            // MLLM settings
            mllmUrl: mllmUrl,
            mllmApiKey: mllmApiKey,
            mllmGreetingMessage: mllmGreetingMessage,
            mllmVendor: mllmVendor,
            mllmStyle: mllmStyle,
            mllmMaxHistory: mllmMaxHistory,
            
            // Vertex AI settings
            vertexaiAdcCredentials: vertexaiAdcCredentials,
            vertexaiProjectId: vertexaiProjectId,
            vertexaiLocation: vertexaiLocation,
            vertexaiModel: vertexaiModel,
            vertexaiVoice: vertexaiVoice,
            vertexaiInstructions: vertexaiInstructions,
            
            // Turn detection
            turnDetectionEnabled: turnDetectionEnabled,
            turnDetectionType: turnDetectionType,
            turnInterruptMode: turnInterruptMode,
            turnInterruptKeywords: turnInterruptKeywords,
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
            farewellGracefulEnabled: farewellGracefulEnabled,
            farewellGracefulTimeout: farewellGracefulTimeout,
            // SAL config
            salMode: salMode,
            salSampleUrls: salSampleUrls,
            // Transcript config
            transcriptEnableSet: transcriptEnableSet,
            transcriptEnable: transcriptEnable,
            transcriptProtocolVersionSet: transcriptProtocolVersionSet,
            transcriptProtocolVersion: transcriptProtocolVersion,
            transcriptEnableWordsSet: transcriptEnableWordsSet,
            transcriptEnableWords: transcriptEnableWords,
            transcriptRedundantSet: transcriptRedundantSet,
            transcriptRedundant: transcriptRedundant,
            // AI Avatar settings
            enableAvatar: enableAvatar,
            avatarVendor: avatarVendor,
            avatarApiKey: avatarApiKey,
            avatarId: avatarId,
            avatarRtcUid: avatarRtcUid,
            avatarRtcToken: avatarRtcToken,
            heygenQuality: heygenQuality,
            heygenDisableIdleTimeout: heygenDisableIdleTimeout,
            heygenActivityIdleTimeout: heygenActivityIdleTimeout
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
            // AI Avatar is not compatible with MLLM
            if (data.enableAvatar) {
                throw new Error('AI Avatar is not compatible with MLLM. Please disable one of them.');
            }
        } else {
            // Validate AI Avatar configuration if enabled
            if (data.enableAvatar) {
                if (!data.avatarApiKey) {
                    throw new Error('Avatar API Key is required when AI Avatar is enabled');
                }
                if (!data.avatarId) {
                    throw new Error('Avatar ID is required when AI Avatar is enabled');
                }
                if (!data.avatarRtcUid) {
                    throw new Error('Avatar RTC UID is required when AI Avatar is enabled');
                }
                // Avatar RTC Token is optional - no validation needed since it's already trimmed
                
                // AI Avatar requires TTS to be enabled
                const ttsVendor = data.vendor;
                if (!ttsVendor) {
                    throw new Error('TTS vendor is required when AI Avatar is enabled');
                }
                
                // AI Avatar requires client UID to be set
                const clientRtcUid = document.getElementById('clientRtcUid').value.trim();
                if (!clientRtcUid) {
                    throw new Error('Client RTC UID is required when AI Avatar is enabled');
                }
                
                // AI Avatar requires remote RTC UIDs to not be "*"
                const remoteRtcUids = data.remoteRtcUids;
                if (remoteRtcUids === '*' || remoteRtcUids === '') {
                    throw new Error('Remote RTC UIDs cannot be "*" when AI Avatar is enabled. Please set specific UIDs.');
                }
            }
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
                const microsoftAsrRegion = document.getElementById('microsoftAsrRegion').value.trim();
                const asrLanguage = document.getElementById('asrLanguage').value;
                if (!microsoftAsrKey) {
                    throw new Error('Microsoft ASR Key is required');
                }
                if (!microsoftAsrRegion) {
                    throw new Error('Microsoft ASR Region is required');
                }
                if (!asrLanguage) {
                    throw new Error('ASR Language is required');
                }
            } else if (asrVendor === 'deepgram') {
                const deepgramAsrUrl = document.getElementById('deepgramAsrUrl').value.trim();
                const deepgramAsrKey = document.getElementById('deepgramAsrKey').value.trim();
                const asrLanguage = document.getElementById('asrLanguage').value.trim();
                if (!deepgramAsrKey) {
                    throw new Error('Deepgram ASR Key is required');
                }
                if (!asrLanguage) {
                    throw new Error('ASR Language is required');
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
        const asrLanguage = document.getElementById('asrLanguage').value;
        
        if (vendor === 'ares') {
            return {
                vendor: 'ares',
                language: asrLanguage
            };
        } else if (vendor === 'microsoft') {
            const microsoftAsrKey = document.getElementById('microsoftAsrKey').value;
            const microsoftAsrRegion = document.getElementById('microsoftAsrRegion').value;
            const microsoftAsrPhraseList = document.getElementById('microsoftAsrPhraseList').value.trim();
            
            const params = {
                key: microsoftAsrKey,
                region: microsoftAsrRegion,
                language: asrLanguage
            };
            
            // Add phrase list if provided and language supports it
            if (microsoftAsrPhraseList) {
                // Check if the language supports phrase lists
                const phraseListSupportedLanguages = [
                    'ar-SA', 'de-CH', 'de-DE', 'en-AU', 'en-CA', 'en-GB', 'en-IE', 'en-IN', 'en-US', 'en-ZA'
                ];
                
                if (phraseListSupportedLanguages.includes(asrLanguage)) {
                    params.phrase_list = microsoftAsrPhraseList.split(',').map(phrase => phrase.trim()).filter(phrase => phrase.length > 0);
                }
            }
            
            return {
                vendor: 'microsoft',
                params: params
            };
        } else if (vendor === 'deepgram') {
            const deepgramAsrUrl = document.getElementById('deepgramAsrUrl').value;
            const deepgramAsrKey = document.getElementById('deepgramAsrKey').value;
            const deepgramAsrModel = document.getElementById('deepgramAsrModel').value.trim();
            
            const params = {
                url: deepgramAsrUrl,
                key: deepgramAsrKey,
                language: asrLanguage
            };
            
            // Add model if provided
            if (deepgramAsrModel) {
                params.model = deepgramAsrModel;
            }
            
            return {
                vendor: 'deepgram',
                params: params
            };
        } else if (vendor === 'openai') {
            const openaiAsrKey = document.getElementById('openaiAsrKey').value.trim();
            
            return {
                vendor: 'openai',
                params: {
                    api_key: openaiAsrKey
                },
                language: asrLanguage
            };
        } else if (vendor === 'speechmatics') {
            const speechmaticsAsrKey = document.getElementById('speechmaticsAsrKey').value.trim();
            const speechmaticsAsrLanguage = document.getElementById('speechmaticsAsrLanguage').value.trim();
            
            return {
                vendor: 'speechmatics',
                params: {
                    api_key: speechmaticsAsrKey,
                    language: speechmaticsAsrLanguage
                }
            };
        } else if (vendor === 'assemblyai') {
            const assemblyaiAsrKey = document.getElementById('assemblyaiAsrKey').value.trim();
            const assemblyaiAsrLanguage = document.getElementById('assemblyaiAsrLanguage').value.trim();
            
            return {
                vendor: 'assemblyai',
                params: {
                    api_key: assemblyaiAsrKey,
                    language: assemblyaiAsrLanguage
                }
            };
        } else if (vendor === 'amazon') {
            const amazonAsrRegion = document.getElementById('amazonAsrRegion').value.trim();
            const amazonAsrAccessKeyId = document.getElementById('amazonAsrAccessKeyId').value.trim();
            const amazonAsrSecretAccessKey = document.getElementById('amazonAsrSecretAccessKey').value.trim();
            const amazonAsrLanguageCode = document.getElementById('amazonAsrLanguageCode').value.trim();
            const amazonAsrMediaSampleRateHz = document.getElementById('amazonAsrMediaSampleRateHz').value.trim();
            const amazonAsrMediaEncoding = document.getElementById('amazonAsrMediaEncoding').value;
            
            const params = {
                region: amazonAsrRegion,
                access_key_id: amazonAsrAccessKeyId,
                secret_access_key: amazonAsrSecretAccessKey,
                language_code: amazonAsrLanguageCode
            };
            
            // Add optional parameters if provided
            if (amazonAsrMediaSampleRateHz) {
                params.media_sample_rate_hz = parseInt(amazonAsrMediaSampleRateHz, 10);
            }
            if (amazonAsrMediaEncoding) {
                params.media_encoding = amazonAsrMediaEncoding;
            }
            
            return {
                vendor: 'amazon',
                params: params
            };
        } else if (vendor === 'google') {
            const googleAsrProjectId = document.getElementById('googleAsrProjectId').value.trim();
            const googleAsrLocation = document.getElementById('googleAsrLocation').value.trim();
            const googleAsrAdcCredentials = document.getElementById('googleAsrAdcCredentials').value.trim();
            const googleAsrLanguage = document.getElementById('googleAsrLanguage').value.trim();
            const googleAsrModel = document.getElementById('googleAsrModel').value.trim();
            
            const params = {
                project_id: googleAsrProjectId,
                location: googleAsrLocation,
                adc_credentials_string: googleAsrAdcCredentials,
                language: googleAsrLanguage
            };
            
            // Add optional model if provided
            if (googleAsrModel) {
                params.model = googleAsrModel;
            }
            
            return {
                vendor: 'google',
                params: params
            };
        }
        
        // Default to ARES if vendor is not recognized
        return {
            vendor: 'ares',
            language: asrLanguage
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
        if (formData.enableSal) {
            advancedFeatures.enable_sal = true;
        }

        // Prepare SAL config (optional - only included when enableSal is true)
        let sal = null;
        if (formData.enableSal) {
            sal = {
                sal_mode: formData.salMode || 'locking' // Default to 'locking' if not provided
            };
            
            // Parse sample URLs - expect JSON format, force to be an object
            if (formData.salSampleUrls && formData.salSampleUrls.trim()) {
                let trimmedUrls = formData.salSampleUrls.trim();
                
                // Normalize all types of curly quotes to straight quotes for JSON parsing
                // Handle left/right double quotes (U+201C, U+201D) and left/right single quotes (U+2018, U+2019)
                // Use explicit Unicode character codes to ensure matching
                trimmedUrls = trimmedUrls
                    .replace(/\u201C/g, '"')  // Left double curly quote (")
                    .replace(/\u201D/g, '"')  // Right double curly quote (")
                    .replace(/\u2018/g, "'")  // Left single curly quote (')
                    .replace(/\u2019/g, "'")  // Right single curly quote (')
                    .replace(/\u201A/g, "'")  // Single low-9 quotation mark
                    .replace(/\u201B/g, "'")  // Single high-reversed-9 quotation mark
                    .replace(/\u201E/g, '"')  // Double low-9 quotation mark
                    .replace(/\u201F/g, '"'); // Double high-reversed-9 quotation mark
                
                // Try to parse as JSON
                try {
                    const parsed = JSON.parse(trimmedUrls);
                    // Ensure it's an object (not array or null)
                    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                        sal.sample_urls = parsed;
                    } else {
                        // If parsed but not an object, use empty object
                        sal.sample_urls = {};
                    }
                } catch (e) {
                    // If JSON parsing fails, use empty object
                    console.error('SAL sample URLs JSON parse error:', e, 'Input:', trimmedUrls);
                    sal.sample_urls = {};
                }
            } else {
                // If no sample URLs provided, use empty object
                sal.sample_urls = {};
            }
        }

        // Prepare turn detection config
        let turnDetection = null;
        if (formData.turnDetectionEnabled) {
            turnDetection = {
                type: formData.turnDetectionType,
                interrupt_mode: formData.turnInterruptMode
            };
            
            // Add interrupt keywords if provided (only for keywords interrupt mode)
            // Maximum 128 keywords allowed
            if (formData.turnInterruptKeywords && formData.turnInterruptMode === 'keywords') {
                const keywords = formData.turnInterruptKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
                if (keywords.length > 128) {
                    throw new Error('Maximum 128 interrupt keywords allowed. Please reduce the number of keywords.');
                }
                if (keywords.length > 0) {
                    turnDetection.interrupt_keywords = keywords;
                }
            }
            
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
            
            // Add farewell config if enabled
            if (formData.farewellGracefulEnabled) {
                parameters.farewell_config = {
                    graceful_enabled: true
                };
                if (formData.farewellGracefulTimeout) {
                    const timeout = parseInt(formData.farewellGracefulTimeout, 10);
                    if (timeout < 0 || timeout > 120) {
                        throw new Error('Farewell graceful timeout must be between 0 and 120 seconds.');
                    }
                    parameters.farewell_config.graceful_timeout_seconds = timeout;
                }
            }
            
            // Add RTM metrics if enabled
            if (formData.enableMetrics) {
                parameters.enable_metrics = true;
            }
            if (formData.enableErrorMessage) {
                parameters.enable_error_message = true;
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

        /* Add image handling system message if image input is enabled
        if (formData.inputModalities.includes("image")) {
            systemMessages.push({
                role: "system",
                content: "We will be sending you images so when you receive an image and the user specifically asks about it, comment on it based on the request from the user"
            });
        } */

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
                ...(sal ? { sal: sal } : {}),
                ...(formData.enableMllm ? {} : { asr: this.buildAsrConfig(formData) }), // Only include ASR if MLLM is not enabled
                ...(turnDetection ? { turn_detection: turnDetection } : {}),
                ...(parameters ? { parameters: parameters } : {}),
                ...(formData.enableMllm ? {} : { // Only include LLM/TTS if MLLM is not enabled
                    llm: {
                        url: formData.llmUrl,
                        api_key: formData.llmApiKey,
                        ...(formData.llmAccessKey ? { access_key: formData.llmAccessKey } : {}),
                        ...(formData.llmSecret ? { secret: formData.llmSecret } : {}),
                        ...(formData.llmHeaders ? { headers: formData.llmHeaders } : {}),
                        ...(formData.llmVendor ? { vendor: formData.llmVendor } : {}),
                        ...(formData.llmStyle ? { style: formData.llmStyle } : {}),
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
                        ...(formData.mllmVendor === 'vertexai' ? {} : { url: formData.mllmUrl }), // URL not needed for vertexai
                        ...(formData.mllmVendor === 'vertexai' ? {} : { api_key: formData.mllmApiKey }), // API key not needed for vertexai
                        ...(formData.mllmGreetingMessage ? { greeting_message: formData.mllmGreetingMessage } : {}),
                        ...(formData.mllmVendor ? { vendor: formData.mllmVendor } : {}),
                        ...(formData.mllmStyle ? { style: formData.mllmStyle } : {}),
                        ...(formData.mllmMaxHistory ? { max_history: parseInt(formData.mllmMaxHistory, 10) } : {}),
                        input_modalities: ["audio"], // MLLM uses audio input
                        output_modalities: ["audio"], // MLLM outputs audio
                        ...(formData.mllmVendor === 'vertexai' ? {
                            params: {
                                model: formData.vertexaiModel || 'gemini-live-2.5-flash-preview-native-audio-09-2025',
                                adc_credentials_string: formData.vertexaiAdcCredentials,
                                project_id: formData.vertexaiProjectId,
                                location: formData.vertexaiLocation,
                                ...(formData.vertexaiVoice ? { voice: formData.vertexaiVoice } : {}),
                                ...(formData.vertexaiInstructions ? { instructions: formData.vertexaiInstructions } : {}),
                                transcribe_agent: true,
                                transcribe_user: true,
                                ...customParams
                            }
                        } : (Object.keys(customParams).length > 0 ? { params: customParams } : {})) // Only include params if customParams is not empty
                    }
                } : {}),
                        //add chorus scenario for websdk fix for now, merge with dynamic parameters
                parameters: {
                    audio_scenario: "chorus",
                    ...(parameters || {})
                }
            }
        };

        // Add AI Avatar configuration if enabled
        if (formData.enableAvatar) {
            if (!formData.avatarApiKey) {
                throw new Error('Avatar API Key is required when AI Avatar is enabled');
            }
            if (!formData.avatarId) {
                throw new Error('Avatar ID is required when AI Avatar is enabled');
            }
            if (!formData.avatarRtcUid) {
                throw new Error('Avatar RTC UID is required when AI Avatar is enabled');
            }
            // Avatar RTC Token is optional - no validation needed

            config.properties.avatar = {
                vendor: formData.avatarVendor,
                enable: true,
                params: {
                    api_key: formData.avatarApiKey,
                    agora_uid: formData.avatarRtcUid,
                    avatar_id: formData.avatarId,
                    ...(formData.avatarRtcToken && formData.avatarRtcToken !== '' ? { agora_token: formData.avatarRtcToken } : {})
                }
            };

            // Add HeyGen specific parameters
            if (formData.avatarVendor === 'heygen') {
                config.properties.avatar.params.quality = formData.heygenQuality;
                config.properties.avatar.params.disable_idle_timeout = formData.heygenDisableIdleTimeout;
                if (formData.heygenActivityIdleTimeout) {
                    config.properties.avatar.params.activity_idle_timeout = parseInt(formData.heygenActivityIdleTimeout, 10);
                }
            }
        }

        // Add TTS configuration based on vendor (only if MLLM is not enabled)
        if (!formData.enableMllm) {
            // Handle skip_patterns logic
            const skipPatternsSelect = document.getElementById("skipPatterns");
            let skip_patterns = Array.from(skipPatternsSelect.selectedOptions).map(opt => opt.value).filter(v => v !== "");
            if (skip_patterns.length === 0) skip_patterns = null;
            else skip_patterns = skip_patterns.map(Number);

            if (formData.vendor === "microsoft") {
                config.properties.tts = {
                    vendor: "microsoft",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        key: formData.ttsKey,
                        region: document.getElementById("ttsRegion").value,
                        voice_name: document.getElementById("microsoftVoiceSelect").value,
                        ...(document.getElementById("microsoftRate")?.value ? { rate: parseFloat(document.getElementById("microsoftRate").value) } : {}),
                        ...(document.getElementById("microsoftSpeed")?.value ? { speed: parseFloat(document.getElementById("microsoftSpeed").value) } : {}),
                        ...(document.getElementById("microsoftVolume")?.value ? { volume: parseFloat(document.getElementById("microsoftVolume").value) } : {}),
                        ...(document.getElementById("microsoftSampleRate")?.value ? { sample_rate: parseInt(document.getElementById("microsoftSampleRate").value, 10) } : {})
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
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        key: document.getElementById("elevenLabsTtsKey").value,
                        model_id: modelId,
                        voice_id: finalVoiceId,
                        ...(document.getElementById("elevenLabsSampleRate")?.value ? { sample_rate: parseInt(document.getElementById("elevenLabsSampleRate").value, 10) } : {}),
                        ...(document.getElementById("elevenLabsStability")?.value ? { stability: parseFloat(document.getElementById("elevenLabsStability").value) } : {}),
                        ...(document.getElementById("elevenLabsSimilarityBoost")?.value ? { similarity_boost: parseFloat(document.getElementById("elevenLabsSimilarityBoost").value) } : {}),
                        ...(document.getElementById("elevenLabsStyle")?.value ? { style: parseFloat(document.getElementById("elevenLabsStyle").value) } : {}),
                        ...(document.getElementById("elevenLabsUseSpeakerBoost")?.checked ? { use_speaker_boost: true } : {})
                    }
                };
            } else if (formData.vendor === "cartesia") {
                config.properties.tts = {
                    vendor: "cartesia",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        api_key: document.getElementById("cartesiaTtsKey").value,
                        model_id: document.getElementById("cartesiaModelId").value,
                        voice: {
                            mode: "id",
                            id: document.getElementById("cartesiaVoiceId").value
                        }
                    }
                };
            } else if (formData.vendor === "openai") {
                config.properties.tts = {
                    vendor: "openai",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        api_key: document.getElementById("openaiTtsKey").value,
                        model: document.getElementById("openaiModel").value,
                        voice: document.getElementById("openaiVoice").value,
                        ...(document.getElementById("openaiInstructions")?.value ? { instructions: document.getElementById("openaiInstructions").value } : {}),
                        ...(document.getElementById("openaiSpeed")?.value ? { speed: parseFloat(document.getElementById("openaiSpeed").value) } : {})
                    }
                };
            } else if (formData.vendor === "humeai") {
                config.properties.tts = {
                    vendor: "humeai",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        key: document.getElementById("humeaiTtsKey").value,
                        voice_id: document.getElementById("humeaiVoiceId").value,
                        provider: document.getElementById("humeaiProvider").value || "HUME_AI",
                        ...(document.getElementById("humeaiSpeed")?.value ? { speed: parseFloat(document.getElementById("humeaiSpeed").value) } : {}),
                        ...(document.getElementById("humeaiTrailingSilence")?.value ? { trailing_silence: parseFloat(document.getElementById("humeaiTrailingSilence").value) } : {})
                    }
                };
            } else if (formData.vendor === "rime") {
                config.properties.tts = {
                    vendor: "rime",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        api_key: document.getElementById("rimeTtsKey").value,
                        speaker: document.getElementById("rimeSpeaker").value,
                        modelId: document.getElementById("rimeModelId").value
                    }
                };
            // } else if (formData.vendor === "minimax") { // COMMENTED OUT: Not in Agora 2.0 official docs
            //     config.properties.tts = {
            //         vendor: "minimax",
            //         ...(skip_patterns ? { skip_patterns } : {}),
            //         params: {
            //             api_key: document.getElementById("minimaxTtsKey").value,
            //             group_id: document.getElementById("minimaxGroupId").value,
            //             model: document.getElementById("minimaxModel").value,
            //             voice_setting: {
            //                 voice_id: document.getElementById("minimaxVoiceId").value
            //             },
            //             url: document.getElementById("minimaxUrl").value
            //         }
            //     };
            } else if (formData.vendor === "fishaudio") {
                config.properties.tts = {
                    vendor: "fishaudio",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        api_key: document.getElementById("fishaudioTtsKey").value,
                        reference_id: document.getElementById("fishaudioReferenceId").value,
                        backend: document.getElementById("fishaudioBackend").value
                    }
                };
            } else if (formData.vendor === "groq") {
                config.properties.tts = {
                    vendor: "groq",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        api_key: document.getElementById("groqTtsKey").value,
                        model: document.getElementById("groqModel").value,
                        voice: document.getElementById("groqVoice").value
                    }
                };
            } else if (formData.vendor === "google") {
                const audioConfig = {};
                if (document.getElementById("googleSpeakingRate")?.value) {
                    audioConfig.speaking_rate = parseFloat(document.getElementById("googleSpeakingRate").value);
                }
                if (document.getElementById("googleSampleRate")?.value) {
                    audioConfig.sample_rate_hertz = parseInt(document.getElementById("googleSampleRate").value, 10);
                }
                
                config.properties.tts = {
                    vendor: "google",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        credentials: document.getElementById("googleTtsCredentials").value,
                        VoiceSelectionParams: {
                            name: document.getElementById("googleVoiceName").value
                        },
                        ...(Object.keys(audioConfig).length > 0 ? { AudioConfig: audioConfig } : {})
                    }
                };
            // } else if (formData.vendor === "playht") { // COMMENTED OUT: Not in Agora 2.0 official docs
            //     config.properties.tts = {
            //         vendor: "playht",
            //         ...(skip_patterns ? { skip_patterns } : {}),
            //         params: {
            //             api_key: document.getElementById("playhtTtsKey").value,
            //             user_id: document.getElementById("playhtUserId").value,
            //             voice_engine: document.getElementById("playhtVoiceEngine").value,
            //             voice: document.getElementById("playhtVoice").value,
            //             ...(document.getElementById("playhtSpeed")?.value ? { speed: parseFloat(document.getElementById("playhtSpeed").value) } : {})
            //         }
            //     };
            } else if (formData.vendor === "amazon") {
                config.properties.tts = {
                    vendor: "amazon",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        aws_access_key_id: document.getElementById("amazonPollyAccessKey").value,
                        aws_secret_access_key: document.getElementById("amazonPollySecretKey").value,
                        region_name: document.getElementById("amazonPollyRegion").value,
                        voice: document.getElementById("amazonPollyVoice").value,
                        engine: document.getElementById("amazonPollyEngine").value
                    }
                };
            }
        }

        return config;
    }
} 