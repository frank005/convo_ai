// Media Processing Module
window.MediaProcessor = class MediaProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.localTracks = { audioTrack: null, videoTrack: null };
        this.client = null;
        this.animationFrameId = null;
        this.cameraPreviewManager = null;
    }

    async setupAudioProcessing(remoteAudioTrack) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        const mediaStream = new MediaStream([remoteAudioTrack.getMediaStreamTrack()]);
        const source = this.audioContext.createMediaStreamSource(mediaStream);
        source.connect(this.analyser);

        this.visualizeAudio();
    }

    visualizeAudio() {
        const volumeRing = document.querySelector(".volume-ring");
        const canvas = document.getElementById("audio-wave");
        const ctx = canvas.getContext("2d");

        const drawWave = () => {
            // Safety check - if analyser is null, stop the animation
            if (!this.analyser) {
                if (this.animationFrameId) {
                    cancelAnimationFrame(this.animationFrameId);
                    this.animationFrameId = null;
                }
                return;
            }

            this.animationFrameId = requestAnimationFrame(drawWave);
            this.analyser.getByteFrequencyData(this.dataArray);
            let averageVolume = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;
            let volumeLevel = averageVolume / 128;

            let bounceScale = 1 + (volumeLevel * 0.8);
            volumeRing.style.transform = `scale(${bounceScale})`;
            volumeRing.style.boxShadow = `0px 0px ${10 + volumeLevel * 20}px rgba(0, 255, 255, 0.8)`;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);

            for (let i = 0; i < canvas.width; i += 10) {
                let height = Math.sin(i * 0.05) * volumeLevel * 50;
                ctx.lineTo(i, canvas.height / 2 - height);
            }

            ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + volumeLevel * 0.7})`;
            ctx.lineWidth = 4;
            ctx.stroke();
        };

        drawWave();
    }

    // Helper function to convert hex string to ASCII
    hex2ascii(hexx) {
        const hex = hexx.toString();
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }

    // Helper function to convert base64 string to Uint8Array
    async base64ToUint8Array(string) {
        const raw = window.atob(string);
        const result = new Uint8Array(new ArrayBuffer(raw.length));
        for (let i = 0; i < raw.length; i += 1) {
            result[i] = raw.charCodeAt(i);
        }
        return result;
    }

    // Map numeric encryption mode to Agora SDK string format
    getEncryptionModeString(modeNum) {
        const modeMap = {
            1: 'aes-128-xts',
            2: 'aes-128-ecb',
            3: 'aes-256-xts',
            4: 'sm4-128-ecb',
            5: 'aes-128-gcm',
            6: 'aes-256-gcm',
            7: 'aes-128-gcm2',
            8: 'aes-256-gcm2'
        };
        return modeMap[modeNum] || null;
    }

    // Apply RTC encryption to client if encryption is configured
    async applyRtcEncryption(client) {
        const encryptionMode = document.getElementById('rtcEncryptionMode');
        const encryptionKey = document.getElementById('rtcEncryptionKey');
        const encryptionSalt = document.getElementById('rtcEncryptionSalt');
        
        if (!encryptionMode || !encryptionKey) {
            console.log('🔐 Encryption form elements not found - encryption will not be applied');
            return; // No encryption configured
        }
        
        const mode = encryptionMode.value;
        const key = encryptionKey.value.trim();
        
        console.log('🔐 Reading encryption settings:', {
            mode,
            hasKey: !!key,
            keyLength: key ? key.length : 0,
            hasSaltElement: !!encryptionSalt
        });
        
        // If no encryption mode is selected (empty string), don't apply encryption
        if (!mode || mode === '' || !key || key === '') {
            console.log('🔐 No RTC encryption configured (mode or key is empty), skipping encryption setup');
            return;
        }
        
        try {
            const modeNum = parseInt(mode, 10);
            
            // Validate mode
            if (isNaN(modeNum) || modeNum < 1 || modeNum > 8) {
                console.warn('🔐 Invalid encryption mode:', mode);
                return;
            }
            
            // Convert numeric mode to Agora SDK string format
            const modeString = this.getEncryptionModeString(modeNum);
            if (!modeString) {
                console.warn('🔐 Unknown encryption mode:', modeNum);
                return;
            }
            
            // Convert hex key to ASCII (same as octopiencryption)
            const asciiSecret = this.hex2ascii(key);
            
            console.log('🔐 Encryption config:', {
                modeNum,
                modeString,
                keyLength: key.length,
                asciiSecretLength: asciiSecret.length,
                hasSalt: modeNum === 7 || modeNum === 8
            });
            
            // For GCM2 modes (7 and 8), salt is required
            if (modeNum === 7 || modeNum === 8) {
                const salt = encryptionSalt ? encryptionSalt.value.trim() : '';
                if (!salt || salt === '') {
                    console.warn('🔐 Encryption salt is required for GCM2 modes (7 and 8)');
                    return;
                }
                
                const saltArray = await this.base64ToUint8Array(salt);
                console.log('🔐 Setting RTC encryption (GCM2): mode', modeString, 'salt length:', saltArray.length);
                console.log('🔐 Calling setEncryptionConfig with:', [modeString, asciiSecret, saltArray]);
                await client.setEncryptionConfig(modeString, asciiSecret, saltArray);
            } else {
                console.log('🔐 Setting RTC encryption: mode', modeString);
                console.log('🔐 Calling setEncryptionConfig with:', [modeString, asciiSecret]);
                await client.setEncryptionConfig(modeString, asciiSecret);
            }
            
            console.log('🔐 RTC encryption applied successfully');
        } catch (error) {
            console.error('🔐 Error applying RTC encryption:', error);
            console.error('🔐 Error details:', {
                message: error.message,
                stack: error.stack,
                mode,
                keyLength: key ? key.length : 0
            });
            throw new Error(`Failed to apply RTC encryption: ${error.message}`);
        }
    }

    async joinChannel(appId, channelName, token, uid, subtitleManager = null, agentId = null) {
        this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        this.appId = appId; // Store appId for later use
        this.subtitleManager = subtitleManager;
        
        // Store the requested UID initially (will be updated with actual assigned UID)
        this.uid = uid;
        console.log('🔵 MediaProcessor: Initial UID for RTM initialization:', this.uid, '(original uid param:', uid, ')');
        
        // Apply RTC encryption if configured (must be done before joining)
        await this.applyRtcEncryption(this.client);
        
        // Listen for join success to capture the actual assigned UID
        this.client.on("user-joined", (user) => {
            // This event is for when other users join, not for our own join
            // We'll capture our UID from the join promise result
        });

        // Initialize Conversational AI for subtitles if enabled (RTM mode)
        if (this.subtitleManager && this.subtitleManager.isEnabled && !this.subtitleManager.isDataStreamMode) {
            await this.initializeConversationalAI(appId, channelName, token, uid, agentId);
        }
        
        // Initialize data stream subtitle handling if enabled
        if (this.subtitleManager && this.subtitleManager.isEnabled && this.subtitleManager.isDataStreamMode) {
            await this.initializeDataStreamSubtitles(agentId);
        }
        
        this.client.on("user-published", async (user, mediaType) => {
            await this.client.subscribe(user, mediaType);
            if (mediaType === "audio") {
                const remoteAudioTrack = user.audioTrack;
                remoteAudioTrack.play();
                await this.setupAudioProcessing(remoteAudioTrack);
            } else if (mediaType === "video") {
                const remoteVideoTrack = user.videoTrack;
                // Check if AI Avatar is enabled
                const enableAvatar = document.getElementById('enableAvatar').checked;
                if (enableAvatar) {
                    // Hide placeholder and show video element
                    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
                    const avatarVideo = document.getElementById('avatarVideo');
                    
                    // Hide placeholder
                    avatarPlaceholder.style.display = 'none';
                    avatarPlaceholder.innerHTML = '';
                    
                    // Show and configure video element
                    avatarVideo.style.display = 'block';
                    avatarVideo.style.background = '';
                    avatarVideo.style.alignItems = '';
                    avatarVideo.style.justifyContent = '';
                    
                    // Play video in the video element
                    remoteVideoTrack.play(avatarVideo);
                } else {
                    // Play video normally (for image input)
                    remoteVideoTrack.play();
                }
            }
        });

        this.client.on("user-unpublished", async (user, mediaType) => {
            console.log(`User ${user.uid} unpublished ${mediaType}`);
            if (mediaType === "video") {
                // Reset avatar display if AI Avatar is enabled
                const enableAvatar = document.getElementById('enableAvatar');
                if (enableAvatar && enableAvatar.checked) {
                    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
                    if (avatarPlaceholder) {
                        avatarPlaceholder.style.display = 'flex';
                        avatarPlaceholder.innerHTML = `
                          <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                            <!-- Background circle -->
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#00ffff" stroke-width="2" opacity="0.3"/>
                            <!-- AI Icon -->
                            <g transform="translate(60, 45)">
                              <!-- Brain/Neural network representation -->
                              <circle cx="0" cy="0" r="8" fill="none" stroke="#00ffff" stroke-width="1.5"/>
                              <circle cx="-12" cy="-8" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
                              <circle cx="12" cy="-8" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
                              <circle cx="-8" cy="12" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
                              <circle cx="8" cy="12" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
                              <!-- Connection lines -->
                              <line x1="-12" y1="-8" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
                              <line x1="12" y1="-8" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
                              <line x1="-8" y1="12" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
                              <line x1="8" y1="12" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
                            </g>
                            <!-- Text -->
                            <text x="60" y="85" text-anchor="middle" fill="#00ffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">AI AVATAR</text>
                          </svg>
                        `;
                    }
                }
            }
        });

        const joinResult = await this.client.join(appId, channelName, token, uid);
        
        // Capture the actual assigned UID from the join result
        if (joinResult && joinResult.uid) {
            console.log('🔵 MediaProcessor: UID updated from join result - requested:', this.uid, 'assigned:', joinResult.uid);
            this.uid = joinResult.uid;
        }
        
        // Create and publish audio track
        if (!this.localTracks.audioTrack) {
            const micId = localStorage.getItem('selectedMicrophoneId');
            const audioConfig = {
                encoderConfig: "music_standard"
            };
            
            // Validate device ID exists before using it
            let useDeviceId = false;
            if (micId && micId.trim() !== '') {
                try {
                    // Check if the device still exists
                    const devices = await AgoraRTC.getDevices();
                    const audioInputs = devices.filter(device => device.kind === 'audioinput');
                    const deviceExists = audioInputs.some(device => device.deviceId === micId);
                    
                    if (deviceExists) {
                        audioConfig.microphoneId = micId;
                        useDeviceId = true;
                    } else {
                        console.warn('Stored microphone device ID no longer available, using default device');
                        // Clear invalid device ID from localStorage
                        localStorage.removeItem('selectedMicrophoneId');
                    }
                } catch (deviceCheckError) {
                    console.warn('Could not verify device availability, will try with stored ID:', deviceCheckError);
                    // If we can't check devices, still try with the stored ID
                    audioConfig.microphoneId = micId;
                    useDeviceId = true;
                }
            }
            
            try {
                this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack(audioConfig);
                console.log('Audio track created successfully', useDeviceId ? `with device ID: ${micId}` : 'with default device');
            } catch (error) {
                console.error('Failed to create audio track with', useDeviceId ? 'selected device' : 'default device', ':', error);
                
                // If we used a device ID and it failed, clear it and try again
                if (useDeviceId) {
                    console.log('Clearing invalid device ID and retrying with default device');
                    localStorage.removeItem('selectedMicrophoneId');
                    
                    try {
                        this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                            encoderConfig: "music_standard"
                        });
                        console.log('Audio track created successfully with default device after clearing invalid ID');
                    } catch (fallbackError) {
                        console.error('Failed to create audio track with fallback:', fallbackError);
                        // Provide more helpful error message
                        if (fallbackError.message && fallbackError.message.includes('getUserMedia')) {
                            throw new Error('Failed to access microphone. Please check your browser permissions and ensure a microphone is connected.');
                        }
                        throw fallbackError;
                    }
                } else {
                    // If default device also failed, provide helpful error
                    if (error.message && error.message.includes('getUserMedia')) {
                        throw new Error('Failed to access microphone. Please check your browser permissions and ensure a microphone is connected.');
                    }
                    throw error;
                }
            }
        }
        await this.client.publish(this.localTracks.audioTrack);

        // Create and publish video track if image input is enabled
        const imageInputEnabled = document.getElementById("inputImage").checked;
        if (imageInputEnabled && !this.localTracks.videoTrack) {
            try {
                const cameraId = localStorage.getItem('selectedCameraId');
                const videoConfig = {};
                
                // Only add cameraId if it's actually set and not empty
                if (cameraId && cameraId.trim() !== '') {
                    videoConfig.cameraId = cameraId;
                }
                
                try {
                    this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack(videoConfig);
                } catch (error) {
                    console.error('Failed to create video track with selected device:', error);
                    
                    // Fallback: try without specifying cameraId
                    try {
                        this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
                    } catch (fallbackError) {
                        console.error('Failed to create video track with fallback:', fallbackError);
                        throw fallbackError;
                    }
                }
                
                await this.client.publish(this.localTracks.videoTrack);
                
                // Initialize camera preview manager and show preview
                console.log('Video track created successfully, initializing camera preview...');
                
                // Log camera resolution
                const mediaStream = this.localTracks.videoTrack.getMediaStreamTrack();
                if (mediaStream && mediaStream.getSettings) {
                    const settings = mediaStream.getSettings();
                    console.log('Camera resolution:', settings.width + 'x' + settings.height);
                    console.log('Camera aspect ratio:', (settings.width / settings.height).toFixed(2));
                }
                
                // Add a small delay to ensure the video track is fully initialized
                setTimeout(() => {
                    this.initializeCameraPreview();
                }, 100);
            } catch (error) {
                console.error('Failed to create camera video track:', error);
                // If camera permission is denied, we should still allow the user to join
                // but inform them that camera functionality won't be available
                if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
                    console.warn('Camera permission denied - continuing without video track');
                    // Don't throw the error, just log it and continue
                    // The UI will handle showing appropriate messages
                } else {
                    // For other errors, re-throw them
                    throw error;
                }
            }
        }

        return true;
    }

    async leaveChannel() {
        if (!this.client) return;

        // Stop animations first
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Reset UI effects
        const volumeRing = document.querySelector(".volume-ring");
        volumeRing.style.transform = `scale(1)`;
        volumeRing.style.boxShadow = `0px 0px 30px rgba(0, 255, 255, 0.8)`;

        const canvas = document.getElementById("audio-wave");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cleanup Conversational AI if initialized
        await this.cleanupConversationalAI();
        
        // Handle subtitle manager cleanup
        if (this.subtitleManager) {
            this.subtitleManager.handleChannelLeave();
        }

        // Leave Agora Channel
        await this.client.leave();

        // Close AudioContext
        if (this.audioContext) {
            await this.audioContext.close();
        }

        // Stop and close video track if it exists
        if (this.localTracks.videoTrack) {
            this.localTracks.videoTrack.stop();
            this.localTracks.videoTrack.close();
        }

        // Clean up camera preview
        if (this.cameraPreviewManager) {
            this.cameraPreviewManager.hide();
        }

        // Stop and close audio track if it exists
        if (this.localTracks.audioTrack) {
            this.localTracks.audioTrack.stop();
            this.localTracks.audioTrack.close();
        }

        // Reset state
        this.client = null;
        this.appId = null;
        this.uid = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.localTracks.audioTrack = null;
        this.localTracks.videoTrack = null;

        // Reset avatar display
        const avatarImage = document.getElementById('avatarImage');
        const avatarVideo = document.getElementById('avatarVideo');
        const enableAvatar = document.getElementById('enableAvatar');
        
        if (enableAvatar && enableAvatar.checked) {
            // Show loading state for AI Avatar
            avatarImage.style.display = 'none';
            avatarVideo.style.display = 'none';
            const avatarPlaceholder = document.getElementById('avatarPlaceholder');
            avatarPlaceholder.style.display = 'flex';
            avatarPlaceholder.innerHTML = `
              <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <!-- Background circle -->
                <circle cx="60" cy="60" r="50" fill="none" stroke="#00ffff" stroke-width="2" opacity="0.3"/>
                <!-- AI Icon -->
                <g transform="translate(60, 45)">
                  <!-- Brain/Neural network representation -->
                  <circle cx="0" cy="0" r="8" fill="none" stroke="#00ffff" stroke-width="1.5"/>
                  <circle cx="-12" cy="-8" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
                  <circle cx="12" cy="-8" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
                  <circle cx="-8" cy="12" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
                  <circle cx="8" cy="12" r="4" fill="none" stroke="#00ffff" stroke-width="1.5"/>
                  <!-- Connection lines -->
                  <line x1="-12" y1="-8" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
                  <line x1="12" y1="-8" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
                  <line x1="-8" y1="12" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
                  <line x1="8" y1="12" x2="0" y2="0" stroke="#00ffff" stroke-width="1" opacity="0.7"/>
                </g>
                <!-- Text -->
                <text x="60" y="85" text-anchor="middle" fill="#00ffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">AI AVATAR</text>
              </svg>
            `;
        } else {
            // Show image
            avatarImage.style.display = 'block';
            avatarVideo.style.display = 'none';
            avatarVideo.innerHTML = '';
        }
    }

    async initializeConversationalAI(appId, channelName, token, uid, agentId = null) {
        try {
            if (this.subtitleManager && window.ConversationalAIAPI) {
                await this.subtitleManager.initializeConversationalAI(appId, channelName, token, uid, agentId);
                console.log('Conversational AI initialized for subtitles');
            }
        } catch (error) {
            console.error('Failed to initialize Conversational AI:', error);
        }
    }

    async cleanupConversationalAI() {
        try {
            if (this.subtitleManager) {
                await this.subtitleManager.cleanupConversationalAI();
                this.subtitleManager.cleanupDataStreamSubtitles();
                console.log('Conversational AI cleaned up');
            }
        } catch (error) {
            console.error('Error cleaning up Conversational AI:', error);
        }
    }

    async initializeDataStreamSubtitles(agentId) {
        if (!this.subtitleManager || !this.subtitleManager.isDataStreamMode) return;

        try {
            // Get the agent RTC UID from the UI
            const agoraRtcUidElement = document.getElementById('agoraRtcUid');
            const agentUid = agoraRtcUidElement ? agoraRtcUidElement.value.trim() : null;
            if (!agentUid) {
                console.warn('Agent RTC UID not found in UI, data stream subtitles may not work correctly');
                return;
            }
            
            console.log('Initializing data stream subtitle handling for agent:', agentUid);
            
            // Initialize the subtitle manager with the RTC client and agent UID
            await this.subtitleManager.initializeDataStreamSubtitles(this.client, agentUid);
            
            console.log('Data stream subtitle handling initialized successfully');
        } catch (error) {
            console.error('Failed to initialize data stream subtitle handling:', error);
        }
    }

    initializeCameraPreview() {
        if (!this.localTracks.videoTrack) {
            console.warn('No video track available for camera preview initialization');
            return;
        }

        try {
            // Initialize camera preview manager if not already done
            if (!this.cameraPreviewManager && window.CameraPreviewManager) {
                this.cameraPreviewManager = new window.CameraPreviewManager();
                this.cameraPreviewManager.loadSavedPosition();
            }

            if (this.cameraPreviewManager) {
                // Verify that the video track has the expected Agora Web SDK methods
                if (!this.localTracks.videoTrack.getMediaStreamTrack) {
                    console.error('Video track does not have getMediaStreamTrack method - Agora Web SDK version issue?');
                    this.cameraPreviewManager.updateVisibility(false, false);
                    return;
                }

                // Get the media stream from the video track using Agora Web SDK API
                const mediaStreamTrack = this.localTracks.videoTrack.getMediaStreamTrack();
                if (mediaStreamTrack) {
                    const stream = new MediaStream([mediaStreamTrack]);
                    this.cameraPreviewManager.setVideoStream(stream);
                    
                    // Update visibility based on camera state
                    const cameraBtn = document.getElementById("toggleCameraBtn");
                    const isCameraEnabled = !cameraBtn || !cameraBtn.classList.contains("muted");
                    this.cameraPreviewManager.updateVisibility(true, isCameraEnabled);
                    
                    console.log('Camera preview initialized with stream:', stream);
                } else {
                    console.warn('No media stream track available for camera preview');
                    // Hide preview if no stream is available
                    this.cameraPreviewManager.updateVisibility(false, false);
                }
            }
        } catch (error) {
            console.error('Failed to initialize camera preview:', error);
            // Hide preview on error
            if (this.cameraPreviewManager) {
                this.cameraPreviewManager.updateVisibility(false, false);
            }
        }
    }

    updateCameraPreviewVisibility(isEnabled) {
        if (!this.cameraPreviewManager || !this.localTracks.videoTrack) {
            console.warn('Camera preview manager or video track not available');
            return;
        }

        try {
            // Verify that the video track has the expected Agora Web SDK methods
            if (!this.localTracks.videoTrack.getMediaStreamTrack) {
                console.error('Video track does not have getMediaStreamTrack method - Agora Web SDK version issue?');
                this.cameraPreviewManager.updateVisibility(false, false);
                return;
            }

            // Update the video stream if needed
            const mediaStreamTrack = this.localTracks.videoTrack.getMediaStreamTrack();
            if (mediaStreamTrack) {
                const stream = new MediaStream([mediaStreamTrack]);
                this.cameraPreviewManager.setVideoStream(stream);
                this.cameraPreviewManager.updateVisibility(true, isEnabled);
            } else {
                console.warn('No media stream track available for camera preview update');
                this.cameraPreviewManager.updateVisibility(false, false);
            }
        } catch (error) {
            console.error('Failed to update camera preview visibility:', error);
            this.cameraPreviewManager.updateVisibility(false, false);
        }
    }

    // Method to initialize RTM for existing channel connection
    async initializeRTMForExistingChannel() {
        if (!this.client || !this.appId) {
            console.log('🔵 RTM: No active channel connection to initialize RTM for');
            return false;
        }

        console.log('🔵 RTM: Initializing RTM for existing channel connection');
        
        // Get channel information
        const channelName = document.getElementById("agoraChannelName")?.value?.trim();
        let clientRtcUid = document.getElementById("clientRtcUid")?.value?.trim();
        const clientRtcToken = document.getElementById("clientRtcToken")?.value?.trim();
        const agentId = document.getElementById("uniqueName")?.value?.trim();
        
        // Use the actual UID from the join request if Client UID field is empty
        console.log('🔵 RTM: Debug - clientRtcUid from form:', clientRtcUid, 'this.uid from join:', this.uid);
        
        if (!clientRtcUid && this.uid !== undefined && this.uid !== null) {
            clientRtcUid = this.uid.toString();
            console.log('🔵 RTM: No Client UID in form field, using UID from join request:', clientRtcUid);
        } else if (!clientRtcUid) {
            console.warn('🔵 RTM: No Client UID available from form field or join request');
            console.warn('🔵 RTM: Form field value:', document.getElementById("clientRtcUid")?.value);
            console.warn('🔵 RTM: Stored UID value:', this.uid);
            return false;
        }
        
        console.log('🔵 RTM: Channel info - channelName:', channelName, 'clientRtcUid:', clientRtcUid, 'agentId:', agentId);
        
        if (!channelName) {
            console.warn('🔵 RTM: Missing channel name for RTM initialization');
            return false;
        }

        try {
            // Initialize Conversational AI for RTM mode
            await this.initializeConversationalAI(
                this.appId,
                channelName,
                clientRtcToken || null,
                clientRtcUid,
                agentId
            );
            console.log('🔵 RTM: Successfully initialized RTM for existing channel');
            return true;
        } catch (error) {
            console.error('🔵 RTM: Failed to initialize RTM for existing channel:', error);
            return false;
        }
    }
} 
