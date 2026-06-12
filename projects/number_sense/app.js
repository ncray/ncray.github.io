const EMOJIS = ['🐶', '🍎', '🐱', '🐘', '🍊', '🚗', '🎈', '⭐', '🍓', '🐸', '🦁', '🦖'];
const MIN_NUMBER = 1;

let score = 0;
let isPlaying = false;
let isWaitingForInput = false;
let currentLeftCount = 0;
let currentRightCount = 0;
let currentHadError = false;
let lastPair = '';
let settings = LearningGame.load('number-sense', {
    reduceMotion: LearningGame.prefersReducedMotion(),
    voice: true,
    maxNumber: 10,
    score: 0,
    skills: {}
});
score = settings.score;
const mastery = LearningGame.createMasteryTracker({ skills: settings.skills });

// DOM Elements
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-btn');
const leftSide = document.getElementById('left-side');
const rightSide = document.getElementById('right-side');
const leftEmojisDiv = document.getElementById('left-emojis');
const rightEmojisDiv = document.getElementById('right-emojis');
const scoreDisplay = document.getElementById('score');
const repeatBtn = document.getElementById('repeat-btn');
const motionBtn = document.getElementById('motion-btn');
const voiceSetting = document.getElementById('voice-setting');
const rangeSetting = document.getElementById('range-setting');
const parentSettings = document.getElementById('parent-settings');
const parentSummary = document.getElementById('parent-summary');
scoreDisplay.textContent = score;
LearningGame.applyMotionPreference(settings.reduceMotion);
motionBtn.setAttribute('aria-pressed', String(settings.reduceMotion));
motionBtn.textContent = settings.reduceMotion ? 'Allow motion' : 'Reduce motion';
voiceSetting.checked = settings.voice;
rangeSetting.value = String(settings.maxNumber);

// Speech Synthesis Setup
const synth = window.speechSynthesis;
let voices = [];
const activeUtterances = new Set(); // Prevent garbage collection of speech utterances

function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices();
}
if (synth && 'onvoiceschanged' in synth) {
    synth.onvoiceschanged = loadVoices;
}

function speak(text, callback = null) {
    if (!settings.voice) {
        if (callback) callback();
        return;
    }
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
        if (callback) callback();
        return;
    }
    if (synth.speaking) {
        synth.cancel();
    }
    const utterThis = new SpeechSynthesisUtterance(text);

    // Try to find a friendly, energetic voice
    utterThis.pitch = 1.2;
    utterThis.rate = 0.9;

    activeUtterances.add(utterThis);

    const handleSpeechEnd = () => {
        activeUtterances.delete(utterThis);
        if (callback) {
            callback();
        }
    };

    utterThis.onend = handleSpeechEnd;
    utterThis.onerror = handleSpeechEnd; // Prevent hanging on permission blocks or errors

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
    currentHadError = false;
    // Generate distinct counts for left and right
    currentLeftCount = getRandomInt(MIN_NUMBER, settings.maxNumber);
    do {
        currentRightCount = getRandomInt(MIN_NUMBER, settings.maxNumber);
    } while (currentRightCount === currentLeftCount); // Ensure they are not equal
    const pair = `${currentLeftCount}:${currentRightCount}`;
    if (pair === lastPair) return generateRound();
    lastPair = pair;

    // Pick a random emoji
    let emoji = getRandomEmoji();

    renderEmojis(leftEmojisDiv, currentLeftCount, emoji);
    renderEmojis(rightEmojisDiv, currentRightCount, emoji);

    gameContainer.classList.add('playing');
    isWaitingForInput = true; // Allow input immediately for responsive, snappy gameplay

    speak("Which side has more?");
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
        isWaitingForInput = false; // block inputs during feedback animation
        score++;
        scoreDisplay.textContent = score;
        mastery.record(`compare:${Math.max(currentLeftCount, currentRightCount)}`, !currentHadError);
        settings = { ...settings, score, skills: mastery.skills };
        LearningGame.save('number-sense', settings);

        // Visual Feedback
        clickedContainer.classList.add('success-bounce');
        triggerConfetti(clickedContainer);

        // Speak encouragement in background
        speak("Good job!");

        // Move to next round immediately after animation completes (600ms)
        setTimeout(() => {
            clickedContainer.classList.remove('success-bounce');
            generateRound();
        }, 600);
    } else {
        currentHadError = true;
        isWaitingForInput = false;
        // Visual Feedback
        clickedContainer.classList.add('shake');

        // Speak warning in background
        speak("Try again!");
        // Allow click input again immediately after shake animation completes (500ms)
        setTimeout(() => {
            clickedContainer.classList.remove('shake');
            isWaitingForInput = true;
        }, 500);
    }
}

function triggerConfetti(element) {
    const rect = element.getBoundingClientRect();
    // Calculate center of the clicked element for precise confetti origin
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = (rect.top + rect.height / 2) / window.innerHeight;

    LearningGame.celebrate({
        particleCount: 100,
        spread: 70,
        origin: { x: originX, y: originY },
        colors: ['#ff4081', '#00e676', '#ffd54f', '#00bcd4']
    });
}

// Event Listeners
startBtn.addEventListener('click', () => {
    if (isPlaying) return;
    isPlaying = true;
    startBtn.disabled = true;
    // Need user interaction to initialize speech synthesis reliably in some browsers
    loadVoices();
    speak("Let's play!");
    setTimeout(generateRound, 1000);
});

leftSide.addEventListener('click', () => handleSideClick('left'));
rightSide.addEventListener('click', () => handleSideClick('right'));
repeatBtn.addEventListener('click', () => speak("Which side has more?"));
motionBtn.addEventListener('click', () => {
    settings.reduceMotion = !settings.reduceMotion;
    LearningGame.applyMotionPreference(settings.reduceMotion);
    motionBtn.setAttribute('aria-pressed', String(settings.reduceMotion));
    motionBtn.textContent = settings.reduceMotion ? 'Allow motion' : 'Reduce motion';
    LearningGame.save('number-sense', settings);
});
voiceSetting.addEventListener('change', () => {
    settings.voice = voiceSetting.checked;
    LearningGame.save('number-sense', settings);
});
rangeSetting.addEventListener('change', () => {
    settings.maxNumber = Number(rangeSetting.value);
    LearningGame.save('number-sense', settings);
    if (isPlaying) generateRound();
});
parentSettings.addEventListener('toggle', () => {
    if (!parentSettings.open) return;
    const totals = Object.values(mastery.skills).reduce((sum, item) => ({
        attempts: sum.attempts + item.attempts,
        independent: sum.independent + item.independent
    }), { attempts: 0, independent: 0 });
    const accuracy = totals.attempts ? Math.round(totals.independent / totals.attempts * 100) : 0;
    parentSummary.textContent = `Independent comparisons: ${totals.independent}/${totals.attempts} (${accuracy}%).`;
});
