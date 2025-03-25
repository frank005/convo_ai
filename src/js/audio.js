// Audio Processing Module
export class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.localTracks = { audioTrack: null };
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

    async joinChannel(appId, channelName, token, uid) {
        this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        
        this.client.on("user-published", async (user, mediaType) => {
            await this.client.subscribe(user, mediaType);
            if (mediaType === "audio") {
                const remoteAudioTrack = user.audioTrack;
                remoteAudioTrack.play();
                await this.setupAudioProcessing(remoteAudioTrack);
            }
        });

        await this.client.join(appId, channelName, token, uid);
        
        if (!this.localTracks.audioTrack) {
            this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                encoderConfig: "music_standard"
            });
        }
        
        await this.client.publish(this.localTracks.audioTrack);
        return true;
    }

    async leaveChannel() {
        if (!this.client) return;

        // Leave Agora Channel
        await this.client.leave();

        // Stop animations
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Reset UI effects
        const volumeRing = document.querySelector(".volume-ring");
        volumeRing.style.transform = `scale(1)`;
        volumeRing.style.boxShadow = `0px 0px 30px rgba(0, 255, 255, 0.8)`;

        const canvas = document.getElementById("audio-wave");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Close AudioContext
        if (this.audioContext) {
            await this.audioContext.close();
        }

        // Reset state
        this.client = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.localTracks.audioTrack = null;
        this.animationFrameId = null;
    }
} 