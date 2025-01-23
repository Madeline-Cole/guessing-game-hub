class FlagGame {
    constructor() {
        this.gameMode = 'easy';
        this.gameType = 'infinite';
        this.rounds = 10;
        this.timeLimit = 300;
        this.score = 0;
        this.currentRound = 0;
        this.flags = [];
        this.timer = null;
        this.currentFlag = null;
        
        this.initializeGame();
    }

    async initializeGame() {
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
        // Hub Navigation
        // Update hub navigation to show stats for infinite mode
    document.querySelectorAll('.hub-return').forEach(button => {
        button.addEventListener('click', (e) => {
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
            button.addEventListener('click', () => this.setGameMode(button.dataset.mode));
        });
    
        document.querySelectorAll('.type-select').forEach(button => {
            button.addEventListener('click', () => this.setGameType(button.dataset.type));
        });
    
        // Game Control Buttons
        document.querySelector('#game-setup .play-button').addEventListener('click', () => this.startGame());
        document.getElementById('submit-answer').addEventListener('click', () => {
            const answer = document.getElementById('country-input').value;
            this.checkAnswer(answer);
        });
        document.getElementById('next-flag').addEventListener('click', () => this.loadNextFlag());
        document.getElementById('play-again').addEventListener('click', () => this.resetGame());
    
        // Menu Controls
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('popup-menu').classList.remove('hidden');
        });
        document.getElementById('close-menu').addEventListener('click', () => {
            document.getElementById('popup-menu').classList.add('hidden');
        });
    
        // Settings Controls
        document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
            document.body.classList.toggle('dark-mode', e.target.checked);
            localStorage.setItem('darkMode', e.target.checked);
        });
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
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

    setGameMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('.mode-select').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    }

    setGameType(type) {
        this.gameType = type;
        document.querySelectorAll('.type-select').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        document.getElementById('rounds-setup').classList.toggle('hidden', type !== 'rounds');
        document.getElementById('timer-setup').classList.toggle('hidden', type !== 'timed');
    }

    startGame() {
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
        if (this.gameType === 'timed') {
            this.timeLimit = parseInt(document.getElementById('time-limit').value) * 60;
            const timerDisplay = document.getElementById('timer');
            timerDisplay.classList.remove('hidden');
            // Set initial display before starting the countdown
            const minutes = Math.floor(this.timeLimit / 60);
            const seconds = this.timeLimit % 60;
            timerDisplay.querySelector('span').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.startTimer();
        }
    
        document.getElementById('score').querySelector('span').textContent = '0';
        document.getElementById('game-setup').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        document.getElementById('next-flag').classList.add('hidden');
        document.getElementById('submit-answer').classList.add('hidden');
    
        const multipleChoice = document.getElementById('multiple-choice');
        const fillBlank = document.getElementById('fill-blank');
        const countryInput = document.getElementById('country-input');
    
        if (this.gameMode === 'easy') {
            multipleChoice.classList.remove('hidden');
            fillBlank.classList.add('hidden');
            countryInput.classList.add('hidden');
        } else {
            multipleChoice.classList.add('hidden');
            fillBlank.classList.remove('hidden');
            countryInput.classList.remove('hidden');
            document.getElementById('submit-answer').classList.remove('hidden');
        }
    
        this.loadNextFlag();
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
        } else if (this.gameType === 'infinite') {
            this.currentRound++;
            document.getElementById('round-counter').querySelector('span').textContent = 
                `${this.currentRound}/∞`;
        }
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
        const optionsContainer = document.querySelector('.options-grid');
        optionsContainer.innerHTML = '';
        
        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option.name;
            button.addEventListener('click', () => this.checkAnswer(option.name));
            optionsContainer.appendChild(button);
        });
    }

    checkAnswer(answer) {
        const isCorrect = answer.toLowerCase() === this.currentFlag.name.toLowerCase();

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

document.addEventListener('DOMContentLoaded', () => {
    new FlagGame();
});
