const EMOJIS = ['🐶', '🍎', '🐱', '🐘', '🍊', '🚗', '🎈', '⭐', '🍓', '🐸', '🦁', '🦖'];
const MAX_NUMBER = 10;
const MIN_NUMBER = 1;

let score = 0;
let isPlaying = false;
let isWaitingForInput = false;
let currentLeftCount = 0;
let currentRightCount = 0;

// DOM Elements
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-btn');
const leftSide = document.getElementById('left-side');
const rightSide = document.getElementById('right-side');
const leftEmojisDiv = document.getElementById('left-emojis');
const rightEmojisDiv = document.getElementById('right-emojis');
const scoreDisplay = document.getElementById('score');

// Speech Synthesis Setup
const synth = window.speechSynthesis;
let voices = [];

function loadVoices() {
    voices = synth.getVoices();
}
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

function speak(text, callback = null) {
    if (synth.speaking) {
        synth.cancel();
    }
    const utterThis = new SpeechSynthesisUtterance(text);

    // Try to find a friendly, energetic voice (e.g., female or kid-like if available, else default)
    // On Mac, 'Samantha' or 'Alex' are common. We'll just pick a default for now.
    // Adjust pitch and rate for a friendlier tone
    utterThis.pitch = 1.2;
    utterThis.rate = 0.9;

    if (callback) {
        utterThis.onend = callback;
    }
    synth.speak(utterThis);
}

// Game Logic
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomEmoji() {
    return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function renderEmojis(container, count, emoji) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.className = 'emoji-item';
        span.textContent = emoji;
        // Stagger animation slightly for effect
        span.style.animationDelay = `${i * 0.05}s`;
        container.appendChild(span);
    }
}

function generateRound() {
    // Generate distinct counts for left and right
    currentLeftCount = getRandomInt(MIN_NUMBER, MAX_NUMBER);
    do {
        currentRightCount = getRandomInt(MIN_NUMBER, MAX_NUMBER);
    } while (currentRightCount === currentLeftCount); // Ensure they are not equal

    // Pick two random distinct emojis
    let leftEmoji = getRandomEmoji();
    let rightEmoji;
    do {
        rightEmoji = getRandomEmoji();
    } while (rightEmoji === leftEmoji);

    renderEmojis(leftEmojisDiv, currentLeftCount, leftEmoji);
    renderEmojis(rightEmojisDiv, currentRightCount, rightEmoji);

    gameContainer.classList.add('playing');
    isWaitingForInput = false; // Prevent clicks while speaking

    speak("Which side is bigger?", () => {
        isWaitingForInput = true;
    });
}

function handleSideClick(side) {
    if (!isWaitingForInput) return;

    let isCorrect = false;
    let clickedContainer = side === 'left' ? leftSide : rightSide;
    let otherContainer = side === 'left' ? rightSide : leftSide;

    if (side === 'left') {
        isCorrect = currentLeftCount > currentRightCount;
    } else {
        isCorrect = currentRightCount > currentLeftCount;
    }

    // Reset previous animations if they were stuck
    clickedContainer.classList.remove('success-bounce', 'shake');
    // small reflow delay
    void clickedContainer.offsetWidth;

    if (isCorrect) {
        isWaitingForInput = false; // block inputs during feedback
        score++;
        scoreDisplay.textContent = score;

        // Visual Feedback
        clickedContainer.classList.add('success-bounce');
        triggerConfetti(clickedContainer);

        speak("Good job!", () => {
            // Slight delay before next round
            setTimeout(() => {
                clickedContainer.classList.remove('success-bounce');
                generateRound();
            }, 500);
        });
    } else {
        isWaitingForInput = false;
        // Visual Feedback
        clickedContainer.classList.add('shake');

        speak("Try again!", () => {
            setTimeout(() => {
                clickedContainer.classList.remove('shake');
                isWaitingForInput = true;
            }, 500); // give it a moment to rest
        });
    }
}

function triggerConfetti(element) {
    const rect = element.getBoundingClientRect();
    // Calculate center of the clicked element for precise confetti origin
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: originX, y: originY },
        colors: ['#ff4081', '#00e676', '#ffd54f', '#00bcd4']
    });
}

// Event Listeners
startBtn.addEventListener('click', () => {
    // Need user interaction to initialize speech synthesis reliably in some browsers
    loadVoices();
    speak("Let's play!");
    setTimeout(generateRound, 1000);
});

leftSide.addEventListener('click', () => handleSideClick('left'));
rightSide.addEventListener('click', () => handleSideClick('right'));
