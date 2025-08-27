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

    async joinChannel(appId, channelName, token, uid, subtitleManager = null, agentId = null) {
        this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        this.subtitleManager = subtitleManager;

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

        await this.client.join(appId, channelName, token, uid);
        
        // Create and publish audio track
        if (!this.localTracks.audioTrack) {
            const micId = localStorage.getItem('selectedMicrophoneId');
            const audioConfig = {
                encoderConfig: "music_standard"
            };
            
            // Only add microphoneId if it's actually set and not empty
            if (micId && micId.trim() !== '') {
                audioConfig.microphoneId = micId;
            }
            
            try {
                this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack(audioConfig);
            } catch (error) {
                console.error('Failed to create audio track with selected device:', error);
                
                // Fallback: try without specifying microphoneId
                try {
                    this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                        encoderConfig: "music_standard"
                    });
                } catch (fallbackError) {
                    console.error('Failed to create audio track with fallback:', fallbackError);
                    throw fallbackError;
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
            // Get the agent UID from the agent ID or use a default
            const agentUid = agentId || '8888'; // Default agent UID
            
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
} 
