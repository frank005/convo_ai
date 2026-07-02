/**
 * Subtitle Manager for Agora Conversational AI
 * Manages subtitle display, chat history, and auto-configuration
 * Uses the Agora Conversational AI toolkit approach with RTM signaling
 */

class SubtitleManager {
    constructor() {
        console.log('SubtitleManager v1.2 loaded - supporting both RTM and data stream modes');
        
        this.isEnabled = false;
        this.isOverlayVisible = false;
        this.currentSubtitle = '';
        this.currentSpeaker = '';
        this.subtitleTimeout = null;
        this.chatHistoryData = [];
        this.conversationalAIAPI = null;
        this.expectedAgentId = null;
        this.agentActivityState = 'unknown';
        this.statusOnlyDataStream = false;
        this.streamMessageHandler = null;
        this.hasExplicitAgentStateSignal = false;
        
        // New properties for data stream mode
        this.isDataStreamMode = false;
        this.messagesMap = new Map();
        this.agentUid = null;
        this.rtcClient = null;
        
        // Deduplication properties for data stream
        this.lastProcessedText = null;
        this.lastProcessedSpeaker = null;
        this.lastProcessedTimestamp = 0;
        this.lastProcessedTurnId = null;
        this.lastProcessedMessageId = null;
        
        // Live message tracking for user transcripts
        this.currentUserMessage = null;
        this.currentUserTurnId = null;
        
        // Chat history management
        this.chatClearedByUser = false;
        this.lastClearedTimestamp = 0;
        this.lastMessageIdBeforeClear = null;
        
        // DOM elements
        this.elements = {};
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateLiveSubtitleMainControlsVisibility();
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
            agentActivityStatus: document.getElementById('agentActivityStatus'),
            subtitleModeRTM: document.getElementById('subtitleModeRTM'),
            subtitleModeDataStream: document.getElementById('subtitleModeDataStream'),
            
            // Auto-configuration elements
            transcriptEnable: document.getElementById('transcriptEnable'),
            transcriptEnableSet: document.getElementById('transcriptEnableSet'),
            enableRtm: document.getElementById('enableRtm'),
            dataChannel: document.getElementById('dataChannel'),
            parametersEnabled: document.getElementById('parametersEnabled')
        };
    }

    /** Reflect Agent Settings → main UI: show overlay/mode only when Live Subtitles is enabled */
    updateLiveSubtitleMainControlsVisibility() {
        const wrap = document.getElementById('liveSubtitleMainControls');
        if (!wrap || !this.elements.enableSubtitles) return;
        wrap.classList.toggle('hidden', !this.elements.enableSubtitles.checked);
    }

    setupEventListeners() {
        // Main subtitle toggle
        if (this.elements.enableSubtitles) {
            this.elements.enableSubtitles.addEventListener('change', (e) => {
                this.updateLiveSubtitleMainControlsVisibility();
                if (e.target.checked) {
                    if (window.__formSettingRestoreSync) {
                        if (this.elements.subtitleModeDataStream && this.elements.subtitleModeDataStream.checked) {
                            this.enableDataStreamMode();
                        } else {
                            if (this.elements.subtitleModeRTM) {
                                this.elements.subtitleModeRTM.checked = true;
                            }
                            this.enableRTMMode();
                        }
                        return;
                    }
                    // Check which mode is selected
                    if (this.elements.subtitleModeRTM && this.elements.subtitleModeRTM.checked) {
                        this.enableRTMMode();
                    } else if (this.elements.subtitleModeDataStream && this.elements.subtitleModeDataStream.checked) {
                        this.enableDataStreamMode();
                    } else {
                        // No mode selected, show signaling modal (default to RTM)
                        this.showSignalingModal();
                    }
                } else {
                    // Disable all modes
                    if (this.isDataStreamMode) {
                        this.disableDataStreamMode();
                    } else {
                        this.disableRTMMode();
                    }
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

        // Diagnostic buttons
        const diagnoseBtn = document.getElementById('diagnoseTranscription');
        if (diagnoseBtn) {
            diagnoseBtn.addEventListener('click', () => {
                this.diagnoseTranscriptionConfig();
            });
        }

        const testBtn = document.getElementById('testTranscription');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                this.testTranscription();
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

        // Subtitle mode radio buttons - handled in setupRadioButtonExclusivity to avoid duplicate listeners
        this.setupRadioButtonExclusivity();

        // Setup RTM change listeners to prevent manual disabling
        this.setupRTMChangeListeners();

        // Check configuration on load
        this.checkConfigurationCompatibility();
        
        // Check if data stream mode should be enabled on load
        this.checkDataStreamModeOnLoad();
    }

    setSubtitlesEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (enabled) {
            console.log('Subtitles enabled');
            if (!this.isDataStreamMode) {
                this.configureRTMSettings(true);
                this.showNotification('Subtitles enabled with auto-configuration', 'success');
            } else {
                this.showNotification('Subtitles enabled in data stream mode', 'success');
                // If we previously started in status-only mode, switch back to
                // full subtitle rendering when user explicitly enables subtitles.
                this.statusOnlyDataStream = false;
            }
            
            // Check if data stream mode should be enabled
            if (this.elements.subtitleModeDataStream && this.elements.subtitleModeDataStream.checked) {
                this.isDataStreamMode = true;
                this.showDataStreamStatus();
                console.log('🔵 Data Stream Subtitles: Auto-enabled from radio button');
            }
        } else {
            console.log('Subtitles disabled');
            this.hideOverlay();
            // Keep RTM/data-channel settings intact so agent activity can
            // continue updating even when subtitle rendering is toggled off.
            this.showNotification('Subtitles disabled', 'info');
            
            // Reset data stream mode
            this.isDataStreamMode = false;
            
            // Reset radio button states
            if (this.elements.subtitleModeRTM) {
                this.elements.subtitleModeRTM.checked = false;
            }
            if (this.elements.subtitleModeDataStream) {
                this.elements.subtitleModeDataStream.checked = false;
            }
            
            // Remove disable button
            const disableBtn = document.getElementById('disableSubtitlesWithoutRTM');
            if (disableBtn) {
                disableBtn.remove();
            }
            
            // Hide status indicator
            const statusIndicator = document.getElementById('dataStreamStatusIndicator');
            if (statusIndicator) {
                statusIndicator.classList.add('hidden');
            }
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
            
            // Handle image messages with special styling
            let messageContent = this.escapeHtml(msg.text);
            let messageClass = messageType + tempClass;
            
            if (msg.messageType === 'image') {
                messageClass += ' image-message';
                // Don't escape HTML for image messages as they contain emojis and formatting
                messageContent = msg.text;
            }
            
            return `<div class="chat-message ${messageClass}"><div class="speaker">${this.escapeHtml(msg.speaker)}</div><div class="text">${messageContent}</div><div class="timestamp">${msg.isTemp ? '(live)' : msg.timestamp}</div></div>`;
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
        // Store the last message ID before clearing (if any messages exist)
        if (this.chatHistoryData.length > 0) {
            const lastMessage = this.chatHistoryData[this.chatHistoryData.length - 1];
            this.lastMessageIdBeforeClear = lastMessage.id;
        }
        
        this.chatHistoryData = [];
        this.chatClearedByUser = true;
        this.lastClearedTimestamp = Date.now();
        this.updateChatHistoryDisplay();
        this.showNotification('Chat history cleared', 'info');
    }

    updateAgentActivityStatus(state, detail = '') {
        const el = this.elements.agentActivityStatus;
        if (!el) return;

        const normalized = (state || '').toString().toLowerCase();
        let label = 'Waiting for state';
        let css = 'text-gray-300';

        if (normalized === 'speaking') {
            label = 'Speaking';
            css = 'text-green-400';
        } else if (normalized === 'thinking') {
            label = 'Thinking';
            css = 'text-yellow-300';
        } else if (normalized === 'listening') {
            label = 'Listening';
            css = 'text-cyan-300';
        } else if (normalized === 'processing') {
            label = 'Processing';
            css = 'text-blue-300';
        } else if (normalized === 'disconnected') {
            label = 'Disconnected';
            css = 'text-gray-500';
        }

        if (detail) {
            label = `${label} (${detail})`;
        }

        el.className = `font-medium ${css}`;
        el.textContent = label;
        this.agentActivityState = normalized || 'idle';
    }

    clearAgentActivityStatus() {
        this.hasExplicitAgentStateSignal = false;
        this.updateAgentActivityStatus('unknown');
    }

    // Reset the clear flag when starting a new session
    resetChatClearState() {
        this.chatClearedByUser = false;
        this.lastClearedTimestamp = 0;
        this.lastMessageIdBeforeClear = null;
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

        // Add null checks for all elements
        if (!transcriptEnable || !transcriptEnableSet || !enableRtm || !dataChannel || !parametersEnabled) {
            console.warn('Some subtitle configuration elements are missing:', {
                transcriptEnable: !!transcriptEnable,
                transcriptEnableSet: !!transcriptEnableSet,
                enableRtm: !!enableRtm,
                dataChannel: !!dataChannel,
                parametersEnabled: !!parametersEnabled
            });
            return;
        }

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
            
            // Ensure form data is properly updated by triggering additional events
            this.ensureRTMParametersSynchronized();
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
                    return;
                }

                // Keep agent-state monitoring active even when subtitles are off.
                // If user switches to datastream while already joined, initialize
                // status-only data stream handling.
                if (e.target.value === 'datastream' && window.mediaProcessor?.client) {
                    const agoraRtcUidElement = document.getElementById('agoraRtcUid');
                    const agentUid = agoraRtcUidElement ? agoraRtcUidElement.value.trim() : null;
                    if (agentUid) {
                        this.initializeDataStreamSubtitles(window.mediaProcessor.client, agentUid, { statusOnly: !this.isDataStreamMode });
                    }
                }
            });
        }

        // If RTM is enabled after join (without toggling subtitles), initialize
        // conversational API so agent state events are still received.
        if (this.elements.enableRtm) {
            this.elements.enableRtm.addEventListener('change', (e) => {
                if (e.target.checked && window.mediaProcessor?.client) {
                    this.checkAndInitializeRTMIfInChannel();
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

    checkDataStreamModeOnLoad() {
        // Check if data stream mode should be enabled on page load
        if (this.elements.subtitleModeDataStream && this.elements.subtitleModeDataStream.checked) {
            console.log('🔵 Data Stream Subtitles: Found enabled on page load');
            this.isDataStreamMode = true;
            this.isEnabled = true;
            this.showDataStreamStatus();
        }
    }

    checkAgentStatusOnLoad() {
        // Check if there's an agent ID in the field (indicates agent might be running)
        const agentIdElement = document.getElementById('agentId');
        if (agentIdElement && agentIdElement.value.trim()) {
            console.log('🔵 Subtitle Mode: Agent ID found, checking if agent is running...');
            // For now, we'll assume if there's an agent ID, the agent might be running
            // In a real implementation, you might want to query the agent status
            this.disableSubtitleModeSelection();
        }
    }

    setupRadioButtonExclusivity() {
        // Create the RTM change handler
        this.rtmChangeHandler = (e) => {
            if (e.target.checked) {
                console.log('🔵 RTM radio button clicked');
                // Uncheck data stream mode without triggering its change event
                if (this.elements.subtitleModeDataStream) {
                    this.elements.subtitleModeDataStream.removeEventListener('change', this.dataStreamChangeHandler);
                    this.elements.subtitleModeDataStream.checked = false;
                    this.elements.subtitleModeDataStream.addEventListener('change', this.dataStreamChangeHandler);
                }
                // Enable RTM mode
                this.enableRTMMode();
            }
        };
        
        // Create the data stream change handler
        this.dataStreamChangeHandler = (e) => {
            if (e.target.checked) {
                console.log('🔵 Data Stream radio button clicked');
                // Uncheck RTM mode without triggering its change event
                if (this.elements.subtitleModeRTM) {
                    this.elements.subtitleModeRTM.removeEventListener('change', this.rtmChangeHandler);
                    this.elements.subtitleModeRTM.checked = false;
                    this.elements.subtitleModeRTM.addEventListener('change', this.rtmChangeHandler);
                }
                // Enable data stream mode
                this.enableDataStreamMode();
            }
        };
        
        // Add event listeners
        if (this.elements.subtitleModeRTM) {
            this.elements.subtitleModeRTM.addEventListener('change', this.rtmChangeHandler);
        }
        
        if (this.elements.subtitleModeDataStream) {
            this.elements.subtitleModeDataStream.addEventListener('change', this.dataStreamChangeHandler);
        }
    }

    // Disable subtitle mode selection (when agent is created/running)
    disableSubtitleModeSelection() {
        console.log('🔵 Subtitle Mode: Disabling selection (agent running)');
        
        if (this.elements.subtitleModeRTM) {
            this.elements.subtitleModeRTM.disabled = true;
        }
        if (this.elements.subtitleModeDataStream) {
            this.elements.subtitleModeDataStream.disabled = true;
        }
        
        // Also disable the main subtitle checkbox
        if (this.elements.enableSubtitles) {
            this.elements.enableSubtitles.disabled = true;
        }
        
        // Show disabled indicator
        const disabledIndicator = document.getElementById('subtitleModeDisabledIndicator');
        if (disabledIndicator) {
            disabledIndicator.classList.remove('hidden');
        }
    }

    // Enable subtitle mode selection (when agent is stopped)
    enableSubtitleModeSelection() {
        console.log('🔵 Subtitle Mode: Enabling selection (agent stopped)');
        
        if (this.elements.subtitleModeRTM) {
            this.elements.subtitleModeRTM.disabled = false;
        }
        if (this.elements.subtitleModeDataStream) {
            this.elements.subtitleModeDataStream.disabled = false;
        }
        
        // Also enable the main subtitle checkbox
        if (this.elements.enableSubtitles) {
            this.elements.enableSubtitles.disabled = false;
        }
        
        // Hide disabled indicator
        const disabledIndicator = document.getElementById('subtitleModeDisabledIndicator');
        if (disabledIndicator) {
            disabledIndicator.classList.add('hidden');
        }
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

    /**
     * Tokens from buildTokenWithRtm include RTC + RTM privileges; after RTC renewToken, update RTM too.
     */
    async renewSharedSignalingToken(newToken) {
        const trimmed = newToken && String(newToken).trim();
        if (!trimmed) return;
        let rtm = this.conversationalAIAPI && this.conversationalAIAPI.rtmEngine;
        if (!rtm && typeof ConversationalAIAPI !== "undefined" && ConversationalAIAPI.instance) {
            rtm = ConversationalAIAPI.instance.rtmEngine;
        }
        if (!rtm || typeof rtm.renewToken !== "function") return;
        try {
            await rtm.renewToken(trimmed);
        } catch (e) {
            console.error("RTM renewToken failed (shared RTC+RTM token):", e);
        }
    }

    // Conversational AI integration methods
    async initializeConversationalAI(appId, channelName, token, uid, agentId = null) {
        // Store the agent ID for use in speaker identification
        this.expectedAgentId = agentId;
        
        // Clear chat history for new agent session
        this.chatHistoryData = [];
        
        // Reset chat clear state for new session
        this.resetChatClearState();
        try {
            // Check SDK availability
            if (!window.AgoraRTC || !window.AgoraRTM) {
                const errorMsg = `Agora SDKs are required for transcription. Available: RTC=${!!window.AgoraRTC}, RTM=${!!window.AgoraRTM}`;
                console.error('Agora SDKs availability check:', {
                    AgoraRTC: typeof window.AgoraRTC,
                    AgoraRTM: typeof window.AgoraRTM
                });
                this.showNotification(errorMsg, 'error');
                throw new Error(errorMsg);
            }

            // Check configuration
            if (!this.isConfigurationValid()) {
                console.warn('Invalid transcription configuration detected, attempting to auto-configure...');
                this.configureRTMSettings(true);
                
                // Verify configuration was applied
                if (!this.isConfigurationValid()) {
                    const errorMsg = 'Failed to auto-configure transcription settings. Please check RTM and transcript settings.';
                    console.error(errorMsg);
                    this.showNotification(errorMsg, 'error');
                    return;
                }
            }

            console.log('RTM SDK v2.x detected and ready');
            console.log('Transcription configuration is valid');

            // Initialize the Conversational AI toolkit
            if (typeof ConversationalAIAPI !== 'undefined') {
                // IMPORTANT: RTM tokens are generated for a specific UID.
                // If caller omits UID and we default token generation to UID=0,
                // we must NOT replace UID=0 with a random UID here.
                // Only default when UID is truly missing/empty.
                let validUid = uid;
                if (validUid === undefined || validUid === null || validUid === '') {
                    validUid = 0;
                }
                
                console.log('Initializing RTM with UID:', validUid);
                console.log('Channel:', channelName);
                console.log('Expected Agent ID:', this.expectedAgentId);
                
                // Use RTM v2.x API based on the official documentation
                const rtmEngine = new window.AgoraRTM.RTM(appId, validUid.toString(), {
                    token: token || undefined, // Use token if available
                    logUpload: true,
                    logLevel: 'INFO'
                });
                
                // Login to RTM v2.x
                console.log('Logging into RTM...');
                await rtmEngine.login({token});
                console.log('RTM login successful');

                if (!this._onRtmTokenPrivilegeWillExpire) {
                    this._onRtmTokenPrivilegeWillExpire = () => {
                        if (
                            window.mediaProcessor &&
                            typeof window.mediaProcessor.requestClientTokenRenewal === "function"
                        ) {
                            window.mediaProcessor.requestClientTokenRenewal();
                        }
                    };
                }
                this._rtmEngineTokenListener = rtmEngine;
                rtmEngine.addEventListener(
                    "tokenPrivilegeWillExpire",
                    this._onRtmTokenPrivilegeWillExpire
                );
                
                ConversationalAIAPI.init({
                    rtcEngine: window.mediaProcessor?.client || window.AgoraRTC.createClient({mode: "rtc", codec: "vp8"}),
                    rtmEngine: rtmEngine,
                    renderMode: window.ESubtitleHelperMode?.TEXT || 'text',
                    enableLog: true,
                    expectedAgentId: this.expectedAgentId // Pass the expected agent ID from UI
                });

                this.conversationalAIAPI = ConversationalAIAPI.getInstance();
                
                // Subscribe to transcription events using the correct event system
                this.conversationalAIAPI.on(window.EConversationalAIAPIEvents.TRANSCRIPT_UPDATED, (chatHistory) => {
                    console.log('Received transcription update:', chatHistory);
                    this.handleTranscriptionUpdate(chatHistory);
                });

                this.conversationalAIAPI.on(window.EConversationalAIAPIEvents.AGENT_STATE_CHANGED, (agentUserId, event) => {
                    console.log('Agent state changed:', agentUserId, event);
                    this.handleAgentStateChanged(event);
                });

                if (window.EConversationalAIAPIEvents.MANUAL_TURN_RESULT) {
                    this.conversationalAIAPI.on(window.EConversationalAIAPIEvents.MANUAL_TURN_RESULT, (agentUserId, result) => {
                        this.handleManualTurnResult(agentUserId, result);
                    });
                }

                this.conversationalAIAPI.on(window.EConversationalAIAPIEvents.DEBUG_LOG, (message) => {
                    console.log('ConversationalAI Debug:', message);
                });

                this.conversationalAIAPI.on(window.EConversationalAIAPIEvents.AGENT_ERROR, (agentUserId, error) => {
                    console.error('ConversationalAI Agent Error:', agentUserId, error);
                    this.showNotification(`Agent Error: ${error.message || 'Unknown error'}`, 'error');
                });

                // Subscribe to the channel for messages
                console.log('Subscribing to RTM channel for transcription messages...');
                await this.conversationalAIAPI.subscribeMessage(channelName);

                console.log('Conversational AI API initialized successfully for subtitles');
                this.showNotification('Transcription service connected successfully', 'success');
            } else {
                const errorMsg = 'ConversationalAIAPI not available. Please ensure the API is loaded.';
                console.error(errorMsg);
                this.showNotification(errorMsg, 'error');
            }
        } catch (error) {
            const errorMsg = `Failed to initialize transcription: ${error.message}`;
            console.error('Failed to initialize Conversational AI for subtitles:', error);
            this.showNotification(errorMsg, 'error');
        }
    }

    async cleanupConversationalAI() {
        if (this._rtmEngineTokenListener && this._onRtmTokenPrivilegeWillExpire) {
            try {
                this._rtmEngineTokenListener.removeEventListener(
                    "tokenPrivilegeWillExpire",
                    this._onRtmTokenPrivilegeWillExpire
                );
            } catch (_) {
                /* noop */
            }
            this._rtmEngineTokenListener = null;
        }
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
                if (isAssistantTranscription) {
                    this.updateAgentActivityStatus('speaking');
                } else if (isFinal) {
                    this.updateAgentActivityStatus('thinking');
                } else {
                    this.updateAgentActivityStatus('listening');
                }
                
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

    handleAgentStateChanged(event) {
        if (!event || !event.state) return;
        this.hasExplicitAgentStateSignal = true;
        const state = event.state.toString().toLowerCase();
        if (state === 'speaking') {
            this.updateAgentActivityStatus('speaking');
        } else if (state === 'processing' || state === 'thinking') {
            this.updateAgentActivityStatus('thinking');
        } else if (state === 'listening' || state === 'silent' || state === 'idle') {
            this.updateAgentActivityStatus('listening');
        } else {
            this.updateAgentActivityStatus('processing', state);
        }
    }

    handleManualTurnResult(agentUserId, result) {
        if (!result) return;
        const statusEl = document.getElementById('manualTurnStatus');
        const label = result.eventType || 'manual turn';
        const successText = result.success === true ? 'accepted' : (result.success === false ? 'rejected' : 'received');
        const detailParts = [
            `${label}: ${successText}`,
            result.requestId ? `request=${result.requestId}` : null,
            result.turnId != null ? `turn=${result.turnId}` : null,
            result.reason ? `reason=${result.reason}` : null,
            result.errorMessage ? result.errorMessage : null
        ].filter(Boolean);
        const message = detailParts.join(' · ');
        console.log('Manual turn result:', agentUserId, result);
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.classList.remove('hidden');
        }
    }

    async sendManualSos() {
        const agentRtcUid = this.getAgentRtcUidForManualTurn();
        if (!this.conversationalAIAPI || !this.conversationalAIAPI.isReady()) {
            throw new Error('RTM is not ready. Enable RTM and join the channel before sending manual SoS.');
        }
        return this.conversationalAIAPI.publishManualSos(agentRtcUid);
    }

    async sendManualEos() {
        const agentRtcUid = this.getAgentRtcUidForManualTurn();
        if (!this.conversationalAIAPI || !this.conversationalAIAPI.isReady()) {
            throw new Error('RTM is not ready. Enable RTM and join the channel before sending manual EoS.');
        }
        return this.conversationalAIAPI.publishManualEos(agentRtcUid);
    }

    getAgentRtcUidForManualTurn() {
        const agentRtcUidElement = document.getElementById('agoraRtcUid');
        const agentRtcUid = agentRtcUidElement ? agentRtcUidElement.value.trim() : '';
        if (!agentRtcUid) {
            throw new Error('Agent RTC UID is required for manual turn control.');
        }
        return agentRtcUid;
    }

    extractExplicitAgentState(messageDataJson) {
        if (!messageDataJson || typeof messageDataJson !== 'object') return null;

        if (typeof messageDataJson.event_type === 'string' && messageDataJson.event_type.startsWith('state.')) {
            const payload = messageDataJson.payload || {};
            const value = typeof payload.value === 'boolean' ? payload.value : true;
            const base = messageDataJson.event_type.replace('state.', '');
            if (!value) {
                if (base === 'speaking' || base === 'thinking') return 'listening';
                return 'idle';
            }
            return base;
        }

        if (typeof messageDataJson.state === 'string' && messageDataJson.state.trim()) {
            return messageDataJson.state.trim().toLowerCase();
        }

        if (messageDataJson.stateChanged && typeof messageDataJson.stateChanged.state === 'string' && messageDataJson.stateChanged.state.trim()) {
            return messageDataJson.stateChanged.state.trim().toLowerCase();
        }

        if (typeof messageDataJson.agent_state === 'string' && messageDataJson.agent_state.trim()) {
            return messageDataJson.agent_state.trim().toLowerCase();
        }

        if (typeof messageDataJson.status === 'string' && messageDataJson.status.trim()) {
            return messageDataJson.status.trim().toLowerCase();
        }

        return null;
    }

    // New method to convert API chat history to display format
    updateChatHistoryFromAPI(chatHistory) {
        if (!Array.isArray(chatHistory)) return;

        // If user has cleared the chat, filter out old messages
        if (this.chatClearedByUser) {
            let newMessages = chatHistory;
            
            // If we have a last message ID before clear, filter based on that
            if (this.lastMessageIdBeforeClear) {
                // Find the index of the last message we had before clearing
                const lastMessageIndex = chatHistory.findIndex(item => item.id === this.lastMessageIdBeforeClear);
                
                if (lastMessageIndex !== -1) {
                    // Only take messages that come after the last message we had
                    newMessages = chatHistory.slice(lastMessageIndex + 1);
                } else {
                    // If we can't find the last message, assume all messages are new
                    // (this could happen if the API sends a different set of messages)
                    newMessages = chatHistory;
                }
            } else {
                // If no last message ID, use timestamp-based filtering as fallback
                // But be more lenient - only filter out messages that are clearly old
                const clearTime = this.lastClearedTimestamp;
                const timeThreshold = clearTime - 5000; // Allow messages from 5 seconds before clear
                
                newMessages = chatHistory.filter(item => {
                    const transcription = item.data;
                    if (transcription.timestamp) {
                        const messageTime = typeof transcription.timestamp === 'number' 
                            ? transcription.timestamp 
                            : new Date(transcription.timestamp).getTime();
                        return messageTime > timeThreshold;
                    }
                    // If no timestamp, assume it's a new message
                    return true;
                });
            }
            
            // If no new messages, don't update anything
            if (newMessages.length === 0) {
                console.log('No new messages to display after clear');
                return;
            }
            
            console.log(`Filtered ${chatHistory.length - newMessages.length} old messages, keeping ${newMessages.length} new messages`);
            chatHistory = newMessages;
        }

        // Preserve existing image messages
        const existingImageMessages = this.chatHistoryData.filter(msg => msg.messageType === 'image');
        
        // Convert API chat history to our display format
        const apiMessages = chatHistory.map(item => {
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

        // Merge API messages with existing image messages in chronological order
        const allMessages = [...apiMessages, ...existingImageMessages];
        
        // Sort by timestamp to maintain chronological order
        allMessages.sort((a, b) => {
            // Handle live messages (they should appear at the end)
            if (a.timestamp === '(live)' && b.timestamp !== '(live)') return 1;
            if (a.timestamp !== '(live)' && b.timestamp === '(live)') return -1;
            if (a.timestamp === '(live)' && b.timestamp === '(live)') return 0;
            
            // Parse timestamps for comparison
            try {
                const timeA = new Date(`2000-01-01 ${a.timestamp}`);
                const timeB = new Date(`2000-01-01 ${b.timestamp}`);
                return timeA - timeB;
            } catch (error) {
                // If timestamp parsing fails, maintain original order
                return 0;
            }
        });
        
        this.chatHistoryData = allMessages;
        
        // Update the display
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

    // Subtitle mode methods
    enableRTMMode() {
        console.log('🔵 RTM Mode: Enabling...');
        console.log('🔵 RTM Mode: Current state - isDataStreamMode:', this.isDataStreamMode, 'isEnabled:', this.isEnabled);
        
        // Disable data stream mode if it was active
        if (this.isDataStreamMode) {
            console.log('🔵 RTM Mode: Disabling data stream mode first');
            this.disableDataStreamMode();
        }
        
        // Set RTM mode as active
        this.isDataStreamMode = false;
        this.isEnabled = true;
        
        // Ensure the main subtitle checkbox is checked
        if (this.elements.enableSubtitles) {
            this.elements.enableSubtitles.checked = true;
        }
        this.updateLiveSubtitleMainControlsVisibility();
        
        // Ensure RTM radio button is checked
        if (this.elements.subtitleModeRTM) {
            this.elements.subtitleModeRTM.checked = true;
            console.log('🔵 RTM Mode: RTM radio button checked:', this.elements.subtitleModeRTM.checked);
        }
        
        // Configure RTM settings to ensure proper agent configuration
        console.log('🔵 RTM Mode: Configuring RTM settings');
        this.configureRTMSettings(true);
        
        // Check if user is already in a channel and initialize RTM if needed
        console.log('🔵 RTM Mode: Checking if user is in channel for RTM initialization');
        this.checkAndInitializeRTMIfInChannel();
        
        // Update message UI state to enable message buttons
        if (window.ui && typeof window.ui.updateMessageUIState === 'function') {
            setTimeout(() => window.ui.updateMessageUIState(), 100);
        }
        
        // Show notification
        this.showNotification('RTM subtitle mode enabled. Join a channel to start transcription.', 'success');
        
        console.log('🔵 RTM Mode: Enabled and ready for channel join');
    }

    // Check if user is already in a channel and initialize RTM if needed
    checkAndInitializeRTMIfInChannel() {
        console.log('🔵 RTM Mode: Checking channel status...');
        console.log('🔵 RTM Mode: mediaProcessor exists:', !!window.mediaProcessor);
        console.log('🔵 RTM Mode: client exists:', !!(window.mediaProcessor && window.mediaProcessor.client));
        
        // Check if media processor exists and user is in a channel
        if (window.mediaProcessor && window.mediaProcessor.client) {
            console.log('🔵 RTM Mode: User is already in channel, initializing RTM...');
            
            // Use the mediaProcessor's method to initialize RTM
            window.mediaProcessor.initializeRTMForExistingChannel().then(success => {
                if (success) {
                    console.log('🔵 RTM Mode: RTM initialization completed successfully');
                    this.showNotification('RTM initialized for existing channel connection', 'success');
                } else {
                    console.warn('🔵 RTM Mode: RTM initialization failed');
                    this.showNotification('Failed to initialize RTM for existing channel', 'error');
                }
            }).catch(error => {
                console.error('🔵 RTM Mode: Error during RTM initialization:', error);
                this.showNotification('Error initializing RTM for existing channel', 'error');
            });
        } else {
            console.log('🔵 RTM Mode: User not in channel, RTM will be initialized on channel join');
        }
    }

    // New method to ensure RTM parameters are properly synchronized
    ensureRTMParametersSynchronized() {
        // Force a small delay to ensure all DOM updates are complete
        setTimeout(() => {
            // Trigger change events on all RTM-related elements to ensure form data is updated
            const rtmElements = [
                'enableRtm',
                'dataChannel', 
                'parametersEnabled',
                'transcriptEnableSet',
                'transcriptEnable',
                'enableMetrics',
                'enableErrorMessage'
            ];
            
            rtmElements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                    // Trigger both change and input events to ensure form data is captured
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            
            console.log('RTM parameters synchronization completed');
        }, 100);
    }

    // New method to validate RTM configuration before agent creation
    validateRTMConfigurationForAgentCreation() {
        if (!this.isEnabled || this.isDataStreamMode) {
            return true; // Not using RTM mode, no validation needed
        }

        console.log('🔵 Validating RTM configuration for agent creation...');
        
        // Check if all required RTM settings are properly configured
        const isConfigValid = this.isConfigurationValid();
        
        if (!isConfigValid) {
            console.warn('🔵 RTM configuration invalid, attempting to auto-configure...');
            this.configureRTMSettings(true);
            
            // Check again after auto-configuration
            const isConfigValidAfter = this.isConfigurationValid();
            if (!isConfigValidAfter) {
                console.error('🔵 Failed to auto-configure RTM settings for agent creation');
                this.showNotification('Failed to configure RTM settings for subtitles. Please check your configuration.', 'error');
                return false;
            }
        }
        
        console.log('🔵 RTM configuration validated successfully for agent creation');
        return true;
    }

    enableDataStreamMode() {
        console.log('🔵 Data Stream Mode: Enabling...');
        
        // Disable RTM mode if it was active
        if (this.isEnabled && !this.isDataStreamMode) {
            this.disableRTMMode();
        }

        // Check if transcript is enabled (required for data stream mode)
        if (!this.isTranscriptEnabled()) {
            // Auto-enable transcript for data stream mode
            this.autoEnableTranscript();
            this.showNotification('Auto-enabled transcript for data stream subtitles', 'info');
        }

        this.isDataStreamMode = true;
        this.setSubtitlesEnabled(true);
        this.showNotification('Subtitles enabled in data stream mode (no RTM required)', 'success');

        // Ensure data stream runs in full subtitle mode (not status-only),
        // even if it had been initialized earlier for activity-only updates.
        this.statusOnlyDataStream = false;
        if (window.mediaProcessor?.client) {
            const agoraRtcUidElement = document.getElementById('agoraRtcUid');
            const agentUid = agoraRtcUidElement ? agoraRtcUidElement.value.trim() : null;
            if (agentUid) {
                this.initializeDataStreamSubtitles(window.mediaProcessor.client, agentUid, { statusOnly: false });
            }
        }
        
        // Show status indicator
        this.showDataStreamStatus();
        
        // Ensure the main subtitle checkbox is checked
        if (this.elements.enableSubtitles) {
            this.elements.enableSubtitles.checked = true;
        }
        this.updateLiveSubtitleMainControlsVisibility();
        
        // Update message UI state to disable message buttons
        if (window.ui && typeof window.ui.updateMessageUIState === 'function') {
            setTimeout(() => window.ui.updateMessageUIState(), 100);
        }
        
        console.log('🔵 Data Stream Subtitles: Enabled');
        console.log('🔵 Data Stream Subtitles: Waiting for channel join to initialize...');
    }

    disableRTMMode() {
        console.log('🔴 RTM Mode: Disabling...');
        this.setSubtitlesEnabled(false);
        this.showNotification('RTM subtitle mode disabled', 'info');
        
        // Update message UI state to disable message buttons
        if (window.ui && typeof window.ui.updateMessageUIState === 'function') {
            setTimeout(() => window.ui.updateMessageUIState(), 100);
        }
    }

    disableDataStreamMode() {
        console.log('🔴 Data Stream Mode: Disabling...');
        this.setSubtitlesEnabled(false);
        this.showNotification('Data stream subtitle mode disabled', 'info');
        
        // Hide status indicator
        const statusIndicator = document.getElementById('dataStreamStatusIndicator');
        if (statusIndicator) {
            statusIndicator.classList.add('hidden');
        }
        
        // Update message UI state to disable message buttons
        if (window.ui && typeof window.ui.updateMessageUIState === 'function') {
            setTimeout(() => window.ui.updateMessageUIState(), 100);
        }
    }

    showDataStreamStatus() {
        // Show status indicator
        const statusIndicator = document.getElementById('dataStreamStatusIndicator');
        if (statusIndicator) {
            statusIndicator.classList.remove('hidden');
        }
    }

    isTranscriptEnabled() {
        const transcriptEnableSet = this.elements.transcriptEnableSet;
        const transcriptEnable = this.elements.transcriptEnable;
        
        return transcriptEnableSet?.checked && transcriptEnable?.value === 'true';
    }

    autoEnableTranscript() {
        // Enable parameters section if not already enabled
        const parametersEnabled = this.elements.parametersEnabled;
        if (parametersEnabled && !parametersEnabled.checked) {
            parametersEnabled.checked = true;
            parametersEnabled.dataset.autoEnabled = 'true';
            parametersEnabled.dispatchEvent(new Event('change'));
        }

        // Enable transcript
        const transcriptEnableSet = this.elements.transcriptEnableSet;
        const transcriptEnable = this.elements.transcriptEnable;
        
        if (transcriptEnableSet && !transcriptEnableSet.checked) {
            transcriptEnableSet.checked = true;
            transcriptEnableSet.dataset.autoEnabled = 'true';
            transcriptEnableSet.dispatchEvent(new Event('change'));
        }
        
        if (transcriptEnable && transcriptEnable.value !== 'true') {
            transcriptEnable.value = 'true';
        }
    }





    // Initialize data stream subtitle handling
    async initializeDataStreamSubtitles(rtcClient, agentUid, options = {}) {
        const statusOnly = !!options.statusOnly;
        if (!this.isDataStreamMode && !statusOnly) return;

        this.rtcClient = rtcClient;
        this.agentUid = agentUid;
        this.statusOnlyDataStream = statusOnly;
        this.hasExplicitAgentStateSignal = false;

        // Reset deduplication properties for new session
        this.lastProcessedText = null;
        this.lastProcessedSpeaker = null;
        this.lastProcessedTimestamp = 0;
        this.lastProcessedTurnId = null;
        this.lastProcessedMessageId = null;
        this.messagesMap.clear();
        
        // Reset user message tracking
        this.currentUserMessage = null;
        this.currentUserTurnId = null;
        
        // Clear chat history for new agent session
        this.chatHistoryData = [];
        
        // Reset chat clear state for new session
        this.resetChatClearState();

        console.log('🔵 Data Stream Subtitles: Initializing for agent UID:', agentUid);
        console.log('🔵 Data Stream Subtitles: RTC Client available:', !!rtcClient);

        // Set up data stream message handler
        if (this.rtcClient) {
            // Avoid duplicate handlers when reinitializing in-channel.
            if (this.streamMessageHandler) {
                this.rtcClient.off('stream-message', this.streamMessageHandler);
            }
            this.streamMessageHandler = (uid, msgData) => {
                console.log('🔵 Data Stream Subtitles: Received stream message from UID:', uid, 'Agent UID:', this.agentUid);
                this.handleAgentStreamMessage(uid, msgData);
            };
            this.rtcClient.on('stream-message', this.streamMessageHandler);
            console.log('🔵 Data Stream Subtitles: Stream message handler attached');
        } else {
            console.error('🔴 Data Stream Subtitles: RTC Client not available');
        }

        this.showNotification('Data stream subtitle handling initialized. Waiting for agent to start...', 'success');
        console.log('🔵 Data Stream Subtitles: Initialization complete');
    }

    // Handle agent stream messages (based on the provided code snippet)
    handleAgentStreamMessage(uid, msgData) {
        // Verbose logging removed - uncomment for debugging if needed
        // console.log('🔵 Data Stream Subtitles: Processing message from UID:', uid);
        
        try {
            const decodedMessage = new TextDecoder().decode(msgData);
            
            let [messageId, messagePart, messageChunks, messageData] = decodedMessage.split("|");
            
            messageData = atob(messageData);
            
            this.messagesMap.set(messageId, this.messagesMap.get(messageId) ? this.messagesMap.get(messageId) + messageData : messageData);

            messageData = this.messagesMap.get(messageId);
            if (parseInt(messagePart) === parseInt(messageChunks)) {
                // console.log('🔵 Data Stream Subtitles: Complete message received, processing...');
                this.messagesMap.delete(messageId);
            } else {
                // console.log('🔵 Data Stream Subtitles: Partial message, waiting for more chunks...');
                return;
            }

            let messageDataJson;
            try {
                messageDataJson = JSON.parse(messageData);
                // Verbose logging removed - uncomment for debugging if needed
                // console.log("🔵 Data Stream Subtitles: Parsed message data:", messageDataJson);
            } catch (parseError) {
                console.error("🔴 Data Stream Subtitles: JSON parse error:", parseError);
                console.error("🔴 Data Stream Subtitles: Raw message data that failed to parse:", messageData);
                console.error("🔴 Data Stream Subtitles: Message data length:", messageData.length);
                
                // Try to find where the JSON is malformed
                if (messageData.length > 1000) {
                    console.error("🔴 Data Stream Subtitles: Message is very long, showing first 500 chars:", messageData.substring(0, 500));
                    console.error("🔴 Data Stream Subtitles: Message around position 1050:", messageData.substring(1040, 1060));
                }
                return; // Skip this message
            }
            
            const explicitState = this.extractExplicitAgentState(messageDataJson);
            if (explicitState) {
                this.hasExplicitAgentStateSignal = true;
                if (explicitState === 'silent' || explicitState === 'idle') {
                    this.updateAgentActivityStatus('listening');
                } else if (explicitState === 'speaking') {
                    this.updateAgentActivityStatus('speaking');
                } else if (explicitState === 'thinking' || explicitState === 'processing') {
                    this.updateAgentActivityStatus('thinking');
                } else if (explicitState === 'listening') {
                    this.updateAgentActivityStatus('listening');
                } else {
                    this.updateAgentActivityStatus('processing', explicitState);
                }
            }

            if (messageDataJson.object === "assistant.transcription") {
                // This is agent transcript
                // Check turn_status - 0 means the message is ready to be processed
                // We should process messages with turn_status 0 or 1 (final)
                const turnStatus = messageDataJson.turn_status;
                if (turnStatus !== 0 && turnStatus !== 1) {
                    // console.log("🔵 Data Stream Subtitles: turn_status not ready for processing:", turnStatus, "skipping");
                    return;
                }
                
                const transcriptText = messageDataJson.text;
                if (!transcriptText || !transcriptText.trim()) {
                    // console.log("🔵 Data Stream Subtitles: Empty transcript text, skipping");
                    return;
                }
                
                // Finalize any current user message when agent starts speaking
                this.finalizeCurrentUserMessage();
                
                // Extract deduplication fields
                const turnId = messageDataJson.turn_id || messageDataJson.turnId;
                const messageId = messageDataJson.message_id || messageDataJson.messageId;
                const isFinal = messageDataJson.is_final || messageDataJson.isFinal || messageDataJson.final || false;
                
                // Verbose logging removed - uncomment for debugging if needed
                // console.log("🔵 Data Stream Subtitles: Agent transcript:", transcriptText);
                
                // Check for duplicates and handle multiple transcription messages for the same turn
                if (turnId && messageId) {
                    // If this is the same turn as the last processed message, check if we should skip it
                    if (this.lastProcessedTurnId === turnId) {
                        // If it's the exact same message, skip it
                        if (this.lastProcessedMessageId === messageId) {
                            // console.log("🔵 Data Stream Subtitles: Duplicate message detected (turnID/messageID), skipping");
                            return;
                        }
                        
                        // If it's a different message for the same turn, check if the new message is more complete
                        const currentTextLength = transcriptText.length;
                        const lastTextLength = this.lastProcessedText ? this.lastProcessedText.length : 0;
                        
                        // If the new message is shorter or the same length, skip it (we want the most complete version)
                        if (currentTextLength <= lastTextLength) {
                            // console.log("🔵 Data Stream Subtitles: Shorter/equal length message for same turn, skipping");
                            return;
                        }
                        
                        // console.log("🔵 Data Stream Subtitles: Longer message for same turn, processing new version");
                        
                        // Remove the previous shorter message from chat history
                        this.removeLastMessageFromChatHistory();
                        
                        // Reset deduplication tracking to allow the new message
                        // Only reset if we're actually replacing with a longer message
                        if (currentTextLength > lastTextLength) {
                            this.lastProcessedText = null;
                            this.lastProcessedSpeaker = null;
                            this.lastProcessedTimestamp = 0;
                        }
                    }
                    
                    this.lastProcessedTurnId = turnId;
                    this.lastProcessedMessageId = messageId;
                    this.lastProcessedText = transcriptText;
                }
                
                if (!this.statusOnlyDataStream) {
                    // Add to chat history
                    this.addToChatHistoryDataStream(transcriptText, 'AI Agent', new Date().toLocaleTimeString());
                    
                    // Update subtitle overlay with isFinal flag
                    this.updateSubtitle(transcriptText, 'AI Agent', isFinal);
                }

                // Handle bracket matches if any
                const match = transcriptText.match(/\[([^\]]+)\]/);
                if (match) {
                    // console.log("🔵 Data Stream Subtitles: Bracket match found:", match[1]);
                    this.handleBracketMatch(match[1]);
                }
            } else if (messageDataJson.object === "user.transcription") {
                // This is user transcript - process regardless of UID
                // User transcripts don't have turn_status, but they have final, turn_id, message_id
                if (!messageDataJson?.text) {
                    // console.log("🔵 Data Stream Subtitles: No text in user transcript, skipping");
                    return;
                }
                
                const transcriptText = messageDataJson.text;
                if (!transcriptText || !transcriptText.trim()) {
                    // console.log("🔵 Data Stream Subtitles: Empty user transcript text, skipping");
                    return;
                }
                
                // Extract fields
                const turnId = messageDataJson.turn_id || messageDataJson.turnId;
                const messageId = messageDataJson.message_id || messageDataJson.messageId;
                const isFinal = messageDataJson.is_final || messageDataJson.isFinal || messageDataJson.final || false;
                
                // Verbose logging removed - uncomment for debugging if needed
                // console.log("🔵 Data Stream Subtitles: User transcript:", transcriptText);
                
                if (!this.statusOnlyDataStream) {
                    // Handle live user message updates
                    this.handleLiveUserMessage(transcriptText, turnId, isFinal);
                    
                    // Update subtitle overlay with isFinal flag
                    this.updateSubtitle(transcriptText, 'User', isFinal);
                }
            } else {
                // Only log unknown types for debugging
                // console.log("🔵 Data Stream Subtitles: Unknown message object type:", messageDataJson.object);
            }
        } catch (error) {
            console.error("🔴 Data Stream Subtitles: Error processing agent stream message:", error);
            console.error("🔴 Data Stream Subtitles: Error details:", {
                uid,
                msgDataLength: msgData?.length,
                errorMessage: error.message,
                errorStack: error.stack
            });
        }
    }

    // Handle live user message updates (like typing in real-time)
    handleLiveUserMessage(text, turnId, isFinal) {
        // Verbose logging removed - uncomment for debugging if needed
        // console.log("🔵 Data Stream Subtitles: Handling live user message:", { text, turnId, isFinal });
        
        // If this is a new turn, start a new message
        if (turnId !== this.currentUserTurnId) {
            // console.log("🔵 Data Stream Subtitles: New user turn detected, starting new message");
            this.finalizeCurrentUserMessage(); // Finalize any previous message
            
            // Create new message
            this.currentUserMessage = {
                id: `user-${Date.now()}`,
                text: text,
                speaker: 'User',
                timestamp: new Date().toLocaleTimeString(),
                isTemp: !isFinal,
                turnId: turnId
            };
            this.currentUserTurnId = turnId;
            
            // Add to chat history
            this.chatHistoryData.push(this.currentUserMessage);
            // console.log("🔵 Data Stream Subtitles: New user message created:", this.currentUserMessage);
        } else {
            // Same turn, update existing message
            if (this.currentUserMessage) {
                // console.log("🔵 Data Stream Subtitles: Updating existing user message:", text);
                this.currentUserMessage.text = text;
                this.currentUserMessage.isTemp = !isFinal;
            }
        }
        
        // If message is final, mark it as permanent
        if (isFinal && this.currentUserMessage) {
            // console.log("🔵 Data Stream Subtitles: Finalizing user message");
            this.currentUserMessage.isTemp = false;
            this.currentUserMessage.timestamp = new Date().toLocaleTimeString();
            this.currentUserMessage = null; // Clear current message
            this.currentUserTurnId = null;
        }
        
        // Update display
        this.updateChatHistoryDisplay();
    }
    
    // Finalize current user message (called when starting new turn or agent speaks)
    finalizeCurrentUserMessage() {
        if (this.currentUserMessage && this.currentUserMessage.isTemp) {
            // console.log("🔵 Data Stream Subtitles: Finalizing current user message due to turn change");
            this.currentUserMessage.isTemp = false;
            this.currentUserMessage.timestamp = new Date().toLocaleTimeString();
        }
        this.currentUserMessage = null;
        this.currentUserTurnId = null;
    }

    // Add to chat history for data stream mode
    addToChatHistoryDataStream(text, speaker, timestamp) {
        if (!text || !text.trim()) return;

        // Verbose logging removed - uncomment for debugging if needed
        // console.log('🔵 Data Stream Subtitles: Adding to chat history:', { text, speaker, timestamp });

        // Deduplication check for data stream messages
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastProcessedTimestamp;
        
        // Check if this is a duplicate message (same text, speaker, and within 2 seconds)
        // But allow it if the new message is longer (indicating a replacement) or if it's a recent replacement
        if (this.lastProcessedText === text.trim() && 
            this.lastProcessedSpeaker === speaker && 
            timeDiff < 2000) {
            
            // If the new message is longer, it's likely a replacement, so allow it
            if (text.trim().length > this.lastProcessedText.length) {
                // console.log('🔵 Data Stream Subtitles: Longer replacement message detected, allowing');
            } 
            // If it's a very recent message (within 500ms), it might be a replacement of equal length
            else if (timeDiff < 500) {
                // console.log('🔵 Data Stream Subtitles: Recent message replacement detected, allowing');
            } else {
                // console.log('🔵 Data Stream Subtitles: Duplicate message detected, skipping');
                return;
            }
        }
        
        // Update last processed values
        this.lastProcessedText = text.trim();
        this.lastProcessedSpeaker = speaker;
        this.lastProcessedTimestamp = currentTime;

        const message = {
            id: Date.now().toString(),
            text: text.trim(),
            speaker: speaker,
            timestamp: timestamp,
            isTemp: false
        };

        this.chatHistoryData.push(message);
        this.updateChatHistoryDisplay();
        // Verbose logging removed - uncomment for debugging if needed
        // console.log('🔵 Data Stream Subtitles: Chat history updated, total messages:', this.chatHistoryData.length);
    }

    // Remove the last message from chat history (used when replacing with a longer version)
    removeLastMessageFromChatHistory() {
        if (this.chatHistoryData.length > 0) {
            const removedMessage = this.chatHistoryData.pop();
            // console.log('🔵 Data Stream Subtitles: Removed last message from chat history:', removedMessage);
            this.updateChatHistoryDisplay();
            // console.log('🔵 Data Stream Subtitles: Chat history updated after removal, total messages:', this.chatHistoryData.length);
        }
    }

    // Handle bracket matches (placeholder for future functionality)
    handleBracketMatch(match) {
        console.log('Bracket match detected:', match);
        // Add any specific handling for bracket matches here
    }

    // Cleanup data stream subtitle handling
    cleanupDataStreamSubtitles() {
        console.log('🔵 Data Stream Subtitles: Cleaning up...');
        if (this.rtcClient) {
            if (this.streamMessageHandler) {
                this.rtcClient.off('stream-message', this.streamMessageHandler);
                this.streamMessageHandler = null;
            } else {
                this.rtcClient.off('stream-message');
            }
            this.rtcClient = null;
            console.log('🔵 Data Stream Subtitles: RTC client event listeners removed');
        }
        this.agentUid = null;
        this.messagesMap.clear();
        
        // Reset deduplication properties
        this.lastProcessedText = null;
        this.lastProcessedSpeaker = null;
        this.lastProcessedTimestamp = 0;
        this.lastProcessedTurnId = null;
        this.lastProcessedMessageId = null;
        
        // Reset user message tracking
        this.currentUserMessage = null;
        this.currentUserTurnId = null;
        this.statusOnlyDataStream = false;
        
        console.log('🔵 Data Stream Subtitles: Cleanup complete');
    }

    // Method to handle channel leave
    handleChannelLeave() {
        if (this.rtcClient) {
            console.log('🔵 Data Stream Subtitles: Channel leaving, cleaning up...');
            this.cleanupDataStreamSubtitles();
            this.showNotification('Data stream subtitle handling disconnected', 'info');
        }
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
                this.updateLiveSubtitleMainControlsVisibility();
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
                this.updateLiveSubtitleMainControlsVisibility();
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
                this.updateLiveSubtitleMainControlsVisibility();
            };
        }

        // Enable RTM mode button
        const enableRTMBtn = document.getElementById('enableRTMModal');
        if (enableRTMBtn) {
            enableRTMBtn.onclick = () => {
                this.hideSignalingModal();
                // Enable RTM mode
                if (this.elements.subtitleModeRTM) {
                    this.elements.subtitleModeRTM.checked = true;
                }
                this.enableRTMMode();
            };
        }

        // Enable data stream mode button
        const enableDataStreamBtn = document.getElementById('enableDataStreamModal');
        if (enableDataStreamBtn) {
            enableDataStreamBtn.onclick = () => {
                this.hideSignalingModal();
                // Enable data stream mode
                if (this.elements.subtitleModeDataStream) {
                    this.elements.subtitleModeDataStream.checked = true;
                }
                this.enableDataStreamMode();
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
                    this.updateLiveSubtitleMainControlsVisibility();
                }
            };
        }
    }

    // Diagnostic method to check transcription configuration
    diagnoseTranscriptionConfig() {
        console.log('=== TRANSCRIPTION DIAGNOSTIC ===');
        
        // Check SDK availability
        console.log('SDK Availability:');
        console.log('  AgoraRTC:', !!window.AgoraRTC);
        console.log('  AgoraRTM:', !!window.AgoraRTM);
        console.log('  ConversationalAIAPI:', typeof ConversationalAIAPI !== 'undefined');
        
        // Check subtitle manager state
        console.log('Subtitle Manager State:');
        console.log('  isEnabled:', this.isEnabled);
        console.log('  conversationalAIAPI:', !!this.conversationalAIAPI);
        console.log('  expectedAgentId:', this.expectedAgentId);
        
        // Check configuration elements
        console.log('Configuration Elements:');
        const elements = [
            'transcriptEnable', 'transcriptEnableSet', 'enableRtm', 
            'dataChannel', 'parametersEnabled', 'enableMetrics', 'enableErrorMessage'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const value = element.type === 'checkbox' ? element.checked : element.value;
                console.log(`  ${id}:`, value);
            } else {
                console.log(`  ${id}: MISSING`);
            }
        });
        
        // Check configuration validity
        console.log('Configuration Valid:', this.isConfigurationValid());
        
        // Check ConversationalAI API state
        if (this.conversationalAIAPI) {
            console.log('ConversationalAI API Config:', this.conversationalAIAPI.getConfig());
        }
        
        console.log('=== END DIAGNOSTIC ===');
        
        return {
            sdksAvailable: !!window.AgoraRTC && !!window.AgoraRTM,
            apiAvailable: typeof ConversationalAIAPI !== 'undefined',
            isEnabled: this.isEnabled,
            hasAPI: !!this.conversationalAIAPI,
            configValid: this.isConfigurationValid()
        };
    }

    // Public method to test transcription manually
    testTranscription() {
        if (!this.isEnabled) {
            console.warn('Subtitles are not enabled. Enable them first.');
            this.showNotification('Please enable subtitles first', 'warning');
            return;
        }
        
        console.log('Testing transcription system...');
        
        if (this.isDataStreamMode) {
            // Test data stream mode
            this.updateSubtitle('This is a test data stream transcription message', 'Test User', true);
            this.addToChatHistoryDataStream('This is a test data stream transcription message', 'Test User', new Date().toLocaleTimeString());
            this.showNotification('Test data stream transcription sent - check subtitle overlay and chat history', 'info');
        } else {
            // Test RTM mode
            const diagnosis = this.diagnoseTranscriptionConfig();
            
            if (!diagnosis.sdksAvailable) {
                this.showNotification('Agora SDKs not available', 'error');
                return;
            }
            
            if (!diagnosis.apiAvailable) {
                this.showNotification('ConversationalAI API not available', 'error');
                return;
            }
            
            if (!diagnosis.configValid) {
                this.showNotification('Configuration invalid - attempting to fix...', 'warning');
                this.configureRTMSettings(true);
            }
            
            // Test subtitle display
            this.updateSubtitle('This is a test RTM transcription message', 'Test User', true);
            this.showNotification('Test RTM transcription sent - check subtitle overlay', 'info');
        }
    }

    // Destroy method for cleanup
    destroy() {
        this.clearSubtitleTimeout();
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
        }
        this.cleanupConversationalAI();
        this.cleanupDataStreamSubtitles();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubtitleManager;
} else {
    window.SubtitleManager = SubtitleManager;
}