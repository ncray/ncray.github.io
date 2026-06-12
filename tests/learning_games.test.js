const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function loadRuntime() {
    const classes = new Set();
    const storage = new Map();
    const context = {
        console,
        MutationObserver: class {
            observe() {}
        },
        localStorage: {
            getItem(key) {
                return storage.get(key) ?? null;
            },
            setItem(key, value) {
                storage.set(key, value);
            }
        },
        document: {
            body: {
                classList: {
                    contains: (name) => classes.has(name),
                    toggle(name, enabled) {
                        if (enabled) classes.add(name);
                        else classes.delete(name);
                    }
                }
            }
        },
        window: {
            clearTimeout,
            setTimeout,
            matchMedia() {
                return {
                    matches: false,
                    addEventListener() {},
                    removeEventListener() {}
                };
            }
        }
    };
    vm.createContext(context);
    vm.runInContext(read("projects/learning-game-utils.js"), context);
    return { api: context.window.LearningGame, classes, context };
}

test("shared runtime persists state and tracks independent mastery", () => {
    const { api } = loadRuntime();
    api.save("sample", { level: 2 });
    assert.deepEqual({ ...api.load("sample", { level: 1 }) }, { level: 2 });

    const tracker = api.createMasteryTracker();
    tracker.record("on", true);
    tracker.record("on", false);
    assert.equal(tracker.skills.on.attempts, 2);
    assert.equal(tracker.skills.on.independent, 1);
    assert.equal(tracker.recentAccuracy("on"), 0.5);
});

test("celebration is optional and disabled for reduced motion", () => {
    const { api, context } = loadRuntime();
    assert.doesNotThrow(() => api.celebrate({ particleCount: 10 }));

    let calls = 0;
    context.window.confetti = () => calls++;
    api.celebrate({});
    assert.equal(calls, 1);

    api.applyMotionPreference(true);
    api.celebrate({});
    assert.equal(calls, 1);
});

test("shuffled bags retain every item and avoid an immediate repeat", () => {
    const { api } = loadRuntime();
    const bag = api.shuffledBag(["A", "B", "C"], "A");
    assert.deepEqual([...bag].sort(), ["A", "B", "C"]);
    assert.notEqual(bag[0], "A");
});

test("standalone games use shared accessibility and offline-safe infrastructure", () => {
    const games = [
        "projects/number_bridge/index.html",
        "projects/dino_director/index.html",
        "projects/inset_puzzles/index.html",
        "projects/where_donald/index.html"
    ];

    for (const game of games) {
        const source = read(game);
        assert.match(source, /learning-game-utils\.css/);
        assert.match(source, /learning-game-utils\.js/);
        assert.match(source, /LearningGame\.celebrate\(/);
        assert.doesNotMatch(source, /(?<!LearningGame\.)\bconfetti\(/);
        assert.match(source, /id="toggle-motion"/);
        assert.match(source, /<button class="settings-btn-trigger"/);
        assert.match(source, /class="learning-controls"/);
    }
});

test("reviewed defects have dedicated regressions", () => {
    const bridge = read("projects/number_bridge/index.html");
    assert.doesNotMatch(bridge, /wrongAttemptsThisRound >= 2/);
    assert.match(bridge, /recentErrors\.filter\(Boolean\)\.length >= 3/);
    assert.match(bridge, /currentLevel === 1 \? 3/);

    const dino = read("projects/dino_director/index.html");
    assert.match(dino, /if \(type === 'noise'\)/);
    assert.match(dino, /EAT: \['LEAF'\]/);
    assert.match(dino, /assessmentTrial/);

    const puzzles = read("projects/inset_puzzles/index.html");
    assert.match(puzzles, /tap it and then tap its spot/i);
    assert.match(puzzles, /piece\.setAttribute\('role', 'button'\)/);
    assert.match(puzzles, /window\.addEventListener\('resize'/);

    const donald = read("projects/where_donald/index.html");
    assert.match(donald, /role="button" tabindex="0" aria-label="Donald"/);
    assert.match(donald, /assessmentTrial/);

    const garden = read("projects/caleb_learning/app.js");
    assert.match(garden, /timers\.clearAll\(\)/);
    assert.match(garden, /shuffledBag/);

    const numberSense = read("projects/number_sense/index.html");
    assert.match(numberSense, /<button class="side-container"/);
});
