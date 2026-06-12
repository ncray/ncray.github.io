(function () {
    "use strict";

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function storageKey(gameId) {
        return `learning-game:${gameId}`;
    }

    function load(gameId, defaults = {}) {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey(gameId))) || {};
            return { ...defaults, ...saved };
        } catch {
            return { ...defaults };
        }
    }

    function save(gameId, state) {
        try {
            localStorage.setItem(storageKey(gameId), JSON.stringify(state));
        } catch {
            // Storage is optional. Games continue to work in private/restricted modes.
        }
    }

    function celebrate(options = {}) {
        if (document.body.classList.contains("reduce-motion")) return;
        if (typeof window.confetti !== "function") return;
        try {
            window.confetti(options);
        } catch {
            // Celebration is decorative and must never block game progression.
        }
    }

    function applyMotionPreference(reduceMotion) {
        document.body.classList.toggle("reduce-motion", Boolean(reduceMotion));
    }

    function watchSystemMotion(onChange) {
        const handler = (event) => onChange(event.matches);
        reduceMotionQuery.addEventListener?.("change", handler);
        return () => reduceMotionQuery.removeEventListener?.("change", handler);
    }

    function createTimerManager() {
        const timers = new Set();
        return {
            set(callback, delay) {
                const id = window.setTimeout(() => {
                    timers.delete(id);
                    callback();
                }, delay);
                timers.add(id);
                return id;
            },
            clearAll() {
                timers.forEach((id) => window.clearTimeout(id));
                timers.clear();
            }
        };
    }

    function createMasteryTracker(saved = {}) {
        const skills = { ...(saved.skills || {}) };

        function record(skill, independent) {
            const current = skills[skill] || { attempts: 0, independent: 0 };
            current.attempts += 1;
            if (independent) current.independent += 1;
            skills[skill] = current;
            return current;
        }

        function recentAccuracy(skill) {
            const current = skills[skill];
            return current?.attempts ? current.independent / current.attempts : 0;
        }

        return { skills, record, recentAccuracy };
    }

    function shuffledBag(items, previousValue) {
        const bag = [...items];
        for (let index = bag.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
        }
        if (bag.length > 1 && bag[0] === previousValue) {
            [bag[0], bag[1]] = [bag[1], bag[0]];
        }
        return bag;
    }

    function setupModal(modal, openTrigger, closeButton) {
        if (!modal) return;
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-hidden", "true");
        openTrigger?.setAttribute("aria-haspopup", "dialog");
        openTrigger?.setAttribute("aria-expanded", "false");

        const observer = new MutationObserver(() => {
            const active = modal.classList.contains("active");
            modal.setAttribute("aria-hidden", String(!active));
            openTrigger?.setAttribute("aria-expanded", String(active));
            if (active) {
                modal.querySelector("button, input, select")?.focus();
            }
        });
        observer.observe(modal, { attributes: true, attributeFilter: ["class"] });

        modal.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeButton?.click();
        });
    }

    window.LearningGame = {
        celebrate,
        createMasteryTracker,
        createTimerManager,
        load,
        prefersReducedMotion: () => reduceMotionQuery.matches,
        save,
        setupModal,
        shuffledBag,
        applyMotionPreference,
        watchSystemMotion
    };
})();
