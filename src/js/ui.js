// UI Module
// UI Module
// UI Module

window.UI = class UI {
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
        this.setupMessageUIState();
        this.checkCredentials();
        this.populateMicrosoftLangList();
        this.setupDrawerListeners();
        // Initialize TTS vendor blocks visibility
        this.handleTtsVendorChange();
        // Update base URL indicator
        this.updateBaseUrlIndicator();
        
        // Initialize message UI state after a short delay to ensure all elements are loaded
        setTimeout(() => {
            this.updateMessageUIState();
        }, 100);
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

        // Add parameter field button
        const addParamBtn = document.getElementById("addParamBtn");
        if (addParamBtn) {
            addParamBtn.addEventListener("click", () => this.addParamField());
        }

        // Setup message UI state management
        this.setupMessageUIState();

        // Credentials modal
        const setCredsBtn = document.getElementById("setCredsBtn");
        if (setCredsBtn) {
            setCredsBtn.addEventListener("click", () => this.openCredsModal());
        }
        const saveCredsBtn = document.getElementById("saveCredsBtn");
        if (saveCredsBtn) {
            saveCredsBtn.addEventListener("click", () => this.saveCreds());
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

        // Microphone control
        const toggleMicBtn = document.getElementById("toggleMicBtn");
        if (toggleMicBtn) {
            toggleMicBtn.addEventListener("click", () => this.toggleMicrophone());
        }

        // Camera control
        const toggleCameraBtn = document.getElementById("toggleCameraBtn");
        if (toggleCameraBtn) {
            toggleCameraBtn.addEventListener("click", () => this.toggleCamera());
            console.log("Camera button found and event listener added");
        } else {
            console.error("Camera button not found!");
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
                console.log("Camera unmuted");
                
                // Disable image upload when camera is unmuted
                this.updateMessageUIState();
            } else {
                // Currently unmuted, mute it
                await videoTrack.setEnabled(false);
                cameraBtn.classList.add("muted");
                cameraBtn.title = "Unmute Camera";
                cameraIcon.classList.add("hidden");
                cameraOffIcon.classList.remove("hidden");
                console.log("Camera muted");
                
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
                console.log('Subtitle manager reference updated in UI');
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
        if (!text) return;

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
        
        console.log('Added image to chat history:', messageData);
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
            console.log('=== IMAGE MESSAGE RESPONSE DEBUG ===');
            console.log('Original message:', message);
            
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
                    
                    console.log('Extracted dimensions:', { width, height, size });
                    
                    const imageDetails = `📷 Image received: ${width}x${height} (${this.formatFileSize(size)})`;
                    console.log('Final image details text:', imageDetails);
                    
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
                console.log('❌ Message does not match expected format for image response');
                console.log('Expected: object="message.info" and module="context"');
                console.log('Got: object="' + message.object + '" and module="' + message.module + '"');
            }
        } catch (error) {
            console.error('Error handling image message response:', error);
            console.error('Original message:', message);
        }
    }

    updateMostRecentImageMessage(newText, status) {
        console.log('=== UPDATE MOST RECENT IMAGE MESSAGE DEBUG ===');
        console.log('New text:', newText);
        console.log('Status:', status);
        
        // Find and update the most recent image message in chat history
        if (window.subtitleManager && window.subtitleManager.chatHistoryData) {
            console.log('Chat history data length:', window.subtitleManager.chatHistoryData.length);
            console.log('All messages:', window.subtitleManager.chatHistoryData.map(msg => ({ id: msg.id, type: msg.messageType, text: msg.text })));
            
            // Find the last image message in the chat history
            let messageIndex = -1;
            for (let i = window.subtitleManager.chatHistoryData.length - 1; i >= 0; i--) {
                const msg = window.subtitleManager.chatHistoryData[i];
                if (msg.messageType === 'image') {
                    messageIndex = i;
                    console.log('Found most recent image message at index:', i);
                    break;
                }
            }
            
            if (messageIndex !== -1) {
                const message = window.subtitleManager.chatHistoryData[messageIndex];
                console.log('Original message:', message);
                message.text = newText;
                message.status = status;
                console.log('Updated message:', message);
                
                // Update the display
                window.subtitleManager.updateChatHistoryDisplay();
                console.log(`✅ Successfully updated image message at index ${messageIndex} with status: ${status}`);
            } else {
                console.log('❌ Could not find any image message to update');
                console.log('Available messages:', window.subtitleManager.chatHistoryData.map(msg => ({ id: msg.id, type: msg.messageType, text: msg.text })));
            }
        } else {
            console.log('❌ Subtitle manager or chat history data not available');
        }
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
        const agentId = document.getElementById("uniqueName").value.trim(); // Get agent ID from unique name field

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
                console.log("Camera button shown - image input enabled and video track available");
                
                // Update message UI state when camera button is shown
                this.updateMessageUIState();
            } else {
                cameraBtn.classList.add("hidden");
                console.log("Camera button hidden - image input enabled but no video track (camera permission likely denied)");
                
                // Show a user-friendly message about camera permission
                if (imageInputEnabled) {
                    console.warn("Camera permission was denied. Camera functionality will not be available.");
                }
            }
        } else {
            console.log("Camera button hidden - image input:", imageInputEnabled);
        }
    }

    async leaveChannel() {
        try {
            await this.mediaProcessor.leaveChannel();
            document.getElementById("joinChannel").disabled = false;
            document.getElementById("leaveChannel").disabled = true;
            
            // Reset mic and camera button states
            this.resetMicAndCameraStates();
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
        const elevenLabsVoiceSelect = document.getElementById("elevenLabsVoiceSelect");
        const voiceIdBlk = document.getElementById("elevenLabsVoiceIdBlock");
        
        if (!elevenLabsVoiceSelect || !voiceIdBlk) {
            console.warn('ElevenLabs TTS elements not found');
            return;
        }
        
        const voiceSel = elevenLabsVoiceSelect.value;
        voiceIdBlk.classList.toggle("hidden", voiceSel !== "other");
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
            const formData = Utils.getFormData();
            Utils.validateFormData(formData);
            const customParams = Utils.getCustomParams();
            const agentConfig = Utils.buildAgentConfig(formData, customParams);

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
            const { customerId, customerSecret } = Utils.getStoredCredentials();
            const agentIdElement = document.getElementById("agentId");
            if (!agentIdElement || !agentIdElement.value.trim()) {
                throw new Error("Agent ID is required for update");
            }
            const agentId = agentIdElement.value.trim();
            const formData = Utils.getFormData();
            const customParams = Utils.getCustomParams();
            const config = Utils.buildAgentConfig(formData, customParams);
            
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
} 