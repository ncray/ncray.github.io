const LETTERS = [
    { upper: "A", lower: "a", word: "apple", emoji: "🍎" },
    { upper: "B", lower: "b", word: "ball", emoji: "⚽" },
    { upper: "C", lower: "c", word: "car", emoji: "🚗" },
    { upper: "D", lower: "d", word: "dog", emoji: "🐶" },
    { upper: "E", lower: "e", word: "elephant", emoji: "🐘" },
    { upper: "F", lower: "f", word: "fish", emoji: "🐟" },
    { upper: "G", lower: "g", word: "grapes", emoji: "🍇" },
    { upper: "H", lower: "h", word: "hat", emoji: "🎩" },
    { upper: "I", lower: "i", word: "ice cream", emoji: "🍦" },
    { upper: "J", lower: "j", word: "juice", emoji: "🧃" },
    { upper: "K", lower: "k", word: "key", emoji: "🔑" },
    { upper: "L", lower: "l", word: "lion", emoji: "🦁" },
    { upper: "M", lower: "m", word: "moon", emoji: "🌙" },
    { upper: "N", lower: "n", word: "nest", emoji: "🪹" },
    { upper: "O", lower: "o", word: "orange", emoji: "🍊" },
    { upper: "P", lower: "p", word: "pizza", emoji: "🍕" },
    { upper: "Q", lower: "q", word: "queen", emoji: "👑" },
    { upper: "R", lower: "r", word: "rainbow", emoji: "🌈" },
    { upper: "S", lower: "s", word: "sun", emoji: "☀️" },
    { upper: "T", lower: "t", word: "train", emoji: "🚂" },
    { upper: "U", lower: "u", word: "umbrella", emoji: "☂️" },
    { upper: "V", lower: "v", word: "violin", emoji: "🎻" },
    { upper: "W", lower: "w", word: "watermelon", emoji: "🍉" },
    { upper: "X", lower: "x", word: "x-ray", emoji: "🩻" },
    { upper: "Y", lower: "y", word: "yarn", emoji: "🧶" },
    { upper: "Z", lower: "z", word: "zebra", emoji: "🦓" }
];

const COUNT_SYMBOLS = ["★", "●", "■", "♥"];
const GAME_NAMES = {
    "letter-match": "Match Letters",
    "first-sound": "First Letter",
    counting: "Count It",
    "number-order": "Number Train"
};

const defaultSettings = {
    voice: true,
    sound: true,
    calmMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    choiceCount: 3,
    numberRange: 5
};

let settings = loadSettings();
let currentGame = null;
let currentAnswer = null;
let currentPrompt = "";
let round = 0;
let attempts = 0;
let acceptingInput = false;
let audioContext = null;
let lastLetter = null;
let letterBag = [];
let lastCount = null;
let countBag = [];
const timers = LearningGame.createTimerManager();
const mastery = LearningGame.createMasteryTracker(
    LearningGame.load("caleb-learning-mastery", {})
);

const screens = [...document.querySelectorAll(".screen")];
const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const celebrationScreen = document.getElementById("celebration-screen");
const homeBtn = document.getElementById("home-btn");
const settingsBtn = document.getElementById("settings-btn");
const settingsDialog = document.getElementById("settings-dialog");
const prompt = document.getElementById("prompt");
const gameLabel = document.getElementById("game-label");
const questionArea = document.getElementById("question-area");
const choices = document.getElementById("choices");
const feedback = document.getElementById("feedback");
const repeatBtn = document.getElementById("repeat-btn");
const progressDots = [...document.querySelectorAll(".progress-dot")];
const parentSummary = document.getElementById("parent-summary");

function loadSettings() {
    try {
        return { ...defaultSettings, ...JSON.parse(localStorage.getItem("caleb-learning-settings")) };
    } catch {
        return { ...defaultSettings };
    }
}

function saveSettings() {
    localStorage.setItem("caleb-learning-settings", JSON.stringify(settings));
}

function showScreen(screen) {
    screens.forEach((item) => item.classList.toggle("active", item === screen));
    homeBtn.classList.toggle("hidden", screen === menuScreen);
}

function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
}

function sample(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function nextBalanced(items, bagName) {
    let bag = bagName === "letters" ? letterBag : countBag;
    const previous = bagName === "letters" ? lastLetter : lastCount;
    if (bag.length === 0) bag = LearningGame.shuffledBag(items, previous);
    const value = bag.shift();
    if (bagName === "letters") {
        letterBag = bag;
        lastLetter = value;
    } else {
        countBag = bag;
        lastCount = value;
    }
    return value;
}

function makeOptions(answer, pool) {
    const alternatives = shuffle([...new Set(pool.filter((item) => String(item) !== String(answer)))]);
    return shuffle([answer, ...alternatives.slice(0, settings.choiceCount - 1)]);
}

function speak(text) {
    if (!settings.voice || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.82;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
}

function playChime() {
    if (!settings.sound) return;
    try {
        audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        [523.25, 659.25].forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.frequency.value = frequency;
            oscillator.type = "sine";
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02 + index * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + index * 0.08);
            oscillator.connect(gain).connect(audioContext.destination);
            oscillator.start(now + index * 0.08);
            oscillator.stop(now + 0.45 + index * 0.08);
        });
    } catch {
        // Audio is optional; the visual response remains available.
    }
}

function updateProgress() {
    progressDots.forEach((dot, index) => dot.classList.toggle("done", index < round));
}

function startGame(game) {
    timers.clearAll();
    window.speechSynthesis?.cancel();
    currentGame = game;
    round = 0;
    updateProgress();
    gameLabel.textContent = GAME_NAMES[game];
    showScreen(gameScreen);
    nextRound();
}

function nextRound() {
    attempts = 0;
    acceptingInput = true;
    feedback.textContent = "";
    choices.innerHTML = "";
    questionArea.innerHTML = "";
    choices.style.setProperty("--choice-count", settings.choiceCount);

    if (currentGame === "letter-match") buildLetterMatch();
    if (currentGame === "first-sound") buildFirstSound();
    if (currentGame === "counting") buildCounting();
    if (currentGame === "number-order") buildNumberOrder();

    timers.set(() => speak(currentPrompt), 180);
}

function buildLetterMatch() {
    const letter = nextBalanced(LETTERS, "letters");
    currentAnswer = letter.lower;
    currentPrompt = `Find little ${letter.upper}.`;
    prompt.textContent = `Find little ${letter.upper}`;
    questionArea.innerHTML = `<div class="focus-card"><span class="focus-letter">${letter.upper}</span></div>`;
    renderChoices(makeOptions(letter.lower, LETTERS.map((item) => item.lower)));
}

function buildFirstSound() {
    const letter = nextBalanced(LETTERS, "letters");
    currentAnswer = letter.upper;
    currentPrompt = `${letter.word}. What letter does ${letter.word} start with?`;
    prompt.textContent = `What starts ${letter.word}?`;
    questionArea.innerHTML = `
        <div class="focus-card">
            <span class="picture-emoji" aria-hidden="true">${letter.emoji}</span>
            <span class="sr-word">${letter.word}</span>
        </div>`;
    renderChoices(makeOptions(letter.upper, LETTERS.map((item) => item.upper)));
}

function buildCounting() {
    const numberPool = Array.from({ length: settings.numberRange }, (_, index) => index + 1);
    const count = nextBalanced(numberPool, "counts");
    const symbol = sample(COUNT_SYMBOLS);
    currentAnswer = String(count);
    currentPrompt = `How many? Count them.`;
    prompt.textContent = "How many?";
    questionArea.innerHTML = `
        <div class="count-grid" aria-label="${count} shapes">
            ${Array.from({ length: count }, () => `<span class="count-item">${symbol}</span>`).join("")}
        </div>`;
    renderChoices(makeOptions(String(count), numberPool.map(String)));
}

function buildNumberOrder() {
    const maxStart = Math.max(1, settings.numberRange - 2);
    const start = Math.floor(Math.random() * maxStart) + 1;
    const sequence = [start, start + 1, start + 2];
    const missingIndex = Math.floor(Math.random() * 3);
    currentAnswer = String(sequence[missingIndex]);
    currentPrompt = `What number is missing?`;
    prompt.textContent = "What number is missing?";
    questionArea.innerHTML = `
        <div class="train" aria-label="Number sequence">
            ${sequence.map((number, index) => (
                index === missingIndex
                    ? `<div class="train-car missing">?</div>`
                    : `<div class="train-car">${number}</div>`
            )).join("")}
        </div>`;
    const numberPool = Array.from({ length: settings.numberRange }, (_, index) => String(index + 1));
    renderChoices(makeOptions(currentAnswer, numberPool));
}

function renderChoices(options) {
    options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "choice-btn";
        button.type = "button";
        button.dataset.answer = option;
        button.textContent = option;
        button.setAttribute("aria-label", option);
        button.addEventListener("click", () => checkAnswer(button));
        choices.appendChild(button);
    });
}

function checkAnswer(button) {
    if (!acceptingInput) return;

    if (button.dataset.answer === String(currentAnswer)) {
        acceptingInput = false;
        button.classList.add("correct");
        feedback.textContent = sample(["You found it!", "That's it!", "Great looking!", "Nice work!"]);
        playChime();
        speak(`${feedback.textContent} ${spokenAnswer()}`);
        round += 1;
        mastery.record(`${currentGame}:${currentAnswer}`, attempts === 0);
        LearningGame.save("caleb-learning-mastery", { skills: mastery.skills });
        updateProgress();
        timers.set(() => {
            if (round >= 5) finishGame();
            else nextRound();
        }, settings.calmMotion ? 700 : 1100);
        return;
    }

    attempts += 1;
    button.classList.add("try-again");
    button.disabled = true;
    feedback.textContent = "Good try. Look again.";
    speak("Good try. Look again.");

    if (attempts >= 2) {
        const answerButton = [...choices.children].find(
            (choice) => choice.dataset.answer === String(currentAnswer)
        );
        answerButton?.classList.add("hint");
    }
}

function spokenAnswer() {
    if (currentGame === "letter-match") return `Little ${currentAnswer}.`;
    if (currentGame === "first-sound") return `${currentAnswer}.`;
    return `${currentAnswer}.`;
}

function finishGame() {
    showScreen(celebrationScreen);
    playChime();
    speak("You did it, Caleb! Five great tries.");
}

function goHome() {
    timers.clearAll();
    window.speechSynthesis?.cancel();
    currentGame = null;
    showScreen(menuScreen);
}

function applySettingsToPage() {
    document.body.classList.toggle("calm-motion", settings.calmMotion);
    document.getElementById("voice-setting").checked = settings.voice;
    document.getElementById("sound-setting").checked = settings.sound;
    document.getElementById("motion-setting").checked = settings.calmMotion;
    document.getElementById("choices-setting").value = String(settings.choiceCount);
    document.getElementById("range-setting").value = String(settings.numberRange);
}

function updateParentSummary() {
    const totals = Object.values(mastery.skills).reduce((sum, item) => ({
        attempts: sum.attempts + item.attempts,
        independent: sum.independent + item.independent
    }), { attempts: 0, independent: 0 });
    const accuracy = totals.attempts ? Math.round(totals.independent / totals.attempts * 100) : 0;
    parentSummary.textContent = `Independent answers: ${totals.independent}/${totals.attempts} (${accuracy}%).`;
}

document.querySelectorAll("[data-game]").forEach((button) => {
    button.addEventListener("click", () => startGame(button.dataset.game));
});

homeBtn.addEventListener("click", goHome);
repeatBtn.addEventListener("click", () => speak(currentPrompt));
document.getElementById("choose-game-btn").addEventListener("click", goHome);
document.getElementById("play-again-btn").addEventListener("click", () => startGame(currentGame));

settingsBtn.addEventListener("click", () => {
    applySettingsToPage();
    updateParentSummary();
    settingsDialog.showModal();
});

settingsDialog.addEventListener("close", () => {
    if (settingsDialog.returnValue !== "save") return;
    settings = {
        voice: document.getElementById("voice-setting").checked,
        sound: document.getElementById("sound-setting").checked,
        calmMotion: document.getElementById("motion-setting").checked,
        choiceCount: Number(document.getElementById("choices-setting").value),
        numberRange: Number(document.getElementById("range-setting").value)
    };
    saveSettings();
    applySettingsToPage();
    if (currentGame && gameScreen.classList.contains("active")) {
        timers.clearAll();
        nextRound();
    }
});

applySettingsToPage();
