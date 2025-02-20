class FlagGame {
    constructor() {
        this.gameMode = null;
        this.gameType = null;
        this.rounds = 10;
        this.timeLimit = 300;
        this.score = 0;
        this.currentRound = 0;
        this.flags = [];
        this.timer = null;
        this.currentFlag = null;
        
        this.initializeGame();
    }

    async initializeGame() { //FETCH FROM API
        try {
            const response = await fetch('https://restcountries.com/v3.1/all');
            const data = await response.json();
            this.flags = data.map(country => ({
                name: country.name.common,
                flag: country.flags.png
            }));
            this.setupEventListeners();
        } catch (error) {
            console.error('Error loading flags:', error);
        }
    }

    setupEventListeners() {
        const playButton = document.querySelector('#game-setup .play-button');
        playButton.classList.add('inactive');
        // Hub Navigation
        // Update hub navigation to show stats for infinite mode
    document.querySelectorAll('.hub-return').forEach(button => {
        button.addEventListener('click', (e) => {
            this.playSoundEffect('click');
            e.preventDefault();
            if (this.gameType === 'infinite' && this.currentRound > 0) {
                this.endGame();
            } else {
                window.location.href = 'index.html?screen=selection';
            }
        });
    });
    
        // Game Mode and Type Selection
        document.querySelectorAll('.mode-select').forEach(button => {
            button.addEventListener('click', () => {
                this.playSoundEffect('click');
                this.setGameMode(button.dataset.mode);
                this.updatePlayButtonState();
            });
        });
    
        document.querySelectorAll('.type-select').forEach(button => {
            button.addEventListener('click', () => {
                this.playSoundEffect('click');
                this.setGameType(button.dataset.type);
                this.updatePlayButtonState();
            });
        });
    
        // Game Control Buttons
        document.querySelector('#game-setup .play-button').addEventListener('click', () => this.startGame());
        document.getElementById('submit-answer').addEventListener('click', () => {
            this.playSoundEffect('click');
            const answer = document.getElementById('country-input').value;
            this.checkAnswer(answer);
        });
        
        document.getElementById('next-flag').addEventListener('click', () => {
            this.playSoundEffect('click');
            this.loadNextFlag();
        });
        
        document.getElementById('play-again').addEventListener('click', () => {
            this.playSoundEffect('click');
            this.resetGame();
        });
    
        // Menu Controls
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('popup-menu').classList.remove('hidden');
            this.playSoundEffect('click');
        });
        document.getElementById('close-menu').addEventListener('click', () => {
            document.getElementById('popup-menu').classList.add('hidden');
            this.playSoundEffect('click');
        });
    
        // Settings Controls
        document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
            this.playSoundEffect('click');
            document.body.classList.toggle('dark-mode', e.target.checked);
            localStorage.setItem('darkMode', e.target.checked);
        });
        
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            if (e.target.checked) {  // Sound is being turned ON
                // Play sound before updating muted state
                const tempMuted = this.isMuted;
                this.isMuted = false;
                this.playSoundEffect('click');
                this.isMuted = tempMuted;
            }
            
            // Update mute state
            this.isMuted = !e.target.checked;
            localStorage.setItem('isMuted', this.isMuted);
        });  
    
        // Initialize Settings from localStorage
        const darkMode = localStorage.getItem('darkMode') === 'true';
        document.getElementById('dark-mode-toggle').checked = darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
    
        this.isMuted = localStorage.getItem('isMuted') === 'true';
        document.getElementById('sound-toggle').checked = !this.isMuted;
    } 
    
    playSoundEffect(type) {
        if (this.isMuted) return;
        
        const sounds = {
            correct: new Audio('assets/sounds/correct.mp3'),
            incorrect: new Audio('assets/sounds/incorrect.mp3'),
            click: new Audio('assets/sounds/click.mp3'),
            gameOver: new Audio('assets/sounds/game-over.mp3')
        };
    
        if (sounds[type]) {
            sounds[type].play();
        }
    }
    
    updatePreview() {
        const previewContainer = document.querySelector('.preview-container');
        const previewContent = previewContainer.querySelector('.preview-content');
        
        if (this.gameMode) {
            // Add fade out class to existing content
            previewContent.classList.add('fade-out');
            
            // Wait for fade out to complete
            setTimeout(() => {
                // Show container if not already visible
                previewContainer.classList.add('active');
                
                // Get sample countries and build HTML
                const sampleCountries = this.flags
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 4);
                
                let previewHTML = `
                    <div class="preview-flag">
                        <img src="${sampleCountries[0]?.flag || ''}" alt="Sample Flag">
                    </div>
                `;
                
                if (this.gameMode === 'easy') {
                    previewHTML += `
                        <div class="options-grid">
                            ${sampleCountries.map(country => `
                                <button class="option-btn">${country.name}</button>
                            `).join('')}
                        </div>
                    `;
                } else {
                    previewHTML += `
                        <div class="fill-blank">
                            <input type="text" placeholder="Enter country name" disabled>
                            <button disabled>Submit</button>
                        </div>
                    `;
                }
                
                // Update content and trigger fade in
                previewContent.innerHTML = previewHTML;
                previewContent.classList.remove('fade-out');
                previewContent.classList.add('fade-in');
                
                // Remove animation class after it completes
                setTimeout(() => {
                    previewContent.classList.remove('fade-in');
                }, 300);
                
            }, 300); // Match transition duration
            
        } else {
            previewContainer.classList.remove('active');
        }
    }     
    
    
    setGameMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('.mode-select').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        this.updatePreview();
    }
    
    setGameType(type) {
        this.gameType = type;
        document.querySelectorAll('.type-select').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        document.getElementById('rounds-setup').classList.toggle('hidden', type !== 'rounds');
        document.getElementById('timer-setup').classList.toggle('hidden', type !== 'timed');
    }

    updatePlayButtonState() {
        const playButton = document.querySelector('#game-setup .play-button');
        const modeSelected = document.querySelector('.mode-select.active');
        const typeSelected = document.querySelector('.type-select.active');
    
        if (modeSelected && typeSelected) {
            playButton.classList.remove('inactive');
        } else {
            playButton.classList.add('inactive');
        }
    }

    startGame() {
        // Check if game mode and type are selected
    const modeSelected = document.querySelector('.mode-select.active');
    const typeSelected = document.querySelector('.type-select.active');
    
    if (!modeSelected && !typeSelected) {
        showError('Please select both a Game Mode and Game Type');
        return;
    }
    
    if (!modeSelected) {
        showError('Please select a Game Mode (Easy/Hard)');
        return;
    }
    
    if (!typeSelected) {
        showError('Please select a Game Type (Infinite/Rounds/Timed)');
        return;
    }

    // Additional validation for specific game types
    if (this.gameType === 'rounds') {
        const roundCount = parseInt(document.getElementById('round-count').value);
        if (isNaN(roundCount) || roundCount < 1 || roundCount > 100) {
            showError('Please enter a valid number of rounds (1-100)');
            return;
        }
    }

    if (this.gameType === 'timed') {
        this.timeLimit = parseInt(document.getElementById('time-limit').value) * 60;
        const timerDisplay = document.getElementById('timer');
        timerDisplay.classList.remove('hidden');
        // Initialize currentRound for timed mode
        this.currentRound = 0;
        document.getElementById('round-counter').classList.remove('hidden');
        document.getElementById('round-counter').querySelector('span').textContent = '0/∞';
        // Set initial display before starting the countdown
        const minutes = Math.floor(this.timeLimit / 60);
        const seconds = this.timeLimit % 60;
        timerDisplay.querySelector('span').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.startTimer();
    }

        document.querySelector('.menu-icon').classList.add('active');

        const hubButton = document.querySelector('#popup-menu .hub-return');
        if (this.gameType === 'infinite') {
            hubButton.textContent = 'Quit Game';
        } else {
            hubButton.textContent = 'Back to Hub';
        }
    
        this.score = 0;
        this.currentRound = 0;
        
        
        // Get custom rounds value if rounds mode is selected
        if (this.gameType === 'rounds') {
            this.rounds = parseInt(document.getElementById('round-count').value);
            document.getElementById('round-counter').classList.remove('hidden');
        } else if (this.gameType === 'infinite') {
            document.getElementById('round-counter').classList.remove('hidden');
            document.getElementById('round-counter').querySelector('span').textContent = `0/∞`;
        }
        
        // Get time limit if timed mode is selected
       // In the startGame method, add this after the timeLimit setup:

    
        document.getElementById('score').querySelector('span').textContent = '0';
        document.getElementById('game-setup').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        document.getElementById('next-flag').classList.add('hidden');
        document.getElementById('submit-answer').classList.add('hidden');
    
        const multipleChoice = document.getElementById('multiple-choice');
        const fillBlank = document.getElementById('fill-blank');
        const countryInput = document.getElementById('country-input');
    
        // Clear and show multiple choice container for easy mode
    if (this.gameMode === 'easy') {
        const multipleChoice = document.getElementById('multiple-choice');
        const fillBlank = document.getElementById('fill-blank');
        
        // Remove hidden class from multiple choice
        multipleChoice.classList.remove('hidden');
        // Hide fill in the blank
        fillBlank.classList.add('hidden');
        
        // Clear any existing options
        const optionsGrid = multipleChoice.querySelector('.options-grid');
        if (optionsGrid) {
            optionsGrid.innerHTML = '';
        }
    } else {
        // Hard mode setup
        document.getElementById('multiple-choice').classList.add('hidden');
        document.getElementById('fill-blank').classList.remove('hidden');
        document.getElementById('submit-answer').classList.remove('hidden');
    }
    
        this.loadNextFlag();
    }  
    
    loadMultipleChoice() {
        const options = [this.currentFlag];
        while (options.length < 4) {
            const randomFlag = this.flags[Math.floor(Math.random() * this.flags.length)];
            if (!options.find(opt => opt.name === randomFlag.name)) {
                options.push(randomFlag);
            }
        }
    
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
        const optionsContainer = document.querySelector('#multiple-choice .options-grid');
        
        // Clear existing options
        optionsContainer.innerHTML = '';
        
        // Add new options
        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option.name;
            button.addEventListener('click', () => this.checkAnswer(option.name));
            optionsContainer.appendChild(button);
        });
    }
    
    loadNextFlag() {
        document.getElementById('next-flag').classList.add('hidden');
        const countryInput = document.getElementById('country-input');
        countryInput.value = '';
        countryInput.style.borderColor = '';
        countryInput.style.boxShadow = '';
        
        if (this.gameMode === 'hard') {
            document.getElementById('submit-answer').classList.remove('hidden');
        }
        
        const randomIndex = Math.floor(Math.random() * this.flags.length);
        this.currentFlag = this.flags[randomIndex];
        document.getElementById('flag-image').src = this.currentFlag.flag;
    
        if (this.gameMode === 'easy') {
            this.loadMultipleChoice();
        }
    
        if (this.gameType === 'rounds') {
            this.currentRound++;
            document.getElementById('round-counter').querySelector('span').textContent = 
                `${this.currentRound}/${this.rounds}`;
        } else if (this.gameType === 'infinite' || this.gameType === 'timed') {
            this.currentRound++;
            document.getElementById('round-counter').querySelector('span').textContent = 
                `${this.currentRound}/∞`;
        }        
    }

    checkAnswer(answer) {
        const isCorrect = answer.toLowerCase() === this.currentFlag.name.toLowerCase();

        // Play appropriate sound
    this.playSoundEffect(isCorrect ? 'correct' : 'incorrect');

        if (this.gameMode === 'easy') {
            const buttons = document.querySelectorAll('.option-btn');
            buttons.forEach(button => {
                if (button.textContent === this.currentFlag.name) {
                    button.classList.add('correct');
                } else if (button.textContent === answer && !isCorrect) {
                    button.classList.add('incorrect');
                }
            });
        } else {
            const inputBox = document.getElementById('country-input');
            if (isCorrect) {
                inputBox.style.borderColor = '#4CAF50';
                inputBox.style.boxShadow = '0 0 5px #4CAF50';
            } else {
                inputBox.style.borderColor = '#f44336';
                inputBox.style.boxShadow = '0 0 5px #f44336';
                inputBox.value = this.currentFlag.name;
            }
            document.getElementById('submit-answer').classList.add('hidden');
        }
    
        if (isCorrect) {
            this.score++;
            document.getElementById('score').querySelector('span').textContent = this.score;
        }
    
        const nextFlagButton = document.getElementById('next-flag');
        nextFlagButton.classList.remove('hidden');
    
        if (this.gameType === 'rounds' && this.currentRound === this.rounds) {
            nextFlagButton.textContent = 'Round Over in 3';
            nextFlagButton.disabled = true;
    
            let count = 3;
            const countdown = setInterval(() => {
                count--;
                if (count > 0) {
                    nextFlagButton.textContent = `Round Over in ${count}`;
                } else {
                    clearInterval(countdown);
                    this.endGame();
                }
            }, 1000);
        } else {
            nextFlagButton.textContent = 'Next Flag';
            nextFlagButton.disabled = false;
        }
    }    

    startTimer() {
        let timeLeft = this.timeLimit;
        const timerDisplay = document.getElementById('timer');
    
        this.timer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.querySelector('span').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
            if (timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        this.playSoundEffect('gameOver');
        document.querySelector('.menu-icon').classList.remove('active');
    
        if (this.timer) {
            clearInterval(this.timer);
        }
    
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('popup-menu').classList.add('hidden'); // Hide popup menu
        document.getElementById('results-screen').classList.remove('hidden');
        
        const finalScore = document.querySelector('.final-score');
        finalScore.querySelector('h3 span').textContent = this.score;
        finalScore.querySelectorAll('p span')[0].textContent = this.score;
        finalScore.querySelectorAll('p span')[1].textContent = this.currentRound;
        
        // Calculate and display accuracy percentage
        const accuracy = this.currentRound > 0 ? Math.round((this.score / this.currentRound) * 100) : 0;
        finalScore.querySelectorAll('p span')[2].textContent = `${accuracy}%`;

        document.querySelector('#results-screen .hub-return').addEventListener('click', () => {
            window.location.href = 'index.html?screen=selection';
        });
    } 

    resetGame() {
        document.getElementById('results-screen').classList.add('hidden');
        document.getElementById('game-setup').classList.remove('hidden');
        document.getElementById('timer').classList.add('hidden');
        document.getElementById('round-counter').classList.add('hidden');

        document.querySelector('#popup-menu .hub-return').textContent = 'Back to Hub';
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Remove the error message after animation completes
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    new FlagGame();
});
