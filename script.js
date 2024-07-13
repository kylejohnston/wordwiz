// script.js

document.addEventListener('DOMContentLoaded', () => {
    const letterElement = document.getElementById('letter');
    const letterInput = document.getElementById('letter-input');
    const wordInput = document.getElementById('word-input');
    const submitButton = document.getElementById('submit-button');
    const wordList = document.getElementById('word-list');
    const rewardContainer = document.getElementById('reward-container');
  
    let currentLetter = letterInput.value || 'A'; // Get the initial value from the text field or default to 'A'
    let words = [];
    let nextRewardThreshold = 3;
  
    const updateLetter = () => {
      currentLetter = letterInput.value.toUpperCase();
      letterElement.textContent = currentLetter;
    };
  
    const showReward = () => {
      // Use canvas-confetti for a better visual effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
  
      // Play upbeat sound
      let audio = new Audio('upbeat-sound.mp3'); // Make sure to have this audio file
      audio.play();
    };
  
    const checkReward = () => {
      if (words.length >= nextRewardThreshold) {
        showReward();
        nextRewardThreshold += Math.floor(Math.random() * 11) + 5; // Next reward between 5 and 15 words
      }
    };
  
    const addWord = (word) => {
      if (word.startsWith(currentLetter.toLowerCase()) || word.startsWith(currentLetter.toUpperCase())) {
        words.push(word);
        const listItem = document.createElement('li');
        listItem.textContent = word;
        wordList.appendChild(listItem);
        wordInput.value = '';
        checkReward();
      }
    };
  
    submitButton.addEventListener('click', () => {
      const word = wordInput.value.trim();
      if (word) {
        addWord(word);
      }
    });
  
    wordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const word = wordInput.value.trim();
        if (word) {
          addWord(word);
        }
      }
    });
  
    letterInput.addEventListener('input', updateLetter);
  
    updateLetter();
  });
  