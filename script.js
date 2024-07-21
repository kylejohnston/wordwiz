const seedLetterInput = document.getElementById('seed-letter');
const startGameButton = document.getElementById('start-game');
const gameContainer = document.getElementById('game-container');
const wordInput = document.getElementById('word-input');
const submitButton = document.getElementById('submit-word');
const messageElement = document.getElementById('message');
const wordListElement = document.getElementById('word-list');
const historyContainer = document.getElementById('history-container');
const timerElement = document.getElementById('timer');
const timerToggle = document.getElementById('timer-toggle');
const timerContainer = document.getElementById('timer-container');

let seedLetter = '';
let words = [];
let wordsUntilReward = [5, 7, 9][Math.floor(Math.random() * 3)];
let stats = JSON.parse(localStorage.getItem('wordGameStats')) || {};
let timer;
let timeLeft = 60;
let timerEnabled = false;

startGameButton.addEventListener('click', startGame);
submitButton.addEventListener('click', submitWord);
wordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') submitWord();
});

timerToggle.addEventListener('change', function() {
    timerEnabled = timerToggle.checked;
    timerElement.style.display = timerEnabled ? 'flex' : 'none';
});

seedLetterInput.addEventListener('input', function() {
    const isDisabled = seedLetterInput.value.length !== 1 || !seedLetterInput.value.match(/[a-z]/i);
    startGameButton.disabled = isDisabled;
    startGameButton.classList.toggle('disabled', isDisabled);
});

document.addEventListener('DOMContentLoaded', function() {
    seedLetterInput.focus();

    timerToggle.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' || event.key === 'Return') {
            timerToggle.checked = !timerToggle.checked; // Toggle the checkbox
            timerToggle.dispatchEvent(new Event('change')); // Trigger the change event
        }
    });
});

function startGame() {
    seedLetter = seedLetterInput.value.toLowerCase();
    timerEnabled = timerToggle.checked;
    if (seedLetter.length !== 1 || !seedLetter.match(/[a-z]/i)) {
        alert('Please enter a single letter.');
        return;
    }
    words = [];
    
    // Set wordsUntilReward to a random value from [5, 7, 9]
    wordsUntilReward = [5, 7, 9][Math.floor(Math.random() * 3)];

    updateWordList();
    updateStats();
    if (timerEnabled) {
        timeLeft = 60;
        startTimer();
        timerElement.style.color = '#8800FF';
    } else {
        timerElement.style.color = 'gray';
    }
    gameContainer.style.display = 'flex';
    wordInput.value = '';
    wordInput.disabled = false;
    submitButton.disabled = false;
    wordInput.focus();
    
    // Initialize the initial message
    initialMessage = `Add words starting with "${seedLetter.toUpperCase()}"`;
    showMessage(initialMessage, 'success');
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function endGame() {
    clearInterval(timer);
    wordInput.disabled = true;
    submitButton.disabled = true;

    // Play 'goodjob.mp3' sound
    const audio = new Audio('goodjob.mp3');
    audio.play().catch(error => console.error('Error playing audio:', error));

    // Show confetti
    confetti({
        particleCount: 200,
        spread: 360,
        origin: { y: 0.6 },
        shapes: ['star']
    });

    // Show the final message
    messageElement.textContent = 'Game over!';
    messageElement.className = 'game-over'; // Use a specific class for game over
}

function submitWord() {
    if (timerEnabled && timeLeft <= 0) {
        showMessage('Time is up! Start a new game to continue.', 'error');
        return;
    }

    const word = wordInput.value.toLowerCase().trim();
    if (word.length === 0) {
        showMessage('Please enter a word.', 'error');
        return;
    }
    if (word[0] !== seedLetter) {
        showMessage(`The word must start with the letter "${seedLetter}".`, 'error');
        return;
    }
    if (words.includes(word)) {
        showMessage('You already guessed that word.', 'error');
        return;
    }
    
    words.push(word);
    updateWordList();
    updateStats();
    // Reset the message to the initial state when a new word is entered
    messageElement.textContent = `Add words starting with "${seedLetter.toUpperCase()}"`;
    messageElement.className = 'success';
    wordInput.value = '';
    checkReward();
}

let initialMessage = '';

function showMessage(text, type, keepInitialText = false) {
    if (type === 'success' && !initialMessage) {
        initialMessage = messageElement.textContent; // Save the initial message
    }

    messageElement.textContent = text;
    messageElement.className = type;

    if (keepInitialText) {
        setTimeout(() => {
            messageElement.textContent = initialMessage || `Add words starting with "${seedLetter.toUpperCase()}"`;
            messageElement.className = 'success';
        }, 1000); // delay before restoring the initial message
    }
}

function updateWordList() {
    wordListElement.innerHTML = `<h3>Current score: ${words.length}</h3><p>` + words.join(', ') + `</p>`;
}

function updateStats() {
    if (!stats[seedLetter]) {
        stats[seedLetter] = { highScore: 0, currentScore: 0 };
    }
    stats[seedLetter].currentScore = words.length;
    if (words.length > stats[seedLetter].highScore) {
        stats[seedLetter].highScore = words.length;
    }
    localStorage.setItem('wordGameStats', JSON.stringify(stats));
    
    updateHistory();
}

function checkReward() {
    if (words.length % wordsUntilReward === 0 && words.length !== 0) {
        confetti({
            particleCount: 200,
            spread: 360,
            origin: { y: 0.6 },
            shapes: ['star']
        });
        playRewardSound();
        
        // Set a new random value for wordsUntilReward after rewarding
        wordsUntilReward = [5, 7, 9][Math.floor(Math.random() * 3)];
    }
}


function playRewardSound() {
    const audio = new Audio('reward-sound.mp3');
    audio.play().catch(error => console.error('Error playing audio:', error));
}

function updateHistory() {
    historyContainer.innerHTML = '';
    Object.entries(stats).sort((a, b) => b[1].highScore - a[1].highScore).forEach(([letter, data]) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-letter">${letter.toUpperCase()}</div>
            <div class="history-score">High: ${data.highScore}</div>
        `;
        historyContainer.appendChild(historyItem);
    });
}

// Initialize history on page load
updateHistory();
seedLetterInput.focus();
