// Utilities Module
window.Utils = class Utils {
    static getStoredCredentials() {
        return {
            customerId: localStorage.getItem("customerId") || "",
            customerSecret: localStorage.getItem("customerSecret") || "",
            appId: localStorage.getItem("appId") || "",
            appCertificate: localStorage.getItem("appCertificate") || ""
        };
    }

    static saveCredentials(customerId, customerSecret, appId, appCertificate = "") {
        if (!customerId || !customerSecret || !appId) {
            throw new Error("All credentials are required");
        }
        localStorage.setItem("customerId", customerId);
        localStorage.setItem("customerSecret", customerSecret);
        localStorage.setItem("appId", appId);
        if (appCertificate) {
            localStorage.setItem("appCertificate", appCertificate);
        } else {
            localStorage.removeItem("appCertificate");
        }
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
        } else if (ttsVendor === "deepgram") {
            ttsKey = document.getElementById("deepgramTtsKey") ? document.getElementById("deepgramTtsKey").value.trim() : '';
        } else if (ttsVendor === "rime") {
            ttsKey = document.getElementById("rimeTtsKey") ? document.getElementById("rimeTtsKey").value.trim() : '';
        } else if (ttsVendor === "minimax") {
            ttsKey = document.getElementById("minimaxTtsKey") ? document.getElementById("minimaxTtsKey").value.trim() : '';
        } else if (ttsVendor === "fishaudio") {
            ttsKey = document.getElementById("fishaudioTtsKey") ? document.getElementById("fishaudioTtsKey").value.trim() : '';
        } else if (ttsVendor === "groq") {
            ttsKey = document.getElementById("groqTtsKey") ? document.getElementById("groqTtsKey").value.trim() : '';
        } else if (ttsVendor === "google") {
            ttsKey = document.getElementById("googleTtsCredentials") ? document.getElementById("googleTtsCredentials").value.trim() : '';
        } else if (ttsVendor === "playht") {
            ttsKey = document.getElementById("playhtTtsKey") ? document.getElementById("playhtTtsKey").value.trim() : '';
        } else if (ttsVendor === "sarvam") {
            ttsKey = document.getElementById("sarvamTtsKey") ? document.getElementById("sarvamTtsKey").value.trim() : '';
        } else if (ttsVendor === "amazon") {
            // Amazon Polly uses access key and secret key, not a single ttsKey
            // We'll handle this in buildAgentConfig
            ttsKey = '';
        } else if (ttsVendor === "murf") {
            ttsKey = document.getElementById("murfApiKey") ? document.getElementById("murfApiKey").value.trim() : '';
        } else if (ttsVendor === "gradium") {
            ttsKey = document.getElementById("gradiumTtsKey") ? document.getElementById("gradiumTtsKey").value.trim() : '';
        } else if (ttsVendor === "mistral") {
            ttsKey = document.getElementById("mistralTtsKey") ? document.getElementById("mistralTtsKey").value.trim() : '';
        } else if (ttsVendor === "generic_http") {
            ttsKey = document.getElementById("genericHttpTtsKey") ? document.getElementById("genericHttpTtsKey").value.trim() : '';
        }

        // Get new v1.6 fields
        const remoteRtcUids = document.getElementById("remoteRtcUids").value.trim();
        const idleTimeout = document.getElementById("idleTimeout").value.trim();
        
        // Deprecated features (pre-v2.4) vs v2.4 turn detection
        const useDeprecatedFeatures = document.getElementById("deprecatedFeatures") ? document.getElementById("deprecatedFeatures").checked : true;
        // Get advanced features
        const enableAivad = document.getElementById("enableAivad") ? document.getElementById("enableAivad").checked : false;
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
        const turnServerVadIdleTimeoutMs = document.getElementById("turnServerVadIdleTimeoutMs") ? document.getElementById("turnServerVadIdleTimeoutMs").value || null : null;
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
        const mllmMaxHistory = document.getElementById("mllmMaxHistory").value || null;
        const mllmOpenaiModel = document.getElementById("mllmOpenaiModel") ? document.getElementById("mllmOpenaiModel").value.trim() : "";
        const mllmOpenaiVoice = document.getElementById("mllmOpenaiVoice") ? document.getElementById("mllmOpenaiVoice").value.trim() : "";
        const mllmOpenaiInstructions = document.getElementById("mllmOpenaiInstructions") ? document.getElementById("mllmOpenaiInstructions").value.trim() : "";
        const mllmOpenaiTranscriptionLanguage = document.getElementById("mllmOpenaiTranscriptionLanguage") ? document.getElementById("mllmOpenaiTranscriptionLanguage").value.trim() : "";
        const mllmOpenaiTranscriptionModel = document.getElementById("mllmOpenaiTranscriptionModel") ? document.getElementById("mllmOpenaiTranscriptionModel").value.trim() : "";
        const mllmOpenaiTranscriptionPrompt = document.getElementById("mllmOpenaiTranscriptionPrompt") ? document.getElementById("mllmOpenaiTranscriptionPrompt").value.trim() : "";
        const geminiModel = document.getElementById("geminiModel") ? document.getElementById("geminiModel").value.trim() : "";
        const geminiVoice = document.getElementById("geminiVoice") ? document.getElementById("geminiVoice").value.trim() : "";
        const geminiInstructions = document.getElementById("geminiInstructions") ? document.getElementById("geminiInstructions").value.trim() : "";
        const geminiApiVersion = document.getElementById("geminiApiVersion") ? document.getElementById("geminiApiVersion").value.trim() : "";
        const geminiAffectiveDialog = document.getElementById("geminiAffectiveDialog") ? document.getElementById("geminiAffectiveDialog").checked : false;
        const geminiProactiveAudio = document.getElementById("geminiProactiveAudio") ? document.getElementById("geminiProactiveAudio").checked : false;
        const geminiTranscribeAgent = document.getElementById("geminiTranscribeAgent") ? document.getElementById("geminiTranscribeAgent").checked : true;
        const geminiTranscribeUser = document.getElementById("geminiTranscribeUser") ? document.getElementById("geminiTranscribeUser").checked : true;
        const customMllmModel = document.getElementById("customMllmModel") ? document.getElementById("customMllmModel").value.trim() : "";
        const customMllmVoice = document.getElementById("customMllmVoice") ? document.getElementById("customMllmVoice").value.trim() : "";
        const customMllmInstructions = document.getElementById("customMllmInstructions") ? document.getElementById("customMllmInstructions").value.trim() : "";
        
        // Get Vertex AI specific settings
        const vertexaiAdcCredentials = document.getElementById("vertexaiAdcCredentials") ? document.getElementById("vertexaiAdcCredentials").value.trim() : '';
        const vertexaiProjectId = document.getElementById("vertexaiProjectId") ? document.getElementById("vertexaiProjectId").value.trim() : '';
        const vertexaiLocation = document.getElementById("vertexaiLocation") ? document.getElementById("vertexaiLocation").value.trim() : '';
        const vertexaiModel = document.getElementById("vertexaiModel") ? document.getElementById("vertexaiModel").value.trim() : '';
        const vertexaiVoice = document.getElementById("vertexaiVoice") ? document.getElementById("vertexaiVoice").value.trim() : '';
        const vertexaiInstructions = document.getElementById("vertexaiInstructions") ? document.getElementById("vertexaiInstructions").value.trim() : '';
        const vertexaiTranscribeAgent = document.getElementById("vertexaiTranscribeAgent") ? document.getElementById("vertexaiTranscribeAgent").checked : true;
        const vertexaiTranscribeUser = document.getElementById("vertexaiTranscribeUser") ? document.getElementById("vertexaiTranscribeUser").checked : true;
        
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

        // Pipeline overrides: if Pipeline ID is provided, these determine whether
        // we still send ASR/LLM/TTS blocks from this UI.
        const overrideLlm = document.getElementById("overrideLlm") ? document.getElementById("overrideLlm").checked : false;
        const overrideTts = document.getElementById("overrideTts") ? document.getElementById("overrideTts").checked : false;
        const overrideAsr = document.getElementById("overrideAsr") ? document.getElementById("overrideAsr").checked : false;

        // Get AI Avatar settings
        const enableAvatar = document.getElementById("enableAvatar").checked;
        const avatarVendor = document.getElementById("avatarVendor").value;
        const avatarApiKey = document.getElementById("avatarApiKey").value.trim();
        const avatarId = document.getElementById("avatarId").value.trim();
        const avatarRtcUid = document.getElementById("avatarRtcUid").value.trim();
        const avatarRtcToken = document.getElementById("avatarRtcToken").value.trim();
        const avatarApiBaseUrl = document.getElementById("avatarApiBaseUrl")
            ? document.getElementById("avatarApiBaseUrl").value.trim()
            : '';
        const lemonsliceApiBaseUrl = document.getElementById("lemonsliceApiBaseUrl")
            ? document.getElementById("lemonsliceApiBaseUrl").value.trim()
            : '';
        const lemonsliceImageSource = document.getElementById("lemonsliceImageSource")
            ? document.getElementById("lemonsliceImageSource").value
            : 'agent_id';
        const lemonsliceImageValue = document.getElementById("lemonsliceImageValue")
            ? document.getElementById("lemonsliceImageValue").value.trim()
            : '';
        const lemonsliceAspectRatio = document.getElementById("lemonsliceAspectRatio")
            ? document.getElementById("lemonsliceAspectRatio").value
            : '2x3';
        const lemonsliceSampleRate = document.getElementById("lemonsliceSampleRate")
            ? document.getElementById("lemonsliceSampleRate").value
            : '24000';
        const lemonsliceVideoEncoding = document.getElementById("lemonsliceVideoEncoding")
            ? document.getElementById("lemonsliceVideoEncoding").value
            : '';
        const lemonsliceModel = document.getElementById("lemonsliceModel")
            ? document.getElementById("lemonsliceModel").value
            : '';
        const lemonsliceActivityIdleTimeout = document.getElementById("lemonsliceActivityIdleTimeout")
            ? document.getElementById("lemonsliceActivityIdleTimeout").value.trim()
            : '';
        const lemonsliceResponseDoneTimeout = document.getElementById("lemonsliceResponseDoneTimeout")
            ? document.getElementById("lemonsliceResponseDoneTimeout").value.trim()
            : '';
        const lemonsliceAgentPrompt = document.getElementById("lemonsliceAgentPrompt")
            ? document.getElementById("lemonsliceAgentPrompt").value.trim()
            : '';
        const lemonsliceAgentIdlePrompt = document.getElementById("lemonsliceAgentIdlePrompt")
            ? document.getElementById("lemonsliceAgentIdlePrompt").value.trim()
            : '';
        const heygenQuality = document.getElementById("heygenQuality").value;
        const heygenDisableIdleTimeout = document.getElementById("heygenDisableIdleTimeout").checked;
        const heygenActivityIdleTimeout = document.getElementById("heygenActivityIdleTimeout").value || null;
        const anamSampleRate = document.getElementById("anamSampleRate") ? document.getElementById("anamSampleRate").value : '24000';
        const anamQuality = document.getElementById("anamQuality") ? document.getElementById("anamQuality").value : 'high';
        const anamVideoEncoding = document.getElementById("anamVideoEncoding") ? document.getElementById("anamVideoEncoding").value : 'H264';
        const asrPreset = document.getElementById("asrPreset") ? document.getElementById("asrPreset").value : '';
        const llmPreset = document.getElementById("llmPreset") ? document.getElementById("llmPreset").value : '';
        const ttsPreset = document.getElementById("ttsPreset") ? document.getElementById("ttsPreset").value : '';
        const combinedPreset = [asrPreset, llmPreset, ttsPreset].filter(Boolean).join(',');

        return {
            uniqueName: document.getElementById("uniqueName").value.trim(),
            channel: document.getElementById("agoraChannelName").value.trim(),
            rtcUid: document.getElementById("agoraRtcUid").value.trim(),
            token: document.getElementById("agoraRtcToken").value.trim(),
            remoteRtcUids: remoteRtcUids,
            idleTimeout: idleTimeout,
            // Optional pipeline ID for backend-configured ASR/LLM/TTS
            pipelineId: document.getElementById("pipelineId") ? document.getElementById("pipelineId").value.trim() : '',
            preset: combinedPreset,
            asrPreset: asrPreset,
            llmPreset: llmPreset,
            ttsPreset: ttsPreset,
            overrideLlm: overrideLlm,
            overrideTts: overrideTts,
            overrideAsr: overrideAsr,
            llmApiKey: document.getElementById("llmApiKey").value.trim(),
            llmUrl: document.getElementById("llmUrl").value.trim(),
            llmAccessKey: document.getElementById("llmAccessKey") ? document.getElementById("llmAccessKey").value.trim() : '',
            llmSecret: document.getElementById("llmSecret") ? document.getElementById("llmSecret").value.trim() : '',
            llmHeaders: document.getElementById("llmHeaders") ? document.getElementById("llmHeaders").value.trim() : '',
            llmVendor: document.getElementById("llmVendor") ? document.getElementById("llmVendor").value.trim() : '',
            llmStyle: document.getElementById("llmStyle") ? document.getElementById("llmStyle").value.trim() : '',
            ttsKey: ttsKey,
            gMsg: document.getElementById("gMsg").value.trim(),
            greetingMode: document.getElementById("greetingMode") ? document.getElementById("greetingMode").value : "single_every",
            llmGreetingInterruptable: document.getElementById("llmGreetingInterruptable")
                ? document.getElementById("llmGreetingInterruptable").value === 'true'
                : true,
            fMsg: document.getElementById("fMsg").value.trim(),
            fillerWordsEnable: document.getElementById("fillerWordsEnable") ? document.getElementById("fillerWordsEnable").checked : false,
            fillerWords: document.getElementById("fillerWords") ? document.getElementById("fillerWords").value.trim() : '',
            fillerWordsResponseWaitMs: document.getElementById("fillerWordsResponseWaitMs") ? document.getElementById("fillerWordsResponseWaitMs").value : '1500',
            fillerWordsSelectionRule: document.getElementById("fillerWordsSelectionRule") ? document.getElementById("fillerWordsSelectionRule").value : 'shuffle',
            sMsgContent: document.getElementById("sMsgContent").value.trim(),
            geofenceArea: document.getElementById("geofenceArea") ? document.getElementById("geofenceArea").value : '',
            geofenceAreaCustom: document.getElementById("geofenceAreaCustom") ? document.getElementById("geofenceAreaCustom").value.trim() : '',
            geofenceExclude: document.getElementById("geofenceExclude") ? document.getElementById("geofenceExclude").value : '',
            geofenceExcludeCustom: document.getElementById("geofenceExcludeCustom") ? document.getElementById("geofenceExcludeCustom").value.trim() : '',
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
            enableTools: document.getElementById("enableTools") ? document.getElementById("enableTools").checked : false,
            // RTM UID
            agentRtmUid: document.getElementById('agentRtmUid') ? document.getElementById('agentRtmUid').value.trim() : '',
            
            // MLLM settings
            mllmUrl: mllmUrl,
            mllmApiKey: mllmApiKey,
            mllmGreetingMessage: mllmGreetingMessage,
            mllmVendor: mllmVendor,
            mllmMaxHistory: mllmMaxHistory,
            mllmOpenaiModel: mllmOpenaiModel,
            mllmOpenaiVoice: mllmOpenaiVoice,
            mllmOpenaiInstructions: mllmOpenaiInstructions,
            mllmOpenaiTranscriptionLanguage: mllmOpenaiTranscriptionLanguage,
            mllmOpenaiTranscriptionModel: mllmOpenaiTranscriptionModel,
            mllmOpenaiTranscriptionPrompt: mllmOpenaiTranscriptionPrompt,
            geminiModel: geminiModel,
            geminiVoice: geminiVoice,
            geminiInstructions: geminiInstructions,
            geminiApiVersion: geminiApiVersion,
            geminiAffectiveDialog: geminiAffectiveDialog,
            geminiProactiveAudio: geminiProactiveAudio,
            geminiTranscribeAgent: geminiTranscribeAgent,
            geminiTranscribeUser: geminiTranscribeUser,
            customMllmModel: customMllmModel,
            customMllmVoice: customMllmVoice,
            customMllmInstructions: customMllmInstructions,
            
            // Vertex AI settings
            vertexaiAdcCredentials: vertexaiAdcCredentials,
            vertexaiProjectId: vertexaiProjectId,
            vertexaiLocation: vertexaiLocation,
            vertexaiModel: vertexaiModel,
            vertexaiVoice: vertexaiVoice,
            vertexaiInstructions: vertexaiInstructions,
            vertexaiTranscribeAgent: vertexaiTranscribeAgent,
            vertexaiTranscribeUser: vertexaiTranscribeUser,
            
            // Turn detection
            turnDetectionEnabled: turnDetectionEnabled,
            turnDetectionType: turnDetectionType,
            turnInterruptMode: turnInterruptMode,
            turnInterruptKeywords: turnInterruptKeywords,
            turnInterruptDuration: turnInterruptDuration,
            turnPrefixPadding: turnPrefixPadding,
            turnSilenceDuration: turnSilenceDuration,
            turnThreshold: turnThreshold,
            turnServerVadIdleTimeoutMs: turnServerVadIdleTimeoutMs,
            turnEagerness: turnEagerness,
            
            // v2.4 turn detection (when Deprecated Features is off)
            useDeprecatedFeatures: useDeprecatedFeatures,
            turnV24Enabled: document.getElementById("turnDetectionV24Enabled") ? document.getElementById("turnDetectionV24Enabled").checked : false,
            turnV24SpeechThreshold: document.getElementById("turnV24SpeechThreshold") ? document.getElementById("turnV24SpeechThreshold").value || null : null,
            turnV24StartOfSpeechMode: document.getElementById("turnV24StartOfSpeechMode") ? document.getElementById("turnV24StartOfSpeechMode").value : 'vad',
            turnV24SoSVadInterruptMs: document.getElementById("turnV24SoSVadInterruptMs") ? document.getElementById("turnV24SoSVadInterruptMs").value || null : null,
            turnV24SoSVadSpeakingInterruptMs: document.getElementById("turnV24SoSVadSpeakingInterruptMs") ? document.getElementById("turnV24SoSVadSpeakingInterruptMs").value || null : null,
            turnV24SoSPrefixPaddingMs: document.getElementById("turnV24SoSPrefixPaddingMs") ? document.getElementById("turnV24SoSPrefixPaddingMs").value || null : null,
            turnV24SoSKeywordsInterruptMs: document.getElementById("turnV24SoSKeywordsInterruptMs") ? document.getElementById("turnV24SoSKeywordsInterruptMs").value || null : null,
            turnV24SoSKeywordsPrefixMs: document.getElementById("turnV24SoSKeywordsPrefixMs") ? document.getElementById("turnV24SoSKeywordsPrefixMs").value || null : null,
            turnV24SoSKeywords: document.getElementById("turnV24SoSKeywords") ? document.getElementById("turnV24SoSKeywords").value.trim() || null : null,
            turnV24SoSDisabledStrategy: document.getElementById("turnV24SoSDisabledStrategy") ? document.getElementById("turnV24SoSDisabledStrategy").value : 'append',
            turnV24EndOfSpeechMode: document.getElementById("turnV24EndOfSpeechMode") ? document.getElementById("turnV24EndOfSpeechMode").value : 'vad',
            turnV24EoSSilenceMs: document.getElementById("turnV24EoSSilenceMs") ? document.getElementById("turnV24EoSSilenceMs").value || null : null,
            turnV24EoSemanticSilenceMs: document.getElementById("turnV24EoSemanticSilenceMs") ? document.getElementById("turnV24EoSemanticSilenceMs").value || null : null,
            turnV24EoSemanticMaxWaitMs: document.getElementById("turnV24EoSemanticMaxWaitMs") ? document.getElementById("turnV24EoSemanticMaxWaitMs").value || null : null,
            turnV24EoSemanticPauseStateEnabled: document.getElementById("turnV24EoSemanticPauseStateEnabled") ? document.getElementById("turnV24EoSemanticPauseStateEnabled").value || null : null,
            
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
            avatarApiBaseUrl: avatarApiBaseUrl,
            lemonsliceApiBaseUrl: lemonsliceApiBaseUrl,
            lemonsliceImageSource: lemonsliceImageSource,
            lemonsliceImageValue: lemonsliceImageValue,
            lemonsliceAspectRatio: lemonsliceAspectRatio,
            lemonsliceSampleRate: lemonsliceSampleRate,
            lemonsliceVideoEncoding: lemonsliceVideoEncoding,
            lemonsliceModel: lemonsliceModel,
            lemonsliceActivityIdleTimeout: lemonsliceActivityIdleTimeout,
            lemonsliceResponseDoneTimeout: lemonsliceResponseDoneTimeout,
            lemonsliceAgentPrompt: lemonsliceAgentPrompt,
            lemonsliceAgentIdlePrompt: lemonsliceAgentIdlePrompt,
            heygenQuality: heygenQuality,
            heygenDisableIdleTimeout: heygenDisableIdleTimeout,
            heygenActivityIdleTimeout: heygenActivityIdleTimeout,
            anamSampleRate: anamSampleRate,
            anamQuality: anamQuality,
            anamVideoEncoding: anamVideoEncoding,
            // RTC Encryption settings
            rtcEncryptionMode: document.getElementById('rtcEncryptionMode') ? document.getElementById('rtcEncryptionMode').value : '',
            rtcEncryptionKey: document.getElementById('rtcEncryptionKey') ? document.getElementById('rtcEncryptionKey').value.trim() : '',
            rtcEncryptionSalt: document.getElementById('rtcEncryptionSalt') ? document.getElementById('rtcEncryptionSalt').value.trim() : ''
        };
    }

    static validateFormData(data) {
        const required = ['uniqueName', 'channel', 'rtcUid', 'remoteRtcUids'];
        const missing = required.filter(field => !data[field]);
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        const hasPipelineId = data.pipelineId && data.pipelineId.trim() !== '';
        const overrideLlm = data.overrideLlm;
        const overrideTts = data.overrideTts;
        const overrideAsr = data.overrideAsr;
        const presets = this.parsePresetList(data.preset);
        const presetHasAsr = presets.some(p => p.startsWith('deepgram_'));
        const presetHasLlm = presets.some(p => p.startsWith('openai_gpt_'));
        const presetHasTts = presets.some(p => p.startsWith('openai_tts_') || p.startsWith('minimax_speech_'));

        if (this.usesManualTurnControl(data)) {
            if (!data.enableRtm) {
                throw new Error('Manual turn control requires RTM (enable RTM in Advanced Features)');
            }
            if (data.dataChannel !== 'rtm') {
                throw new Error('Manual turn control requires parameters.data_channel to be "rtm"');
            }
        }

        // Validate MLLM configuration if enabled
        if (data.enableMllm) {
            if (hasPipelineId) {
                throw new Error('Disable MLLM when Pipeline ID is provided');
            }
            const mllmInputModalities = (data.inputModalities || []).filter(modality => modality === 'audio' || modality === 'text');
            const mllmOutputModalities = (data.outputModalities || []).filter(modality => modality === 'audio' || modality === 'text');
            if (!mllmInputModalities.includes('audio')) {
                throw new Error('MLLM requires audio input modality');
            }
            if (!mllmOutputModalities.includes('audio')) {
                throw new Error('MLLM requires audio output modality');
            }
            if (data.mllmVendor === 'vertexai') {
                if (!data.vertexaiAdcCredentials) {
                    throw new Error('Vertex AI ADC Credentials are required when MLLM vendor is Gemini Live');
                }
                if (!data.vertexaiProjectId) {
                    throw new Error('Vertex AI Project ID is required when MLLM vendor is Gemini Live');
                }
                if (!data.vertexaiLocation) {
                    throw new Error('Vertex AI Location is required when MLLM vendor is Gemini Live');
                }
            } else if (data.mllmVendor === 'gemini') {
                if (!data.mllmApiKey) {
                    throw new Error('Gemini API Key is required when MLLM vendor is Gemini Live');
                }
            } else {
                if (!data.mllmUrl) {
                    throw new Error('MLLM URL is required when MLLM is enabled');
                }
                if (!data.mllmApiKey) {
                    throw new Error('MLLM API Key is required when MLLM is enabled');
                }
            }
            if (data.mllmVendor === 'xai' && data.turnDetectionType === 'semantic_vad') {
                throw new Error('xAI Grok MLLM supports agora_vad and server_vad only (not semantic_vad)');
            }
        }

        // Validate AI Avatar configuration if enabled
        if (data.enableAvatar) {
            if (!data.avatarApiKey) {
                throw new Error('Avatar API Key is required when AI Avatar is enabled');
            }
            if (data.avatarVendor !== 'lemonslice' && !data.avatarId) {
                throw new Error('Avatar ID is required when AI Avatar is enabled');
            }
            if (!data.avatarRtcUid) {
                throw new Error('Avatar RTC UID is required when AI Avatar is enabled');
            }
            if (data.avatarVendor === 'generic') {
                if (!data.avatarApiBaseUrl) {
                    throw new Error('API Base URL is required when Generic avatar vendor is selected');
                }
                if (!data.channel) {
                    throw new Error('Channel name is required when Generic avatar vendor is selected');
                }
                const creds = this.getStoredCredentials();
                if (!creds.appId) {
                    throw new Error('App ID is required when Generic avatar vendor is selected');
                }
            }
            if (data.avatarVendor === 'lemonslice') {
                if (!data.lemonsliceApiBaseUrl) {
                    throw new Error('API Base URL is required when LemonSlice avatar is selected');
                }
                if (!data.lemonsliceImageValue) {
                    throw new Error('LemonSlice requires an image URL, agent ID, or base64 image');
                }
                if (!data.channel) {
                    throw new Error('Channel name is required when LemonSlice avatar is selected');
                }
                const creds = this.getStoredCredentials();
                if (!creds.appId) {
                    throw new Error('App ID is required when LemonSlice avatar is selected');
                }
            }
            // Avatar RTC Token is optional - no validation needed since it's already trimmed
            
            // AI Avatar requires TTS to be enabled
            const ttsVendor = data.vendor;
            if (!(hasPipelineId && !overrideTts) && !ttsVendor) {
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

        if (!data.enableMllm) {
            // Validate LLM/TTS/ASR only if not using pipeline mode,
            // or if the corresponding override checkbox is checked.
            const shouldValidateLlm = !hasPipelineId || overrideLlm;
            const shouldValidateTts = !hasPipelineId || overrideTts;
            const shouldValidateAsr = !hasPipelineId || overrideAsr;

            if (shouldValidateLlm && !presetHasLlm) {
                if (!data.llmApiKey) {
                    throw new Error('LLM API Key is required');
                }
                if (!data.llmUrl) {
                    throw new Error('LLM URL is required');
                }
            }

            if (shouldValidateTts && !presetHasTts) {
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
                } else if (ttsVendor === 'deepgram') {
                    const deepgramTtsKey = document.getElementById('deepgramTtsKey') ? document.getElementById('deepgramTtsKey').value.trim() : '';
                    const deepgramModel = document.getElementById('deepgramModel') ? document.getElementById('deepgramModel').value.trim() : '';
                    if (!deepgramTtsKey) {
                        throw new Error('Deepgram API Key is required');
                    }
                    if (!deepgramModel) {
                        throw new Error('Deepgram model is required');
                    }
                } else if (ttsVendor === 'minimax') {
                    const minimaxTtsKey = document.getElementById('minimaxTtsKey').value.trim();
                    const minimaxGroupId = document.getElementById('minimaxGroupId').value.trim();
                    const minimaxModel = document.getElementById('minimaxModel').value.trim();
                    const minimaxVoiceId = this.getMinimaxVoiceId();
                    const minimaxUrl = document.getElementById('minimaxUrl').value.trim();
                    if (!minimaxTtsKey) throw new Error('MiniMax API Key is required');
                    if (!minimaxGroupId) throw new Error('MiniMax Group ID is required');
                    if (!minimaxModel) throw new Error('MiniMax Model is required');
                    if (!minimaxVoiceId) throw new Error('MiniMax Voice ID is required');
                    if (!minimaxUrl) throw new Error('MiniMax URL is required');
                    const minimaxSrRaw = document.getElementById('minimaxSampleRate') ? document.getElementById('minimaxSampleRate').value.trim() : '';
                    if (minimaxSrRaw) {
                        if (!/^\d+$/.test(minimaxSrRaw)) {
                            throw new Error('MiniMax sample rate must be an integer between 8000 and 44100');
                        }
                        const minimaxSr = parseInt(minimaxSrRaw, 10);
                        if (!Number.isFinite(minimaxSr) || minimaxSr < 8000 || minimaxSr > 44100) {
                            throw new Error('MiniMax sample rate must be an integer between 8000 and 44100');
                        }
                    }
                } else if (ttsVendor === 'playht') {
                    const playhtTtsKey = document.getElementById('playhtTtsKey').value.trim();
                    const playhtUserId = document.getElementById('playhtUserId').value.trim();
                    const playhtVoiceEngine = document.getElementById('playhtVoiceEngine').value.trim();
                    const playhtVoice = document.getElementById('playhtVoice').value.trim();
                    
                    if (!playhtTtsKey) {
                        throw new Error('PlayHT API Key is required');
                    }
                    if (!playhtUserId) {
                        throw new Error('PlayHT User ID is required');
                    }
                    if (!playhtVoiceEngine) {
                        throw new Error('PlayHT Voice Engine is required');
                    }
                    if (!playhtVoice) {
                        throw new Error('PlayHT Voice is required');
                    }
                } else if (ttsVendor === 'sarvam') {
                    const sarvamTtsKey = document.getElementById('sarvamTtsKey').value.trim();
                    const sarvamSpeakerSelect = document.getElementById('sarvamSpeaker').value.trim();
                    const sarvamSpeakerId = document.getElementById('sarvamSpeakerId') ? document.getElementById('sarvamSpeakerId').value.trim() : '';
                    const sarvamLanguageCode = document.getElementById('sarvamLanguageCode').value.trim();
                    
                    if (!sarvamTtsKey) {
                        throw new Error('Sarvam API Key is required');
                    }
                    if (sarvamSpeakerSelect === 'other' && !sarvamSpeakerId) {
                        throw new Error('Sarvam Custom Speaker ID is required when "Custom" is selected');
                    }
                    if (sarvamSpeakerSelect !== 'other' && !sarvamSpeakerSelect) {
                        throw new Error('Sarvam Speaker is required');
                    }
                    if (!sarvamLanguageCode) {
                        throw new Error('Sarvam Language Code is required');
                    }
                } else if (ttsVendor === 'murf') {
                    const murfApiKey = document.getElementById('murfApiKey') ? document.getElementById('murfApiKey').value.trim() : '';
                    if (!murfApiKey) {
                        throw new Error('Murf API Key is required');
                    }
                } else if (ttsVendor === 'rime') {
                    const rimeTtsKey = document.getElementById('rimeTtsKey') ? document.getElementById('rimeTtsKey').value.trim() : '';
                    if (!rimeTtsKey) {
                        throw new Error('Rime API Key is required');
                    }
                    const rimeSrRaw = document.getElementById('rimeSamplingRate') ? document.getElementById('rimeSamplingRate').value.trim() : '';
                    if (rimeSrRaw) {
                        if (!/^\d+$/.test(rimeSrRaw)) {
                            throw new Error('Rime sampling rate must be an integer between 4000 and 44100');
                        }
                        const rimeSr = parseInt(rimeSrRaw, 10);
                        if (!Number.isFinite(rimeSr) || rimeSr < 4000 || rimeSr > 44100) {
                            throw new Error('Rime sampling rate must be an integer between 4000 and 44100');
                        }
                    }
                } else if (ttsVendor === 'gradium') {
                    const gradiumTtsKey = document.getElementById('gradiumTtsKey') ? document.getElementById('gradiumTtsKey').value.trim() : '';
                    const gradiumUrl = document.getElementById('gradiumUrl') ? document.getElementById('gradiumUrl').value.trim() : '';
                    const gradiumVoiceId = document.getElementById('gradiumVoiceId') ? document.getElementById('gradiumVoiceId').value.trim() : '';
                    if (!gradiumTtsKey) throw new Error('Gradium API Key is required');
                    if (!gradiumUrl) throw new Error('Gradium URL is required');
                    if (!gradiumVoiceId) throw new Error('Gradium Voice ID is required');
                } else if (ttsVendor === 'mistral') {
                    const mistralTtsKey = document.getElementById('mistralTtsKey') ? document.getElementById('mistralTtsKey').value.trim() : '';
                    const mistralModel = document.getElementById('mistralModel') ? document.getElementById('mistralModel').value.trim() : '';
                    const mistralVoice = document.getElementById('mistralVoice') ? document.getElementById('mistralVoice').value.trim() : '';
                    if (!mistralTtsKey) throw new Error('Mistral API Key is required');
                    if (!mistralModel) throw new Error('Mistral Model is required');
                    if (!mistralVoice) throw new Error('Mistral Voice is required');
                } else if (ttsVendor === 'generic_http') {
                    const genericHttpUrl = document.getElementById('genericHttpUrl') ? document.getElementById('genericHttpUrl').value.trim() : '';
                    const genericHttpTtsKey = document.getElementById('genericHttpTtsKey') ? document.getElementById('genericHttpTtsKey').value.trim() : '';
                    const genericHttpHeadersRaw = document.getElementById('genericHttpHeaders') ? document.getElementById('genericHttpHeaders').value.trim() : '';
                    if (!genericHttpUrl) {
                        throw new Error('Generic HTTP TTS URL is required');
                    }
                    let hasAuthHeader = false;
                    if (genericHttpHeadersRaw) {
                        try {
                            const headers = JSON.parse(genericHttpHeadersRaw);
                            if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
                                throw new Error('Generic HTTP TTS headers must be a JSON object');
                            }
                            hasAuthHeader = Boolean(headers.Authorization);
                        } catch (e) {
                            if (e.message && e.message.includes('Generic HTTP')) throw e;
                            throw new Error('Generic HTTP TTS headers must be valid JSON');
                        }
                    }
                    if (!genericHttpTtsKey && !hasAuthHeader) {
                        throw new Error('Generic HTTP TTS requires params.api_key and/or headers.Authorization');
                    }
                }
            }

            if (shouldValidateAsr && !presetHasAsr) {
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

    static getMinimaxVoiceId() {
        const voiceSelect = document.getElementById("minimaxVoiceSelect");
        if (!voiceSelect) {
            return document.getElementById("minimaxVoiceId")?.value.trim() || "";
        }
        if (voiceSelect.value === "other") {
            return document.getElementById("minimaxVoiceId")?.value.trim() || "";
        }
        return voiceSelect.value;
    }

    static getCustomParams() {
        const params = {};
        const container = document.getElementById("param-container");
        if (!container) return params;
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

    static getMllmCustomParams() {
        const params = {};
        const container = document.getElementById("mllm-param-container");
        if (!container) return params;
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

    static getAsrCustomParams() {
        const params = {};
        const container = document.getElementById("asr-param-container");
        if (!container) return params;
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

    static getTtsCustomParams() {
        const params = {};
        const container = document.getElementById("tts-param-container");
        if (!container) return params;
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

    static getAvatarCustomParams() {
        const params = {};
        const container = document.getElementById("avatar-param-container");
        if (!container) return params;
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

    static getMcpServers() {
        const servers = [];
        const container = document.getElementById("mcp-servers-container");
        if (!container) return servers;

        const serverElements = container.children;

        for (let element of serverElements) {
            // Get server ID from element ID (format: mcp-server-0, mcp-server-1, etc.)
            const serverId = element.id;
            if (!serverId || !serverId.startsWith("mcp-server-")) continue;

            const nameInput = document.getElementById(`${serverId}-name`);
            const endpointInput = document.getElementById(`${serverId}-endpoint`);
            const transportSelect = document.getElementById(`${serverId}-transport`);
            const isToolCallSelect = document.getElementById(`${serverId}-isToolCallAvailable`);
            const allowedToolsInput = document.getElementById(`${serverId}-allowedTools`);
            const timeoutMsInput = document.getElementById(`${serverId}-timeoutMs`);
            const headersInput = document.getElementById(`${serverId}-headers`);

            if (nameInput && endpointInput && transportSelect && isToolCallSelect && allowedToolsInput) {
                const name = nameInput.value.trim();
                const endpoint = endpointInput.value.trim();
                const transport = "streamable_http";
                const isToolCallAvailable = isToolCallSelect.value === "true";
                const allowedToolsValue = allowedToolsInput.value.trim();

                // Only add if name and endpoint are provided
                if (name && endpoint) {
                    let allowedTools = ["*"];
                    if (allowedToolsValue && allowedToolsValue !== "") {
                        allowedTools = allowedToolsValue.split(",").map(v => v.trim()).filter(v => v !== "");
                    }
                    // API: name only letters, numbers, dots, dashes (no spaces, no underscores)
                    const sanitizedName = name.replace(/\s+/g, '-').replace(/_/g, '').replace(/[^a-zA-Z0-9.-]/g, '').slice(0, 48) || name.replace(/\s+/g, '-').replace(/_/g, '').slice(0, 48);
                    const server = {
                        name: sanitizedName,
                        endpoint: endpoint,
                        transport: transport,
                        allowed_tools: allowedTools
                    };
                    if (timeoutMsInput && timeoutMsInput.value.trim() !== "") {
                        const ms = parseInt(timeoutMsInput.value.trim(), 10);
                        if (!isNaN(ms)) server.timeout_ms = Math.min(100000, Math.max(1000, ms));
                    }
                    if (headersInput && headersInput.value.trim() !== "") {
                        try {
                            const headers = JSON.parse(headersInput.value.trim());
                            if (headers && typeof headers === "object" && !Array.isArray(headers)) {
                                server.headers = headers;
                            }
                        } catch (e) { /* ignore invalid JSON */ }
                    }
                    servers.push(server);
                }
            }
        }

        return servers;
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

    static parsePresetList(presetValue) {
        if (!presetValue || !presetValue.trim()) return [];
        return presetValue
            .split(',')
            .map(v => v.trim())
            .filter(Boolean);
    }

    static MANAGED_ASR_MODELS = {
        deepgram_nova_2: 'nova-2',
        deepgram_nova_3: 'nova-3'
    };

    static MANAGED_LLM_MODELS = {
        openai_gpt_4o_mini: 'gpt-4o-mini',
        openai_gpt_4_1_mini: 'gpt-4.1-mini',
        openai_gpt_5_nano: 'gpt-5-nano',
        openai_gpt_5_mini: 'gpt-5-mini'
    };

    static MANAGED_TTS_MODELS = {
        openai_tts_1: 'tts-1',
        openai_tts_1_hd: 'tts-1',
        minimax_speech_2_6_turbo: 'speech-2.6-turbo',
        minimax_speech_2_8_turbo: 'speech-2.8-turbo'
    };

    static usesManualTurnControl(formData) {
        if (formData.useDeprecatedFeatures || !formData.turnV24Enabled) return false;
        const sosMode = formData.turnV24StartOfSpeechMode || 'vad';
        const eosMode = formData.turnV24EndOfSpeechMode || 'vad';
        return sosMode === 'manual' || eosMode === 'manual';
    }

    static applyManagedProviderBlock(block, presetKey, category) {
        if (!block || !presetKey) return;
        block.credential_mode = 'managed';
        if (!block.params) block.params = {};

        if (category === 'asr') {
            block.vendor = 'deepgram';
            const model = this.MANAGED_ASR_MODELS[presetKey];
            if (model) block.params.model = model;
            if (!block.params.url) block.params.url = 'wss://api.deepgram.com/v1/listen';
            delete block.params.key;
        } else if (category === 'llm') {
            block.vendor = block.vendor || 'openai';
            block.style = block.style || 'openai';
            if (!block.url) block.url = 'https://api.openai.com/v1/chat/completions';
            const model = this.MANAGED_LLM_MODELS[presetKey];
            if (model) block.params.model = model;
            delete block.api_key;
        } else if (category === 'tts') {
            const model = this.MANAGED_TTS_MODELS[presetKey];
            if (presetKey.startsWith('openai_tts_')) {
                block.vendor = 'openai';
                if (model) block.params.model = model;
                delete block.params.api_key;
            } else if (presetKey.startsWith('minimax_speech_')) {
                block.vendor = 'minimax';
                if (model) block.params.model = model;
                if (!block.params.url) block.params.url = 'wss://api.minimax.io/ws/v1/t2a_v2';
                delete block.params.key;
                delete block.params.group_id;
            }
        }
    }

    static buildAsrConfig(formData) {
        const vendor = formData.asrVendor;
        const asrLanguage = document.getElementById('asrLanguage').value;
        
        if (vendor === 'custom') {
            const customAsrJson = document.getElementById('customAsrJson');
            if (!customAsrJson) {
                console.error('Custom ASR JSON textarea not found');
                return {
                    vendor: 'ares',
                    language: 'en-US'
                };
            }
            
            const jsonString = customAsrJson.value.trim();
            if (!jsonString) {
                console.error('Custom ASR JSON is empty');
                throw new Error('Custom ASR configuration is required when using custom vendor');
            }
            
            // Normalize all types of curly quotes to straight quotes for JSON parsing
            // Handle left/right double quotes (U+201C, U+201D) and left/right single quotes (U+2018, U+2019)
            let normalizedJson = jsonString
                .replace(/\u201C/g, '"')  // Left double curly quote (")
                .replace(/\u201D/g, '"')  // Right double curly quote (")
                .replace(/\u2018/g, "'")  // Left single curly quote (')
                .replace(/\u2019/g, "'")  // Right single curly quote (')
                .replace(/\u201A/g, "'")  // Single low-9 quotation mark
                .replace(/\u201B/g, "'")  // Single high-reversed-9 quotation mark
                .replace(/\u201E/g, '"')  // Double low-9 quotation mark
                .replace(/\u201F/g, '"'); // Double high-reversed-9 quotation mark
            
            try {
                const parsed = JSON.parse(normalizedJson);
                // Ensure it's an object (not array or null)
                if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                    throw new Error('Custom ASR configuration must be a valid JSON object');
                }
                return parsed;
            } catch (e) {
                console.error('Custom ASR JSON parse error:', e, 'Input:', normalizedJson);
                throw new Error(`Invalid JSON in custom ASR configuration: ${e.message}`);
            }
        } else if (vendor === 'ares') {
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
            const deepgramAsrKeyterm = document.getElementById('deepgramAsrKeyterm') ? document.getElementById('deepgramAsrKeyterm').value.trim() : '';
            
            const params = {
                url: deepgramAsrUrl,
                key: deepgramAsrKey,
                language: asrLanguage
            };
            
            // Add model if provided
            if (deepgramAsrModel) {
                params.model = deepgramAsrModel;
            }
            if (deepgramAsrKeyterm) {
                params.keyterm = deepgramAsrKeyterm;
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
        } else if (vendor === 'sarvam') {
            const sarvamAsrKey = document.getElementById('sarvamAsrKey').value.trim();
            const sarvamAsrLanguage = document.getElementById('sarvamAsrLanguage').value.trim();
            
            return {
                vendor: 'sarvam',
                params: {
                    api_key: sarvamAsrKey,
                    language: sarvamAsrLanguage
                }
            };
        }
        
        // Default to ARES if vendor is not recognized
        return {
            vendor: 'ares',
            language: asrLanguage
        };
    }

    /**
     * LemonSlice lip-sync breaks when its avatar sample_rate and the TTS output rate disagree,
     * so both sides read this single value.
     */
    static getLemonsliceSampleRate(formData) {
        const parsed = parseInt(formData.lemonsliceSampleRate || '24000', 10);
        return Number.isFinite(parsed) ? parsed : 24000;
    }

    /**
     * LiveAvatar and LemonSlice need TTS at a specific sample rate (default 24 kHz).
     * Legacy vendor "heygen" may still accept other rates on the service side.
     */
    static enforceAvatarTtsSampleRate(config, formData) {
        if (!formData.enableAvatar || formData.enableMllm) return;
        if (!config.properties?.tts?.params) return;

        let rate = null;
        if (formData.avatarVendor === 'liveavatar') {
            rate = 24000;
        } else if (formData.avatarVendor === 'lemonslice') {
            rate = this.getLemonsliceSampleRate(formData);
        } else {
            return;
        }

        const tts = config.properties.tts;
        const p = tts.params;
        switch (tts.vendor) {
            case 'microsoft':
            case 'elevenlabs':
            case 'sarvam':
            case 'murf':
            case 'deepgram':
            case 'gradium':
            case 'generic_http':
                p.sample_rate = rate;
                break;
            case 'google':
                if (!p.AudioConfig) p.AudioConfig = {};
                p.AudioConfig.sample_rate_hertz = rate;
                break;
            case 'minimax':
                if (!p.audio_setting) p.audio_setting = {};
                p.audio_setting.sample_rate = rate;
                break;
            case 'rime':
                p.samplingRate = rate;
                break;
            default:
                break;
        }
    }

    /** @deprecated Use enforceAvatarTtsSampleRate */
    static enforceLiveAvatarTtsSampleRate(config, formData) {
        this.enforceAvatarTtsSampleRate(config, formData);
    }

    /**
     * MLLM turn_detection uses mode agora_vad | server_vad | semantic_vad and nested *_config objects.
     * When MLLM is enabled, top-level turn_detection is not used; values come from the Turn Detection
     * controls when the Turn Detection checkbox is enabled (same fields as pipeline legacy UI).
     */
    static buildMllmTurnDetection(formData) {
        if (!formData.enableMllm) return null;
        if (!formData.turnDetectionEnabled) return null;

        const mode = formData.turnDetectionType;
        if (!mode) return null;

        const hasVal = (v) => v != null && v !== '';
        const result = { mode };

        if (mode === 'agora_vad') {
            const c = {};
            if (hasVal(formData.turnInterruptDuration)) {
                c.interrupt_duration_ms = parseFloat(formData.turnInterruptDuration);
            }
            if (hasVal(formData.turnPrefixPadding)) {
                c.prefix_padding_ms = parseInt(formData.turnPrefixPadding, 10);
            }
            if (hasVal(formData.turnSilenceDuration)) {
                c.silence_duration_ms = parseInt(formData.turnSilenceDuration, 10);
            }
            if (hasVal(formData.turnThreshold)) {
                c.threshold = parseFloat(formData.turnThreshold);
            }
            if (Object.keys(c).length > 0) {
                result.agora_vad_config = c;
            }
        } else if (mode === 'server_vad') {
            const c = {};
            if (hasVal(formData.turnPrefixPadding)) {
                c.prefix_padding_ms = parseInt(formData.turnPrefixPadding, 10);
            }
            if (hasVal(formData.turnSilenceDuration)) {
                c.silence_duration_ms = parseInt(formData.turnSilenceDuration, 10);
            }
            if (hasVal(formData.turnThreshold)) {
                c.threshold = parseFloat(formData.turnThreshold);
            }
            if (hasVal(formData.turnServerVadIdleTimeoutMs)) {
                c.idle_timeout_ms = parseInt(formData.turnServerVadIdleTimeoutMs, 10);
            }
            if (Object.keys(c).length > 0) {
                result.server_vad_config = c;
            }
        } else if (mode === 'semantic_vad') {
            result.semantic_vad_config = {
                eagerness: formData.turnEagerness || 'auto'
            };
        }

        return result;
    }

    static buildAgentConfig(formData, customParams = {}, mllmCustomParams = {}) {
        const presets = this.parsePresetList(formData.preset);
        const presetHasAsr = presets.some(p => p.startsWith('deepgram_'));
        const presetHasLlm = presets.some(p => p.startsWith('openai_gpt_'));
        const presetHasTts = presets.some(p => p.startsWith('openai_tts_') || p.startsWith('minimax_speech_'));

        // Parse remote RTC UIDs
        let remoteRtcUids = ["*"];
        if (formData.remoteRtcUids && formData.remoteRtcUids.trim() !== "*") {
            remoteRtcUids = formData.remoteRtcUids.split(',').map(uid => uid.trim());
        }

        // Parse idle timeout
        const idleTimeout = formData.idleTimeout ? parseInt(formData.idleTimeout, 10) : 30;

        // Prepare advanced features
        const advancedFeatures = {};
        if (formData.enableRtm) {
            advancedFeatures.enable_rtm = true;
        }
        if (formData.enableSal) {
            advancedFeatures.enable_sal = true;
        }
        // Enable tools if MCP servers are configured
        if (formData.enableTools) {
            advancedFeatures.enable_tools = true;
        }
        // Prepare SAL config (optional - only included when enableSal is true)
        let sal = null;
        if (formData.enableSal) {
            const salMode = formData.salMode || 'locking'; // Default to 'locking' if not provided
            
            // Validate recognition mode requires custom LLM vendor
            if (salMode === 'recognition') {
                const llmVendor = formData.llmVendor ? formData.llmVendor.trim().toLowerCase() : '';
                if (llmVendor !== 'custom') {
                    console.warn('SAL Warning: Recognition mode requires LLM vendor to be set to "custom" to process speaker information (vpids in metadata). Current LLM vendor:', llmVendor || '(not set)');
                }
            }
            
            sal = {
                sal_mode: salMode
            };
            
            // Parse sample URLs - JSON format only
            // Only include sample_urls in the config if there are actual URLs
            if (formData.salSampleUrls && formData.salSampleUrls.trim()) {
                let trimmedUrls = formData.salSampleUrls.trim();
                let parsed = null;
                
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
                
                try {
                    parsed = JSON.parse(trimmedUrls);
                    // Ensure it's an object (not array or null)
                    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                        parsed = null;
                    }
                } catch (e) {
                    console.error('SAL sample URLs JSON parse error:', e, 'Input:', trimmedUrls);
                    parsed = null;
                }
                
                // Validate and apply SAL requirements
                if (parsed && typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                    // Validate SAL requirements
                    const keys = Object.keys(parsed);
                    
                    // Check for reserved "unknown" keyword
                    if (keys.some(key => key.toLowerCase() === 'unknown')) {
                        console.warn('SAL Warning: "unknown" is a reserved keyword and cannot be used as a voiceprint name. It will be ignored.');
                        // Remove "unknown" key
                        delete parsed.unknown;
                        delete parsed.Unknown;
                        delete parsed.UNKNOWN;
                    }
                    
                    // Validate quantity based on mode
                    const validKeys = Object.keys(parsed);
                    if (validKeys.length === 0) {
                        // Empty after parsing/validation - check if required for this mode
                        if (salMode === 'recognition') {
                            console.warn('SAL Warning: Recognition mode requires at least 1 voiceprint URL.');
                        }
                        // Don't include sample_urls if empty
                    } else if (salMode === 'recognition' && validKeys.length > 1) {
                        // Recognition mode allows up to 1 URL
                        console.warn(`SAL Warning: Recognition mode allows up to 1 voiceprint URL, but ${validKeys.length} provided. Only the first one will be used.`);
                        const limited = {};
                        limited[validKeys[0]] = parsed[validKeys[0]];
                        sal.sample_urls = limited;
                    } else if (salMode === 'locking' && validKeys.length > 3) {
                        // Locking mode allows 1-3 URLs
                        console.warn(`SAL Warning: Locking mode allows up to 3 voiceprint URLs, but ${validKeys.length} provided. Only the first 3 will be used.`);
                        const limited = {};
                        validKeys.slice(0, 3).forEach(key => {
                            limited[key] = parsed[key];
                        });
                        sal.sample_urls = limited;
                    } else {
                        // Valid URLs - include sample_urls
                        sal.sample_urls = parsed;
                    }
                } else {
                    // If parsing fails, check if required for this mode
                    if (salMode === 'recognition') {
                        console.warn('SAL Warning: Recognition mode requires at least 1 voiceprint URL, but parsing failed.');
                    }
                    // Don't include sample_urls if parsing failed
                }
            } else {
                // If no sample URLs provided, check if required for this mode
                if (salMode === 'recognition') {
                    console.warn('SAL Warning: Recognition mode requires at least 1 voiceprint URL. Leave empty only for locking mode (seamless mode).');
                }
                // For locking mode, empty is valid (seamless mode) - don't include sample_urls
            }
        }

        // Prepare turn detection config (deprecated vs v2.4)
        let turnDetection = null;
        let interruption = null;
        if (formData.useDeprecatedFeatures && formData.turnDetectionEnabled) {
            // Deprecated structure (pre-v2.4). When MLLM is on, turn_detection belongs under mllm only
            // (see buildMllmTurnDetection); do not emit legacy top-level turn_detection.
            if (!formData.enableMllm) {
                turnDetection = {
                    type: formData.turnDetectionType
                };

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

                if (formData.turnDetectionType === 'semantic_vad') {
                    turnDetection.eagerness = formData.turnEagerness;
                }
            }
            // v2.6 interruption object replaces interrupt_mode behavior.
            if (formData.turnInterruptMode === 'keywords') {
                const keywords = (formData.turnInterruptKeywords || '')
                    .split(',')
                    .map(k => k.trim())
                    .filter(k => k.length > 0);
                if (keywords.length > 128) {
                    throw new Error('Maximum 128 interrupt keywords allowed. Please reduce the number of keywords.');
                }
                interruption = {
                    enable: true,
                    mode: 'keywords',
                    keywords: keywords
                };
            } else if (formData.turnInterruptMode === 'append' || formData.turnInterruptMode === 'ignore') {
                interruption = {
                    enable: false,
                    disabled_config: {
                        strategy: formData.turnInterruptMode
                    }
                };
            } else {
                interruption = {
                    enable: true,
                    mode: 'start_of_speech'
                };
            }
        } else if (!formData.useDeprecatedFeatures && formData.turnV24Enabled) {
            // v2.4 structure: mode + config (SoS / EoS)
            const config = {};
            const sosMode = formData.turnV24StartOfSpeechMode || 'vad';
            const eosMode = formData.turnV24EndOfSpeechMode || 'vad';
            const usesVad = sosMode === 'vad' || eosMode === 'vad';
            if (usesVad && formData.turnV24SpeechThreshold != null && formData.turnV24SpeechThreshold !== '') {
                config.speech_threshold = parseFloat(formData.turnV24SpeechThreshold);
            }
            // Start of Speech (vad_config / semantic / keywords_config / disabled_config)
            if (sosMode === 'vad') {
                const vadConfig = {};
                if (formData.turnV24SoSVadInterruptMs != null && formData.turnV24SoSVadInterruptMs !== '') {
                    vadConfig.interrupt_duration_ms = parseInt(formData.turnV24SoSVadInterruptMs, 10);
                }
                if (formData.turnV24SoSVadSpeakingInterruptMs != null && formData.turnV24SoSVadSpeakingInterruptMs !== '') {
                    vadConfig.speaking_interrupt_duration_ms = parseInt(formData.turnV24SoSVadSpeakingInterruptMs, 10);
                }
                if (formData.turnV24SoSPrefixPaddingMs != null && formData.turnV24SoSPrefixPaddingMs !== '') {
                    vadConfig.prefix_padding_ms = parseInt(formData.turnV24SoSPrefixPaddingMs, 10);
                }
                config.start_of_speech = Object.keys(vadConfig).length > 0 ? { mode: 'vad', vad_config: vadConfig } : { mode: 'vad' };
            } else if (sosMode === 'semantic') {
                config.start_of_speech = { mode: 'semantic' };
            } else if (sosMode === 'keywords') {
                const keywordsConfig = {};
                if (formData.turnV24SoSKeywordsInterruptMs != null && formData.turnV24SoSKeywordsInterruptMs !== '') {
                    keywordsConfig.interrupt_duration_ms = parseInt(formData.turnV24SoSKeywordsInterruptMs, 10);
                }
                if (formData.turnV24SoSKeywordsPrefixMs != null && formData.turnV24SoSKeywordsPrefixMs !== '') {
                    keywordsConfig.prefix_padding_ms = parseInt(formData.turnV24SoSKeywordsPrefixMs, 10);
                }
                if (formData.turnV24SoSKeywords) {
                    const triggered_keywords = formData.turnV24SoSKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
                    if (triggered_keywords.length > 0) keywordsConfig.triggered_keywords = triggered_keywords;
                }
                const triggeredKeywords = Array.isArray(keywordsConfig.triggered_keywords) ? keywordsConfig.triggered_keywords : [];
                interruption = {
                    enable: true,
                    mode: 'keywords',
                    keywords: triggeredKeywords
                };
            } else if (sosMode === 'disabled') {
                interruption = {
                    enable: false,
                    disabled_config: {
                        strategy: formData.turnV24SoSDisabledStrategy || 'append'
                    }
                };
            } else if (sosMode === 'manual') {
                config.start_of_speech = { mode: 'manual' };
            }
            if (sosMode === 'vad' || sosMode === 'semantic') {
                interruption = {
                    enable: true,
                    mode: 'start_of_speech'
                };
            }
            // End of Speech
            if (eosMode === 'manual') {
                config.end_of_speech = { mode: 'manual' };
            } else if (eosMode === 'vad') {
                config.end_of_speech = { mode: 'vad' };
                if (formData.turnV24EoSSilenceMs != null && formData.turnV24EoSSilenceMs !== '') {
                    config.end_of_speech.vad_config = { silence_duration_ms: parseInt(formData.turnV24EoSSilenceMs, 10) };
                }
            } else {
                const semanticConfig = {};
                if (formData.turnV24EoSemanticSilenceMs != null && formData.turnV24EoSemanticSilenceMs !== '') {
                    semanticConfig.silence_duration_ms = parseInt(formData.turnV24EoSemanticSilenceMs, 10);
                }
                if (formData.turnV24EoSemanticMaxWaitMs != null && formData.turnV24EoSemanticMaxWaitMs !== '') {
                    semanticConfig.max_wait_ms = parseInt(formData.turnV24EoSemanticMaxWaitMs, 10);
                }
                if (formData.turnV24EoSemanticPauseStateEnabled === 'true' || formData.turnV24EoSemanticPauseStateEnabled === 'false') {
                    semanticConfig.pause_state_enabled = formData.turnV24EoSemanticPauseStateEnabled === 'true';
                }
                config.end_of_speech = Object.keys(semanticConfig).length > 0 ? { mode: 'semantic', semantic_config: semanticConfig } : { mode: 'semantic' };
            }
            turnDetection = { mode: 'default', config };
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

        const asrCustomParams = this.getAsrCustomParams();

        // Build geofence from dropdowns if provided
        let geofence = null;
        if (formData.geofenceArea && formData.geofenceArea !== "") {
            // Determine the area value
            let areaValue = formData.geofenceArea;
            if (areaValue === "custom") {
                if (!formData.geofenceAreaCustom || !formData.geofenceAreaCustom.trim()) {
                    throw new Error('Custom area code is required when "Custom" is selected for geofence area');
                }
                areaValue = formData.geofenceAreaCustom.trim();
            }
            
            geofence = {
                area: areaValue
            };
            
            // Add exclude_area only if area is GLOBAL and exclude is selected
            if (areaValue === "GLOBAL" && formData.geofenceExclude && formData.geofenceExclude !== "") {
                let excludeValue = formData.geofenceExclude;
                
                if (excludeValue === "custom") {
                    if (!formData.geofenceExcludeCustom || !formData.geofenceExcludeCustom.trim()) {
                        throw new Error('Custom exclude area code is required when "Custom" is selected for geofence exclude area');
                    }
                    excludeValue = formData.geofenceExcludeCustom.trim();
                }
                
                geofence.exclude_area = excludeValue;
            }
        }

        let parsedLlmHeaders;
        if (formData.llmHeaders) {
            try {
                parsedLlmHeaders = JSON.parse(formData.llmHeaders);
            } catch (error) {
                throw new Error('LLM Headers must be valid JSON.');
            }
            if (parsedLlmHeaders === null || typeof parsedLlmHeaders !== 'object' || Array.isArray(parsedLlmHeaders)) {
                throw new Error('LLM Headers must be a JSON object.');
            }
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
                ...(geofence ? { geofence: geofence } : {}),
                ...(formData.enableRtm && formData.agentRtmUid ? { agent_rtm_uid: formData.agentRtmUid } : {}),
                ...(Object.keys(advancedFeatures).length > 0 ? { advanced_features: advancedFeatures } : {}),
                ...(sal ? { sal: sal } : {}),
                ...(formData.enableMllm ? {} : { asr: this.buildAsrConfig(formData) }), // Only include ASR if MLLM is not enabled
                ...(turnDetection && !formData.enableMllm ? { turn_detection: turnDetection } : {}),
                ...(interruption ? { interruption: interruption } : {}),
                ...(parameters ? { parameters: parameters } : {}),
                ...(formData.enableMllm ? {} : { // Only include LLM/TTS if MLLM is not enabled
                    llm: {
                        url: formData.llmUrl,
                        api_key: formData.llmApiKey,
                        ...(formData.llmAccessKey ? { access_key: formData.llmAccessKey } : {}),
                        ...(formData.llmSecret ? { secret: formData.llmSecret } : {}),
                        ...(parsedLlmHeaders ? { headers: parsedLlmHeaders } : {}),
                        ...(formData.llmVendor ? { vendor: formData.llmVendor } : {}),
                        ...(formData.llmStyle ? { style: formData.llmStyle } : {}),
                        system_messages: systemMessages,
                        greeting_message: formData.gMsg,
                        ...(() => {
                            const greetingConfigs = {};
                            if (formData.greetingMode && formData.greetingMode !== 'single_every') {
                                greetingConfigs.mode = formData.greetingMode;
                            }
                            if (typeof formData.llmGreetingInterruptable === 'boolean') {
                                greetingConfigs.interruptable = formData.llmGreetingInterruptable;
                            }
                            return Object.keys(greetingConfigs).length > 0
                                ? { greeting_configs: greetingConfigs }
                                : {};
                        })(),
                        failure_message: formData.fMsg,
                        ...(formData.fillerWordsEnable && formData.fillerWords ? (() => {
                            const phrases = formData.fillerWords.split(',').map(s => s.trim()).filter(s => s.length > 0);
                            if (phrases.length === 0) return {};
                            const responseWaitMs = parseInt(formData.fillerWordsResponseWaitMs, 10) || 1500;
                            const selectionRule = formData.fillerWordsSelectionRule || 'shuffle';
                            return {
                                filler_words: {
                                    enable: true,
                                    trigger: { mode: 'fixed_time', fixed_time_config: { response_wait_ms: Math.min(10000, Math.max(100, responseWaitMs)) } },
                                    content: { mode: 'static', static_config: { phrases, selection_rule: selectionRule } }
                                }
                            };
                        })() : {}),
                        max_history: 32,
                        input_modalities: formData.inputModalities,
                        output_modalities: formData.outputModalities,
                        params: {
                            model: formData.llmModel,
                            ...customParams
                        },
                        ...(formData.enableTools ? (() => {
                            const mcpServers = this.getMcpServers();
                            if (mcpServers.length > 0) {
                                return { mcp_servers: mcpServers };
                            }
                            return {};
                        })() : {})
                    }
                }),
                ...(formData.enableMllm ? { // Include MLLM if enabled
                    mllm: (() => {
                        const mllmTurnDetection = this.buildMllmTurnDetection(formData);
                        const mllmInputModalities = (formData.inputModalities || []).filter(modality => modality === 'audio' || modality === 'text');
                        const safeMllmInputModalities = mllmInputModalities.length > 0
                            ? mllmInputModalities
                            : ['audio'];
                        const mllmOutputModalities = (formData.outputModalities || []).filter(modality => modality === 'audio' || modality === 'text');
                        const safeMllmOutputModalities = mllmOutputModalities.length > 0
                            ? mllmOutputModalities
                            : ((formData.mllmVendor === 'vertexai' || formData.mllmVendor === 'gemini') ? ['audio'] : ['text', 'audio']);
                        const mllmConfig = {
                        enable: true,
                        ...(mllmTurnDetection ? { turn_detection: mllmTurnDetection } : {}),
                        ...((formData.mllmVendor === 'vertexai' || formData.mllmVendor === 'gemini') ? {} : { url: formData.mllmUrl }),
                        ...(formData.mllmVendor === 'vertexai' ? {} : { api_key: formData.mllmApiKey }),
                        ...(formData.mllmGreetingMessage ? { greeting_message: formData.mllmGreetingMessage } : {}),
                        ...(formData.mllmVendor ? { vendor: formData.mllmVendor } : {}),
                        ...(formData.mllmMaxHistory ? { max_history: parseInt(formData.mllmMaxHistory, 10) } : {}),
                        input_modalities: safeMllmInputModalities,
                        output_modalities: safeMllmOutputModalities,
                        ...(formData.mllmVendor === 'vertexai' ? {
                            params: {
                                model: formData.vertexaiModel || 'gemini-live-2.5-flash-preview-native-audio-09-2025',
                                adc_credentials_string: formData.vertexaiAdcCredentials,
                                project_id: formData.vertexaiProjectId,
                                location: formData.vertexaiLocation,
                                ...(formData.vertexaiVoice ? { voice: formData.vertexaiVoice } : {}),
                                ...(formData.vertexaiInstructions ? { instructions: formData.vertexaiInstructions } : {}),
                                transcribe_agent: formData.vertexaiTranscribeAgent,
                                transcribe_user: formData.vertexaiTranscribeUser,
                                ...mllmCustomParams
                            }
                        } : formData.mllmVendor === 'gemini' ? {
                            params: {
                                ...(formData.geminiModel ? { model: formData.geminiModel } : {}),
                                ...(formData.geminiVoice ? { voice: formData.geminiVoice } : {}),
                                ...(formData.geminiInstructions ? { instructions: formData.geminiInstructions } : {}),
                                affective_dialog: formData.geminiAffectiveDialog,
                                proactive_audio: formData.geminiProactiveAudio,
                                transcribe_agent: formData.geminiTranscribeAgent,
                                transcribe_user: formData.geminiTranscribeUser,
                                ...(formData.geminiApiVersion ? { http_options: { api_version: formData.geminiApiVersion } } : {}),
                                ...mllmCustomParams
                            }
                        } : formData.mllmVendor === 'custom' ? {
                            params: {
                                ...(formData.customMllmModel ? { model: formData.customMllmModel } : {}),
                                ...(formData.customMllmVoice ? { voice: formData.customMllmVoice } : {}),
                                ...(formData.customMllmInstructions ? { instructions: formData.customMllmInstructions } : {}),
                                ...mllmCustomParams
                            }
                        } : formData.mllmVendor === 'xai' ? {
                            params: {
                                voice: formData.mllmOpenaiVoice || 'eve',
                                language: 'en',
                                sample_rate: 24000,
                                ...(formData.mllmOpenaiInstructions ? { instructions: formData.mllmOpenaiInstructions } : {}),
                                ...mllmCustomParams
                            }
                        } : {
                            params: {
                                ...(formData.mllmOpenaiModel ? { model: formData.mllmOpenaiModel } : {}),
                                ...(formData.mllmOpenaiVoice ? { voice: formData.mllmOpenaiVoice } : {}),
                                ...(formData.mllmOpenaiInstructions ? { instructions: formData.mllmOpenaiInstructions } : {}),
                                ...((formData.mllmOpenaiTranscriptionLanguage || formData.mllmOpenaiTranscriptionModel || formData.mllmOpenaiTranscriptionPrompt) ? {
                                    input_audio_transcription: {
                                        ...(formData.mllmOpenaiTranscriptionLanguage ? { language: formData.mllmOpenaiTranscriptionLanguage } : {}),
                                        ...(formData.mllmOpenaiTranscriptionModel ? { model: formData.mllmOpenaiTranscriptionModel } : {}),
                                        ...(formData.mllmOpenaiTranscriptionPrompt ? { prompt: formData.mllmOpenaiTranscriptionPrompt } : {})
                                    }
                                } : {}),
                                ...mllmCustomParams
                            }
                        })
                        };
                        return mllmConfig;
                    })()
                } : {}),
                        //add chorus scenario for websdk fix for now, merge with dynamic parameters
                parameters: {
                    audio_scenario: "chorus",
                    ...(parameters || {})
                }
            }
        };

        if (!formData.enableMllm && config.properties.asr && Object.keys(asrCustomParams).length > 0) {
            config.properties.asr.params = {
                ...(config.properties.asr.params || {}),
                ...asrCustomParams
            };
        }

        // Add AI Avatar configuration if enabled
        if (formData.enableAvatar) {
            if (!formData.avatarApiKey) {
                throw new Error('Avatar API Key is required when AI Avatar is enabled');
            }
            if (formData.avatarVendor !== 'lemonslice' && !formData.avatarId) {
                throw new Error('Avatar ID is required when AI Avatar is enabled');
            }
            if (!formData.avatarRtcUid) {
                throw new Error('Avatar RTC UID is required when AI Avatar is enabled');
            }
            // Avatar RTC Token is optional - no validation needed

            const credsForAvatar = this.getStoredCredentials();
            const isLemonslice = formData.avatarVendor === 'lemonslice';
            // LemonSlice is a first-class UI option but REST still uses vendor "generic"
            const avatarVendorPayload = isLemonslice ? 'generic' : formData.avatarVendor;

            let avatarParams;
            if (formData.avatarVendor === 'anam') {
                avatarParams = {
                    agora_token: formData.avatarRtcToken || '',
                    agora_uid: formData.avatarRtcUid,
                    api_key: formData.avatarApiKey,
                    avatar_id: formData.avatarId,
                    sample_rate: parseInt(formData.anamSampleRate, 10),
                    quality: formData.anamQuality,
                    video_encoding: formData.anamVideoEncoding
                };
            } else if (formData.avatarVendor === 'generic') {
                avatarParams = {
                    api_key: formData.avatarApiKey,
                    api_base_url: formData.avatarApiBaseUrl,
                    avatar_id: formData.avatarId,
                    agora_appid: credsForAvatar.appId,
                    agora_channel: formData.channel,
                    agora_uid: formData.avatarRtcUid,
                    ...(formData.avatarRtcToken ? { agora_token: formData.avatarRtcToken } : {})
                };
            } else if (isLemonslice) {
                const imageSource = formData.lemonsliceImageSource || 'agent_id';
                avatarParams = {
                    api_key: formData.avatarApiKey,
                    api_base_url: formData.lemonsliceApiBaseUrl || 'https://lemonslice.com/api/liveai/agora',
                    avatar_id: 'lemonslice',
                    agora_appid: credsForAvatar.appId,
                    agora_channel: formData.channel,
                    agora_uid: formData.avatarRtcUid,
                    ...(formData.avatarRtcToken ? { agora_token: formData.avatarRtcToken } : {}),
                    [imageSource]: formData.lemonsliceImageValue,
                    sample_rate: this.getLemonsliceSampleRate(formData),
                    ...(formData.lemonsliceAspectRatio ? { aspect_ratio: formData.lemonsliceAspectRatio } : {}),
                    ...(formData.lemonsliceVideoEncoding ? { video_encoding: formData.lemonsliceVideoEncoding } : {}),
                    ...(formData.lemonsliceModel ? { model: formData.lemonsliceModel } : {}),
                    ...(formData.lemonsliceActivityIdleTimeout !== '' && formData.lemonsliceActivityIdleTimeout != null
                        ? { activity_idle_timeout: parseInt(formData.lemonsliceActivityIdleTimeout, 10) }
                        : {}),
                    ...(formData.lemonsliceResponseDoneTimeout !== '' && formData.lemonsliceResponseDoneTimeout != null
                        ? { response_done_timeout: parseFloat(formData.lemonsliceResponseDoneTimeout) }
                        : {}),
                    ...(formData.lemonsliceAgentPrompt ? { agent_prompt: formData.lemonsliceAgentPrompt } : {}),
                    ...(formData.lemonsliceAgentIdlePrompt ? { agent_idle_prompt: formData.lemonsliceAgentIdlePrompt } : {})
                };
            } else {
                avatarParams = {
                    api_key: formData.avatarApiKey,
                    agora_uid: formData.avatarRtcUid,
                    avatar_id: formData.avatarId,
                    ...(formData.avatarRtcToken && formData.avatarRtcToken !== '' ? { agora_token: formData.avatarRtcToken } : {})
                };
            }

            config.properties.avatar = {
                vendor: avatarVendorPayload,
                enable: true,
                params: avatarParams
            };

            // Add LiveAvatar/HeyGen specific parameters
            if (formData.avatarVendor === 'heygen' || formData.avatarVendor === 'liveavatar') {
                config.properties.avatar.params.quality = formData.heygenQuality;
                config.properties.avatar.params.disable_idle_timeout = formData.heygenDisableIdleTimeout;
                if (formData.heygenActivityIdleTimeout) {
                    config.properties.avatar.params.activity_idle_timeout = parseInt(formData.heygenActivityIdleTimeout, 10);
                }
            }

            const avatarCustomParams = this.getAvatarCustomParams();
            if (Object.keys(avatarCustomParams).length > 0) {
                config.properties.avatar.params = {
                    ...config.properties.avatar.params,
                    ...avatarCustomParams
                };
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
                        ...(document.getElementById("elevenLabsBaseUrl")?.value ? { base_url: document.getElementById("elevenLabsBaseUrl").value.trim() } : {}),
                        model_id: modelId,
                        voice_id: finalVoiceId,
                        ...(document.getElementById("elevenLabsSampleRate")?.value ? { sample_rate: parseInt(document.getElementById("elevenLabsSampleRate").value, 10) } : {}),
                        ...(document.getElementById("elevenLabsSpeed")?.value ? { speed: parseFloat(document.getElementById("elevenLabsSpeed").value) } : {}),
                        ...(document.getElementById("elevenLabsStability")?.value ? { stability: parseFloat(document.getElementById("elevenLabsStability").value) } : {}),
                        ...(document.getElementById("elevenLabsSimilarityBoost")?.value ? { similarity_boost: parseFloat(document.getElementById("elevenLabsSimilarityBoost").value) } : {}),
                        ...(document.getElementById("elevenLabsStyle")?.value ? { style: parseFloat(document.getElementById("elevenLabsStyle").value) } : {}),
                        ...(document.getElementById("elevenLabsUseSpeakerBoost") ? { use_speaker_boost: document.getElementById("elevenLabsUseSpeakerBoost").value === "true" } : {})
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
                        ...(document.getElementById("openaiBaseUrl")?.value ? { base_url: document.getElementById("openaiBaseUrl").value.trim() } : {}),
                        model: document.getElementById("openaiModel").value,
                        voice: document.getElementById("openaiVoice").value,
                        ...(document.getElementById("openaiInstructions")?.value ? { instructions: document.getElementById("openaiInstructions").value } : {}),
                        ...(document.getElementById("openaiSpeed")?.value ? { speed: parseFloat(document.getElementById("openaiSpeed").value) } : {})
                    }
                };
            } else if (formData.vendor === "deepgram") {
                const deepgramParams = {
                    api_key: document.getElementById("deepgramTtsKey").value,
                    model: document.getElementById("deepgramModel").value
                };
                if (document.getElementById("deepgramBaseUrl")?.value) {
                    deepgramParams.base_url = document.getElementById("deepgramBaseUrl").value.trim();
                }
                if (document.getElementById("deepgramSampleRate")?.value) {
                    deepgramParams.sample_rate = parseInt(document.getElementById("deepgramSampleRate").value, 10);
                }
                config.properties.tts = {
                    vendor: "deepgram",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: deepgramParams
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
                const rimeSrEl = document.getElementById("rimeSamplingRate");
                const rimeSrRaw = rimeSrEl ? rimeSrEl.value.trim() : "";
                let rimeSamplingRate = 24000;
                if (rimeSrRaw) {
                    const n = parseInt(rimeSrRaw, 10);
                    if (Number.isFinite(n) && n >= 4000 && n <= 44100) {
                        rimeSamplingRate = n;
                    }
                }
                const rimeParams = {
                    api_key: document.getElementById("rimeTtsKey").value,
                    speaker: document.getElementById("rimeSpeaker").value,
                    modelId: document.getElementById("rimeModelId").value,
                    samplingRate: rimeSamplingRate
                };
                config.properties.tts = {
                    vendor: "rime",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: rimeParams
                };
            } else if (formData.vendor === "minimax") {
                const minimaxSrEl = document.getElementById("minimaxSampleRate");
                const minimaxSrRaw = minimaxSrEl ? minimaxSrEl.value.trim() : "";
                let minimaxSampleRate = 24000;
                if (minimaxSrRaw) {
                    const n = parseInt(minimaxSrRaw, 10);
                    if (Number.isFinite(n) && n >= 8000 && n <= 44100) {
                        minimaxSampleRate = n;
                    }
                }
                config.properties.tts = {
                    vendor: "minimax",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        api_key: document.getElementById("minimaxTtsKey").value,
                        group_id: document.getElementById("minimaxGroupId").value,
                        model: document.getElementById("minimaxModel").value,
                        voice_setting: {
                            voice_id: this.getMinimaxVoiceId()
                        },
                        audio_setting: {
                            sample_rate: minimaxSampleRate
                        },
                        url: document.getElementById("minimaxUrl").value
                    }
                };
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
            } else if (formData.vendor === "playht") {
                config.properties.tts = {
                    vendor: "playht",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        api_key: document.getElementById("playhtTtsKey").value,
                        user_id: document.getElementById("playhtUserId").value,
                        voice_engine: document.getElementById("playhtVoiceEngine").value,
                        voice: document.getElementById("playhtVoice").value,
                        ...(document.getElementById("playhtSpeed")?.value ? { speed: parseFloat(document.getElementById("playhtSpeed").value) } : {})
                    }
                };
            } else if (formData.vendor === "sarvam") {
                const sarvamSpeakerSelect = document.getElementById("sarvamSpeaker").value;
                const finalSpeaker = sarvamSpeakerSelect === "other" 
                    ? document.getElementById("sarvamSpeakerId").value.trim()
                    : sarvamSpeakerSelect;
                
                const sarvamParams = {
                    api_subscription_key: document.getElementById("sarvamTtsKey").value,
                    speaker: finalSpeaker,
                    target_language_code: document.getElementById("sarvamLanguageCode").value
                };
                
                if (document.getElementById("sarvamPitch")?.value) {
                    sarvamParams.pitch = parseFloat(document.getElementById("sarvamPitch").value);
                }
                if (document.getElementById("sarvamPace")?.value) {
                    sarvamParams.pace = parseFloat(document.getElementById("sarvamPace").value);
                }
                if (document.getElementById("sarvamLoudness")?.value) {
                    sarvamParams.loudness = parseFloat(document.getElementById("sarvamLoudness").value);
                }
                if (document.getElementById("sarvamSampleRate")?.value) {
                    sarvamParams.sample_rate = parseInt(document.getElementById("sarvamSampleRate").value, 10);
                }
                
                config.properties.tts = {
                    vendor: "sarvam",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: sarvamParams
                };
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
            } else if (formData.vendor === "murf") {
                config.properties.tts = {
                    vendor: "murf",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        api_key: document.getElementById("murfApiKey").value,
                        base_url: document.getElementById("murfBaseUrl").value,
                        voiceId: document.getElementById("murfVoiceId").value,
                        locale: document.getElementById("murfLocale").value,
                        rate: parseFloat(document.getElementById("murfRate").value || "0"),
                        pitch: parseFloat(document.getElementById("murfPitch").value || "0"),
                        model: document.getElementById("murfModel").value,
                        sample_rate: parseInt(document.getElementById("murfSampleRate").value || "24000", 10)
                    }
                };
            } else if (formData.vendor === "gradium") {
                const gradiumParams = {
                    api_key: document.getElementById("gradiumTtsKey").value,
                    url: document.getElementById("gradiumUrl").value.trim(),
                    model_name: document.getElementById("gradiumModelName").value.trim() || "default",
                    voice_id: document.getElementById("gradiumVoiceId").value.trim()
                };
                if (document.getElementById("gradiumSampleRate")?.value) {
                    gradiumParams.sample_rate = parseInt(document.getElementById("gradiumSampleRate").value, 10);
                }
                config.properties.tts = {
                    vendor: "gradium",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: gradiumParams
                };
            } else if (formData.vendor === "mistral") {
                config.properties.tts = {
                    vendor: "mistral",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    params: {
                        api_key: document.getElementById("mistralTtsKey").value,
                        model: document.getElementById("mistralModel").value.trim(),
                        voice: document.getElementById("mistralVoice").value.trim()
                    }
                };
            } else if (formData.vendor === "generic_http") {
                const genericHttpParams = {};
                const genericHttpKey = document.getElementById("genericHttpTtsKey")?.value.trim();
                if (genericHttpKey) genericHttpParams.api_key = genericHttpKey;
                if (document.getElementById("genericHttpModel")?.value.trim()) {
                    genericHttpParams.model = document.getElementById("genericHttpModel").value.trim();
                }
                if (document.getElementById("genericHttpVoice")?.value.trim()) {
                    genericHttpParams.voice = document.getElementById("genericHttpVoice").value.trim();
                }
                if (document.getElementById("genericHttpSpeed")?.value) {
                    genericHttpParams.speed = parseFloat(document.getElementById("genericHttpSpeed").value);
                }
                if (document.getElementById("genericHttpSampleRate")?.value) {
                    genericHttpParams.sample_rate = parseInt(document.getElementById("genericHttpSampleRate").value, 10);
                }
                if (document.getElementById("genericHttpResponseFormat")?.value.trim()) {
                    genericHttpParams.response_format = document.getElementById("genericHttpResponseFormat").value.trim();
                }
                if (document.getElementById("genericHttpInstruction")?.value.trim()) {
                    genericHttpParams.instruction = document.getElementById("genericHttpInstruction").value.trim();
                }

                const genericHttpTts = {
                    vendor: "generic_http",
                    ...(skip_patterns ? { skip_patterns } : {}),
                    url: document.getElementById("genericHttpUrl").value.trim(),
                    params: genericHttpParams
                };

                const headersRaw = document.getElementById("genericHttpHeaders")?.value.trim();
                if (headersRaw) {
                    genericHttpTts.headers = JSON.parse(headersRaw);
                }

                config.properties.tts = genericHttpTts;
            }

            const ttsCustomParams = this.getTtsCustomParams();
            if (
                config.properties.tts &&
                config.properties.tts.params &&
                Object.keys(ttsCustomParams).length > 0
            ) {
                config.properties.tts.params = {
                    ...config.properties.tts.params,
                    ...ttsCustomParams
                };
            }

            this.enforceAvatarTtsSampleRate(config, formData);
        }

        // Add RTC encryption configuration if enabled (only if mode is selected and not empty)
        // If no encryption mode is selected (empty string), the rtc parameter will not be included
        if (formData.rtcEncryptionMode && formData.rtcEncryptionMode.trim() !== '') {
            const encryptionMode = parseInt(formData.rtcEncryptionMode, 10);
            
            // Validate that we got a valid mode number
            if (isNaN(encryptionMode) || encryptionMode < 1 || encryptionMode > 8) {
                throw new Error('Invalid RTC encryption mode selected');
            }
            
            const encryptionKey = formData.rtcEncryptionKey;
            
            if (!encryptionKey || encryptionKey.trim() === '') {
                throw new Error('Encryption key is required when RTC encryption mode is set');
            }
            
            // Use encryption key directly (max 31 characters, no conversion needed)
            const trimmedKey = encryptionKey.trim();
            
            // Validate key length
            if (trimmedKey.length > 31) {
                throw new Error('Encryption key must be 31 characters or less');
            }
            
            if (trimmedKey.length === 0) {
                throw new Error('Encryption key cannot be empty');
            }
            
            const rtc = {
                encryption_mode: encryptionMode,
                encryption_key: trimmedKey
            };
            
            // For GCM2 modes (7 and 8), salt is required
            // Note: Salt is sent as base64 string (not converted to Uint8Array for API)
            // The API expects base64 string, client SDK expects Uint8Array
            if (encryptionMode === 7 || encryptionMode === 8) {
                const encryptionSalt = formData.rtcEncryptionSalt;
                if (!encryptionSalt || encryptionSalt.trim() === '') {
                    throw new Error('Encryption salt is required for AES-128-GCM2 (7) and AES-256-GCM2 (8) modes');
                }
                // Salt is sent as base64 string to the API (API will handle conversion)
                rtc.encryption_salt = encryptionSalt.trim();
            }
            
            config.properties.rtc = rtc;
        }
        // If no encryption mode is selected, rtc property is not added to config.properties

        // If a pipeline ID is provided, attach it to the top-level config and
        // strip vendor-specific ASR/LLM/TTS/MLLM config. When not overriding LLM,
        // remove llm entirely (no empty object) — modalities are not sent.
        if (formData.pipelineId && formData.pipelineId.trim() !== '') {
            config.pipeline_id = formData.pipelineId.trim();
            if (config.properties) {
                const overrideLlm = !!formData.overrideLlm;
                const overrideTts = !!formData.overrideTts;
                const overrideAsr = !!formData.overrideAsr;

                // Pipeline mode: remove MLLM completely
                delete config.properties.mllm;

                // Conditionally remove vendor-specific blocks
                if (!overrideAsr) delete config.properties.asr;
                if (!overrideTts) delete config.properties.tts;

                // Conditionally remove LLM config (including input/output modalities).
                // Only keep llm when override LLM is enabled.
                if (!overrideLlm) {
                    delete config.properties.llm;
                }
            }
        }

        // v2.9 managed mode: credential_mode replaces deprecated top-level preset.
        if (!formData.enableMllm) {
            if (presetHasAsr && formData.asrPreset && config.properties.asr) {
                this.applyManagedProviderBlock(config.properties.asr, formData.asrPreset, 'asr');
            }
            if (presetHasLlm && formData.llmPreset && config.properties.llm) {
                this.applyManagedProviderBlock(config.properties.llm, formData.llmPreset, 'llm');
            }
            if (presetHasTts && formData.ttsPreset && config.properties.tts) {
                this.applyManagedProviderBlock(config.properties.tts, formData.ttsPreset, 'tts');
            }
        }

        return config;
    }

    /**
     * Generate Agora RTC + RTM token
     * @param {string} appId - Agora App ID
     * @param {string} appCertificate - Agora App Certificate
     * @param {string} channelName - Channel name
     * @param {string|number} userAccount - User account (UID)
     * @param {number} role - Role (1 = PUBLISHER, 2 = SUBSCRIBER)
     * @returns {Promise<string>} Generated token
     */
    static async generateAgoraToken(appId, appCertificate, channelName, userAccount, role = 1) {
        if (!appId || !appCertificate) {
            throw new Error("App ID and App Certificate are required to generate tokens");
        }
        if (!channelName) {
            throw new Error("Channel name is required");
        }
        // Default empty / undefined userAccount to 0 so callers
        // can omit UID for cases like client tokens.
        const finalUserAccount = (userAccount === undefined || userAccount === null || userAccount === '')
            ? 0
            : userAccount;

        const TOKEN_EXPIRE = 3600; // 60 minutes in seconds
        const PRIVILEGE_EXPIRE = 3600; // 60 minutes in seconds

        try {
            const token = await RtcTokenBuilder.buildTokenWithRtm(
                appId,
                appCertificate,
                channelName,
                finalUserAccount.toString(),
                role,
                TOKEN_EXPIRE,
                PRIVILEGE_EXPIRE
            );
            return token;
        } catch (error) {
            console.error("Error generating token:", error);
            throw new Error("Failed to generate token: " + error.message);
        }
    }

    /**
     * Conversational AI API error reasons. InvalidRequest is deprecated.
     */
    static CONVO_AI_ERROR_REASONS_V27 = {
        InvalidRequestBody: 'Request body is invalid.',
        MissingRequiredField: 'A required field is missing.',
        InvalidFieldValue: 'A field value is invalid.',
        ServiceNotEnabled: 'Conversational AI service is not enabled for this project.',
        AccountSuspended: 'Account is suspended.',
        ResourceAllocationFailed: 'Failed to allocate agent resources.'
    };

    /** @deprecated — replaced by InvalidRequestBody, MissingRequiredField, InvalidFieldValue */
    static isDeprecatedConvoAiReason(reason) {
        return reason === 'InvalidRequest';
    }

    static describeConvoAiErrorReason(reason) {
        if (this.isDeprecatedConvoAiReason(reason)) {
            return 'Deprecated reason InvalidRequest. Map to InvalidRequestBody, MissingRequiredField, or InvalidFieldValue.';
        }
        return this.CONVO_AI_ERROR_REASONS_V27[reason] || null;
    }

    static formatConvoAiApiError(error) {
        const message = error && error.message ? error.message : String(error);
        try {
            const parsed = JSON.parse(message);
            const reason = parsed.reason || parsed.error?.reason;
            const status = parsed.status || parsed.code;
            const hint = reason ? this.describeConvoAiErrorReason(reason) : null;
            const parts = [message];
            if (status) parts.unshift(`HTTP ${status}`);
            if (hint) parts.push(hint);
            return parts.join(' — ');
        } catch (_e) {
            return message;
        }
    }
} 