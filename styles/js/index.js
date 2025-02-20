function playClickSound() {
    if (localStorage.getItem('isMuted') !== 'true') {
        const clickSound = new Audio('assets/sounds/click.mp3');
        clickSound.play();
    }
}

document.addEventListener('DOMContentLoaded', function() {
     // Check if we're returning from a game
     const urlParams = new URLSearchParams(window.location.search);
     if (urlParams.get('screen') === 'selection') {
         document.getElementById('start-screen').classList.add('hidden');
         document.getElementById('game-selection').classList.remove('hidden');
         // Clean up the URL
         history.replaceState(null, '', 'index.html');
     }
     
     // Welcome to Hub transition
     document.getElementById('enter-hub-button').addEventListener('click', function() {
        playClickSound();
        document.getElementById('start-screen').classList.add('hidden');  // Changed from welcome-screen to start-screen
        document.getElementById('game-selection').classList.remove('hidden');
    });

    document.querySelectorAll('.play-now').forEach(button => { //PROBLEM!
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent immediate redirect
            playClickSound();
            setTimeout(() => {
                window.location.href = 'flags.html';
            }, 100); // Small delay to ensure sound plays
        });
    });
    
   // Game selection handlers
   const gameCards = document.querySelectorAll('.game-card');
   gameCards.forEach(card => {
       card.addEventListener('click', function() {
        playClickSound();
           const game = this.dataset.game;
           if (game === 'class-guess') {
               window.location.href = 'class-guess.html';
           } else if (game !== 'coming-soon') {
               document.getElementById('game-selection').classList.add('hidden');
               document.getElementById(`${game}-intro`).classList.remove('hidden');
           }
       });
   });

    // Back button handlers
    const backButtons = document.querySelectorAll('.back-button');
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            playClickSound();
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            // Show game selection
            document.getElementById('game-selection').classList.remove('hidden');
        });
    });
});
