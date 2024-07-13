const seedLetterInput = document.getElementById('seed-letter');
const startGameButton = document.getElementById('start-game');
const gameContainer = document.getElementById('game-container');
const wordInput = document.getElementById('word-input');
const submitButton = document.getElementById('submit-word');
const messageElement = document.getElementById('message');
const wordListElement = document.getElementById('word-list');
const statsElement = document.getElementById('stats');
const historyContainer = document.getElementById('history-container');
const timerElement = document.getElementById('timer');
const timerToggle = document.getElementById('timer-toggle');
const timerContainer = document.getElementById('timer-container');

let seedLetter = '';
let words = [];
let wordsUntilReward = 5;
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
  timerElement.style.color = timerEnabled ? 'green' : 'gray';
});

function startGame() {
    seedLetter = seedLetterInput.value.toLowerCase();
    timerEnabled = timerToggle.checked;
    if (seedLetter.length !== 1 || !seedLetter.match(/[a-z]/i)) {
        alert('Please enter a single letter.');
        return;
    }
    words = [];
    wordsUntilReward = 5;
    updateWordList();
    updateStats();
    if (timerEnabled) {
      timeLeft = 60;
      startTimer();
      timerElement.style.color = 'green';
  } else {
      timerElement.style.color = 'gray';
  }
    gameContainer.style.display = 'block';
    wordInput.value = '';
    wordInput.disabled = false;
    submitButton.disabled = false;
    wordInput.focus();
    showMessage(`Game started! Enter words starting with "${seedLetter.toUpperCase()}"`, 'success');
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
    showMessage('Time is up! Game over.', 'error');
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
    showMessage('Word accepted!', 'success');
    wordInput.value = '';
    checkReward();
}

function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.className = type;
}

function updateWordList() {
    wordListElement.innerHTML = `<h3>Words (${words.length}):</h3>` + words.join(', ');
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

    statsElement.innerHTML = `
      <h3>Stats for "${seedLetter.toUpperCase()}":</h3>
      <p>Current Score: ${stats[seedLetter].currentScore}</p>
      <p>High Score: ${stats[seedLetter].highScore}</p>
    `;
    
    updateHistory();
}

function checkReward() {
    if (words.length % wordsUntilReward === 0) {
        confetti({
            particleCount: 200,
            spread: 360,
            origin: { y: 0.6 },
            shapes: ['star']
        });
        playRewardSound();
        wordsUntilReward = Math.floor(Math.random() * 6) + 5;  // 5-10 words
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
  