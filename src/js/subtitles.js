/**
 * Subtitle Manager for Agora Conversational AI
 * Manages subtitle display, chat history, and auto-configuration
 * Uses the Agora Conversational AI toolkit approach with RTM signaling
 */

class SubtitleManager {
    constructor() {
        console.log('SubtitleManager v1.1 loaded - using API-based chat history management');
        
        this.isEnabled = false;
        this.isOverlayVisible = false;
        this.currentSubtitle = '';
        this.currentSpeaker = '';
        this.subtitleTimeout = null;
        this.chatHistoryData = [];
        this.conversationalAIAPI = null;
        this.expectedAgentId = null;
        
        // DOM elements
        this.elements = {};
        
        this.initializeElements();
        this.setupEventListeners();
        

    }

    initializeElements() {
        this.elements = {
            enableSubtitles: document.getElementById('enableSubtitles'),
            toggleSubtitleOverlay: document.getElementById('toggleSubtitleOverlay'),
            demoSubtitles: document.getElementById('demoSubtitles'),
            testSubtitle: document.getElementById('testSubtitle'),
            subtitleOverlay: document.getElementById('subtitleOverlay'),
            subtitleText: document.getElementById('subtitleText'),
            subtitleSpeaker: document.getElementById('subtitleSpeaker'),
            chatHistory: document.getElementById('chatHistory'),
            copyChatBtn: document.getElementById('copyChatBtn'),
            clearChatBtn: document.getElementById('clearChatBtn'),
            
            // Auto-configuration elements
            transcriptEnable: document.getElementById('transcriptEnable'),
            transcriptEnableSet: document.getElementById('transcriptEnableSet'),
            enableRtm: document.getElementById('enableRtm'),
            dataChannel: document.getElementById('dataChannel'),
            parametersEnabled: document.getElementById('parametersEnabled')
        };
    }

    setupEventListeners() {
        // Main subtitle toggle
        if (this.elements.enableSubtitles) {
            this.elements.enableSubtitles.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Show signaling requirements modal when enabling subtitles
                    this.showSignalingModal();
                } else {
                    this.setSubtitlesEnabled(false);
                }
            });
        }

        // Overlay toggle
        if (this.elements.toggleSubtitleOverlay) {
            this.elements.toggleSubtitleOverlay.addEventListener('click', () => {
                this.toggleOverlay();
            });
        }

        // Demo button
        if (this.elements.demoSubtitles) {
            this.elements.demoSubtitles.addEventListener('click', () => {
                this.demoSubtitle();
            });
        }

        // Test subtitle button
        if (this.elements.testSubtitle) {
            this.elements.testSubtitle.addEventListener('click', () => {
                this.addManualSubtitle('Test subtitle message', 'Test User');
            });
        }

        // Chat history buttons
        if (this.elements.copyChatBtn) {
            this.elements.copyChatBtn.addEventListener('click', () => {
                this.copyChatHistory();
            });
        }

        if (this.elements.clearChatBtn) {
            this.elements.clearChatBtn.addEventListener('click', () => {
                this.clearChatHistory();
            });
        }

        // Setup RTM change listeners to prevent manual disabling
        this.setupRTMChangeListeners();

        // Check configuration on load
        this.checkConfigurationCompatibility();
    }

    setSubtitlesEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (enabled) {
            console.log('Subtitles enabled');
            this.configureRTMSettings(true);
            this.showNotification('Subtitles enabled with auto-configuration', 'success');
        } else {
            console.log('Subtitles disabled');
            this.hideOverlay();
            this.configureRTMSettings(false);
            this.showNotification('Subtitles disabled', 'info');
        }

        // Update UI elements
        if (this.elements.toggleSubtitleOverlay) {
            this.elements.toggleSubtitleOverlay.disabled = !enabled;
        }
        if (this.elements.demoSubtitles) {
            this.elements.demoSubtitles.disabled = !enabled;
        }
        if (this.elements.testSubtitle) {
            this.elements.testSubtitle.disabled = !enabled;
        }
    }

    toggleOverlay() {
        if (this.isOverlayVisible) {
            this.hideOverlay();
        } else {
            this.showOverlay();
        }
    }

    showOverlay() {
        if (!this.isEnabled || !this.elements.subtitleOverlay) return;
        
        this.elements.subtitleOverlay.classList.remove('hidden');
        this.elements.subtitleOverlay.classList.add('visible');
        this.isOverlayVisible = true;
        
        if (this.elements.toggleSubtitleOverlay) {
            this.elements.toggleSubtitleOverlay.textContent = 'Hide Overlay';
        }
    }

    hideOverlay() {
        if (!this.elements.subtitleOverlay) return;
        
        this.elements.subtitleOverlay.classList.remove('visible');
        this.elements.subtitleOverlay.classList.add('hidden');
        this.isOverlayVisible = false;
        
        if (this.elements.toggleSubtitleOverlay) {
            this.elements.toggleSubtitleOverlay.textContent = 'Show Overlay';
        }
    }

    updateSubtitle(text, speaker = '', isFinal = false) {
        if (!this.isEnabled) return;

        this.currentSubtitle = text;
        this.currentSpeaker = speaker;

        // Update overlay
        if (this.elements.subtitleText) {
            this.elements.subtitleText.textContent = text;
        }
        if (this.elements.subtitleSpeaker) {
            this.elements.subtitleSpeaker.textContent = speaker ? `${speaker}:` : '';
        }

        // Show overlay if enabled
        if (this.isOverlayVisible) {
            this.showOverlay();
        }

        // Auto-clear after timeout
        this.clearSubtitleTimeout();
        if (!isFinal) {
            this.subtitleTimeout = setTimeout(() => {
                this.clearSubtitle();
            }, 5000);
        }
    }

    clearSubtitle() {
        if (this.elements.subtitleText) {
            this.elements.subtitleText.textContent = '';
        }
        if (this.elements.subtitleSpeaker) {
            this.elements.subtitleSpeaker.textContent = '';
        }
        this.currentSubtitle = '';
        this.currentSpeaker = '';
    }

    clearSubtitleTimeout() {
        if (this.subtitleTimeout) {
            clearTimeout(this.subtitleTimeout);
            this.subtitleTimeout = null;
        }
    }

    addToChatHistory(text, speaker = '', timestamp = null, userId = null) {
        // This method is no longer used in the new approach
        // The API handles chat history management
        console.log('addToChatHistory called but not used in new approach');
        return;
    }

    updateChatHistoryDisplay() {
        if (!this.elements.chatHistory) return;

        const historyHtml = this.chatHistoryData.map(msg => {
            // Determine message type based on speaker
            const speakerLower = msg.speaker.toLowerCase();
            const isAgent = speakerLower.includes('agent') || 
                           speakerLower.includes('assistant');
            const messageType = isAgent ? 'agent' : 'user';
            const tempClass = msg.isTemp ? ' temp' : '';
            
            return `<div class="chat-message ${messageType}${tempClass}"><div class="speaker">${this.escapeHtml(msg.speaker)}</div><div class="text">${this.escapeHtml(msg.text)}</div><div class="timestamp">${msg.isTemp ? '(live)' : msg.timestamp}</div></div>`;
        }).join('');

        this.elements.chatHistory.innerHTML = historyHtml;
        
        // Scroll to bottom
        this.elements.chatHistory.scrollTop = this.elements.chatHistory.scrollHeight;
    }

    copyChatHistory() {
        if (this.chatHistoryData.length === 0) {
            this.showNotification('No chat history to copy', 'warning');
            return;
        }

        const chatText = this.chatHistoryData.map(msg => 
            `[${msg.timestamp}] ${msg.speaker}: ${msg.text}`
        ).join('\n');

        navigator.clipboard.writeText(chatText).then(() => {
            this.showNotification('Chat history copied to clipboard', 'success');
        }).catch(err => {
            console.error('Failed to copy chat history:', err);
            this.showNotification('Failed to copy chat history', 'error');
        });
    }

    clearChatHistory() {
        this.chatHistoryData = [];
        this.updateChatHistoryDisplay();
        this.showNotification('Chat history cleared', 'info');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Auto-configuration methods
    configureRTMSettings(enabled) {
        const transcriptEnable = this.elements.transcriptEnable;
        const transcriptEnableSet = this.elements.transcriptEnableSet;
        const enableRtm = this.elements.enableRtm;
        const dataChannel = this.elements.dataChannel;
        const parametersEnabled = this.elements.parametersEnabled;

        if (enabled) {
            // Auto-enable parameters section (required for RTM parameters)
            if (parametersEnabled && !parametersEnabled.checked) {
                parametersEnabled.checked = true;
                parametersEnabled.dataset.autoEnabled = 'true';
                parametersEnabled.dispatchEvent(new Event('change'));
            }

            // Auto-enable transcript
            if (transcriptEnableSet && !transcriptEnableSet.checked) {
                transcriptEnableSet.checked = true;
                transcriptEnableSet.dataset.autoEnabled = 'true';
                transcriptEnableSet.dispatchEvent(new Event('change'));
            }
            if (transcriptEnable && transcriptEnable.value !== 'true') {
                transcriptEnable.value = 'true';
            }

            // Auto-enable RTM
            if (enableRtm && !enableRtm.checked) {
                enableRtm.checked = true;
                enableRtm.dataset.autoEnabled = 'true';
                enableRtm.dispatchEvent(new Event('change'));
            }

            // Set data channel to RTM
            if (dataChannel && dataChannel.value !== 'rtm') {
                dataChannel.value = 'rtm';
                dataChannel.dataset.autoSet = 'true';
            }

            // Auto-enable RTM metrics for subtitle support
            const enableMetrics = document.getElementById('enableMetrics');
            if (enableMetrics && !enableMetrics.checked) {
                enableMetrics.checked = true;
                enableMetrics.dataset.autoEnabled = 'true';
                enableMetrics.dispatchEvent(new Event('change'));
            }

            // Auto-enable RTM error messages for subtitle support
            const enableErrorMessage = document.getElementById('enableErrorMessage');
            if (enableErrorMessage && !enableErrorMessage.checked) {
                enableErrorMessage.checked = true;
                enableErrorMessage.dataset.autoEnabled = 'true';
                enableErrorMessage.dispatchEvent(new Event('change'));
            }

            console.log('Auto-configured settings for subtitles: parameters=true, transcript=true, rtm=true, data_channel=rtm, metrics=true, error_messages=true');
            this.showNotification('Settings auto-configured for subtitles', 'info');
        } else {
            // Revert auto-enabled settings
            if (parametersEnabled && parametersEnabled.dataset.autoEnabled === 'true') {
                parametersEnabled.checked = false;
                parametersEnabled.dispatchEvent(new Event('change'));
                delete parametersEnabled.dataset.autoEnabled;
            }

            if (transcriptEnableSet && transcriptEnableSet.dataset.autoEnabled === 'true') {
                transcriptEnableSet.checked = false;
                transcriptEnableSet.dispatchEvent(new Event('change'));
                delete transcriptEnableSet.dataset.autoEnabled;
            }

            if (enableRtm && enableRtm.dataset.autoEnabled === 'true') {
                enableRtm.checked = false;
                enableRtm.dispatchEvent(new Event('change'));
                delete enableRtm.dataset.autoEnabled;
            }

            if (dataChannel && dataChannel.dataset.autoSet === 'true') {
                dataChannel.value = '';
                delete dataChannel.dataset.autoSet;
            }

            // Revert auto-enabled metrics
            const enableMetrics = document.getElementById('enableMetrics');
            if (enableMetrics && enableMetrics.dataset.autoEnabled === 'true') {
                enableMetrics.checked = false;
                enableMetrics.dispatchEvent(new Event('change'));
                delete enableMetrics.dataset.autoEnabled;
            }

            // Revert auto-enabled error messages
            const enableErrorMessage = document.getElementById('enableErrorMessage');
            if (enableErrorMessage && enableErrorMessage.dataset.autoEnabled === 'true') {
                enableErrorMessage.checked = false;
                enableErrorMessage.dispatchEvent(new Event('change'));
                delete enableErrorMessage.dataset.autoEnabled;
            }

            console.log('Reset auto-configured settings after disabling subtitles');
        }
    }

    setupRTMChangeListeners() {
        // Prevent manual disabling of required settings while subtitles are enabled
        [this.elements.transcriptEnableSet, this.elements.enableRtm, this.elements.parametersEnabled].forEach(element => {
            if (element) {
                element.addEventListener('change', (e) => {
                    if (this.isEnabled && element.dataset.autoEnabled === 'true' && !e.target.checked) {
                        e.preventDefault();
                        e.target.checked = true;
                        this.showNotification('This setting is required for subtitles and cannot be disabled', 'warning');
                    }
                });
            }
        });

        // Protect metrics and error message settings
        ['enableMetrics', 'enableErrorMessage'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    if (this.isEnabled && element.dataset.autoEnabled === 'true' && !e.target.checked) {
                        e.preventDefault();
                        e.target.checked = true;
                        this.showNotification('This setting is required for subtitles and cannot be disabled', 'warning');
                    }
                });
            }
        });

        if (this.elements.dataChannel) {
            this.elements.dataChannel.addEventListener('change', (e) => {
                if (this.isEnabled && this.elements.dataChannel.dataset.autoSet === 'true' && e.target.value !== 'rtm') {
                    e.preventDefault();
                    e.target.value = 'rtm';
                    this.showNotification('Data channel must be set to RTM for subtitles', 'warning');
                }
            });
        }
    }

    checkConfigurationCompatibility() {
        // Check if current configuration is compatible with subtitles
        if (this.elements.enableSubtitles && this.elements.enableSubtitles.checked) {
            if (!this.isConfigurationValid()) {
                console.warn('Subtitle configuration is invalid, auto-configuring...');
                this.configureRTMSettings(true);
            }
        }
    }

    isConfigurationValid() {
        const transcriptEnabled = this.elements.transcriptEnableSet?.checked && 
                                this.elements.transcriptEnable?.value === 'true';
        const rtmEnabled = this.elements.enableRtm?.checked;
        const dataChannelRtm = this.elements.dataChannel?.value === 'rtm';

        return transcriptEnabled && rtmEnabled && dataChannelRtm;
    }

    showNotification(message, type = 'info') {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-3 rounded-lg text-white z-50 transition-opacity duration-300`;
        
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-600');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-600');
                break;
            case 'error':
                notification.classList.add('bg-red-600');
                break;
            default:
                notification.classList.add('bg-blue-600');
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Demo and testing methods
    demoSubtitle() {
        if (!this.isEnabled) return;

        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
            if (this.elements.demoSubtitles) {
                this.elements.demoSubtitles.textContent = 'Demo Subtitles';
            }
            return;
        }

        const demoMessages = [
            { text: "Hello, I'm your AI assistant. How can I help you today?", speaker: "AI Agent" },
            { text: "I'd like to know about the weather forecast for tomorrow.", speaker: "User" },
            { text: "I can help you with weather information. Let me check the latest forecast for your area.", speaker: "AI Agent" },
            { text: "Thank you, that would be great!", speaker: "User" },
            { text: "Based on current data, tomorrow will be partly cloudy with a high of 72°F and a low of 58°F.", speaker: "AI Agent" }
        ];

        let messageIndex = 0;
        
        if (this.elements.demoSubtitles) {
            this.elements.demoSubtitles.textContent = 'Stop Demo';
        }

        this.demoInterval = setInterval(() => {
            if (messageIndex >= demoMessages.length) {
                messageIndex = 0;
            }

            const message = demoMessages[messageIndex];
            this.updateSubtitle(message.text, message.speaker, true);
            messageIndex++;
        }, 3000);
    }

    addManualSubtitle(text, speaker = 'Manual') {
        if (!this.isEnabled) return;
        this.updateSubtitle(text, speaker, true);
    }

    // Conversational AI integration methods
    async initializeConversationalAI(appId, channelName, token, uid, agentId = null) {
        // Store the agent ID for use in speaker identification
        this.expectedAgentId = agentId;
        try {
            if (!window.AgoraRTC || !window.AgoraRTM) {
                console.error('Agora SDKs availability check:', {
                    AgoraRTC: typeof window.AgoraRTC,
                    AgoraRTM: typeof window.AgoraRTM
                });
                throw new Error(`Agora RTC and RTM SDKs are required for subtitles. Available: RTC=${!!window.AgoraRTC}, RTM=${!!window.AgoraRTM}`);
            }

            console.log('RTM SDK v2.x detected and ready');

            // Initialize the Conversational AI toolkit
            if (typeof ConversationalAIAPI !== 'undefined') {
                // Generate a valid UID if none provided or if invalid
                let validUid = uid;
                if (!validUid || validUid === 0 || validUid === '0' || validUid === '') {
                    validUid = Math.floor(Math.random() * 1000000) + 1000;
                }
                
                console.log('RTM UID:', validUid);
                // Use RTM v2.x API based on the official documentation
                console.log('Using RTM v2.x API');
                const rtmEngine = new window.AgoraRTM.RTM(appId, validUid.toString(), {
                    token: token || undefined, // Use token if available
                    logUpload: true,
                    logLevel: 'INFO'
                });
                
                // Login to RTM v2.x (no parameters needed as UID and token are in constructor)
                await rtmEngine.login({token});
                
                ConversationalAIAPI.init({
                    rtcEngine: window.mediaProcessor?.client || window.AgoraRTC.createClient({mode: "rtc", codec: "vp8"}),
                    rtmEngine: rtmEngine,
                    renderMode: window.ESubtitleHelperMode?.TEXT || 'text',
                    enableLog: true,
                    expectedAgentId: this.expectedAgentId // Pass the expected agent ID from UI
                });

                this.conversationalAIAPI = ConversationalAIAPI.getInstance();
                
                // Subscribe to transcription events using the correct event system
                this.conversationalAIAPI.on(window.EConversationalAIAPIEvents.TRANSCRIPTION_UPDATED, (chatHistory) => {
                    this.handleTranscriptionUpdate(chatHistory);
                });

                this.conversationalAIAPI.on(window.EConversationalAIAPIEvents.AGENT_STATE_CHANGED, (agentUserId, event) => {
                    console.log('Agent state changed:', agentUserId, event);
                });

                this.conversationalAIAPI.on(window.EConversationalAIAPIEvents.DEBUG_LOG, (message) => {
                    console.log('ConversationalAI Debug:', message);
                });

                // Subscribe to the channel for messages
                await this.conversationalAIAPI.subscribeMessage(channelName);

                console.log('Conversational AI API initialized for subtitles');
            } else {
                console.warn('ConversationalAIAPI not available, using fallback subtitle implementation');
            }
        } catch (error) {
            console.error('Failed to initialize Conversational AI for subtitles:', error);
        }
    }

    async cleanupConversationalAI() {
        if (this.conversationalAIAPI) {
            try {
                await this.conversationalAIAPI.destroy();
                this.conversationalAIAPI = null;
                console.log('Conversational AI API cleaned up');
            } catch (error) {
                console.error('Error cleaning up Conversational AI:', error);
            }
        }
    }

    handleTranscriptionUpdate(chatHistory) {
        try {
            if (!Array.isArray(chatHistory) || chatHistory.length === 0) return;

            // Get the latest transcription from chat history
            const latestItem = chatHistory[chatHistory.length - 1];
            if (!latestItem || !latestItem.data) return;

            const transcription = latestItem.data;
            const text = transcription.text || transcription.content || '';
            const speaker = transcription.speaker || latestItem.agentUserId || 'Unknown';
            const isFinal = transcription.isFinal || transcription.final || false;
            const isTemp = latestItem.id && latestItem.id.toString().startsWith('temp-');

            if (text.trim()) {
                // Always update the live subtitle overlay
                this.updateSubtitle(text, speaker, isFinal);
                
                // Determine if this is a user or assistant transcription
                // Check if this is a user transcription by looking at the user_id field
                const isUserTranscription = transcription.user_id && transcription.user_id !== '' && transcription.user_id !== undefined;
                const isAssistantTranscription = !isUserTranscription;
                
                // Debug the user_id value
                console.log('DEBUG - transcription.user_id:', transcription.user_id, 'isUserTranscription:', isUserTranscription);
                console.log('DEBUG - latestItem structure:', latestItem);
                console.log('DEBUG - transcription structure:', transcription);
                
                // Instead of managing our own chat history, work with the provided chat history
                // Convert the chat history from the API format to our display format
                this.updateChatHistoryFromAPI(chatHistory);
                
                console.log('Transcription update:', { 
                    text, 
                    speaker, 
                    isFinal, 
                    isTemp, 
                    isUserTranscription,
                    isAssistantTranscription,
                    userId: transcription.user_id,
                    chatHistoryLength: chatHistory.length 
                });
            }
        } catch (error) {
            console.error('Error handling transcription update:', error);
        }
    }

    // New method to convert API chat history to display format
    updateChatHistoryFromAPI(chatHistory) {
        if (!Array.isArray(chatHistory)) return;

        // Convert API chat history to our display format
        this.chatHistoryData = chatHistory.map(item => {
            const transcription = item.data;
            const text = transcription.text || transcription.content || '';
            const speaker = transcription.speaker || item.agentUserId || 'Unknown';
            const isTemp = item.id && item.id.toString().startsWith('temp-');
            
            // Format timestamp
            let formattedTimestamp;
            try {
                if (transcription.timestamp) {
                    if (typeof transcription.timestamp === 'number') {
                        const date = new Date(transcription.timestamp);
                        if (isNaN(date.getTime())) {
                            formattedTimestamp = new Date().toLocaleTimeString();
                        } else {
                            formattedTimestamp = date.toLocaleTimeString();
                        }
                    } else {
                        formattedTimestamp = transcription.timestamp;
                    }
                } else {
                    formattedTimestamp = new Date().toLocaleTimeString();
                }
            } catch (error) {
                formattedTimestamp = new Date().toLocaleTimeString();
            }

            return {
                id: item.id,
                text: text,
                speaker: speaker,
                timestamp: isTemp ? '(live)' : formattedTimestamp,
                isTemp: isTemp,
                userId: transcription.user_id || item.agentUserId
            };
        });

        this.updateChatHistoryDisplay();
    }

    // Helper methods for managing temporary messages - no longer needed since we work with API chat history
    // These methods are kept for backward compatibility but are not used in the new approach
    removeTemporaryMessage(agentUserId) {
        // This method is no longer used in the new approach
        // The API handles temporary message management
        console.log('removeTemporaryMessage called but not used in new approach');
    }

    updateTemporaryMessage(latestItem) {
        // This method is no longer used in the new approach
        // The API handles temporary message management
        console.log('updateTemporaryMessage called but not used in new approach');
    }

    // Public methods for external integration
    getCurrentSubtitle() {
        return {
            text: this.currentSubtitle,
            speaker: this.currentSpeaker,
            isVisible: this.isOverlayVisible
        };
    }

    // Signaling modal methods
    showSignalingModal() {
        const modal = document.getElementById('signalingRequirementsModal');
        if (modal) {
            modal.classList.add('show');
            
            // Setup modal event listeners
            this.setupSignalingModalListeners();
        } else {
            console.error('Signaling modal not found in DOM');
            // Fallback: show a simple alert
            const confirmed = confirm('Live subtitles require signaling (RTM) to be enabled on your Agora AppID. Both client and agent need a single token that works for both RTC and RTM. Do you want to enable subtitles anyway?');
            if (confirmed) {
                this.setSubtitlesEnabled(true);
            } else {
                // Uncheck the checkbox
                if (this.elements.enableSubtitles) {
                    this.elements.enableSubtitles.checked = false;
                }
            }
        }
    }

    hideSignalingModal() {
        const modal = document.getElementById('signalingRequirementsModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    setupSignalingModalListeners() {
        // Close button
        const closeBtn = document.getElementById('closeSignalingModal');
        if (closeBtn) {
            closeBtn.onclick = () => {
                this.hideSignalingModal();
                // Uncheck the subtitles checkbox since user cancelled
                if (this.elements.enableSubtitles) {
                    this.elements.enableSubtitles.checked = false;
                }
            };
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelSignalingModal');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                this.hideSignalingModal();
                // Uncheck the subtitles checkbox since user cancelled
                if (this.elements.enableSubtitles) {
                    this.elements.enableSubtitles.checked = false;
                }
            };
        }

        // Enable anyway button
        const enableBtn = document.getElementById('enableSignalingModal');
        if (enableBtn) {
            enableBtn.onclick = () => {
                this.hideSignalingModal();
                // Actually enable subtitles
                this.setSubtitlesEnabled(true);
            };
        }

        // Close modal when clicking outside
        const modal = document.getElementById('signalingRequirementsModal');
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    this.hideSignalingModal();
                    // Uncheck the subtitles checkbox since user cancelled
                    if (this.elements.enableSubtitles) {
                        this.elements.enableSubtitles.checked = false;
                    }
                }
            };
        }
    }

    // Destroy method for cleanup
    destroy() {
        this.clearSubtitleTimeout();
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
        }
        this.cleanupConversationalAI();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubtitleManager;
} else {
    window.SubtitleManager = SubtitleManager;
}