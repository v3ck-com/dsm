class StandupTimer {
    constructor() {
        this.config = null;
        this.currentIndex = 0;
        this.timeRemaining = 0;
        this.isPaused = false;
        this.isRunning = false;
        this.intervalId = null;
        this.completedParticipants = new Set(); // Track completed participants by reference
        this.history = []; // Track history of speakers with their remaining time
        
        this.initializeElements();
        this.initializeTheme();
        this.attachEventListeners();
        this.loadDefaultConfig();
    }

    initializeElements() {
        this.elements = {
            themeToggle: document.getElementById('themeToggle'),
            editConfigBtn: document.getElementById('editConfigBtn'),
            configDialog: document.getElementById('configDialog'),
            configEditor: document.getElementById('configEditor'),
            closeDialogBtn: document.getElementById('closeDialogBtn'),
            resetConfigBtn: document.getElementById('resetConfigBtn'),
            cancelConfigBtn: document.getElementById('cancelConfigBtn'),
            saveConfigBtn: document.getElementById('saveConfigBtn'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            backBtn: document.getElementById('backBtn'),
            add30Btn: document.getElementById('add30Btn'),
            skipBtn: document.getElementById('skipBtn'),
            currentSpeaker: document.getElementById('currentSpeaker'),
            timerDisplay: document.getElementById('timerDisplay'),
            progressFill: document.getElementById('progressFill'),
            nextName: document.getElementById('nextName'),
            participantsList: document.getElementById('participantsList'),
            currentIndex: document.getElementById('currentIndex'),
            remainingCount: document.getElementById('remainingCount'),
            totalTime: document.getElementById('totalTime')
        };
    }

    initializeTheme() {
        // Load theme from localStorage or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            this.updateThemeIcon(false);
        } else {
            this.updateThemeIcon(true);
        }
    }

    toggleTheme() {
        const isLightTheme = document.body.classList.toggle('light-theme');
        const theme = isLightTheme ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
        this.updateThemeIcon(!isLightTheme);
    }

    updateThemeIcon(isDark) {
        const icon = this.elements.themeToggle.querySelector('.theme-icon');
        icon.textContent = isDark ? '☀️' : '🌙';
    }

    attachEventListeners() {
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.editConfigBtn.addEventListener('click', () => this.openConfigEditor());
        this.elements.closeDialogBtn.addEventListener('click', () => this.closeConfigEditor());
        this.elements.cancelConfigBtn.addEventListener('click', () => this.closeConfigEditor());
        this.elements.resetConfigBtn.addEventListener('click', () => this.resetToDefaultConfig());
        this.elements.saveConfigBtn.addEventListener('click', () => this.saveConfigFromEditor());
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.backBtn.addEventListener('click', () => this.goBackToPrevious());
        this.elements.add30Btn.addEventListener('click', () => this.add30Seconds());
        this.elements.skipBtn.addEventListener('click', () => this.skipToNext());
        
        // Close dialog on Escape key
        this.elements.configDialog.addEventListener('cancel', (e) => {
            e.preventDefault();
            this.closeConfigEditor();
        });
    }

    openConfigEditor() {
        // Get current config or default
        const currentConfig = this.getCurrentConfigJSON();
        this.elements.configEditor.value = currentConfig;
        this.elements.configDialog.showModal();
    }

    closeConfigEditor() {
        this.elements.configDialog.close();
    }

    getCurrentConfigJSON() {
        if (this.config) {
            // Get the raw config from localStorage or create from current config
            const savedConfig = localStorage.getItem('lastConfig');
            if (savedConfig) {
                try {
                    // Format it nicely
                    const parsed = JSON.parse(savedConfig);
                    return JSON.stringify(parsed, null, 2);
                } catch (error) {
                    console.error('Error parsing saved config:', error);
                }
            }
        }
        
        // Default fallback
        return JSON.stringify({
            "defaultDuration": 120,
            "participants": [
                {"name": "Alice Johnson"},
                {"name": "Bob Smith", "duration": 90},
                {"name": "Charlie Davis"}
            ]
        }, null, 2);
    }

    async resetToDefaultConfig() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error('Could not load default config file');
            }
            
            const text = await response.text();
            const parsed = JSON.parse(text);
            this.elements.configEditor.value = JSON.stringify(parsed, null, 2);
        } catch (error) {
            alert('Error loading default config: ' + error.message);
        }
    }

    saveConfigFromEditor() {
        try {
            const configText = this.elements.configEditor.value;
            const parsedConfig = JSON.parse(configText);
            
            // Validate the config
            this.config = parsedConfig;
            if (!this.validateConfig()) {
                alert('Invalid configuration format. Please check your JSON and ensure it has the required fields.');
                return;
            }
            
            // Save to localStorage
            localStorage.setItem('lastConfig', configText);
            
            // Apply the config
            this.normalizeConfig();
            this.reset();
            this.updateUI();
            this.elements.startBtn.disabled = false;
            this.renderParticipantsList();
            
            // Close the dialog
            this.closeConfigEditor();
            
        } catch (error) {
            alert('Error parsing configuration: ' + error.message + '\n\nPlease check your JSON syntax.');
        }
    }

    async loadDefaultConfig() {
        // Try to load from localStorage first
        const savedConfig = localStorage.getItem('lastConfig');
        if (savedConfig) {
            try {
                this.config = JSON.parse(savedConfig);
                if (this.validateConfig()) {
                    this.normalizeConfig();
                    this.reset();
                    this.updateUI();
                    this.elements.startBtn.disabled = false;
                    this.renderParticipantsList();
                    return;
                }
            } catch (error) {
                console.error('Error loading saved config from localStorage:', error);
                localStorage.removeItem('lastConfig');
            }
        }

        // Fall back to loading config.json
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error('Could not load default config file');
            }
            
            const text = await response.text();
            this.config = JSON.parse(text);
            
            if (!this.validateConfig()) {
                this.elements.currentSpeaker.textContent = 'Invalid default config';
                console.error('Default config is invalid. Please check config.json');
                return;
            }

            // Save the default config to localStorage
            localStorage.setItem('lastConfig', text);
            
            this.normalizeConfig();
            this.reset();
            this.updateUI();
            this.elements.startBtn.disabled = false;
            this.renderParticipantsList();
        } catch (error) {
            this.elements.currentSpeaker.textContent = 'Failed to load default config';
            console.error('Error loading default config:', error.message);
        }
    }

    async loadConfig(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const rawConfig = JSON.parse(text);
            
            // Save the raw config before validation/normalization
            this.config = rawConfig;
            
            if (!this.validateConfig()) {
                alert('Invalid config format. Please check the README for proper format.');
                return;
            }

            // Save the clean config to localStorage
            localStorage.setItem('lastConfig', text);
            
            this.normalizeConfig();
            this.reset();
            this.updateUI();
            this.elements.startBtn.disabled = false;
            this.renderParticipantsList();
        } catch (error) {
            alert('Error loading config file: ' + error.message);
        }
    }

    validateConfig() {
        if (!this.config || !Array.isArray(this.config.participants)) {
            return false;
        }

        // Check if defaultDuration exists and is valid
        if (this.config.defaultDuration !== undefined) {
            if (typeof this.config.defaultDuration !== 'number' || this.config.defaultDuration <= 0) {
                return false;
            }
        }

        // Validate each participant
        return this.config.participants.every(p => {
            // Name is required
            if (!p.name || typeof p.name !== 'string') {
                return false;
            }
            
            // Duration is optional if defaultDuration exists
            if (p.duration !== undefined) {
                return typeof p.duration === 'number' && p.duration > 0;
            }
            
            // If no duration specified, defaultDuration must exist
            return this.config.defaultDuration !== undefined;
        });
    }

    normalizeConfig() {
        // Apply default duration to participants without explicit duration
        if (this.config.defaultDuration) {
            this.config.participants = this.config.participants.map(p => ({
                ...p,
                id: p.id || `${p.name}_${Math.random()}`, // Add unique ID if not present
                duration: p.duration !== undefined ? p.duration : this.config.defaultDuration
            }));
        }
        
        // Randomize the order of participants
        this.shuffleParticipants();
    }

    shuffleParticipants() {
        // Fisher-Yates shuffle algorithm
        const participants = [...this.config.participants];
        for (let i = participants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [participants[i], participants[j]] = [participants[j], participants[i]];
        }
        this.config.participants = participants;
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.resetBtn.disabled = false;
        this.elements.add30Btn.disabled = false;
        this.elements.skipBtn.disabled = false;
        this.updateBackButtonState();

        if (this.timeRemaining === 0) {
            this.timeRemaining = this.config.participants[this.currentIndex].duration;
        }

        this.updateUI();
        this.tick();
    }

    updateBackButtonState() {
        // Enable back button only if we have history
        this.elements.backBtn.disabled = this.history.length === 0 || !this.isRunning;
    }

    goBackToPrevious() {
        if (!this.isRunning || this.history.length === 0) return;
        
        // Pop the last state from history
        const previousState = this.history.pop();
        
        // Remove current speaker from completed set
        const currentParticipant = this.config.participants[this.currentIndex];
        this.completedParticipants.delete(currentParticipant.id);
        
        // Restore previous speaker
        this.currentIndex = previousState.index;
        this.timeRemaining = previousState.timeRemaining;
        
        // Remove the previous speaker from completed set (they're now current again)
        const restoredParticipant = this.config.participants[this.currentIndex];
        this.completedParticipants.delete(restoredParticipant.id);
        
        this.updateBackButtonState();
        this.updateUI();
        this.renderParticipantsList();
    }

    add30Seconds() {
        if (!this.isRunning) return;
        
        this.timeRemaining += 30;
        this.updateUI();
    }

    skipToNext() {
        if (!this.isRunning) return;
        
        this.playNotificationSound();
        this.nextParticipant();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.elements.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';

        if (this.isPaused) {
            clearInterval(this.intervalId);
        } else {
            this.tick();
        }
    }

    reset() {
        this.stop();
        this.currentIndex = 0;
        this.timeRemaining = 0;
        this.isPaused = false;
        this.completedParticipants.clear(); // Clear completed set on reset
        this.history = []; // Clear history on reset
        
        this.elements.startBtn.disabled = this.config === null;
        this.elements.pauseBtn.disabled = true;
        this.elements.resetBtn.disabled = true;
        this.elements.backBtn.disabled = true;
        this.elements.add30Btn.disabled = true;
        this.elements.skipBtn.disabled = true;
        this.elements.pauseBtn.textContent = 'Pause';

        if (this.config) {
            this.timeRemaining = this.config.participants[0].duration;
        }

        this.updateUI();
        this.renderParticipantsList();
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    tick() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            if (this.isPaused) return;

            this.timeRemaining--;
            this.updateUI();

            if (this.timeRemaining <= 0) {
                this.playNotificationSound();
                this.nextParticipant();
            }
        }, 1000);
    }

    nextParticipant() {
        // Save current state to history before moving forward
        this.history.push({
            index: this.currentIndex,
            timeRemaining: this.timeRemaining
        });
        
        // Mark current participant as completed before moving to next
        if (this.currentIndex < this.config.participants.length) {
            const completedParticipant = this.config.participants[this.currentIndex];
            this.completedParticipants.add(completedParticipant.id);
        }
        
        this.currentIndex++;

        if (this.currentIndex >= this.config.participants.length) {
            this.stop();
            this.elements.currentSpeaker.textContent = 'Stand-up Complete!';
            this.elements.timerDisplay.textContent = '00:00';
            this.elements.progressFill.style.width = '100%';
            this.elements.nextName.textContent = '-';
            this.elements.startBtn.disabled = true;
            this.elements.pauseBtn.disabled = true;
            this.elements.backBtn.disabled = false; // Allow going back even when complete
            this.renderParticipantsList();
            return;
        }

        this.timeRemaining = this.config.participants[this.currentIndex].duration;
        this.updateBackButtonState();
        this.updateUI();
    }

    updateUI() {
        if (!this.config) return;

        const currentParticipant = this.config.participants[this.currentIndex];
        
        // Update current speaker
        this.elements.currentSpeaker.textContent = currentParticipant.name;
        
        // Update timer display
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.elements.timerDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Update timer color based on time remaining
        this.elements.timerDisplay.classList.remove('warning', 'danger');
        this.elements.progressFill.classList.remove('warning', 'danger');
        
        const percentRemaining = (this.timeRemaining / currentParticipant.duration) * 100;
        
        if (percentRemaining <= 20) {
            this.elements.timerDisplay.classList.add('danger');
            this.elements.progressFill.classList.add('danger');
        } else if (percentRemaining <= 50) {
            this.elements.timerDisplay.classList.add('warning');
            this.elements.progressFill.classList.add('warning');
        }

        // Update progress bar
        const progress = ((currentParticipant.duration - this.timeRemaining) / currentParticipant.duration) * 100;
        this.elements.progressFill.style.width = `${progress}%`;

        // Update next speaker
        if (this.currentIndex + 1 < this.config.participants.length) {
            this.elements.nextName.textContent = this.config.participants[this.currentIndex + 1].name;
        } else {
            this.elements.nextName.textContent = 'None - Last speaker!';
        }

        // Update stats
        this.elements.currentIndex.textContent = `${this.currentIndex + 1} of ${this.config.participants.length}`;
        this.elements.remainingCount.textContent = this.config.participants.length - this.currentIndex - 1;
        
        const totalSeconds = this.config.participants
            .slice(this.currentIndex)
            .reduce((sum, p) => sum + p.duration, 0) - (currentParticipant.duration - this.timeRemaining);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalSecs = totalSeconds % 60;
        this.elements.totalTime.textContent = 
            `${String(totalMinutes).padStart(2, '0')}:${String(totalSecs).padStart(2, '0')}`;

        this.renderParticipantsList();
    }

    renderParticipantsList() {
        if (!this.config) return;

        this.elements.participantsList.innerHTML = '';

        this.config.participants.forEach((participant, index) => {
            const li = document.createElement('li');
            li.setAttribute('data-index', index);
            li.draggable = true;
            
            // Check if this participant is completed by ID, not by index
            if (this.completedParticipants.has(participant.id)) {
                li.classList.add('completed');
            } else if (index === this.currentIndex && this.isRunning) {
                li.classList.add('active');
            }

            // Add drag icon
            const dragIcon = document.createElement('span');
            dragIcon.classList.add('drag-handle');
            dragIcon.innerHTML = '⋮⋮';

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('participant-name');
            nameSpan.textContent = participant.name;

            const timeSpan = document.createElement('span');
            timeSpan.classList.add('participant-time');
            
            // Show current time remaining for active speaker, otherwise show original duration
            let displayTime;
            if (index === this.currentIndex && this.isRunning) {
                displayTime = this.timeRemaining;
            } else {
                displayTime = participant.duration;
            }
            
            const minutes = Math.floor(displayTime / 60);
            const seconds = displayTime % 60;
            timeSpan.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;

            li.appendChild(dragIcon);
            li.appendChild(nameSpan);
            li.appendChild(timeSpan);

            // Add drag event listeners
            li.addEventListener('dragstart', (e) => this.handleDragStart(e));
            li.addEventListener('dragover', (e) => this.handleDragOver(e));
            li.addEventListener('drop', (e) => this.handleDrop(e));
            li.addEventListener('dragend', (e) => this.handleDragEnd(e));
            li.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            li.addEventListener('dragleave', (e) => this.handleDragLeave(e));

            this.elements.participantsList.appendChild(li);
        });
    }

    handleDragStart(e) {
        this.draggedElement = e.currentTarget;
        this.draggedIndex = parseInt(e.currentTarget.getAttribute('data-index'));
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    }

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    handleDragEnter(e) {
        if (e.currentTarget !== this.draggedElement) {
            e.currentTarget.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        e.currentTarget.classList.remove('drag-over');

        if (this.draggedElement !== e.currentTarget) {
            const dropIndex = parseInt(e.currentTarget.getAttribute('data-index'));
            
            // Reorder the participants array
            const participants = [...this.config.participants];
            const [draggedItem] = participants.splice(this.draggedIndex, 1);
            participants.splice(dropIndex, 0, draggedItem);
            
            this.config.participants = participants;
            
            // Update currentIndex only if timer is running
            if (this.isRunning) {
                // Store the ID of the current speaker to track them after reorder
                const currentSpeakerId = this.config.participants[this.currentIndex]?.id;
                
                // Find the new index of the current speaker by their ID after reorder
                if (currentSpeakerId) {
                    const newIndex = this.config.participants.findIndex(p => p.id === currentSpeakerId);
                    if (newIndex !== -1) {
                        this.currentIndex = newIndex;
                    }
                }
                
                this.updateUI();
            } else {
                // Timer hasn't started, keep currentIndex at 0
                this.currentIndex = 0;
            }
            
            this.renderParticipantsList();
        }

        return false;
    }

    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
        
        // Remove drag-over class from all items
        document.querySelectorAll('.participants-list li').forEach(item => {
            item.classList.remove('drag-over');
        });
    }

    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

// Initialize the app
const app = new StandupTimer();
