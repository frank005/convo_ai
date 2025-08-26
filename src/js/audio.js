// Media Processing Module
window.MediaProcessor = class MediaProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.localTracks = { audioTrack: null, videoTrack: null };
        this.client = null;
        this.animationFrameId = null;
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
            this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                encoderConfig: "music_standard"
            });
        }
        await this.client.publish(this.localTracks.audioTrack);

        // Create and publish video track if image input is enabled
        const imageInputEnabled = document.getElementById("inputImage").checked;
        if (imageInputEnabled && !this.localTracks.videoTrack) {
            this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
            await this.client.publish(this.localTracks.videoTrack);
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
} 
