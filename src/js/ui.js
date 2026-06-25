// UI Module
// UI Module
// UI Module

window.UI = class UI {
    constructor() {
        this.mediaProcessor = null;
        this.agoraAPI = null;
        this.subtitleManager = null;
        this.params = {};
        this.mllmParams = {};
        this.asrParams = {};
        this.ttsParams = {};
        this.avatarParams = {};
        this.mcpServers = {};
        this.lastAgentListCursor = null;
        this.agentListPageHistory = []; // History of accumulated results for back navigation
        this.agentListCurrentPageIndex = -1; // Current position in history (-1 = first page)
        this.agentListCumulativeCount = 0; // Total agents loaded across all pages

        // Track token generation times and expiry timers for convenience features
        this.tokenGeneratedAt = { agent: null, client: null, sip: null, avatar: null };
        this.tokenExpiryTimers = { agent: null, client: null, sip: null, avatar: null };
    }

    initialize(mediaProcessor, agoraAPI, subtitleManager = null) {
        this.mediaProcessor = mediaProcessor;
        this.agoraAPI = agoraAPI;
        this.subtitleManager = subtitleManager;

        if (window.FormSettingsPersistence) {
            window.FormSettingsPersistence.applyFromStorage();
        }

        this.setupEventListeners();
        this.setupMessageUIState();
        this.checkCredentials();
        this.populateMicrosoftLangList();
        this.setupDrawerListeners();
        // Initialize TTS vendor blocks visibility
        this.handleTtsVendorChange();
        // Dependent UI (checkbox panels) runs via FormSettingsPersistence.syncDependentUI() at end of DOMContentLoaded
        // Update base URL indicator
        this.updateBaseUrlIndicator();

        // Try to auto-generate agent + client tokens once channel + credentials exist
        this.autoGenerateAgentAndClientTokensIfPossible();

        if (window.FormSettingsPersistence) {
            window.FormSettingsPersistence.attachSaveListeners();
        }

        // Initialize message UI state after a short delay to ensure all elements are loaded
        setTimeout(() => {
            this.updateMessageUIState();
        }, 100);

        // Initialize camera preview manager
        this.initializeCameraPreviewManager();
    }

    /** Non-event side effects after saved settings (tokens, avatar layout). Called from syncDependentUI(). */
    syncRestoredFormDependents() {
        this.handleGeofenceAreaChange();
        this.handleGeofenceExcludeChange();
        this.handleTtsVendorChange();
        if (
            window.subtitleManager &&
            typeof window.subtitleManager.updateLiveSubtitleMainControlsVisibility === "function"
        ) {
            window.subtitleManager.updateLiveSubtitleMainControlsVisibility();
        }
        this.applyEnableAvatarUiIfChecked();
        this.trySyncAvatarFieldsFromClient();
        this.autoGenerateAgentAndClientTokensIfPossible();
        this.autoConfigureAvatarIfPossible();
        this.updateMessageUIState();
    }

    /** Avatar enable UI without the Agora token modal (used on restore and after change handler). */
    applyEnableAvatarUiIfChecked() {
        const enableAvatar = document.getElementById("enableAvatar");
        if (!enableAvatar || !enableAvatar.checked) return;

        const avatarImage = document.getElementById("avatarImage");
        const avatarVideo = document.getElementById("avatarVideo");
        const avatarPlaceholder = document.getElementById("avatarPlaceholder");
        const clientRtcUid = document.getElementById("clientRtcUid");
        const remoteRtcUids = document.getElementById("remoteRtcUids");

        if (avatarImage) avatarImage.style.display = "none";
        if (avatarVideo) avatarVideo.style.display = "none";
        if (avatarPlaceholder) {
            avatarPlaceholder.style.display = "flex";
            avatarPlaceholder.innerHTML = `
          <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#00ffff" stroke-width="2" opacity="0.3"/>
            <g transform="translate(60, 45)">
              <circle cx="0" cy="0" r="8" fill="none" stroke="#00ffff" stroke-width="1.5"/>
              <circle cx="-12" cy="-8" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
              <circle cx="12" cy="-8" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
              <circle cx="-8" cy="12" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
              <circle cx="8" cy="12" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
              <line x1="-12" y1="-8" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
              <line x1="12" y1="-8" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
              <line x1="-8" y1="12" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
              <line x1="8" y1="12" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
            </g>
            <text x="60" y="85" text-anchor="middle" fill="#00ffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">AI AVATAR</text>
          </svg>
        `;
        }

        if (clientRtcUid && !clientRtcUid.value.trim()) {
            clientRtcUid.value = "1001";
        }
        document.getElementById("clientUidNote")?.classList.remove("hidden");
        if (remoteRtcUids && clientRtcUid) {
            remoteRtcUids.value = clientRtcUid.value.trim() || "1001";
        }
        document.getElementById("avatarUidNote")?.classList.remove("hidden");
    }

    /** Match index.html AI Avatar enabled behavior without opening the token modal (e.g. after restore). */
    trySyncAvatarFieldsFromClient() {
        const enableAvatar = document.getElementById("enableAvatar");
        if (!enableAvatar || !enableAvatar.checked) return;
        const clientRtcUid = document.getElementById("clientRtcUid");
        const remoteRtcUids = document.getElementById("remoteRtcUids");
        if (clientRtcUid && !clientRtcUid.value.trim()) {
            clientRtcUid.value = "1001";
        }
        if (remoteRtcUids && clientRtcUid) {
            remoteRtcUids.value = clientRtcUid.value.trim() || "1001";
        }
        document.getElementById("clientUidNote")?.classList.remove("hidden");
        document.getElementById("avatarUidNote")?.classList.remove("hidden");
    }

    /**
     * When AI Avatar is on and app certificate + channel are set, pin avatar RTC UID to 1003 and mint token.
     */
    async autoConfigureAvatarIfPossible() {
        try {
            const { appId, appCertificate } = Utils.getStoredCredentials();
            if (!appId || !appCertificate) return;
            const enableAvatar = document.getElementById("enableAvatar");
            if (!enableAvatar || !enableAvatar.checked) return;
            const channelName = document.getElementById("agoraChannelName")?.value.trim();
            if (!channelName) return;
            const avatarUidInput = document.getElementById("avatarRtcUid");
            if (avatarUidInput) {
                avatarUidInput.value = "1003";
            }
            await this.generateAvatarRtcToken({ silent: true });
        } catch (e) {
            console.warn("Avatar auto-config skipped:", e);
        }
    }

    setupEventListeners() {
        // TTS Vendor change handler
        const ttsVendor = document.getElementById("ttsVendor");
        if (ttsVendor) {
            ttsVendor.addEventListener("change", () => this.handleTtsVendorChange());
        }
        
        // Microsoft language change handler
        const microsoftLangSelect = document.getElementById("microsoftLangSelect");
        if (microsoftLangSelect) {
            microsoftLangSelect.addEventListener("change", () => this.handleMicrosoftLangChange());
        }
        
        // ElevenLabs voice change handler
        const elevenLabsVoiceSelect = document.getElementById("elevenLabsVoiceSelect");
        if (elevenLabsVoiceSelect) {
            elevenLabsVoiceSelect.addEventListener("change", () => this.handleElevenLabsVoiceChange());
        }
        
        // Sarvam speaker change handler
        const sarvamSpeakerSelect = document.getElementById("sarvamSpeaker");
        if (sarvamSpeakerSelect) {
            sarvamSpeakerSelect.addEventListener("change", () => this.handleSarvamSpeakerChange());
        }
        
        // Geofence area change handler
        const geofenceAreaSelect = document.getElementById("geofenceArea");
        if (geofenceAreaSelect) {
            geofenceAreaSelect.addEventListener("change", () => this.handleGeofenceAreaChange());
        }
        
        // Geofence exclude change handler
        const geofenceExcludeSelect = document.getElementById("geofenceExclude");
        if (geofenceExcludeSelect) {
            geofenceExcludeSelect.addEventListener("change", () => this.handleGeofenceExcludeChange());
        }

        // When channel name changes, try to auto-generate agent/client tokens
        const channelInput = document.getElementById("agoraChannelName");
        if (channelInput) {
            channelInput.addEventListener("change", () => this.autoGenerateAgentAndClientTokensIfPossible());
            channelInput.addEventListener("blur", () => this.autoGenerateAgentAndClientTokensIfPossible());
        }

        // Add parameter field button
        const addParamBtn = document.getElementById("addParamBtn");
        if (addParamBtn) {
            addParamBtn.addEventListener("click", () => this.addParamField());
        }
        const addMllmParamBtn = document.getElementById("addMllmParamBtn");
        if (addMllmParamBtn) {
            addMllmParamBtn.addEventListener("click", () => this.addMllmParamField());
        }
        const addAsrParamBtn = document.getElementById("addAsrParamBtn");
        if (addAsrParamBtn) {
            addAsrParamBtn.addEventListener("click", () => this.addAsrParamField());
        }
        const addTtsParamBtn = document.getElementById("addTtsParamBtn");
        if (addTtsParamBtn) {
            addTtsParamBtn.addEventListener("click", () => this.addTtsParamField());
        }
        const addAvatarParamBtn = document.getElementById("addAvatarParamBtn");
        if (addAvatarParamBtn) {
            addAvatarParamBtn.addEventListener("click", () => this.addAvatarParamField());
        }

        // Enable Tools checkbox handler - use event delegation on document
        // This works even if elements are added later
        document.addEventListener("change", (e) => {
            if (e.target.id === "enableTools") {
                this.handleEnableToolsChange();
            } else if (e.target.id === "fillerWordsEnable") {
                this.handleFillerWordsEnableChange();
            }
        });
        
        
        document.addEventListener("click", (e) => {
            if (e.target.id === "addMcpServerBtn") {
                this.addMcpServerField();
            }
        });

        // Setup message UI state management
        this.setupMessageUIState();

        // Credentials modal
        const clearSavedFormSettingsBtn = document.getElementById("clearSavedFormSettingsBtn");
        if (clearSavedFormSettingsBtn) {
            clearSavedFormSettingsBtn.addEventListener("click", () => this.clearSavedFormSettingsAndReload());
        }

        const setCredsBtn = document.getElementById("setCredsBtn");
        if (setCredsBtn) {
            setCredsBtn.addEventListener("click", () => this.openCredsModal());
        }
        const saveCredsBtn = document.getElementById("saveCredsBtn");
        if (saveCredsBtn) {
            saveCredsBtn.addEventListener("click", () => this.saveCreds());
        }

        // Token generation buttons
        const generateAgoraRtcTokenBtn = document.getElementById("generateAgoraRtcTokenBtn");
        if (generateAgoraRtcTokenBtn) {
            generateAgoraRtcTokenBtn.addEventListener("click", () => this.generateAgoraRtcToken());
        }
        const generateAvatarRtcTokenBtn = document.getElementById("generateAvatarRtcTokenBtn");
        if (generateAvatarRtcTokenBtn) {
            generateAvatarRtcTokenBtn.addEventListener("click", () => this.generateAvatarRtcToken());
        }
        const generateClientRtcTokenBtn = document.getElementById("generateClientRtcTokenBtn");
        if (generateClientRtcTokenBtn) {
            generateClientRtcTokenBtn.addEventListener("click", () => this.generateClientRtcToken());
        }
        const generateSipRtcTokenBtn = document.getElementById("generateSipRtcTokenBtn");
        if (generateSipRtcTokenBtn) {
            generateSipRtcTokenBtn.addEventListener("click", () => this.generateSipRtcToken());
        }

        // Volume widget (hidden in new layout)
        const toggleVolumeBtn = document.getElementById("toggleVolumeBtn");
        if (toggleVolumeBtn) {
            toggleVolumeBtn.addEventListener("click", () => this.toggleVolumeWidget());
        }

        // Channel controls
        const joinChannel = document.getElementById("joinChannel");
        if (joinChannel) {
            joinChannel.addEventListener("click", () => this.joinChannel());
        }
        const leaveChannel = document.getElementById("leaveChannel");
        if (leaveChannel) {
            leaveChannel.addEventListener("click", () => this.leaveChannel());
        }

        // Agent controls
        const createAgentBtn = document.getElementById("createAgentBtn");
        if (createAgentBtn) {
            createAgentBtn.addEventListener("click", () => this.createAgent());
        }
        const updateAgentBtn = document.getElementById("updateAgentBtn");
        if (updateAgentBtn) {
            updateAgentBtn.addEventListener("click", () => this.updateAgent());
        }
        const stopAgentBtn = document.getElementById("stopAgentBtn");
        if (stopAgentBtn) {
            stopAgentBtn.addEventListener("click", () => this.stopAgent());
        }
        const queryAgentBtn = document.getElementById("queryAgentBtn");
        if (queryAgentBtn) {
            queryAgentBtn.addEventListener("click", () => this.queryAgent());
        }
        const listAgentsBtn = document.getElementById("listAgentsBtn");
        if (listAgentsBtn) {
            listAgentsBtn.addEventListener("click", () => this.listAgents());
        }
        const toggleAgentListFilters = document.getElementById("toggleAgentListFilters");
        if (toggleAgentListFilters) {
            toggleAgentListFilters.addEventListener("click", () => this.toggleAgentListFilters());
        }
        const toggleConversationTurnsOptions = document.getElementById("toggleConversationTurnsOptions");
        if (toggleConversationTurnsOptions) {
            toggleConversationTurnsOptions.addEventListener("click", () => this.toggleConversationTurnsOptions());
        }
        const agentListNextPageBtn = document.getElementById("agentListNextPageBtn");
        if (agentListNextPageBtn) {
            agentListNextPageBtn.addEventListener("click", () => this.listAgentsNextPage());
        }
        const agentListPrevPageBtn = document.getElementById("agentListPrevPageBtn");
        if (agentListPrevPageBtn) {
            agentListPrevPageBtn.addEventListener("click", () => this.listAgentsPrevPage());
        }
        
        // Auto-populate to_time with current time when filters are shown
        const agentListFilterToTime = document.getElementById("agentListFilterToTime");
        if (agentListFilterToTime) {
            // Set current time when the input is first shown
            this.setCurrentTimeForToTime();
        }

        // Device settings
        const deviceSettingsBtn = document.getElementById("deviceSettingsBtn");
        if (deviceSettingsBtn) {
            deviceSettingsBtn.addEventListener("click", () => this.openDeviceSettings());
        }
        const saveDeviceSettings = document.getElementById("saveDeviceSettings");
        if (saveDeviceSettings) {
            saveDeviceSettings.addEventListener("click", () => this.saveDeviceSettings());
        }
        const cancelDeviceSettings = document.getElementById("cancelDeviceSettings");
        if (cancelDeviceSettings) {
            cancelDeviceSettings.addEventListener("click", () => this.closeDeviceSettings());
        }
        const retryDeviceLoad = document.getElementById("retryDeviceLoad");
        if (retryDeviceLoad) {
            retryDeviceLoad.addEventListener("click", () => this.loadDeviceLists());
        }

        // Microphone control
        const toggleMicBtn = document.getElementById("toggleMicBtn");
        if (toggleMicBtn) {
            toggleMicBtn.addEventListener("click", () => this.toggleMicrophone());
        }

        // Camera control
        const toggleCameraBtn = document.getElementById("toggleCameraBtn");
        if (toggleCameraBtn) {
            toggleCameraBtn.addEventListener("click", () => this.toggleCamera());
        }

        // Message sending controls
        const sendTextBtn = document.getElementById("sendTextBtn");
        if (sendTextBtn) {
            sendTextBtn.addEventListener("click", () => this.sendTextMessage());
        }
        const sendImageBtn = document.getElementById("sendImageBtn");
        if (sendImageBtn) {
            sendImageBtn.addEventListener("click", () => this.sendImageMessage());
        }
        const sendImageFileBtn = document.getElementById("sendImageFileBtn");
        if (sendImageFileBtn) {
            sendImageFileBtn.addEventListener("click", () => this.sendImageFileMessage());
        }
        
        // Auto-send image file when selected
        const imageFileInput = document.getElementById("imageFileInput");
        if (imageFileInput) {
            imageFileInput.addEventListener("change", () => {
                // Check if image upload is enabled before sending
                if (this.isImageUploadEnabled()) {
                    this.sendImageFileMessage();
                } else {
                    if (!this.isRTMEnabled()) {
                        alert("Image upload is disabled. Enable RTM mode to use image upload.");
                    } else if (this.isDataStreamMode()) {
                        alert("Image upload is disabled. Data stream mode is view-only and does not support sending messages.");
                    } else {
                        alert("Image upload is disabled. Mute camera to use image upload.");
                    }
                    imageFileInput.value = ""; // Clear the file input
                }
            });
        }

        // Update camera info message when image input changes
        const inputImage = document.getElementById("inputImage");
        if (inputImage) {
            inputImage.addEventListener("change", () => {
                this.updateCameraInfoMessage();
            });
        }
        
        // Handle Enter key in message inputs
        const messageInput = document.getElementById("messageInput");
        if (messageInput) {
            messageInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    this.sendTextMessage();
                }
            });
        }
        const imageUrlInput = document.getElementById("imageUrlInput");
        if (imageUrlInput) {
            imageUrlInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    this.sendImageMessage();
                }
            });
        }
    }

    async toggleMicrophone() {
        if (!this.mediaProcessor || !this.mediaProcessor.localTracks.audioTrack) return;

        const audioTrack = this.mediaProcessor.localTracks.audioTrack;
        const micBtn = document.getElementById("toggleMicBtn");
        const micIcon = micBtn.querySelector(".mic-icon");
        const micOffIcon = micBtn.querySelector(".mic-off-icon");
        
        try {
            if (micBtn.classList.contains("muted")) {
                // Currently muted, unmute it
                await audioTrack.setEnabled(true);
                micBtn.classList.remove("muted");
                micBtn.title = "Mute Microphone";
                micIcon.classList.remove("hidden");
                micOffIcon.classList.add("hidden");
            } else {
                // Currently unmuted, mute it
                await audioTrack.setEnabled(false);
                micBtn.classList.add("muted");
                micBtn.title = "Unmute Microphone";
                micIcon.classList.add("hidden");
                micOffIcon.classList.remove("hidden");
            }
        } catch (error) {
            console.error('Failed to toggle microphone:', error);
        }
    }

    async toggleCamera() {
        if (!this.mediaProcessor || !this.mediaProcessor.localTracks.videoTrack) {
            console.warn('No video track available for toggling - camera will be controlled when you join a channel');
            // Show a user-friendly message
            alert('Camera controls will be available once you join a channel with image modality enabled.');
            return;
        }

        const videoTrack = this.mediaProcessor.localTracks.videoTrack;
        const cameraBtn = document.getElementById("toggleCameraBtn");
        const cameraIcon = cameraBtn.querySelector(".camera-icon");
        const cameraOffIcon = cameraBtn.querySelector(".camera-off-icon");
        
        try {
            if (cameraBtn.classList.contains("muted")) {
                // Currently muted, unmute it
                await videoTrack.setEnabled(true);
                cameraBtn.classList.remove("muted");
                cameraBtn.title = "Mute Camera";
                cameraIcon.classList.remove("hidden");
                cameraOffIcon.classList.add("hidden");
                
                // Update camera preview visibility
                if (this.mediaProcessor && this.mediaProcessor.updateCameraPreviewVisibility) {
                    this.mediaProcessor.updateCameraPreviewVisibility(true);
                }
                
                // Disable image upload when camera is unmuted
                this.updateMessageUIState();
            } else {
                // Currently unmuted, mute it
                await videoTrack.setEnabled(false);
                cameraBtn.classList.add("muted");
                cameraBtn.title = "Unmute Camera";
                cameraIcon.classList.add("hidden");
                cameraOffIcon.classList.remove("hidden");
                
                // Update camera preview visibility
                if (this.mediaProcessor && this.mediaProcessor.updateCameraPreviewVisibility) {
                    this.mediaProcessor.updateCameraPreviewVisibility(false);
                }
                
                // Enable image upload when camera is muted
                this.updateMessageUIState();
            }
        } catch (error) {
            console.error('Failed to toggle camera:', error);
        }
    }

    setupMessageUIState() {
        // Check initial state on page load
        this.updateMessageUIState();
        
        // Listen for RTM mode changes
        const subtitleModeRTM = document.getElementById('subtitleModeRTM');
        const subtitleModeDataStream = document.getElementById('subtitleModeDataStream');
        const enableSubtitles = document.getElementById('enableSubtitles');
        const imageModality = document.getElementById('inputImage');
        
        if (subtitleModeRTM) {
            subtitleModeRTM.addEventListener('change', () => {
                this.updateMessageUIState();
            });
        }
        
        if (subtitleModeDataStream) {
            subtitleModeDataStream.addEventListener('change', () => {
                this.updateMessageUIState();
            });
        }
        
        if (enableSubtitles) {
            enableSubtitles.addEventListener('change', () => {
                this.updateMessageUIState();
            });
        }
        
        if (imageModality) {
            imageModality.addEventListener('change', () => {
                this.updateMessageUIState();
            });
        }
        
        // Listen for subtitle manager creation
        this.setupSubtitleManagerListener();
    }

    setupSubtitleManagerListener() {
        // Check if subtitle manager exists and update reference
        const checkSubtitleManager = () => {
            if (window.subtitleManager && !this.subtitleManager) {
                this.subtitleManager = window.subtitleManager;
            }
        };
        
        // Check immediately
        checkSubtitleManager();
        
        // Also check periodically for a short time
        let checkCount = 0;
        const maxChecks = 10;
        const checkInterval = setInterval(() => {
            checkSubtitleManager();
            checkCount++;
            if (checkCount >= maxChecks || this.subtitleManager) {
                clearInterval(checkInterval);
            }
        }, 500);
    }

    isRTMEnabled() {
        // Check if RTM is enabled (either RTM mode or data stream mode with subtitles enabled)
        const subtitleModeRTM = document.getElementById('subtitleModeRTM');
        const subtitleModeDataStream = document.getElementById('subtitleModeDataStream');
        const enableSubtitles = document.getElementById('enableSubtitles');
        
        const isRTMEnabled = (subtitleModeRTM && subtitleModeRTM.checked) || 
                           (subtitleModeDataStream && subtitleModeDataStream.checked && enableSubtitles && enableSubtitles.checked);
        
        return isRTMEnabled;
    }

    isDataStreamMode() {
        // Check if data stream mode is enabled (view-only mode)
        const subtitleModeDataStream = document.getElementById('subtitleModeDataStream');
        const enableSubtitles = document.getElementById('enableSubtitles');
        
        return (subtitleModeDataStream && subtitleModeDataStream.checked && enableSubtitles && enableSubtitles.checked);
    }

    isImageUploadEnabled() {
        // Check if RTM is enabled
        const isRTMEnabled = this.isRTMEnabled();
        
        // Check if image modality is enabled
        const imageModalityEnabled = document.getElementById("inputImage")?.checked;
        
        // Check if camera is muted (image upload is only available when camera is muted)
        const cameraBtn = document.getElementById("toggleCameraBtn");
        const isCameraMuted = cameraBtn && cameraBtn.classList.contains("muted");
        
        // Check if video track exists (camera permissions might have been denied)
        const videoTrackExists = this.mediaProcessor && this.mediaProcessor.localTracks && this.mediaProcessor.localTracks.videoTrack;
        
        // If camera button doesn't exist yet or video track doesn't exist, assume camera is not active (so image upload is allowed)
        const cameraNotActive = !cameraBtn || isCameraMuted || !videoTrackExists;
        
        // Image upload is only enabled if RTM is enabled, image modality is enabled, and camera is not active
        return isRTMEnabled && imageModalityEnabled && cameraNotActive;
    }

    isTextMessageEnabled() {
        // Text messages are enabled if RTM is enabled and we're not in data stream mode
        const isRTMEnabled = this.isRTMEnabled();
        const isDataStream = this.isDataStreamMode();
        
        return isRTMEnabled && !isDataStream;
    }

    updateMessageUIState() {
        const imageUrlInput = document.getElementById("imageUrlInput");
        const sendImageBtn = document.getElementById("sendImageBtn");
        const imageFileInput = document.getElementById("imageFileInput");
        const sendImageFileBtn = document.getElementById("sendImageFileBtn");
        const messageInput = document.getElementById("messageInput");
        const sendTextBtn = document.getElementById("sendTextBtn");
        
        const isImageEnabled = this.isImageUploadEnabled();
        const isTextEnabled = this.isTextMessageEnabled();
        const isDataStream = this.isDataStreamMode();
        
        // Update image upload controls
        if (imageUrlInput) {
            imageUrlInput.disabled = !isImageEnabled;
        }
        if (sendImageBtn) {
            sendImageBtn.disabled = !isImageEnabled;
        }
        if (imageFileInput) {
            imageFileInput.disabled = !isImageEnabled;
        }
        if (sendImageFileBtn) {
            sendImageFileBtn.disabled = !isImageEnabled;
        }
        
        // Update text message controls
        if (messageInput) {
            messageInput.disabled = !isTextEnabled;
        }
        if (sendTextBtn) {
            sendTextBtn.disabled = !isTextEnabled;
        }
        
        // Update tooltips based on state
        const updateTooltip = (element, enabledText, disabledText) => {
            if (element) {
                const tooltip = element.parentElement.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.textContent = enabledText;
                }
            }
        };
        
        // Image URL tooltip
        let imageUrlTooltip = "Enter a URL to an image to send to the agent for analysis. Press Enter or click Send to submit.";
        if (!this.isRTMEnabled()) {
            imageUrlTooltip = "Image upload is disabled. Enable RTM mode to use image upload.";
        } else if (isDataStream) {
            imageUrlTooltip = "Image upload is disabled. Data stream mode is view-only and does not support sending messages.";
        } else if (!document.getElementById("inputImage")?.checked) {
            imageUrlTooltip = "Image upload is disabled. Enable image modality to use image upload.";
        } else if (!isImageEnabled) {
            imageUrlTooltip = "Image upload is disabled. Mute camera to use image upload.";
        }
        updateTooltip(imageUrlInput, imageUrlTooltip);
        
        // Image file tooltip
        let imageFileTooltip = "Upload an image file to send to the agent for analysis. The image will be converted to base64.";
        if (!this.isRTMEnabled()) {
            imageFileTooltip = "Image upload is disabled. Enable RTM mode to use image upload.";
        } else if (isDataStream) {
            imageFileTooltip = "Image upload is disabled. Data stream mode is view-only and does not support sending messages.";
        } else if (!document.getElementById("inputImage")?.checked) {
            imageFileTooltip = "Image upload is disabled. Enable image modality to use image upload.";
        } else if (!isImageEnabled) {
            imageFileTooltip = "Image upload is disabled. Mute camera to use image upload.";
        }
        updateTooltip(imageFileInput, imageFileTooltip);
        
        // Text message tooltip
        let textTooltip = "Type a text message to send to the agent. Press Enter or click Send to submit.";
        if (!this.isRTMEnabled()) {
            textTooltip = "Text messages are disabled. Enable RTM mode to send messages.";
        } else if (isDataStream) {
            textTooltip = "Text messages are disabled. Data stream mode is view-only and does not support sending messages.";
        }
        updateTooltip(messageInput, textTooltip);
    }

    async sendTextMessage() {
        const messageInput = document.getElementById("messageInput");
        const text = messageInput.value.trim();

        try {
            const agoraRtcUid = document.getElementById("agoraRtcUid").value.trim();
            if (!agoraRtcUid) {
                alert("Please enter an agent RTC UID first");
                return;
            }

            // Check if text messages are enabled
            if (!this.isTextMessageEnabled()) {
                if (!this.isRTMEnabled()) {
                    alert("Text messages are disabled. Enable RTM mode to send messages.");
                } else if (this.isDataStreamMode()) {
                    alert("Text messages are disabled. Data stream mode is view-only and does not support sending messages.");
                } else {
                    alert("Text messages are disabled.");
                }
                return;
            }

            if (window.ConversationalAIAPI) {
                const conversationalAI = window.ConversationalAIAPI.getInstance();
                if (conversationalAI && conversationalAI.isReady()) {
                    await conversationalAI.chat(agoraRtcUid, {
                        messageType: 'TEXT',
                        text: text,
                        uuid: Date.now().toString() + Math.random().toString(36).substring(2)
                    });
                    messageInput.value = "";
                }
            }
        } catch (error) {
            console.error("Failed to send text message:", error);
            alert("Failed to send message: " + error.message);
        }
    }

    async sendImageMessage() {
        const imageUrlInput = document.getElementById("imageUrlInput");
        const imageUrl = imageUrlInput.value.trim();
        if (!imageUrl) return;

        try {
            const agoraRtcUid = document.getElementById("agoraRtcUid").value.trim();
            if (!agoraRtcUid) {
                alert("Please enter an agent RTC UID first");
                return;
            }

            // Check if image upload is enabled
            if (!this.isImageUploadEnabled()) {
                if (!this.isRTMEnabled()) {
                    alert("Image upload is disabled. Enable RTM mode to use image upload.");
                } else if (this.isDataStreamMode()) {
                    alert("Image upload is disabled. Data stream mode is view-only and does not support sending messages.");
                } else if (!document.getElementById("inputImage")?.checked) {
                    alert("Image upload is disabled. Enable image modality to use image upload.");
                } else {
                    alert("Image upload is disabled. Mute camera to use image upload.");
                }
                return;
            }

            const uuid = Date.now().toString() + Math.random().toString(36).substring(2);

            if (window.ConversationalAIAPI) {
                const conversationalAI = window.ConversationalAIAPI.getInstance();
                if (conversationalAI && conversationalAI.isReady()) {
                    // Add to chat history immediately
                    this.addImageToChatHistory('url', imageUrl, uuid);
                    
                    await conversationalAI.chat(agoraRtcUid, {
                        messageType: 'IMAGE',
                        url: imageUrl,
                        uuid: uuid
                    });
                    imageUrlInput.value = "";
                }
            }
        } catch (error) {
            console.error("Failed to send image:", error);
            alert("Failed to send image: " + error.message);
        }
    }

    async sendImageFileMessage() {
        const imageFileInput = document.getElementById("imageFileInput");
        const file = imageFileInput.files[0];
        if (!file) {
            alert("Please select an image file first");
            return;
        }

        try {
            const agoraRtcUid = document.getElementById("agoraRtcUid").value.trim();
            if (!agoraRtcUid) {
                alert("Please enter an agent RTC UID first");
                return;
            }

            // Check if image upload is enabled
            if (!this.isImageUploadEnabled()) {
                if (!this.isRTMEnabled()) {
                    alert("Image upload is disabled. Enable RTM mode to use image upload.");
                } else if (this.isDataStreamMode()) {
                    alert("Image upload is disabled. Data stream mode is view-only and does not support sending messages.");
                } else if (!document.getElementById("inputImage")?.checked) {
                    alert("Image upload is disabled. Enable image modality to use image upload.");
                } else {
                    alert("Image upload is disabled. Mute camera to use image upload.");
                }
                return;
            }

            const uuid = Date.now().toString() + Math.random().toString(36).substring(2);

            // Convert image to base64
            const base64 = await this.convertImageToBase64(file);
            
            if (window.ConversationalAIAPI) {
                const conversationalAI = window.ConversationalAIAPI.getInstance();
                if (conversationalAI && conversationalAI.isReady()) {
                    // Add to chat history immediately
                    this.addImageToChatHistory('base64', file.name, uuid, file.size);
                    
                    await conversationalAI.chat(agoraRtcUid, {
                        messageType: 'IMAGE',
                        base64: base64,
                        uuid: uuid
                    });
                    imageFileInput.value = ""; // Clear the file input
                }
            }
        } catch (error) {
            console.error("Failed to send image file:", error);
            alert("Failed to send image file: " + error.message);
        }
    }

    convertImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove the data:image/...;base64, prefix to get just the base64 data
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = () => {
                reject(new Error('Failed to read image file'));
            };
            reader.readAsDataURL(file);
        });
    }

    addImageToChatHistory(type, source, uuid, fileSize = null) {
        // Get current user info
        const clientRtcUid = document.getElementById("clientRtcUid").value.trim() || "User";
        
        const timestamp = new Date().toLocaleTimeString();
        const imageInfo = type === 'url' ? 
            `Image URL: ${source}` : 
            `Image File: ${source} (${this.formatFileSize(fileSize)})`;
        
        const messageData = {
            id: uuid,
            text: `📷 ${imageInfo}`,
            speaker: `User (${clientRtcUid})`,
            timestamp: timestamp,
            isTemp: false,
            userId: clientRtcUid,
            messageType: 'image',
            imageType: type,
            imageSource: source
        };

        // Add to subtitle manager's chat history if available
        if (window.subtitleManager && window.subtitleManager.chatHistoryData) {
            window.subtitleManager.chatHistoryData.push(messageData);
            window.subtitleManager.updateChatHistoryDisplay();
        }
        
    }

    formatFileSize(bytes) {
        if (!bytes) return 'Unknown size';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    handleImageMessageResponse(message) {
        try {
            
            // The message parameter is already the parsed message object
            // Check if it's a message.info or message.error with context module
            if (message.object === 'message.info' && message.module === 'context') {
                console.log('✅ Found message.info with context module - processing image response');
                const imageInfo = JSON.parse(message.message);
                console.log('Image info from callback:', imageInfo);
                console.log('Image info keys:', Object.keys(imageInfo));
                
                if (imageInfo.success !== false) {
                    // Image was successfully received
                    // Handle different possible response structures
                    const width = imageInfo.width || imageInfo.dimensions?.width || imageInfo.w || 'unknown';
                    const height = imageInfo.height || imageInfo.dimensions?.height || imageInfo.h || 'unknown';
                    const size = imageInfo.size_bytes || imageInfo.size || imageInfo.file_size || imageInfo.bytes || 'unknown';
                    
                    
                    const imageDetails = `📷 Image received: ${width}x${height} (${this.formatFileSize(size)})`;
                    
                    // Instead of using UUID matching, update the most recent image message
                    this.updateMostRecentImageMessage(imageDetails, 'success');
                }
            } else if (message.object === 'message.error' && message.module === 'context') {
                console.log('❌ Found message.error with context module - processing error response');
                const errorInfo = JSON.parse(message.message);
                console.log('Error info from callback:', errorInfo);
                
                // Image upload failed
                const errorMessage = errorInfo.error?.message || errorInfo.message || 'Unknown error';
                const errorDetails = `❌ Image upload failed: ${errorMessage}`;
                this.updateMostRecentImageMessage(errorDetails, 'error');
            } else {
            }
        } catch (error) {
            console.error('Error handling image message response:', error);
            console.error('Original message:', message);
        }
    }

    updateMostRecentImageMessage(newText, status) {
        
        // Find and update the most recent image message in chat history
        if (window.subtitleManager && window.subtitleManager.chatHistoryData) {
            
            // Find the last image message in the chat history
            let messageIndex = -1;
            for (let i = window.subtitleManager.chatHistoryData.length - 1; i >= 0; i--) {
                const msg = window.subtitleManager.chatHistoryData[i];
                if (msg.messageType === 'image') {
                    messageIndex = i;
                    break;
                }
            }
            
            if (messageIndex !== -1) {
                const message = window.subtitleManager.chatHistoryData[messageIndex];
                message.text = newText;
                message.status = status;
                
                // Update the display
                window.subtitleManager.updateChatHistoryDisplay();
            } else {
            }
        } else {
        }
    }

    checkCredentials() {
        const { customerId, customerSecret, appId } = Utils.getStoredCredentials();
        if (!customerId || !customerSecret || !appId) {
            this.openCredsModal();
        }
    }

    clearSavedFormSettingsAndReload() {
        const msg =
            "Clear all locally saved Agent Settings (fields, checkboxes, drawer values) and reload the page? " +
            "API credentials from \"Set API Credentials\" are not removed; channel name and tokens were never saved.";
        if (!confirm(msg)) return;
        const key =
            window.FormSettingsPersistence && window.FormSettingsPersistence.STORAGE_KEY
                ? window.FormSettingsPersistence.STORAGE_KEY
                : "convo_ai_form_state_v1";
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn("Could not clear saved form settings:", e);
        }
        window.location.reload();
    }

    openCredsModal() {
        const { customerId, customerSecret, appId, appCertificate } = Utils.getStoredCredentials();
        document.getElementById("customerId").value = customerId || '';
        document.getElementById("customerSecret").value = customerSecret || '';
        document.getElementById("appId").value = appId || '';
        document.getElementById("appCertificate").value = appCertificate || '';
        
        document.getElementById("credsModal").classList.remove("hidden");
    }

    async saveCreds() {
        const customerId = document.getElementById("customerId").value.trim();
        const customerSecret = document.getElementById("customerSecret").value.trim();
        const appId = document.getElementById("appId").value.trim();
        const appCertificate = document.getElementById("appCertificate").value.trim();

        if (!customerId || !customerSecret || !appId) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            Utils.saveCredentials(customerId, customerSecret, appId, appCertificate);
            
            document.getElementById("credsModal").classList.add("hidden");
            // Update the AgoraAPI instance with new appId
            this.agoraAPI = new AgoraAPI(appId);
            // Update base URL indicator
            this.updateBaseUrlIndicator();
            // If certificate is present, ensure a deterministic client UID exists
            // so token generation + RTM login don't end up using UID=0.
            const clientRtcUidInput = document.getElementById("clientRtcUid");
            if (clientRtcUidInput && (!clientRtcUidInput.value || clientRtcUidInput.value.trim() === "")) {
                clientRtcUidInput.value = "1001";
            }
            // After credentials are saved, try to auto-generate tokens if channel is present
            this.autoGenerateAgentAndClientTokensIfPossible();
        } catch (error) {
            alert(error.message);
        }
    }

    async generateAgoraRtcToken(options = {}) {
        const silent = options.silent === true;
        try {
            const { appId, appCertificate } = Utils.getStoredCredentials();
            if (!appId || !appCertificate) {
                alert("Please set App ID and App Certificate in API Credentials first");
                return;
            }

            const channelName = document.getElementById("agoraChannelName").value.trim();
            if (!channelName) {
                alert("Please enter a channel name in Agent Settings");
                return;
            }

            const agoraRtcUid = document.getElementById("agoraRtcUid").value.trim();
            if (!agoraRtcUid) {
                alert("Please enter an Agora RTC UID");
                return;
            }

            const token = await Utils.generateAgoraToken(
                appId,
                appCertificate,
                channelName,
                agoraRtcUid,
                1 // PUBLISHER role
            );

            document.getElementById("agoraRtcToken").value = token;
            // Record generation time and schedule expiry warning
            this.tokenGeneratedAt.agent = Date.now();
            this.scheduleTokenExpiryWarning("agent");
            if (!silent) alert("Token generated successfully!");
        } catch (error) {
            if (!silent) alert("Error generating token: " + error.message);
            console.error("Token generation error:", error);
            if (silent) throw error;
        }
    }

    /**
     * Auto-generate agent and client tokens once channel + credentials are present.
     * This is a silent helper; it does not show alerts and only runs when all
     * required inputs are available.
     */
    async autoGenerateAgentAndClientTokensIfPossible() {
        try {
            const { appId, appCertificate } = Utils.getStoredCredentials();
            if (!appId || !appCertificate) {
                return;
            }

            const channelInput = document.getElementById("agoraChannelName");
            if (!channelInput) return;

            const channelName = channelInput.value.trim();
            if (!channelName) return;

            // Agent token (use existing UID or default 8888)
            const agentUidInput = document.getElementById("agoraRtcUid");
            const agentTokenInput = document.getElementById("agoraRtcToken");
            if (agentUidInput && agentTokenInput) {
                const agentUid = agentUidInput.value.trim() || "8888";
                const token = await Utils.generateAgoraToken(
                    appId,
                    appCertificate,
                    channelName,
                    agentUid,
                    1
                );
                agentTokenInput.value = token;
                this.tokenGeneratedAt.agent = Date.now();
                this.scheduleTokenExpiryWarning("agent");
            }

            // Client token: if UID is empty, set a deterministic UID when certificate exists
            const clientUidInput = document.getElementById("clientRtcUid");
            const clientTokenInput = document.getElementById("clientRtcToken");
            if (clientTokenInput) {
                if (clientUidInput && (!clientUidInput.value || clientUidInput.value.trim() === "")) {
                    clientUidInput.value = "1001";
                }
                const clientUid = clientUidInput ? clientUidInput.value.trim() : "";
                const token = await Utils.generateAgoraToken(
                    appId,
                    appCertificate,
                    channelName,
                    clientUid,
                    1
                );
                clientTokenInput.value = token;
                this.tokenGeneratedAt.client = Date.now();
                this.scheduleTokenExpiryWarning("client");
            }

            await this.autoConfigureAvatarIfPossible();
        } catch (e) {
            // Silent failure; log to console for debugging only
            console.error("Auto-generate agent/client tokens failed:", e);
        }
    }

    /**
     * Keep locally generated tokens fresh by auto-regenerating shortly before expiry.
     * This runs in the background for generated tokens so manual actions (create/join)
     * do not fail due to stale credentials.
     */
    scheduleTokenExpiryWarning(type) {
        const TTL_SECONDS = 3600; // matches Utils.generateAgoraToken
        const WARN_BEFORE_MS = 60 * 1000; // refresh 1 minute before expiry

        if (!this.tokenGeneratedAt || !this.tokenGeneratedAt[type]) return;

        // Clear any existing timer for this token type
        if (this.tokenExpiryTimers && this.tokenExpiryTimers[type]) {
            clearTimeout(this.tokenExpiryTimers[type]);
            this.tokenExpiryTimers[type] = null;
        }

        const generatedAt = this.tokenGeneratedAt[type];
        const expiryTime = generatedAt + TTL_SECONDS * 1000;
        let delayMs = expiryTime - Date.now() - WARN_BEFORE_MS;

        // If already close to or past the warn threshold, trigger soon
        if (delayMs < 1000) {
            delayMs = 1000;
        }

        this.tokenExpiryTimers[type] = setTimeout(async () => {
            try {
                if (type === "agent") {
                    await this.generateAgoraRtcToken({ silent: true });
                } else if (type === "client") {
                    await this.generateClientRtcToken({ silent: true });
                } else if (type === "sip") {
                    await this.generateSipRtcToken({ silent: true });
                } else if (type === "avatar") {
                    await this.generateAvatarRtcToken({ silent: true });
                }
            } catch (e) {
                console.error("Background token refresh failed:", e);
                // Retry soon in case fields or credentials are filled shortly after failure.
                if (this.tokenExpiryTimers[type]) {
                    clearTimeout(this.tokenExpiryTimers[type]);
                }
                this.tokenExpiryTimers[type] = setTimeout(() => this.scheduleTokenExpiryWarning(type), 60 * 1000);
            }
        }, delayMs);
    }

    async ensureFreshManagedToken(type) {
        const TTL_SECONDS = 3600;
        const REFRESH_BEFORE_SECONDS = 60;
        const generatedAt = this.tokenGeneratedAt ? this.tokenGeneratedAt[type] : null;
        if (!generatedAt) return;

        const refreshAt = generatedAt + (TTL_SECONDS - REFRESH_BEFORE_SECONDS) * 1000;
        if (Date.now() < refreshAt) return;

        if (type === "agent") {
            await this.generateAgoraRtcToken({ silent: true });
        } else if (type === "client") {
            await this.generateClientRtcToken({ silent: true });
        } else if (type === "sip") {
            await this.generateSipRtcToken({ silent: true });
        } else if (type === "avatar") {
            await this.generateAvatarRtcToken({ silent: true });
        }
    }

    /**
     * @param {{ silent?: boolean }} options - When silent (auto-config / timers), missing cert/channel/UID is a no-op with no alerts.
     *   When not silent (user clicked Generate), validation failures always alert so the user can fix setup.
     */
    async generateAvatarRtcToken(options = {}) {
        const silent = options.silent === true;
        try {
            const { appId, appCertificate } = Utils.getStoredCredentials();
            if (!appId || !appCertificate) {
                if (!silent) alert("Please set App ID and App Certificate in API Credentials first");
                return;
            }

            const channelName = document.getElementById("agoraChannelName").value.trim();
            if (!channelName) {
                if (!silent) alert("Please enter a channel name in Agent Settings");
                return;
            }

            const avatarRtcUid = document.getElementById("avatarRtcUid").value.trim();
            if (!avatarRtcUid) {
                if (!silent) alert("Please enter an Avatar RTC UID");
                return;
            }

            const token = await Utils.generateAgoraToken(
                appId,
                appCertificate,
                channelName,
                avatarRtcUid,
                1 // PUBLISHER role
            );

            document.getElementById("avatarRtcToken").value = token;
            this.tokenGeneratedAt.avatar = Date.now();
            this.scheduleTokenExpiryWarning("avatar");
            if (!silent) alert("Token generated successfully!");
        } catch (error) {
            if (!silent) alert("Error generating token: " + error.message);
            console.error("Token generation error:", error);
            if (silent) throw error;
        }
    }

    async generateClientRtcToken(options = {}) {
        const silent = options.silent === true;
        try {
            const { appId, appCertificate } = Utils.getStoredCredentials();
            if (!appId || !appCertificate) {
                if (!silent) alert("Please set App ID and App Certificate in API Credentials first");
                return null;
            }

            const channelName = document.getElementById("agoraChannelName").value.trim();
            if (!channelName) {
                if (!silent) alert("Please enter a channel name in Agent Settings");
                return null;
            }

            const clientRtcUidInput = document.getElementById("clientRtcUid");
            if (clientRtcUidInput && (!clientRtcUidInput.value || clientRtcUidInput.value.trim() === "")) {
                clientRtcUidInput.value = "1001";
            }
            const clientRtcUid = clientRtcUidInput ? clientRtcUidInput.value.trim() : "";

            const token = await Utils.generateAgoraToken(
                appId,
                appCertificate,
                channelName,
                clientRtcUid, // may be empty -> defaults to UID 0
                1 // PUBLISHER role
            );

            document.getElementById("clientRtcToken").value = token;
            // Record generation time and schedule expiry warning
            this.tokenGeneratedAt.client = Date.now();
            this.scheduleTokenExpiryWarning("client");
            if (!silent) alert("Token generated successfully!");
            return token;
        } catch (error) {
            if (!silent) alert("Error generating token: " + error.message);
            console.error("Token generation error:", error);
            if (silent) throw error;
            return null;
        }
    }

    async generateSipRtcToken(options = {}) {
        const silent = options.silent === true;
        try {
            const { appId, appCertificate } = Utils.getStoredCredentials();
            if (!appId || !appCertificate) {
                alert("Please set App ID and App Certificate in API Credentials first");
                return;
            }

            const channelName = document.getElementById("agoraChannelName").value.trim();
            if (!channelName) {
                alert("Please enter a channel name in Agent Settings");
                return;
            }

            const sipRtcUid = document.getElementById("outboundCallSipRtcUid").value.trim();
            if (!sipRtcUid) {
                alert("Please enter a SIP RTC UID");
                return;
            }

            const token = await Utils.generateAgoraToken(
                appId,
                appCertificate,
                channelName,
                sipRtcUid,
                1 // PUBLISHER role
            );

            document.getElementById("outboundCallSipRtcToken").value = token;
            // Record generation time and schedule expiry warning
            this.tokenGeneratedAt.sip = Date.now();
            this.scheduleTokenExpiryWarning("sip");
            if (!silent) alert("Token generated successfully!");
        } catch (error) {
            if (!silent) alert("Error generating token: " + error.message);
            console.error("Token generation error:", error);
            if (silent) throw error;
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
        const enableStringUid = document.getElementById("enableStringUid").checked;
        const agentId = document.getElementById("uniqueName").value.trim(); // Get agent ID from unique name field

        try {
            await this.ensureFreshManagedToken("client");
            const clientRtcToken = document
                .getElementById("clientRtcToken")
                .value.trim();
            // Convert empty string to null for token (read after refresh so join uses updated value)
            const token = clientRtcToken || null;
            
            // Convert UID to integer unless string UID is enabled
            let uid = clientRtcUid;
            if (!enableStringUid && clientRtcUid) {
                uid = parseInt(clientRtcUid, 10);
                if (isNaN(uid)) {
                    throw new Error('Client UID must be a valid number when String UID is disabled');
                }
            }
            
            const renewClientToken = async () => {
                const fresh =
                    (await this.generateClientRtcToken({ silent: true })) ||
                    document.getElementById("clientRtcToken").value.trim();
                return fresh || null;
            };
            await this.mediaProcessor.joinChannel(
                appId,
                channelName,
                token,
                uid,
                this.subtitleManager,
                agentId,
                renewClientToken
            );
            document.getElementById("joinChannel").disabled = true;
            document.getElementById("leaveChannel").disabled = false;
            
            // Check if video track is available and show camera button
            this.checkAndShowCameraButton();
            
            // Check if camera permissions were denied and show a notification
            const imageInputEnabled = document.getElementById("inputImage")?.checked;
            const videoTrackExists = this.mediaProcessor && this.mediaProcessor.localTracks && this.mediaProcessor.localTracks.videoTrack;
            
            if (imageInputEnabled && !videoTrackExists) {
                console.warn("Camera permission was denied. You can still use the channel for audio and text/image messages.");
                // Show a user-friendly notification
                this.showNotification("Camera permission denied. You can still use audio and text/image messages.", "warning");
            }
        } catch (error) {
            alert(error.message);
        }
    }

    checkAndShowCameraButton() {
        // Check if image input is enabled (video track will be created when joining channel)
        const imageInputEnabled = document.getElementById("inputImage")?.checked;
        
        const cameraBtn = document.getElementById("toggleCameraBtn");
        if (cameraBtn && imageInputEnabled) {
            // Check if video track actually exists (camera permissions might have been denied)
            const videoTrackExists = this.mediaProcessor && this.mediaProcessor.localTracks && this.mediaProcessor.localTracks.videoTrack;
            
            if (videoTrackExists) {
                cameraBtn.classList.remove("hidden");
                
                // Update message UI state when camera button is shown
                this.updateMessageUIState();
            } else {
                cameraBtn.classList.add("hidden");
                
                // Show a user-friendly message about camera permission
                if (imageInputEnabled) {
                    console.warn("Camera permission was denied. Camera functionality will not be available.");
                }
            }
        } else {
        }
    }

    async leaveChannel() {
        try {
            await this.mediaProcessor.leaveChannel();
            document.getElementById("joinChannel").disabled = false;
            document.getElementById("leaveChannel").disabled = true;
            if (this.subtitleManager && typeof this.subtitleManager.clearAgentActivityStatus === 'function') {
                this.subtitleManager.clearAgentActivityStatus();
            }
            
            // Reset mic and camera button states
            this.resetMicAndCameraStates();

            // Treat in-session token as stale after disconnect; regenerate for next join
            try {
                this.tokenGeneratedAt.client = null;
                await this.generateClientRtcToken({ silent: true });
            } catch (e) {
                console.warn("Post-leave client token refresh skipped:", e);
            }
        } catch (error) {
            alert(error.message);
        }
    }

    resetMicAndCameraStates() {
        // Reset microphone button state
        const micBtn = document.getElementById("toggleMicBtn");
        if (micBtn) {
            micBtn.classList.remove("muted");
            micBtn.title = "Mute Microphone";
            const micIcon = micBtn.querySelector(".mic-icon");
            const micOffIcon = micBtn.querySelector(".mic-off-icon");
            if (micIcon) micIcon.classList.remove("hidden");
            if (micOffIcon) micOffIcon.classList.add("hidden");
        }

        // Reset camera button state but only hide it if image input is disabled
        const cameraBtn = document.getElementById("toggleCameraBtn");
        if (cameraBtn) {
            cameraBtn.classList.remove("muted");
            cameraBtn.title = "Mute Camera";
            const cameraIcon = cameraBtn.querySelector(".camera-icon");
            const cameraOffIcon = cameraBtn.querySelector(".camera-off-icon");
            if (cameraIcon) cameraIcon.classList.remove("hidden");
            if (cameraOffIcon) cameraOffIcon.classList.add("hidden");
            
            // Only hide camera button if image input is disabled
            const imageInputEnabled = document.getElementById("inputImage")?.checked;
            if (!imageInputEnabled) {
                cameraBtn.classList.add("hidden");
            }
        }
    }

    handleTtsVendorChange() {
        const ttsVendorElement = document.getElementById("ttsVendor");
        if (!ttsVendorElement) return;
        
        const vendor = ttsVendorElement.value;
        
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
            "elevenLabsBaseUrlBlock",
            "elevenLabsSampleRateBlock",
            "elevenLabsSpeedBlock",
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
            "openaiBaseUrlBlock",
            "openaiModelBlock",
            "openaiVoiceBlock",
            "openaiInstructionsBlock",
            "openaiSpeedBlock"
        ];
        const deepgramBlocks = [
            "deepgramTtsKeyBlock",
            "deepgramBaseUrlBlock",
            "deepgramModelBlock",
            "deepgramSampleRateBlock"
        ];
        const humeaiBlocks = [
            "humeaiTtsKeyBlock",
            "humeaiVoiceIdBlock",
            "humeaiProviderBlock",
            "humeaiSpeedBlock",
            "humeaiTrailingSilenceBlock"
        ];
        const rimeBlocks = [
            "rimeTtsKeyBlock",
            "rimeSpeakerBlock",
            "rimeModelIdBlock",
            "rimeSamplingRateBlock"
        ];
        const minimaxBlocks = [
            "minimaxTtsKeyBlock",
            "minimaxGroupIdBlock",
            "minimaxModelBlock",
            "minimaxVoiceIdBlock",
            "minimaxSampleRateBlock",
            "minimaxUrlBlock"
        ];
        const fishaudioBlocks = [
            "fishaudioTtsKeyBlock",
            "fishaudioReferenceIdBlock",
            "fishaudioBackendBlock"
        ];
        const groqBlocks = [
            "groqTtsKeyBlock",
            "groqModelBlock",
            "groqVoiceBlock"
        ];
        const googleBlocks = [
            "googleTtsCredentialsBlock",
            "googleVoiceNameBlock",
            "googleSpeakingRateBlock",
            "googleSampleRateBlock"
        ];
        const playhtBlocks = [
            "playhtTtsKeyBlock",
            "playhtUserIdBlock",
            "playhtVoiceEngineBlock",
            "playhtVoiceBlock",
            "playhtSpeedBlock"
        ];
        const sarvamBlocks = [
            "sarvamTtsKeyBlock",
            "sarvamSpeakerBlock",
            "sarvamSpeakerIdBlock",
            "sarvamLanguageCodeBlock",
            "sarvamPitchBlock",
            "sarvamPaceBlock",
            "sarvamLoudnessBlock",
            "sarvamSampleRateBlock"
        ];
        const amazonPollyBlocks = [
            "amazonPollyAccessKeyBlock",
            "amazonPollySecretKeyBlock",
            "amazonPollyRegionBlock",
            "amazonPollyVoiceBlock",
            "amazonPollyEngineBlock"
        ];
        const murfBlocks = [
            "murfApiKeyBlock",
            "murfBaseUrlBlock",
            "murfVoiceIdBlock",
            "murfLocaleBlock",
            "murfModelBlock",
            "murfRateBlock",
            "murfPitchBlock",
            "murfSampleRateBlock"
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

        deepgramBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "deepgram");
            }
        });

        humeaiBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "humeai");
            }
        });

        rimeBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "rime");
            }
        });

        minimaxBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "minimax");
            }
        });

        fishaudioBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "fishaudio");
            }
        });

        groqBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "groq");
            }
        });

        googleBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "google");
            }
        });

        playhtBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "playht");
            }
        });

        sarvamBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "sarvam");
            }
        });

        amazonPollyBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "amazon");
            }
        });

        murfBlocks.forEach(block => {
            const element = document.getElementById(block);
            if (element) {
                element.classList.toggle("hidden", vendor !== "murf");
            }
        });

        // Handle Microsoft language population when vendor changes to Microsoft
        if (vendor === "microsoft") {
            this.populateMicrosoftLangList();
        }
        
        // Handle Sarvam speaker visibility when vendor changes to Sarvam
        if (vendor === "sarvam") {
            this.handleSarvamSpeakerChange();
        }

        // Check if AI Avatar is enabled and disable it if TTS is not configured
        const enableAvatar = document.getElementById('enableAvatar');
        if (enableAvatar && enableAvatar.checked && !vendor) {
            enableAvatar.checked = false;
            enableAvatar.dispatchEvent(new Event('change'));
        }
    }

    handleElevenLabsVoiceChange() {
        const elevenLabsVoiceSelect = document.getElementById("elevenLabsVoiceSelect");
        const voiceIdBlk = document.getElementById("elevenLabsVoiceIdBlock");
        
        if (!elevenLabsVoiceSelect || !voiceIdBlk) {
            console.warn('ElevenLabs TTS elements not found');
            return;
        }
        
        const voiceSel = elevenLabsVoiceSelect.value;
        voiceIdBlk.classList.toggle("hidden", voiceSel !== "other");
    }

    handleSarvamSpeakerChange() {
        const sarvamSpeakerSelect = document.getElementById("sarvamSpeaker");
        const speakerIdBlk = document.getElementById("sarvamSpeakerIdBlock");
        
        if (!sarvamSpeakerSelect || !speakerIdBlk) {
            console.warn('Sarvam TTS elements not found');
            return;
        }
        
        const speakerSel = sarvamSpeakerSelect.value;
        speakerIdBlk.classList.toggle("hidden", speakerSel !== "other");
    }

    handleGeofenceAreaChange() {
        const geofenceAreaSelect = document.getElementById("geofenceArea");
        const geofenceAreaCustomBlock = document.getElementById("geofenceAreaCustomBlock");
        const geofenceExcludeBlock = document.getElementById("geofenceExcludeBlock");
        const geofenceExcludeCustomBlock = document.getElementById("geofenceExcludeCustomBlock");
        
        if (!geofenceAreaSelect) {
            return;
        }
        
        const areaValue = geofenceAreaSelect.value;
        
        // Show/hide custom area input
        if (geofenceAreaCustomBlock) {
            geofenceAreaCustomBlock.classList.toggle("hidden", areaValue !== "custom");
        }
        
        // Show/hide exclude area dropdown (only when area is GLOBAL)
        if (geofenceExcludeBlock) {
            geofenceExcludeBlock.classList.toggle("hidden", areaValue !== "GLOBAL");
        }
        
        // Hide exclude custom if exclude block is hidden
        if (geofenceExcludeCustomBlock) {
            if (areaValue !== "GLOBAL") {
                geofenceExcludeCustomBlock.classList.add("hidden");
            } else {
                // Check if custom is selected in exclude
                this.handleGeofenceExcludeChange();
            }
        }
        
        // Clear exclude selections if area is not GLOBAL
        if (areaValue !== "GLOBAL" && geofenceExcludeBlock) {
            const geofenceExcludeSelect = document.getElementById("geofenceExclude");
            if (geofenceExcludeSelect) {
                Array.from(geofenceExcludeSelect.options).forEach(option => {
                    option.selected = false;
                });
            }
            if (geofenceExcludeCustomBlock) {
                const geofenceExcludeCustom = document.getElementById("geofenceExcludeCustom");
                if (geofenceExcludeCustom) {
                    geofenceExcludeCustom.value = "";
                }
            }
        }
    }

    handleGeofenceExcludeChange() {
        const geofenceExcludeSelect = document.getElementById("geofenceExclude");
        const geofenceExcludeCustomBlock = document.getElementById("geofenceExcludeCustomBlock");
        
        if (!geofenceExcludeSelect || !geofenceExcludeCustomBlock) {
            return;
        }
        
        const excludeValue = geofenceExcludeSelect.value;
        geofenceExcludeCustomBlock.classList.toggle("hidden", excludeValue !== "custom");
    }

    populateMicrosoftLangList() {
        const msLangSelect = document.getElementById("microsoftLangSelect");
        const microsoftVoiceSelect = document.getElementById("microsoftVoiceSelect");
        
        if (!msLangSelect || !microsoftVoiceSelect) {
            console.warn('Microsoft TTS elements not found');
            return;
        }
        
        if (!window.microsoftVoicesByLang) {
            console.warn('Microsoft voices data not loaded');
            return;
        }
        
        const currentLang = msLangSelect.value;
        const currentVoice = microsoftVoiceSelect.value;
        msLangSelect.innerHTML = "";

        const languageCodes = Object.keys(window.microsoftVoicesByLang).sort();
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
        const microsoftLangSelect = document.getElementById("microsoftLangSelect");
        const voiceSelect = document.getElementById("microsoftVoiceSelect");
        
        if (!microsoftLangSelect || !voiceSelect) {
            console.warn('Microsoft TTS elements not found');
            return;
        }
        
        if (!window.microsoftVoicesByLang) {
            console.warn('Microsoft voices data not loaded');
            return;
        }
        
        const lang = microsoftLangSelect.value;
        const currentVoice = selectedVoice || voiceSelect.value;
        voiceSelect.innerHTML = "";

        const voices = window.microsoftVoicesByLang[lang] || [];
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

    addMllmParamField() {
        const container = document.getElementById("mllm-param-container");
        const paramId = "mllm-param-" + Object.keys(this.mllmParams).length;

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

        const select = div.querySelector('select');
        const keyInput = div.querySelector('input[placeholder="Key"]');
        const valueInput = div.querySelector('input[placeholder="Value"]');
        const removeBtn = div.querySelector('button');

        select.addEventListener('change', () => this.updateMllmParam(paramId, select, 'type'));
        keyInput.addEventListener('input', () => this.updateMllmParam(paramId, keyInput, 'key'));
        valueInput.addEventListener('input', () => this.updateMllmParam(paramId, valueInput, 'value'));
        removeBtn.addEventListener('click', () => this.removeMllmParam(paramId));

        container.appendChild(div);
        this.mllmParams[paramId] = { key: "", type: "string", value: "" };
    }

    updateMllmParam(id, input, fieldType) {
        if (fieldType === "key") this.mllmParams[id].key = input.value;

        if (fieldType === "type") {
            this.mllmParams[id].type = input.value;
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
            let type = this.mllmParams[id].type;
            if (type === "array") {
                this.mllmParams[id].value = input.value.split(",").map(v => v.trim());
            } else if (type === "number") {
                this.mllmParams[id].value = Number(input.value);
            } else if (type === "object") {
                try {
                    this.mllmParams[id].value = JSON.parse(input.value);
                    input.style.borderColor = "green";
                } catch (e) {
                    input.style.borderColor = "red";
                }
            } else {
                this.mllmParams[id].value = input.value;
            }
        }
    }

    removeMllmParam(id) {
        document.getElementById(id).remove();
        delete this.mllmParams[id];
    }

    addAsrParamField() {
        const container = document.getElementById("asr-param-container");
        const paramId = "asr-param-" + Object.keys(this.asrParams).length;

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

        const select = div.querySelector('select');
        const keyInput = div.querySelector('input[placeholder="Key"]');
        const valueInput = div.querySelector('input[placeholder="Value"]');
        const removeBtn = div.querySelector('button');

        select.addEventListener('change', () => this.updateAsrParam(paramId, select, 'type'));
        keyInput.addEventListener('input', () => this.updateAsrParam(paramId, keyInput, 'key'));
        valueInput.addEventListener('input', () => this.updateAsrParam(paramId, valueInput, 'value'));
        removeBtn.addEventListener('click', () => this.removeAsrParam(paramId));

        container.appendChild(div);
        this.asrParams[paramId] = { key: "", type: "string", value: "" };
    }

    updateAsrParam(id, input, fieldType) {
        if (fieldType === "key") this.asrParams[id].key = input.value;

        if (fieldType === "type") {
            this.asrParams[id].type = input.value;
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
            let type = this.asrParams[id].type;
            if (type === "array") {
                this.asrParams[id].value = input.value.split(",").map(v => v.trim());
            } else if (type === "number") {
                this.asrParams[id].value = Number(input.value);
            } else if (type === "object") {
                try {
                    this.asrParams[id].value = JSON.parse(input.value);
                    input.style.borderColor = "green";
                } catch (e) {
                    input.style.borderColor = "red";
                }
            } else {
                this.asrParams[id].value = input.value;
            }
        }
    }

    removeAsrParam(id) {
        document.getElementById(id).remove();
        delete this.asrParams[id];
    }

    addTtsParamField() {
        const container = document.getElementById("tts-param-container");
        const paramId = "tts-param-" + Object.keys(this.ttsParams).length;

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

        const select = div.querySelector('select');
        const keyInput = div.querySelector('input[placeholder="Key"]');
        const valueInput = div.querySelector('input[placeholder="Value"]');
        const removeBtn = div.querySelector('button');

        select.addEventListener('change', () => this.updateTtsParam(paramId, select, 'type'));
        keyInput.addEventListener('input', () => this.updateTtsParam(paramId, keyInput, 'key'));
        valueInput.addEventListener('input', () => this.updateTtsParam(paramId, valueInput, 'value'));
        removeBtn.addEventListener('click', () => this.removeTtsParam(paramId));

        container.appendChild(div);
        this.ttsParams[paramId] = { key: "", type: "string", value: "" };
    }

    updateTtsParam(id, input, fieldType) {
        if (fieldType === "key") this.ttsParams[id].key = input.value;

        if (fieldType === "type") {
            this.ttsParams[id].type = input.value;
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
            let type = this.ttsParams[id].type;
            if (type === "array") {
                this.ttsParams[id].value = input.value.split(",").map(v => v.trim());
            } else if (type === "number") {
                this.ttsParams[id].value = Number(input.value);
            } else if (type === "object") {
                try {
                    this.ttsParams[id].value = JSON.parse(input.value);
                    input.style.borderColor = "green";
                } catch (e) {
                    input.style.borderColor = "red";
                }
            } else {
                this.ttsParams[id].value = input.value;
            }
        }
    }

    removeTtsParam(id) {
        document.getElementById(id).remove();
        delete this.ttsParams[id];
    }

    addAvatarParamField() {
        const container = document.getElementById("avatar-param-container");
        const paramId = "avatar-param-" + Object.keys(this.avatarParams).length;

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

        const select = div.querySelector('select');
        const keyInput = div.querySelector('input[placeholder="Key"]');
        const valueInput = div.querySelector('input[placeholder="Value"]');
        const removeBtn = div.querySelector('button');

        select.addEventListener('change', () => this.updateAvatarParam(paramId, select, 'type'));
        keyInput.addEventListener('input', () => this.updateAvatarParam(paramId, keyInput, 'key'));
        valueInput.addEventListener('input', () => this.updateAvatarParam(paramId, valueInput, 'value'));
        removeBtn.addEventListener('click', () => this.removeAvatarParam(paramId));

        container.appendChild(div);
        this.avatarParams[paramId] = { key: "", type: "string", value: "" };
    }

    updateAvatarParam(id, input, fieldType) {
        if (fieldType === "key") this.avatarParams[id].key = input.value;

        if (fieldType === "type") {
            this.avatarParams[id].type = input.value;
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
            let type = this.avatarParams[id].type;
            if (type === "array") {
                this.avatarParams[id].value = input.value.split(",").map(v => v.trim());
            } else if (type === "number") {
                this.avatarParams[id].value = Number(input.value);
            } else if (type === "object") {
                try {
                    this.avatarParams[id].value = JSON.parse(input.value);
                    input.style.borderColor = "green";
                } catch (e) {
                    input.style.borderColor = "red";
                }
            } else {
                this.avatarParams[id].value = input.value;
            }
        }
    }

    removeAvatarParam(id) {
        document.getElementById(id).remove();
        delete this.avatarParams[id];
    }

    handleEnableToolsChange() {
        const enableToolsCheckbox = document.getElementById("enableTools");
        const mcpServersConfig = document.getElementById("mcpServersConfig");
        
        if (!enableToolsCheckbox || !mcpServersConfig) {
            return;
        }
        
        const isChecked = enableToolsCheckbox.checked;
        
        // Show the section when checked
        if (isChecked) {
            mcpServersConfig.classList.remove("hidden");
            mcpServersConfig.style.display = "";
        } else {
            mcpServersConfig.classList.add("hidden");
            mcpServersConfig.style.display = "none";
        }
    }

    handleFillerWordsEnableChange() {
        const fillerWordsEnable = document.getElementById("fillerWordsEnable");
        const fillerWordsConfig = document.getElementById("fillerWordsConfig");
        if (!fillerWordsEnable || !fillerWordsConfig) return;
        fillerWordsConfig.classList.toggle("hidden", !fillerWordsEnable.checked);
    }

    addMcpServerField() {
        const container = document.getElementById("mcp-servers-container");
        if (!container) return;
        
        const serverId = "mcp-server-" + Object.keys(this.mcpServers).length;
        
        const div = document.createElement("div");
        div.classList.add("bg-gray-800", "p-3", "rounded", "space-y-2");
        div.id = serverId;
        
        div.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-semibold text-gray-300">MCP Server Configuration</span>
                <button class="text-red-500 hover:text-red-700" title="Remove Server">❌</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="has-tooltip relative">
                    <input type="text" placeholder="Name (e.g., MATH or Agora-Docs)" class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" id="${serverId}-name" maxlength="48">
                    <div class="tooltip">MCP server name: only letters (a-z, A-Z), numbers (0-9), dots (.), and dashes (-). No spaces or underscores. Max 48 characters.</div>
                </div>
                <div class="has-tooltip relative">
                    <input type="text" placeholder="Endpoint URL" class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" id="${serverId}-endpoint">
                    <div class="tooltip">Endpoint URL for the MCP server. Must be a valid URL (e.g., https://example.endpoint.com/mcp). This is where the MCP server is hosted.</div>
                </div>
                <div class="has-tooltip relative">
                    <select class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" id="${serverId}-transport">
                        <option value="streamable_http" selected>streamable_http</option>
                    </select>
                    <div class="tooltip">Transport protocol for the MCP server. Only streamable_http is supported.</div>
                </div>
                <div class="has-tooltip relative">
                    <select class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" id="${serverId}-isToolCallAvailable">
                        <option value="true" selected>true</option>
                        <option value="false">false</option>
                    </select>
                    <div class="tooltip">Whether tool calls are available for this server. Set to "true" if the server supports tool calling, "false" otherwise.</div>
                </div>
                <div class="has-tooltip relative">
                    <input type="number" placeholder="Timeout ms (1000–100000)" class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" id="${serverId}-timeoutMs" min="1000" max="100000" step="1000">
                    <div class="tooltip">MCP server request timeout in milliseconds. Must be between 1000 and 100000. After timeout, the agent stops waiting and continues.</div>
                </div>
            </div>
            <div class="has-tooltip relative">
                <input type="text" placeholder="Allowed Tools (comma-separated, default: *)" value="*" class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" id="${serverId}-allowedTools">
                <div class="tooltip">Comma-separated list of allowed tools for this server. Use "*" to allow all tools, or specify specific tool names separated by commas (e.g., "calculate,query,search").</div>
            </div>
            <div class="has-tooltip relative">
                <textarea placeholder="Headers (optional, JSON object e.g. {\"Authorization\": \"Bearer xxx\"})" class="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" id="${serverId}-headers" rows="2"></textarea>
                <div class="tooltip">HTTP headers to include when requesting the MCP server (e.g. authentication). Must be valid JSON object.</div>
            </div>
        `;
        
        // Add event listeners
        const nameInput = div.querySelector(`#${serverId}-name`);
        const endpointInput = div.querySelector(`#${serverId}-endpoint`);
        const transportSelect = div.querySelector(`#${serverId}-transport`);
        const isToolCallSelect = div.querySelector(`#${serverId}-isToolCallAvailable`);
        const allowedToolsInput = div.querySelector(`#${serverId}-allowedTools`);
        const timeoutMsInput = div.querySelector(`#${serverId}-timeoutMs`);
        const headersInput = div.querySelector(`#${serverId}-headers`);
        const removeBtn = div.querySelector('button');
        
        nameInput.addEventListener('input', () => this.updateMcpServer(serverId, nameInput, 'name'));
        endpointInput.addEventListener('input', () => this.updateMcpServer(serverId, endpointInput, 'endpoint'));
        transportSelect.addEventListener('change', () => this.updateMcpServer(serverId, transportSelect, 'transport'));
        isToolCallSelect.addEventListener('change', () => this.updateMcpServer(serverId, isToolCallSelect, 'isToolCallAvailable'));
        allowedToolsInput.addEventListener('input', () => this.updateMcpServer(serverId, allowedToolsInput, 'allowedTools'));
        if (timeoutMsInput) timeoutMsInput.addEventListener('input', () => this.updateMcpServer(serverId, timeoutMsInput, 'timeoutMs'));
        if (headersInput) headersInput.addEventListener('input', () => this.updateMcpServer(serverId, headersInput, 'headers'));
        removeBtn.addEventListener('click', () => this.removeMcpServer(serverId));
        
        container.appendChild(div);
        this.mcpServers[serverId] = {
            name: "",
            endpoint: "",
            transport: "streamable_http",
            is_tool_call_available: true,
            allowed_tools: ["*"],
            timeout_ms: null,
            headers: null
        };
        
        // Initialize tooltips for the new server configuration
        if (window.attachTooltipListenersToDrawer) {
            window.attachTooltipListenersToDrawer('llmDrawer');
        }
    }

    updateMcpServer(id, input, fieldType) {
        if (!this.mcpServers[id]) return;
        
        if (fieldType === "name") {
            this.mcpServers[id].name = input.value.trim();
        } else if (fieldType === "endpoint") {
            this.mcpServers[id].endpoint = input.value.trim();
        } else if (fieldType === "transport") {
            this.mcpServers[id].transport = input.value;
        } else if (fieldType === "isToolCallAvailable") {
            this.mcpServers[id].is_tool_call_available = input.value === "true";
        } else if (fieldType === "allowedTools") {
            const value = input.value.trim();
            if (value === "") {
                this.mcpServers[id].allowed_tools = ["*"];
            } else {
                this.mcpServers[id].allowed_tools = value.split(",").map(v => v.trim()).filter(v => v !== "");
            }
        } else if (fieldType === "timeoutMs") {
            const val = input.value.trim();
            this.mcpServers[id].timeout_ms = val === "" ? null : parseInt(input.value, 10);
        } else if (fieldType === "headers") {
            const val = input.value.trim();
            if (val === "") {
                this.mcpServers[id].headers = null;
            } else {
                try {
                    this.mcpServers[id].headers = JSON.parse(val);
                } catch (e) {
                    this.mcpServers[id].headers = null;
                }
            }
        }
    }

    removeMcpServer(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
        delete this.mcpServers[id];
    }

    async createAgent() {
        const output = document.getElementById("agentResponse");
        const status = document.getElementById("createAgentStatus");
        
        if (output) {
            output.classList.remove('hidden');
            output.textContent = "Creating...";
        }
        if (status) {
            status.classList.remove('hidden');
            status.textContent = "Creating agent...";
        }

        try {
            await this.ensureFreshManagedToken("agent");
            // Validate RTM configuration before agent creation if subtitles are enabled
            if (this.subtitleManager) {
                const isRTMConfigValid = this.subtitleManager.validateRTMConfigurationForAgentCreation();
                if (!isRTMConfigValid) {
                    throw new Error('RTM configuration validation failed. Please check your subtitle settings.');
                }
            }
            
            const formData = Utils.getFormData();
            Utils.validateFormData(formData);
            const llmCustomParams = Utils.getCustomParams();
            const mllmCustomParams = Utils.getMllmCustomParams();
            const agentConfig = Utils.buildAgentConfig(formData, llmCustomParams, mllmCustomParams);

            const { customerId, customerSecret } = Utils.getStoredCredentials();
            const data = await this.agoraAPI.createAgent(customerId, customerSecret, agentConfig);
            
            if (output) {
                output.textContent = JSON.stringify(data, null, 2);
            }
            if (status) {
                status.textContent = `Agent created successfully! ID: ${data.agent_id || 'N/A'}`;
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    status.classList.add('hidden');
                }, 5000);
            }
            if (data.agent_id) {
                const agentIdElement = document.getElementById("agentId");
                if (agentIdElement) {
                    agentIdElement.value = data.agent_id;
                }
            }
            
            // Disable subtitle mode selection when agent is created
            if (this.subtitleManager) {
                this.subtitleManager.disableSubtitleModeSelection();
            }
        } catch (error) {
            const errorMsg = `Error: ${error.message}`;
            if (output) {
                output.textContent = errorMsg;
            }
            if (status) {
                status.textContent = errorMsg;
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    status.classList.add('hidden');
                }, 5000);
            }
        }
    }

    async updateAgent() {
        const output = document.getElementById("agentResponse");
        const status = document.getElementById("updateAgentStatus");
        
        if (output) {
            output.classList.remove('hidden');
            output.textContent = "Updating...";
        }
        if (status) {
            status.classList.remove('hidden');
            status.textContent = "Updating agent...";
        }

        try {
            await this.ensureFreshManagedToken("agent");
            // Validate RTM configuration before agent update if subtitles are enabled
            if (this.subtitleManager) {
                const isRTMConfigValid = this.subtitleManager.validateRTMConfigurationForAgentCreation();
                if (!isRTMConfigValid) {
                    throw new Error('RTM configuration validation failed. Please check your subtitle settings.');
                }
            }
            
            const { customerId, customerSecret } = Utils.getStoredCredentials();
            const agentIdElement = document.getElementById("agentId");
            if (!agentIdElement || !agentIdElement.value.trim()) {
                throw new Error("Agent ID is required for update");
            }
            const agentId = agentIdElement.value.trim();
            const formData = Utils.getFormData();
            const llmCustomParams = Utils.getCustomParams();
            const mllmCustomParams = Utils.getMllmCustomParams();
            const config = Utils.buildAgentConfig(formData, llmCustomParams, mllmCustomParams);
            
            // Check if MLLM is enabled
            const enableMllmElement = document.getElementById('enableMllm');
            const enableMllm = enableMllmElement ? enableMllmElement.checked : false;
            
            let updatePayload;
            if (enableMllm) {
                // Include token and mllm params (using custom parameters)
                updatePayload = {
                    properties: {
                        token: config.properties.token,
                        mllm: {
                            ...(Object.keys(mllmCustomParams).length > 0 ? { params: mllmCustomParams } : {}) // Only include params if mllmCustomParams is not empty
                        }
                    }
                };
            } else {
                // Include token; llm only when present (e.g. pipeline mode without override omits llm)
                const props = { token: config.properties.token };
                if (config.properties.llm) {
                    props.llm = {
                        system_messages: config.properties.llm.system_messages,
                        params: config.properties.llm.params
                    };
                }
                updatePayload = { properties: props };
            }
            
            const data = await this.agoraAPI.updateAgent(customerId, customerSecret, agentId, updatePayload);
            if (output) {
                output.textContent = JSON.stringify(updatePayload, null, 2);
            }
            if (status) {
                status.textContent = "Agent updated successfully!";
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    status.classList.add('hidden');
                }, 5000);
            }
            
            // Disable subtitle mode selection when agent is updated (agent is running)
            if (this.subtitleManager) {
                this.subtitleManager.disableSubtitleModeSelection();
            }
        } catch (error) {
            const errorMsg = `Error: ${error.message}`;
            if (output) {
                output.textContent = errorMsg;
            }
            if (status) {
                status.textContent = errorMsg;
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    status.classList.add('hidden');
                }, 5000);
            }
        }
    }

    async stopAgent() {
        const output = document.getElementById("agentResponse");
        const status = document.getElementById("stopAgentStatus");
        
        if (output) {
            output.classList.remove('hidden');
            output.textContent = "Stopping...";
        }
        if (status) {
            status.classList.remove('hidden');
            status.textContent = "Stopping agent...";
        }

        try {
            const { customerId, customerSecret } = Utils.getStoredCredentials();
            const agentIdElement = document.getElementById("agentId");
            if (!agentIdElement || !agentIdElement.value.trim()) {
                throw new Error("Agent ID is required for stop");
            }
            const agentId = agentIdElement.value.trim();

            const data = await this.agoraAPI.stopAgent(customerId, customerSecret, agentId);
            const responseText = Object.keys(data).length === 0 
                ? "Agent stopped (empty JSON response)."
                : JSON.stringify(data, null, 2);
            
            if (output) {
                output.textContent = responseText;
            }
            if (status) {
                status.textContent = "Agent stopped successfully!";
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    status.classList.add('hidden');
                }, 5000);
            }
            
            // Enable subtitle mode selection when agent is stopped
            if (this.subtitleManager) {
                this.subtitleManager.enableSubtitleModeSelection();
                if (typeof this.subtitleManager.clearAgentActivityStatus === 'function') {
                    this.subtitleManager.clearAgentActivityStatus();
                }
            }
        } catch (error) {
            const errorMsg = `Error: ${error.message}`;
            if (output) {
                output.textContent = errorMsg;
            }
            if (status) {
                status.textContent = errorMsg;
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    status.classList.add('hidden');
                }, 5000);
            }
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

            // Clear activity display for terminal/ended agent states.
            const rawState = (data && (data.state || data.status || data.agent_state || data.agentStatus || data.current_state)) || '';
            const normalizedState = String(rawState).toLowerCase();
            const terminalStates = ['stopped', 'failed', 'ended', 'end', 'terminated', 'terminating'];
            if (this.subtitleManager && terminalStates.includes(normalizedState) && typeof this.subtitleManager.clearAgentActivityStatus === 'function') {
                this.subtitleManager.clearAgentActivityStatus();
            }
        } catch (error) {
            output.textContent = `Error: ${error.message}`;
        }
    }

    setCurrentTimeForToTime() {
        const toTimeInput = document.getElementById("agentListFilterToTime");
        if (toTimeInput && !toTimeInput.value) {
            // Format current time as datetime-local (YYYY-MM-DDTHH:mm)
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            toTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    }

    toggleAgentListFilters() {
        const filtersDiv = document.getElementById("agentListFilters");
        const toggleText = document.getElementById("toggleAgentListFiltersText");
        if (filtersDiv && toggleText) {
            const isHidden = filtersDiv.classList.contains("hidden");
            if (isHidden) {
                filtersDiv.classList.remove("hidden");
                toggleText.textContent = "Hide Advanced Filters";
                // Set current time when filters are shown
                this.setCurrentTimeForToTime();
            } else {
                filtersDiv.classList.add("hidden");
                toggleText.textContent = "Show Advanced Filters";
            }
        }
    }

    toggleConversationTurnsOptions() {
        const optionsDiv = document.getElementById("conversationTurnsOptions");
        const toggleText = document.getElementById("toggleConversationTurnsOptionsText");
        if (optionsDiv && toggleText) {
            const isHidden = optionsDiv.classList.contains("hidden");
            if (isHidden) {
                optionsDiv.classList.remove("hidden");
                toggleText.textContent = "Hide Conversation Turn Options";
            } else {
                optionsDiv.classList.add("hidden");
                toggleText.textContent = "Show Conversation Turn Options";
            }
        }
    }

    // Convert datetime-local string to Unix timestamp in seconds
    datetimeLocalToSeconds(datetimeLocal) {
        if (!datetimeLocal) return null;
        const date = new Date(datetimeLocal);
        return Math.floor(date.getTime() / 1000);
    }

    async listAgents(useCursor = false, useHistoryIndex = null) {
        const output = document.getElementById("queryResponse");
        output.textContent = "Retrieving agents...";

        // Reset pagination state when starting a new search (not using cursor or history)
        if (!useCursor && useHistoryIndex === null) {
            const paginationInfo = document.getElementById("agentListPaginationInfo");
            if (paginationInfo) {
                paginationInfo.classList.add("hidden");
            }
            this.lastAgentListCursor = null;
            this.agentListPageHistory = [];
            this.agentListCurrentPageIndex = -1;
            this.agentListCumulativeCount = 0;
        }

        try {
            const { customerId, customerSecret } = Utils.getStoredCredentials();
            
            // Collect filter parameters
            const params = {};
            const channel = document.getElementById("agentListFilterChannel")?.value.trim();
            const fromTimeInput = document.getElementById("agentListFilterFromTime")?.value;
            const toTimeInput = document.getElementById("agentListFilterToTime")?.value;
            const state = document.getElementById("agentListFilterState")?.value;
            const limit = document.getElementById("agentListFilterLimit")?.value.trim();
            
            // Handle back navigation - restore from history without API call
            if (useHistoryIndex !== null && useHistoryIndex >= 0 && this.agentListPageHistory[useHistoryIndex]) {
                // Restore from history (no API call needed)
                const historyEntry = this.agentListPageHistory[useHistoryIndex];
                output.textContent = JSON.stringify(historyEntry.data, null, 2);
                this.agentListCumulativeCount = historyEntry.cumulativeCount;
                this.agentListCurrentPageIndex = useHistoryIndex;
                // Get the next cursor from the history entry's meta for forward navigation
                const nextCursor = historyEntry.data.meta?.cursor || '';
                this.lastAgentListCursor = nextCursor;
                // Calculate current page info for display
                const limit = parseInt(document.getElementById("agentListFilterLimit")?.value || "20", 10);
                const currentPageStart = useHistoryIndex * limit + 1;
                const currentPageEnd = historyEntry.cumulativeCount;
                const currentPageCount = historyEntry.cumulativeCount - (useHistoryIndex > 0 ? this.agentListPageHistory[useHistoryIndex - 1].cumulativeCount : 0);
                this.updateAgentListPagination(historyEntry.data, useHistoryIndex > 0, nextCursor, currentPageCount, currentPageStart, currentPageEnd);
                return; // Exit early - no API call needed
            }
            
            // Get cursor from stored value (for next page navigation)
            let cursor = null;
            if (useCursor && this.lastAgentListCursor) {
                // Use stored cursor for next page
                cursor = this.lastAgentListCursor;
            }
            
            if (channel) params.channel = channel;
            if (fromTimeInput) {
                params.from_time = this.datetimeLocalToSeconds(fromTimeInput);
            }
            if (toTimeInput) {
                params.to_time = this.datetimeLocalToSeconds(toTimeInput);
            }
            if (state !== undefined && state !== '') params.state = state;
            if (limit) params.limit = parseInt(limit, 10);
            if (cursor) params.cursor = cursor;
            
            const data = await this.agoraAPI.listAgents(customerId, customerSecret, params);
            
            // Handle results accumulation and history
            if (useCursor) {
                // Append to existing results (next page)
                const previousData = this.agentListPageHistory.length > 0 
                    ? this.agentListPageHistory[this.agentListPageHistory.length - 1].data
                    : { data: { list: [] } };
                
                if (data.data && data.data.list) {
                    const accumulatedData = JSON.parse(JSON.stringify(previousData)); // Deep copy
                    accumulatedData.data.list = accumulatedData.data.list.concat(data.data.list);
                    accumulatedData.data.count = accumulatedData.data.list.length;
                    accumulatedData.meta = data.meta;
                    accumulatedData.status = data.status;
                    
                    // Save to history
                    this.agentListPageHistory.push({
                        data: JSON.parse(JSON.stringify(accumulatedData)), // Deep copy
                        cursor: data.meta?.cursor || '',
                        cumulativeCount: accumulatedData.data.list.length
                    });
                    
                    output.textContent = JSON.stringify(accumulatedData, null, 2);
                    this.agentListCumulativeCount = accumulatedData.data.list.length;
                    this.agentListCurrentPageIndex = this.agentListPageHistory.length - 1;
                    // Calculate current page info
                    const limit = parseInt(document.getElementById("agentListFilterLimit")?.value || "20", 10);
                    const previousCount = this.agentListPageHistory.length > 1 
                        ? this.agentListPageHistory[this.agentListPageHistory.length - 2].cumulativeCount 
                        : 0;
                    const currentPageStart = previousCount + 1;
                    const currentPageEnd = accumulatedData.data.list.length;
                    const currentPageCount = data.data.count || 0;
                    this.updateAgentListPagination(data, true, data.meta?.cursor || '', currentPageCount, currentPageStart, currentPageEnd);
                } else {
                    output.textContent = JSON.stringify(data, null, 2);
                    this.updateAgentListPagination(data, true, data.meta?.cursor || '');
                }
            } else {
                // New search - start fresh
                output.textContent = JSON.stringify(data, null, 2);
                this.agentListPageHistory = [{
                    data: JSON.parse(JSON.stringify(data)), // Deep copy
                    cursor: data.meta?.cursor || '',
                    cumulativeCount: data.data?.count || 0
                }];
                this.agentListCurrentPageIndex = 0;
                this.agentListCumulativeCount = data.data?.count || 0;
                // Calculate current page info for first page
                const limit = parseInt(document.getElementById("agentListFilterLimit")?.value || "20", 10);
                const currentPageStart = 1;
                const currentPageEnd = data.data?.count || 0;
                const currentPageCount = data.data?.count || 0;
                this.updateAgentListPagination(data, false, data.meta?.cursor || '', currentPageCount, currentPageStart, currentPageEnd);
            }
        } catch (error) {
            output.textContent = `Error: ${error.message}`;
            // Hide pagination on error
            const paginationInfo = document.getElementById("agentListPaginationInfo");
            if (paginationInfo) {
                paginationInfo.classList.add("hidden");
            }
        }
    }

    async listAgentsNextPage() {
        // If we're in the middle of history (not at the latest page), we need to continue from current position
        if (this.agentListCurrentPageIndex >= 0 && 
            this.agentListCurrentPageIndex < this.agentListPageHistory.length - 1) {
            // We're not at the latest page - go forward in history
            const nextIndex = this.agentListCurrentPageIndex + 1;
            await this.listAgents(false, nextIndex);
        } else if (this.lastAgentListCursor) {
            // We're at the latest page - fetch next page from API
            await this.listAgents(true);
        }
    }

    async listAgentsPrevPage() {
        if (this.agentListCurrentPageIndex > 0) {
            // Go back one page in history
            const prevIndex = this.agentListCurrentPageIndex - 1;
            await this.listAgents(false, prevIndex);
        }
    }

    updateAgentListPagination(data, isPaginating = false, nextCursor = null, currentPageCount = null, pageStart = null, pageEnd = null) {
        const paginationInfo = document.getElementById("agentListPaginationInfo");
        const currentCountEl = document.getElementById("agentListCurrentCount");
        const totalCountEl = document.getElementById("agentListTotalCount");
        const limitDisplayEl = document.getElementById("agentListLimitDisplay");
        const cursorInfoEl = document.getElementById("agentListCursorInfo");
        const nextPageBtn = document.getElementById("agentListNextPageBtn");
        const prevPageBtn = document.getElementById("agentListPrevPageBtn");
        
        if (!paginationInfo || !data || !data.data) {
            if (paginationInfo) paginationInfo.classList.add("hidden");
            return;
        }
        
        const count = data.data.count || 0;
        const total = data.meta?.total || 0;
        const cursor = nextCursor !== null ? nextCursor : (data.meta?.cursor || '');
        const limit = parseInt(document.getElementById("agentListFilterLimit")?.value || "20", 10);
        
        // Store cursor for next page
        this.lastAgentListCursor = cursor;
        
        // Update display - show current page range if provided, otherwise show cumulative
        if (currentCountEl) {
            if (pageStart !== null && pageEnd !== null && currentPageCount !== null) {
                // Show current page info: "Showing 1-20 of 111"
                currentCountEl.textContent = `${pageStart}-${pageEnd}`;
            } else {
                // Show cumulative count
                currentCountEl.textContent = this.agentListCumulativeCount;
            }
        }
        if (totalCountEl) totalCountEl.textContent = total;
        if (limitDisplayEl) limitDisplayEl.textContent = limit;
        
        if (cursorInfoEl) {
            if (cursor) {
                cursorInfoEl.textContent = `Next cursor: ${cursor.substring(0, 20)}...`;
            } else {
                cursorInfoEl.textContent = "No more pages";
            }
        }
        
        // Update next page button
        if (nextPageBtn) {
            nextPageBtn.disabled = !cursor;
            nextPageBtn.textContent = cursor ? "Next Page" : "No More Pages";
        }
        
        // Update previous page button
        if (prevPageBtn) {
            const canGoBack = this.agentListCurrentPageIndex > 0;
            prevPageBtn.disabled = !canGoBack;
        }
        
        // Show pagination info if we have results
        if (this.agentListCumulativeCount > 0 || total > 0) {
            paginationInfo.classList.remove("hidden");
        } else {
            paginationInfo.classList.add("hidden");
        }
    }

    openDrawer(drawerId) {
        // Close all drawers first
        ['asrConfigBox', 'llmDrawer', 'advDrawer', 'ttsDrawer', 'mllmDrawer', 'avatarDrawer'].forEach(id => {
            const drawer = document.getElementById(id);
            const backdrop = document.getElementById(id + 'Backdrop');
            if (drawer) drawer.classList.add('hidden');
            if (backdrop) backdrop.classList.add('hidden');
        });
        
        // When LLM drawer opens, sync MCP and filler words config visibility
        if (drawerId === 'llmDrawer') {
            setTimeout(() => {
                const enableToolsCheckbox = document.getElementById("enableTools");
                if (enableToolsCheckbox && enableToolsCheckbox.checked) {
                    this.handleEnableToolsChange();
                }
                this.handleFillerWordsEnableChange();
            }, 100);
        }
        // Find the button that triggered this drawer
        let btnId = '';
        if (drawerId === 'llmDrawer') btnId = 'llmSettingsBtn';
        if (drawerId === 'advDrawer') btnId = 'advConfigBtn';
        if (drawerId === 'ttsDrawer') btnId = 'ttsSettingsBtn';
        if (drawerId === 'mllmDrawer') btnId = 'mllmSettingsBtn';
        if (drawerId === 'avatarDrawer') btnId = 'avatarSettingsBtn';
        if (drawerId === 'asrConfigBox') btnId = 'asrSettingsBtn';
        const btn = document.getElementById(btnId);
        const drawer = document.getElementById(drawerId);
        if (!btn || !drawer) return;
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
        const backdrop = document.getElementById(drawerId + 'Backdrop');
        if (backdrop) backdrop.classList.remove('hidden');
        
        // Attach tooltip listeners to this drawer
        if (window.attachTooltipListenersToDrawer) {
            window.attachTooltipListenersToDrawer(drawerId);
        }
    }

    closeDrawer(drawerId) {
        document.getElementById(drawerId).classList.add('hidden');
        document.getElementById(drawerId + 'Backdrop').classList.add('hidden');
    }

    setupDrawerListeners() {
        // ASR
        document.getElementById('asrSettingsBtn').addEventListener('click', () => this.openDrawer('asrConfigBox'));
        document.getElementById('asrConfigBoxBackdrop').addEventListener('click', () => this.closeDrawer('asrConfigBox'));
        document.querySelector('#asrConfigBox .drawer-close').addEventListener('click', () => this.closeDrawer('asrConfigBox'));
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

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 translate-x-full`;
        
        // Set background color based on type
        switch (type) {
            case 'warning':
                notification.className += ' bg-yellow-600 text-white';
                break;
            case 'error':
                notification.className += ' bg-red-600 text-white';
                break;
            case 'success':
                notification.className += ' bg-green-600 text-white';
                break;
            default:
                notification.className += ' bg-blue-600 text-white';
        }
        
        notification.textContent = message;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    initializeCameraPreviewManager() {
        try {
            if (window.CameraPreviewManager) {
                // Initialize the camera preview manager
                const cameraPreviewManager = new window.CameraPreviewManager();
                
                // Store reference in media processor for later use
                if (this.mediaProcessor) {
                    this.mediaProcessor.cameraPreviewManager = cameraPreviewManager;
                }
                
            } else {
                console.warn('CameraPreviewManager not available');
            }
        } catch (error) {
            console.error('Failed to initialize camera preview manager:', error);
        }
    }

    async openDeviceSettings() {
        const modal = document.getElementById('deviceSettingsModal');
        if (!modal) return;

        try {
            // Show modal first
            modal.classList.remove('hidden');
            
            // Add click outside to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeDeviceSettings();
                }
            });
            
            // Check if image input is enabled and show appropriate message
            const imageInputEnabled = document.getElementById("inputImage");
            if (imageInputEnabled) {
                const cameraInfo = modal.querySelector('.text-xs.text-gray-400');
                if (cameraInfo) {
                    if (imageInputEnabled.checked) {
                        cameraInfo.textContent = 'Camera selection will be used immediately for image input.';
                    } else {
                        cameraInfo.textContent = 'Camera selection is available even when image input is disabled. Your selection will be used when you enable image input.';
                    }
                }
            }
            
            // Load device lists after modal is shown
            await this.loadDeviceLists();
        } catch (error) {
            console.error('Failed to open device settings:', error);
            this.showNotification('Failed to load device settings. Please check your browser permissions.', 'error');
        }
    }

    closeDeviceSettings() {
        const modal = document.getElementById('deviceSettingsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async loadDeviceLists() {
        try {
            // Request permissions first before trying to enumerate devices
            let micPermissionGranted = false;
            let cameraPermissionGranted = false;
            
            try {
                // Request microphone permission
                await navigator.mediaDevices.getUserMedia({ audio: true });
                micPermissionGranted = true;
            } catch (error) {
                console.warn('Microphone permission denied:', error);
            }

            try {
                // Request camera permission - always try to get camera permission for device selection
                // This allows users to pre-configure their camera even if image input isn't enabled yet
                await navigator.mediaDevices.getUserMedia({ video: true });
                cameraPermissionGranted = true;
            } catch (error) {
                console.warn('Camera permission denied:', error);
            }

            // Load microphones
            const microphones = await AgoraRTC.getMicrophones();
            const micSelect = document.getElementById('micSelect');
            if (micSelect) {
                if (microphones.length > 0) {
                    micSelect.innerHTML = microphones.map(device => 
                        `<option value="${device.deviceId}">${device.label || `Microphone ${device.deviceId.slice(0, 8)}`}</option>`
                    ).join('');
                    
                    // Set current selection
                    const currentMicId = localStorage.getItem('selectedMicrophoneId');
                    if (currentMicId) {
                        micSelect.value = currentMicId;
                    }
                } else {
                    if (!micPermissionGranted) {
                        micSelect.innerHTML = '<option value="">Microphone permission required</option>';
                    } else {
                        micSelect.innerHTML = '<option value="">No microphones found</option>';
                    }
                }
            }

            // Load cameras
            const cameras = await AgoraRTC.getCameras();
            const cameraSelect = document.getElementById('cameraSelect');
            if (cameraSelect) {
                if (cameras.length > 0) {
                    cameraSelect.innerHTML = cameras.map(device => 
                        `<option value="${device.deviceId}">${device.label || `Camera ${device.deviceId.slice(0, 8)}`}</option>`
                    ).join('');
                    
                    // Set current selection
                    const currentCameraId = localStorage.getItem('selectedCameraId');
                    if (currentCameraId) {
                        cameraSelect.value = currentCameraId;
                    }
                } else {
                    if (!cameraPermissionGranted) {
                        cameraSelect.innerHTML = '<option value="">Camera permission required</option>';
                    } else {
                        cameraSelect.innerHTML = '<option value="">No cameras found</option>';
                    }
                }
            }
            
            // Show success notification if devices were loaded
            if ((microphones.length > 0 || cameras.length > 0)) {
                this.showNotification('Device list loaded successfully', 'success');
            }
        } catch (error) {
            console.error('Failed to load device lists:', error);
            
            // Show user-friendly error messages
            const micSelect = document.getElementById('micSelect');
            const cameraSelect = document.getElementById('cameraSelect');
            
            if (micSelect) {
                micSelect.innerHTML = '<option value="">Error loading microphones</option>';
            }
            if (cameraSelect) {
                cameraSelect.innerHTML = '<option value="">Error loading cameras</option>';
            }
            
            this.showNotification('Failed to load devices. Please check browser permissions.', 'error');
            throw error;
        }
    }

    async saveDeviceSettings() {
        try {
            const micSelect = document.getElementById('micSelect');
            const cameraSelect = document.getElementById('cameraSelect');
            
            if (micSelect && micSelect.value) {
                localStorage.setItem('selectedMicrophoneId', micSelect.value);
            }
            
            if (cameraSelect && cameraSelect.value) {
                localStorage.setItem('selectedCameraId', cameraSelect.value);
            }
            
            this.closeDeviceSettings();
            this.showNotification('Device settings saved successfully', 'success');
            
            // If we're currently in a channel, we need to restart the tracks with new devices
            if (this.mediaProcessor && this.mediaProcessor.client) {
                await this.restartTracksWithNewDevices();
            }
        } catch (error) {
            console.error('Failed to save device settings:', error);
            this.showNotification('Failed to save device settings', 'error');
        }
    }

    async restartTracksWithNewDevices() {
        if (!this.mediaProcessor || !this.mediaProcessor.client) return;

        try {
            // Stop current tracks
            if (this.mediaProcessor.localTracks.audioTrack) {
                await this.mediaProcessor.client.unpublish(this.mediaProcessor.localTracks.audioTrack);
                this.mediaProcessor.localTracks.audioTrack.stop();
                this.mediaProcessor.localTracks.audioTrack.close();
                this.mediaProcessor.localTracks.audioTrack = null;
            }

            if (this.mediaProcessor.localTracks.videoTrack) {
                await this.mediaProcessor.client.unpublish(this.mediaProcessor.localTracks.videoTrack);
                this.mediaProcessor.localTracks.videoTrack.stop();
                this.mediaProcessor.localTracks.videoTrack.close();
                this.mediaProcessor.localTracks.videoTrack = null;
            }

            // Create new tracks with selected devices
            const micId = localStorage.getItem('selectedMicrophoneId');
            const cameraId = localStorage.getItem('selectedCameraId');

            // Create new audio track
            if (micId && micId.trim() !== '') {
                try {
                    this.mediaProcessor.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                        encoderConfig: "music_standard",
                        microphoneId: micId
                    });
                } catch (error) {
                    console.error('Failed to create audio track with selected device:', error);
                    // Fallback to default device
                    this.mediaProcessor.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                        encoderConfig: "music_standard"
                    });
                }
                await this.mediaProcessor.client.publish(this.mediaProcessor.localTracks.audioTrack);
            } else {
                // Create audio track with default device
                this.mediaProcessor.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                    encoderConfig: "music_standard"
                });
                await this.mediaProcessor.client.publish(this.mediaProcessor.localTracks.audioTrack);
            }

            // Create new video track if image input is enabled
            const imageInputEnabled = document.getElementById("inputImage").checked;
            if (imageInputEnabled) {
                if (cameraId && cameraId.trim() !== '') {
                    try {
                        this.mediaProcessor.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
                            cameraId: cameraId
                        });
                    } catch (error) {
                        console.error('Failed to create video track with selected device:', error);
                        // Fallback to default device
                        this.mediaProcessor.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
                    }
                } else {
                    // Create video track with default device
                    this.mediaProcessor.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
                }
                
                await this.mediaProcessor.client.publish(this.mediaProcessor.localTracks.videoTrack);
                
                // Reinitialize camera preview
                this.mediaProcessor.initializeCameraPreview();
            }

            this.showNotification('Tracks restarted with new devices', 'success');
        } catch (error) {
            console.error('Failed to restart tracks with new devices:', error);
            this.showNotification('Failed to restart tracks with new devices', 'error');
        }
    }

    checkAndShowCameraButton() {
        const cameraBtn = document.getElementById("toggleCameraBtn");
        const imageInputEnabled = document.getElementById("inputImage").checked;
        
        if (cameraBtn) {
            if (imageInputEnabled) {
                cameraBtn.classList.remove("hidden");
            } else {
                cameraBtn.classList.add("hidden");
            }
        }
    }

    updateCameraInfoMessage() {
        const modal = document.getElementById('deviceSettingsModal');
        if (!modal || modal.classList.contains('hidden')) return;

        const imageInputEnabled = document.getElementById("inputImage");
        if (imageInputEnabled) {
            const cameraInfo = modal.querySelector('.text-xs.text-gray-400');
            if (cameraInfo) {
                if (imageInputEnabled.checked) {
                    cameraInfo.textContent = 'Camera selection will be used immediately for image input.';
                } else {
                    cameraInfo.textContent = 'Camera selection is available even when image input is disabled. Your selection will be used when you enable image input.';
                }
            }
        }
    }
} 