document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const popupMenu = document.querySelector('.popup-menu');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const soundToggle = document.getElementById('sound-toggle');

    function playClickSound() {
        if (localStorage.getItem('isMuted') !== 'true') {
            const clickSound = new Audio('assets/sounds/click.mp3');
            clickSound.play();
        }
    }

    // Initialize toggles based on localStorage
    darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
    soundToggle.checked = localStorage.getItem('isMuted') !== 'true';

    // Apply initial dark mode if needed
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
    }

    // Menu toggle
    menuToggle.addEventListener('click', () => {
        playClickSound();
        popupMenu.classList.remove('hidden');
    });

    closeMenu.addEventListener('click', () => {
        playClickSound();
        popupMenu.classList.add('hidden');
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('change', () => {
        playClickSound();
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', darkModeToggle.checked);
    });

    // Sound toggle
   // Sound toggle with click sound
   soundToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        const sound = new Audio('assets/sounds/click.mp3');
        sound.play();
    }
    localStorage.setItem('isMuted', !soundToggle.checked);
});
});

