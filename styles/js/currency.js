class CurrencyGame {
    constructor() {
        this.gameMode = null;
        this.gameType = null;
        this.rounds = 10;
        this.timeLimit = 300;
        this.score = 0;
        this.currentRound = 0;
        this.currencies = [];
        this.timer = null;
        this.currentCurrency = null;

        // Show menu toggle during setup
    document.querySelector('.menu-icon').classList.add('active');
    document.getElementById('menu-toggle').classList.remove('hidden');
        
        this.initializeGame();
    }

    async initializeGame() {
        this.setupEventListeners();
        
        // Define image extensions for each currency
        const currencyImageFormats = {
            USD: 'png',
            EUR: 'png',
            GBP: 'jpg',
            JPY: 'png',
            CHF: 'png',
            CAD: 'png',
            AUD: 'webp',
            CNY: 'jpg'
        };
    
        // Create the currencies array with correct image paths
        this.currencies = [
            { name: "US Dollar", symbol: "USD" },
            { name: "Euro", symbol: "EUR" },
            { name: "British Pound", symbol: "GBP" },
            { name: "Japanese Yen", symbol: "JPY" },
            { name: "Swiss Franc", symbol: "CHF" },
            { name: "Canadian Dollar", symbol: "CAD" },
            { name: "Australian Dollar", symbol: "AUD" },
            { name: "Chinese Yuan", symbol: "CNY" }
        ].map(currency => ({
            ...currency,
            image: `assets/currencies/${currency.symbol.toLowerCase()}.${currencyImageFormats[currency.symbol]}`
        }));
    
        this.currentCurrency = this.currencies[0];
    }    

    updatePreview() {
        const previewContainer = document.querySelector('.preview-container');
        const previewContent = previewContainer.querySelector('.preview-content');
        
        if (this.gameMode) {
            previewContent.classList.add('fade-out');
            
            setTimeout(() => {
                previewContainer.classList.add('active');
                
                // Get sample currencies for preview
                const sampleCurrencies = this.currencies
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 4);
                
                let previewHTML = `
                    <div class="preview-currency">
                        <img src="/assets/currencies/placeholder.png" alt="Sample Currency">
                    </div>
                `;
                
                if (this.gameMode === 'easy') {
                    previewHTML += `
                        <div class="options-grid">
                            ${sampleCurrencies.map(currency => `
                                <button class="option-btn">${currency.name}</button>
                            `).join('')}
                        </div>
                    `;
                } else {
                    previewHTML += `
                        <div class="fill-blank">
                            <input type="text" placeholder="Enter currency name" disabled>
                            <button disabled>Submit</button>
                        </div>
                    `;
                }
                
                previewContent.innerHTML = previewHTML;
                previewContent.classList.remove('fade-out');
                previewContent.classList.add('fade-in');
                
                setTimeout(() => {
                    previewContent.classList.remove('fade-in');
                }, 300);
                
            }, 300);
            
        } else {
            previewContainer.classList.remove('active');
        }
    }

    loadCurrencyImage() {
        const imageContainer = document.getElementById('currency-image');
        imageContainer.src = this.currentCurrency.image;
        imageContainer.alt = this.currentCurrency.name;
        
        // Ensure the image is loaded before displaying
        imageContainer.onload = () => {
            imageContainer.style.display = 'block';
        };
    }    

    setupEventListeners() {
        // Same event listener setup as FlagGame
        // Just replace 'flag' with 'currency' in element IDs
        const playButton = document.querySelector('#game-setup .play-button');
        playButton.classList.add('inactive');

        document.querySelectorAll('.hub-return').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (this.gameType === 'infinite' && this.currentRound > 0) {
                    // For infinite mode, show results before redirecting
                    this.endGame();
                } else {
                    // For other modes or when game hasn't started
                    this.playSoundEffect('click');
                    if (this.timer) {
                        clearInterval(this.timer);
                    }
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
            const answer = document.getElementById('currency-input').value;
            this.checkAnswer(answer);
        });

        document.getElementById('next-currency').addEventListener('click', () => {
            this.playSoundEffect('click');
            this.loadNextCurrency();
        });

        document.getElementById('play-again').addEventListener('click', () => {
            this.playSoundEffect('click');
            this.resetGame();
        });

        // Menu Controls
        this.setupMenuControls();
    }

    loadMultipleChoice() {
        const optionsContainer = document.querySelector('#multiple-choice .options-grid');
        optionsContainer.innerHTML = '';
        
        const options = [this.currentCurrency];
        const availableCurrencies = [...this.currencies];
        
        // Remove current currency from available options
        const currentIndex = availableCurrencies.findIndex(c => c.symbol === this.currentCurrency.symbol);
        if (currentIndex > -1) {
            availableCurrencies.splice(currentIndex, 1);
        }
        
        while (options.length < 4) {
            const randomIndex = Math.floor(Math.random() * availableCurrencies.length);
            options.push(availableCurrencies[randomIndex]);
            availableCurrencies.splice(randomIndex, 1);
        }
        
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
        
        shuffledOptions.forEach(currency => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = currency.name;
            // Remove the click sound effect from here
            button.addEventListener('click', () => {
                this.checkAnswer(currency.name);
            }, { once: true }); // Add once:true to prevent multiple clicks
            optionsContainer.appendChild(button);
        });
    }    
    

    setupMenuControls() {
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('popup-menu').classList.remove('hidden');
            this.playSoundEffect('click');
        });

        document.getElementById('close-menu').addEventListener('click', () => {
            document.getElementById('popup-menu').classList.add('hidden');
            this.playSoundEffect('click');
        });

        // Settings Controls
        this.initializeSettings();
    }

    initializeSettings() {
        // Initialize dark mode
        const darkMode = localStorage.getItem('darkMode') === 'true';
        document.getElementById('dark-mode-toggle').checked = darkMode;
        document.body.classList.toggle('dark-mode', darkMode);

        // Initialize sound settings
        this.isMuted = localStorage.getItem('isMuted') === 'true';
        document.getElementById('sound-toggle').checked = !this.isMuted;

        // Add event listeners for settings changes
        this.setupSettingsListeners();
    }

    setupSettingsListeners() {
        document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
            this.playSoundEffect('click');
            document.body.classList.toggle('dark-mode', e.target.checked);
            localStorage.setItem('darkMode', e.target.checked);
        });

        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                const tempMuted = this.isMuted;
                this.isMuted = false;
                this.playSoundEffect('click');
                this.isMuted = tempMuted;
            }
            this.isMuted = !e.target.checked;
            localStorage.setItem('isMuted', this.isMuted);
        });
    }

    // Game logic methods similar to FlagGame but adapted for currencies
    loadNextCurrency() {
        // First select the new random currency
        const randomIndex = Math.floor(Math.random() * this.currencies.length);
        this.currentCurrency = this.currencies[randomIndex];
        
        // Then update the image to match the current currency
        const currencyImage = document.getElementById('currency-image');
        currencyImage.src = this.currentCurrency.image;
        
        // Reset UI elements
        document.getElementById('next-currency').classList.add('hidden');
        const currencyInput = document.getElementById('currency-input');
        currencyInput.value = '';
        currencyInput.style.borderColor = '';
        currencyInput.style.boxShadow = '';
    
        if (this.gameMode === 'hard') {
            document.getElementById('submit-answer').classList.remove('hidden');
        }
    
        if (this.gameMode === 'easy') {
            this.loadMultipleChoice();
        }
    
        // Update round counter
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
        const isCorrect = answer.toLowerCase().trim() === this.currentCurrency.name.toLowerCase();

        // Always show next button regardless of correct/incorrect
        document.getElementById('next-currency').classList.remove('hidden');
        document.getElementById('submit-answer').classList.add('hidden');
    
        if (isCorrect) {
            this.playSoundEffect('correct');
            this.score++;
            document.getElementById('score').querySelector('span').textContent = this.score;
        } else {
            this.playSoundEffect('incorrect');
        }
    
    
        if (this.gameMode === 'easy') {
            // Handle multiple choice feedback
            const buttons = document.querySelectorAll('.option-btn');
            buttons.forEach(button => {
                if (button.textContent === this.currentCurrency.name) {
                    button.classList.add('correct');
                } else if (button.textContent === answer && !isCorrect) {
                    button.classList.add('incorrect');
                }
            });
        } else {
            // Handle text input feedback
            const inputBox = document.getElementById('currency-input');
            if (isCorrect) {
                inputBox.style.borderColor = '#4CAF50';
                inputBox.style.boxShadow = '0 0 5px #4CAF50';
            } else {
                inputBox.style.borderColor = '#f44336';
                inputBox.style.boxShadow = '0 0 5px #f44336';
                inputBox.value = this.currentCurrency.name;
            }
        }
    
        // Show next button and handle game end
        const nextButton = document.getElementById('next-currency');
        nextButton.classList.remove('hidden');
        document.getElementById('submit-answer').classList.add('hidden');
    
        if (this.gameType === 'rounds' && this.currentRound === this.rounds) {
            nextButton.textContent = 'Round Over in 3';
            nextButton.disabled = true;
            let count = 3;
            const countdown = setInterval(() => {
                count--;
                if (count > 0) {
                    nextButton.textContent = `Round Over in ${count}`;
                } else {
                    clearInterval(countdown);
                    this.endGame();
                }
            }, 1000);
        } else {
            nextButton.textContent = 'Next Currency';
            nextButton.disabled = false;
        }
    }    
    
    startGame() {
        // Validate selections
        if (!this.gameMode || !this.gameType) {
            showError('Please select both a Game Mode and Game Type');
            return;
        }
    
        // Reset game state
        this.currentRound = 0;
        this.score = 0;
    
        // Show menu icon
        document.querySelector('.menu-icon').classList.add('active');
        document.getElementById('menu-toggle').classList.remove('hidden');
    
        // Update hub button text for infinite mode
        const hubButton = document.querySelector('#popup-menu .hub-return');
        hubButton.textContent = this.gameType === 'infinite' ? 'Quit Game' : 'Back to Hub';
    
        // Setup rounds/timer if needed
        if (this.gameType === 'rounds') {
            this.rounds = parseInt(document.getElementById('round-count').value);
            document.getElementById('round-counter').classList.remove('hidden');
            document.getElementById('round-counter').querySelector('span').textContent = '0/' + this.rounds;
        } else if (this.gameType === 'infinite') {
            document.getElementById('round-counter').classList.remove('hidden');
            document.getElementById('round-counter').querySelector('span').textContent = '0/∞';
        } else if (this.gameType === 'timed') {
            this.timeLimit = parseInt(document.getElementById('time-limit').value) * 60;
            document.getElementById('timer').classList.remove('hidden');
            document.getElementById('round-counter').classList.remove('hidden');
            document.getElementById('round-counter').querySelector('span').textContent = '0/∞';
            this.startTimer();
        }
    
        // Update display
        document.getElementById('score').innerHTML = 'Score: <span>0</span>';
        document.getElementById('game-setup').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
    
        // Setup game mode specific elements
        if (this.gameMode === 'easy') {
            document.getElementById('multiple-choice').classList.remove('hidden');
            document.getElementById('fill-blank').classList.add('hidden');
        } else {
            document.getElementById('multiple-choice').classList.add('hidden');
            document.getElementById('fill-blank').classList.remove('hidden');
            document.getElementById('submit-answer').classList.remove('hidden');
        }
    
        // Hide next button initially
        document.getElementById('next-currency').classList.add('hidden');
    
        // Load first currency
        this.loadNextCurrency();
    }    
    
    endGame() {
        this.playSoundEffect('gameOver');
        document.querySelector('.menu-icon').classList.remove('active');
    
        if (this.timer) {
            clearInterval(this.timer);
        }
    
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('popup-menu').classList.add('hidden');
        document.getElementById('results-screen').classList.remove('hidden');
        
        // Update final scores
        const finalScore = document.querySelector('.final-score');
        finalScore.querySelector('h3 span').textContent = this.score;
        finalScore.querySelectorAll('p span')[0].textContent = this.score;
        finalScore.querySelectorAll('p span')[1].textContent = this.currentRound;
        
        // Calculate and display accuracy percentage
        const accuracy = this.currentRound > 0 ? Math.round((this.score / this.currentRound) * 100) : 0;
        finalScore.querySelectorAll('p span')[2].textContent = `${accuracy}%`;

        document.querySelector('#results-screen .hub-return').addEventListener('click', () => {
            this.playSoundEffect('click');
            window.location.href = 'index.html?screen=selection';
        });
    }
    
    
    resetGame() {
        // Reset game state
        this.currentRound = 0;
        this.score = 0;
        
        // Clear any existing timers
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Hide results screen and show game setup
        document.getElementById('results-screen').classList.add('hidden');
        document.getElementById('game-setup').classList.remove('hidden');
        
        // Reset timer and round counter displays
        document.getElementById('timer').classList.add('hidden');
        document.getElementById('round-counter').classList.add('hidden');
        
        // Reset hub button text
        document.querySelector('#popup-menu .hub-return').textContent = 'Back to Hub';
        
        // Reset game mode selections
        this.gameMode = null;
        this.gameType = null;
        document.querySelectorAll('.mode-select, .type-select').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Reset play button state
        this.updatePlayButtonState();
    }    
    
    startTimer() {
        let timeLeft = this.timeLimit;
        document.getElementById('timer').textContent = timeLeft;
        
        this.timer = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    

    // Helper methods
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
        
        // Show/hide relevant setup sections
        document.getElementById('rounds-setup').classList.toggle('hidden', type !== 'rounds');
        document.getElementById('timer-setup').classList.toggle('hidden', type !== 'timed');
    }
    
    updatePlayButtonState() {
        const playButton = document.querySelector('#game-setup .play-button');
        playButton.classList.toggle('inactive', !(this.gameMode && this.gameType));
    }
    
}



// Move showError function outside the class
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    new CurrencyGame();
});

