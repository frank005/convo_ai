// Camera Preview Manager
window.CameraPreviewManager = class CameraPreviewManager {
    constructor() {
        this.overlay = null;
        this.video = null;
        this.closeBtn = null;
        this.dragHandle = null;
        this.resizeHandle = null;
        this.reopenBtn = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeOffset = { x: 0, y: 0 };
        this.isVisible = false;
        this.hasVideoStream = false;
        
        console.log('CameraPreviewManager constructor called');
        this.init();
    }

    init() {
        this.overlay = document.getElementById('cameraPreviewOverlay');
        this.video = document.getElementById('cameraPreview');
        this.closeBtn = document.getElementById('closeCameraPreview');
        this.dragHandle = document.getElementById('cameraPreviewDragHandle');
        this.resizeHandle = document.getElementById('cameraPreviewResizeHandle');
        this.reopenBtn = document.getElementById('cameraPreviewReopenBtn');

        if (!this.overlay || !this.video || !this.closeBtn || !this.dragHandle || !this.resizeHandle || !this.reopenBtn) {
            console.error('Camera preview elements not found:', {
                overlay: !!this.overlay,
                video: !!this.video,
                closeBtn: !!this.closeBtn,
                dragHandle: !!this.dragHandle,
                resizeHandle: !!this.resizeHandle,
                reopenBtn: !!this.reopenBtn
            });
            return;
        }

        this.setupEventListeners();
        console.log('Camera preview manager elements initialized successfully');
    }

    setupEventListeners() {
        // Close button
        this.closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hide();
        });

        // Reopen button
        this.reopenBtn.addEventListener('click', () => {
            this.show();
        });

        // Drag functionality - only from the drag handle
        this.dragHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.startDragging(e);
        });

        // Resize functionality - only from the resize handle
        this.resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.startResizing(e);
        });

        // Prevent text selection on the overlay
        this.overlay.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });

        // Allow interactions through muted indicator
        this.overlay.addEventListener('mousedown', (e) => {
            // Only allow dragging if clicking on the drag handle area
            if (e.target.closest('#cameraPreviewDragHandle')) {
                return; // Let the drag handle handle it
            }
            
            // If clicking on the muted indicator in the drag area, allow dragging
            if (e.target.closest('.muted-indicator')) {
                const rect = this.overlay.getBoundingClientRect();
                if (e.clientY - rect.top < 20) {
                    e.stopPropagation();
                    this.startDragging(e);
                }
            }
        });

        // Double-click to reset size
        this.overlay.addEventListener('dblclick', (e) => {
            if (!e.target.closest('#closeCameraPreview') && !e.target.closest('#cameraPreviewResizeHandle')) {
                this.resetToDefaultSize();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e);
            } else if (this.isResizing) {
                this.resize(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.stopDragging();
            } else if (this.isResizing) {
                this.stopResizing();
            }
        });

        // Touch events for mobile
        this.dragHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startDragging(e.touches[0]);
        });

        this.resizeHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startResizing(e.touches[0]);
        });

        // Allow touch interactions through muted indicator
        this.overlay.addEventListener('touchstart', (e) => {
            if (e.target.closest('.muted-indicator')) {
                const dragHandle = this.overlay.querySelector('#cameraPreviewDragHandle');
                if (dragHandle && e.touches[0].clientY - this.overlay.getBoundingClientRect().top < 20) {
                    e.preventDefault();
                    this.startDragging(e.touches[0]);
                }
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.drag(e.touches[0]);
            } else if (this.isResizing) {
                e.preventDefault();
                this.resize(e.touches[0]);
            }
        });

        document.addEventListener('touchend', () => {
            if (this.isDragging) {
                this.stopDragging();
            } else if (this.isResizing) {
                this.stopResizing();
            }
        });
    }

    startDragging(e) {
        this.isDragging = true;
        this.overlay.classList.add('dragging');
        
        const rect = this.overlay.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
    }

    drag(e) {
        if (!this.isDragging) return;

        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;

        // Keep the overlay within viewport bounds with some padding
        const padding = 20;
        const maxX = window.innerWidth - this.overlay.offsetWidth - padding;
        const maxY = window.innerHeight - this.overlay.offsetHeight - padding;

        const clampedX = Math.max(padding, Math.min(x, maxX));
        const clampedY = Math.max(padding, Math.min(y, maxY));

        this.overlay.style.left = clampedX + 'px';
        this.overlay.style.top = clampedY + 'px';
    }

    stopDragging() {
        this.isDragging = false;
        this.overlay.classList.remove('dragging');
    }

    startResizing(e) {
        this.isResizing = true;
        this.overlay.classList.add('dragging');
        
        const rect = this.overlay.getBoundingClientRect();
        this.resizeOffset.x = e.clientX - rect.width;
        this.resizeOffset.y = e.clientY - rect.height;
    }

    resize(e) {
        if (!this.isResizing) return;

        const newWidth = e.clientX - this.resizeOffset.x;
        
        // Maintain 16:9 aspect ratio (standard for modern resolutions)
        const aspectRatio = 16 / 9;
        const newHeight = newWidth / aspectRatio;

        // Apply size constraints
        const minWidth = 160;
        const minHeight = 90; // 160 * (9/16)
        const maxWidth = 640;
        const maxHeight = 360; // 640 * (9/16)

        const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));

        this.overlay.style.width = clampedWidth + 'px';
        this.overlay.style.height = clampedHeight + 'px';
    }

    stopResizing() {
        this.isResizing = false;
        this.overlay.classList.remove('dragging');
    }

    resetToDefaultSize() {
        if (!this.overlay) return;
        
        // Reset to default 16:9 size (320x180) - double the minimum
        this.overlay.style.width = '320px';
        this.overlay.style.height = '180px';
        
        // Re-center muted indicator if visible
        if (this.overlay.querySelector('.muted-indicator')) {
            this.showMutedIndicator();
        }
    }

    show() {
        if (this.isVisible) return;
        
        this.overlay.classList.remove('hidden');
        this.reopenBtn.classList.add('hidden');
        this.isVisible = true;
        
        // Store position in localStorage for persistence
        const position = {
            left: this.overlay.style.left || 'auto',
            top: this.overlay.style.top || 'auto'
        };
        localStorage.setItem('cameraPreviewPosition', JSON.stringify(position));
    }

    hide() {
        if (!this.isVisible) return;
        
        this.overlay.classList.add('hidden');
        this.isVisible = false;
        
        // Show reopen button if we have a video stream
        if (this.hasVideoStream) {
            this.reopenBtn.classList.remove('hidden');
        }
    }

    setVideoStream(stream) {
        if (!this.video) return;

        if (stream) {
            this.video.srcObject = stream;
            this.hasVideoStream = true;
            this.show();
            console.log('Camera preview stream set:', stream);
        } else {
            this.video.srcObject = null;
            this.hasVideoStream = false;
            this.hide();
            this.reopenBtn.classList.add('hidden');
            console.log('Camera preview stream cleared');
        }
    }

    showMutedIndicator() {
        if (!this.overlay) return;
        
        // Add a muted indicator overlay
        let mutedIndicator = this.overlay.querySelector('.muted-indicator');
        if (!mutedIndicator) {
            mutedIndicator = document.createElement('div');
            mutedIndicator.className = 'muted-indicator absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-5';
            mutedIndicator.innerHTML = `
                <div class="text-center">
                    <svg class="w-8 h-8 mx-auto mb-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                        <path d="M3.707 2.293L16.293 17.707" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
                    </svg>
                    <div class="text-white text-sm font-semibold">Camera Muted</div>
                </div>
            `;
            this.overlay.querySelector('.relative').appendChild(mutedIndicator);
        }
        
        // Force re-center the muted indicator
        mutedIndicator.style.display = 'flex';
        mutedIndicator.style.position = 'absolute';
        mutedIndicator.style.top = '0';
        mutedIndicator.style.left = '0';
        mutedIndicator.style.right = '0';
        mutedIndicator.style.bottom = '0';
        mutedIndicator.style.alignItems = 'center';
        mutedIndicator.style.justifyContent = 'center';
    }

    hideMutedIndicator() {
        if (!this.overlay) return;
        
        const mutedIndicator = this.overlay.querySelector('.muted-indicator');
        if (mutedIndicator) {
            mutedIndicator.style.display = 'none';
        }
    }

    updateVisibility(hasVideoTrack, isCameraEnabled) {
        if (hasVideoTrack && isCameraEnabled) {
            // Show preview if we have a video track and camera is enabled
            this.show();
            this.hideMutedIndicator();
            console.log('Camera preview shown - video track available and camera enabled');
        } else if (hasVideoTrack && !isCameraEnabled) {
            // Show preview with muted indicator if video track exists but camera is disabled
            this.show();
            this.showMutedIndicator();
            console.log('Camera preview shown with muted indicator - video track available but camera disabled');
        } else {
            // Hide preview if no video track
            this.hide();
            this.reopenBtn.classList.add('hidden');
            console.log('Camera preview hidden - no video track available');
        }
    }

    loadSavedPosition() {
        try {
            const saved = localStorage.getItem('cameraPreviewPosition');
            if (saved) {
                const position = JSON.parse(saved);
                if (position.left !== 'auto') {
                    this.overlay.style.left = position.left;
                }
                if (position.top !== 'auto') {
                    this.overlay.style.top = position.top;
                }
            }
        } catch (error) {
            console.warn('Failed to load camera preview position:', error);
        }
    }
};
