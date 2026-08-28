/**
 * CYBERQUEST 2099 - Main Application Controller & Gamification Engine
 */

(function () {
    'use strict';

    // Ranks based on level
    const RANKS = [
        { minLevel: 1, title: 'CYBER NOVICE' },
        { minLevel: 3, title: 'NEURAL SPECIALIST' },
        { minLevel: 5, title: 'QUANTUM RUNNER' },
        { minLevel: 8, title: 'CYBER WARLORD' },
        { minLevel: 12, title: 'SYNAPSE ARCHITECT' },
        { minLevel: 16, title: 'QUANTUM OVERLORD' }
    ];

    // Priority Tier XP and QC Rewards
    const TIER_REWARDS = {
        s: { xp: 100, qc: 40, label: 'TIER S (CRITICAL)' },
        a: { xp: 60, qc: 25, label: 'TIER A (HIGH)' },
        b: { xp: 35, qc: 15, label: 'TIER B (STANDARD)' },
        c: { xp: 20, qc: 10, label: 'TIER C (SIDE QUEST)' }
    };

    // Default Achievements Definition
    const ACHIEVEMENTS_DEF = [
        { id: 'first_step', title: 'First Spark', desc: 'Complete your first tactical task.', icon: '⚡', xp: 50, qc: 20 },
        { id: 'task_5', title: 'Cyber Operative', desc: 'Complete 5 tactical tasks.', icon: '🦾', xp: 100, qc: 40 },
        { id: 'task_20', title: 'Task Titan', desc: 'Complete 20 tactical tasks.', icon: '👑', xp: 250, qc: 100 },
        { id: 'pomo_1', title: 'Neural Sync', desc: 'Complete 1 Quantum Focus cycle.', icon: '⚛️', xp: 60, qc: 25 },
        { id: 'pomo_4', title: 'Centurion Focus', desc: 'Complete 4 Quantum Focus cycles.', icon: '🧠', xp: 200, qc: 80 },
        { id: 'streak_3', title: 'Overdrive Streak', desc: 'Achieve a 3-task hyper streak.', icon: '🔥', xp: 120, qc: 50 },
        { id: 'boss_slayer_1', title: 'Titan Slayer', desc: 'Defeat your first Cyber Raid Boss.', icon: '👾', xp: 300, qc: 120 },
        { id: 'shop_first', title: 'Black Market Buyer', desc: 'Redeem your first reward from the Market.', icon: '💎', xp: 80, qc: 30 },
        { id: 'level_5', title: 'Elite Runner', desc: 'Advance to Player Level 5.', icon: '🌟', xp: 200, qc: 75 },
        { id: 'overdrive_master', title: 'Blitz Protocol', desc: 'Complete a focus session in Overdrive Mode.', icon: '⚡', xp: 150, qc: 60 }
    ];

    // Core State Model
    let state = {
        player: {
            level: 1,
            xp: 0,
            credits: 120,
            streak: 0,
            maxStreak: 0,
            streakMultiplier: 1.0,
            totalTasksDone: 0,
            totalFocusMinutes: 0,
            bossesSlain: 0,
            unlockedAchievements: [],
            theme: 'cyber',
            soundMuted: false,
            volume: 0.6,
            overdrive: false,
            inventory: []
        },
        tasks: [
            {
                id: 'task-demo-1',
                title: '⚡ Calibrate Quantum Matrix & Focus Engine',
                tier: 's',
                tag: '#system',
                completed: false,
                createdAt: Date.now(),
                subtasks: [
                    { id: 'sub-1', title: 'Initiate neural telemetry', done: true },
                    { id: 'sub-2', title: 'Execute full cognitive diagnostic', done: false }
                ]
            },
            {
                id: 'task-demo-2',
                title: '🛡️ Deploy Cyber Firewall Security Protocols',
                tier: 'a',
                tag: '#security',
                completed: false,
                createdAt: Date.now() - 3600000,
                subtasks: []
            },
            {
                id: 'task-demo-3',
                title: '☕ Sync Focus Ambient Soundscapes',
                tier: 'b',
                tag: '#wellness',
                completed: true,
                createdAt: Date.now() - 7200000,
                subtasks: []
            }
        ],
        bosses: [
            {
                id: 'boss-demo-1',
                name: 'MECHA CHRONOS: The Procrastination Titan',
                avatar: '🤖',
                maxHp: 300,
                currentHp: 300,
                subtasks: [
                    { id: 'bs-1', text: 'Break project into 4 strategic milestones', damage: 75, done: false },
                    { id: 'bs-2', text: 'Run 2 uninterrupted 25m Focus Cycles', damage: 75, done: false },
                    { id: 'bs-3', text: 'Refactor core codebase architecture', damage: 75, done: false },
                    { id: 'bs-4', text: 'Conduct final peer review & deployment', damage: 75, done: false }
                ],
                defeated: false
            }
        ],
        rewards: [
            {
                id: 'rew-1',
                title: '☕ Double Espresso Neuro-Boost',
                desc: 'Reward yourself with a premium brew or espresso shot.',
                cost: 60,
                icon: '☕',
                isCustom: false
            },
            {
                id: 'rew-2',
                title: '🎮 1 Hour Guilt-Free Gaming',
                desc: 'Unwind with an hour of your favorite video game.',
                cost: 160,
                icon: '🎮',
                isCustom: false
            },
            {
                id: 'rew-3',
                title: '🍕 Cyber Feast / Favorite Takeout',
                desc: 'Order your favorite meal guilt-free after crushing objectives.',
                cost: 320,
                icon: '🍕',
                isCustom: false
            },
            {
                id: 'rew-4',
                title: '🛡️ Quantum Streak Shield',
                desc: 'Protects your streak from resetting if you miss a cycle.',
                cost: 180,
                icon: '🛡️',
                isCustom: false
            },
            {
                id: 'rew-5',
                title: '⚡ Overclock Core (2x XP Booster)',
                desc: 'Earn 2x XP for the next 2 hours of task completions.',
                cost: 220,
                icon: '⚡',
                isCustom: false
            }
        ],
        redemptionHistory: []
    };

    // Pomodoro Timer State
    let timer = {
        mode: 'focus', // 'focus' | 'short' | 'long'
        durations: {
            focus: 25 * 60,
            short: 5 * 60,
            long: 15 * 60
        },
        timeLeft: 25 * 60,
        running: false,
        interval: null,
        cyclesCompleted: 0
    };

    let particles = null;
    let selectedTier = 'b';
    let currentTaskFilter = 'all';

    /* ==========================================================================
       INITIALIZATION & DATA SYNC
       ========================================================================== */
    async function initApp() {
        // Init particle system
        particles = new CyberParticleEngine('bg-canvas');
        updateParticleTheme(state.player.theme);

        // Try load from local storage or API
        await loadState();

        // Bind DOM event listeners
        bindEvents();

        // Render UI elements
        renderAll();

        // Setup Command Palette Items
        setupCommandPalette();

        // Generate initial AI debrief
        updateAiDebrief();
    }

    async function loadState() {
        // Try localStorage first
        const saved = localStorage.getItem('cyberquest_2099_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
            } catch (e) {
                console.warn('Error reading local state', e);
            }
        }

        // Try backend API sync
        try {
            const res = await fetch('/api/state');
            if (res.ok) {
                const apiData = await res.json();
                if (apiData && apiData.player) {
                    state = { ...state, ...apiData };
                }
            }
        } catch (e) {
            // Running offline / standalone
        }
    }

    async function saveState() {
        // Save to localStorage
        localStorage.setItem('cyberquest_2099_state', JSON.stringify(state));

        // Save to Python backend if available
        try {
            await fetch('/api/state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state)
            });
        } catch (e) {
            // Offline fallback
        }
    }

    /* ==========================================================================
       LEVELING, XP & GAMIFICATION
       ========================================================================== */
    function getXpForLevel(level) {
        return Math.floor(100 * Math.pow(1.32, level - 1));
    }

    function getRankTitle(level) {
        let currentRank = RANKS[0].title;
        for (const r of RANKS) {
            if (level >= r.minLevel) currentRank = r.title;
        }
        return currentRank;
    }

    function addPlayerXp(amount) {
        let effectiveXp = Math.round(amount * state.player.streakMultiplier);
        if (state.player.overdrive) {
            effectiveXp = Math.round(effectiveXp * 1.5);
        }

        state.player.xp += effectiveXp;
        let xpNeeded = getXpForLevel(state.player.level);

        while (state.player.xp >= xpNeeded) {
            state.player.xp -= xpNeeded;
            state.player.level++;
            state.player.credits += 50; // Level up credit bonus
            onLevelUp(state.player.level);
            xpNeeded = getXpForLevel(state.player.level);
        }

        checkAchievements();
        renderPlayerStats();
        saveState();
        return effectiveXp;
    }

    function addPlayerCredits(amount) {
        state.player.credits += amount;
        renderPlayerStats();
        saveState();
    }

    function onLevelUp(newLevel) {
        window.cyberAudio.playLevelUp();
        if (particles) particles.triggerLevelUpStorm();

        const modal = document.getElementById('level-up-modal');
        const titleEl = document.getElementById('modal-level-title');
        if (titleEl) {
            titleEl.textContent = `${getRankTitle(newLevel)} (LVL ${newLevel})`;
        }
        if (modal) modal.classList.add('active');

        showToast(`⚡ LEVEL UP! Advanced to Level ${newLevel}! +50 $QC`);
    }

    function checkAchievements() {
        let newlyUnlocked = false;

        ACHIEVEMENTS_DEF.forEach(ach => {
            if (state.player.unlockedAchievements.includes(ach.id)) return;

            let conditionMet = false;
            if (ach.id === 'first_step' && state.player.totalTasksDone >= 1) conditionMet = true;
            if (ach.id === 'task_5' && state.player.totalTasksDone >= 5) conditionMet = true;
            if (ach.id === 'task_20' && state.player.totalTasksDone >= 20) conditionMet = true;
            if (ach.id === 'pomo_1' && timer.cyclesCompleted >= 1) conditionMet = true;
            if (ach.id === 'pomo_4' && timer.cyclesCompleted >= 4) conditionMet = true;
            if (ach.id === 'streak_3' && state.player.streak >= 3) conditionMet = true;
            if (ach.id === 'boss_slayer_1' && state.player.bossesSlain >= 1) conditionMet = true;
            if (ach.id === 'shop_first' && state.redemptionHistory.length >= 1) conditionMet = true;
            if (ach.id === 'level_5' && state.player.level >= 5) conditionMet = true;
            if (ach.id === 'overdrive_master' && state.player.overdrive && timer.cyclesCompleted >= 1) conditionMet = true;

            if (conditionMet) {
                state.player.unlockedAchievements.push(ach.id);
                state.player.xp += ach.xp;
                state.player.credits += ach.qc;
                showToast(`🎖️ ACHIEVEMENT UNLOCKED: ${ach.title}! (+${ach.xp} XP / +${ach.qc} QC)`);
                window.cyberAudio.playStreakBonus();
                newlyUnlocked = true;
            }
        });

        if (newlyUnlocked) {
            renderAchievements();
        }
    }

    /* ==========================================================================
       TASK MATRIX LOGIC
       ========================================================================== */
    function addTask(title, tier = 'b', tag = '#mission', subtasks = []) {
        if (!title.trim()) return;

        const newTask = {
            id: 'task-' + Date.now(),
            title: title.trim(),
            tier: tier,
            tag: tag.startsWith('#') ? tag : (tag ? '#' + tag : '#mission'),
            completed: false,
            createdAt: Date.now(),
            subtasks: subtasks.map((s, idx) => ({ id: `sub-${Date.now()}-${idx}`, title: s, done: false }))
        };

        state.tasks.unshift(newTask);
        window.cyberAudio.playClick();
        renderTasks();
        updateAiDebrief();
        saveState();
        showToast('🎯 Objective Initialized into Task Matrix!');
    }

    function toggleTask(id, targetElement = null) {
        const task = state.tasks.find(t => t.id === id);
        if (!task) return;

        task.completed = !task.completed;

        if (task.completed) {
            // Task Completed
            state.player.totalTasksDone++;
            state.player.streak++;
            if (state.player.streak > state.player.maxStreak) {
                state.player.maxStreak = state.player.streak;
            }

            // Streak multiplier calculation
            if (state.player.streak >= 7) state.player.streakMultiplier = 2.0;
            else if (state.player.streak >= 4) state.player.streakMultiplier = 1.5;
            else if (state.player.streak >= 2) state.player.streakMultiplier = 1.2;
            else state.player.streakMultiplier = 1.0;

            const rewards = TIER_REWARDS[task.tier] || TIER_REWARDS.b;
            const earnedXp = addPlayerXp(rewards.xp);
            const earnedQc = Math.round(rewards.qc * state.player.streakMultiplier);
            addPlayerCredits(earnedQc);

            // Trigger sound & visual burst
            window.cyberAudio.playLaserComplete();
            if (targetElement && particles) {
                const rect = targetElement.getBoundingClientRect();
                particles.triggerQuantumBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }

            showToast(`⚡ TARGET ELIMINATED! +${earnedXp} XP, +${earnedQc} $QC`);
        } else {
            // Uncheck task
            state.player.totalTasksDone = Math.max(0, state.player.totalTasksDone - 1);
        }

        renderTasks();
        renderPlayerStats();
        updateDailyQuests();
        updateAiDebrief();
        saveState();
    }

    function deleteTask(id) {
        state.tasks = state.tasks.filter(t => t.id !== id);
        window.cyberAudio.playClick();
        renderTasks();
        saveState();
        showToast('🗑️ Objective Removed from Matrix');
    }

    function toggleSubtask(taskId, subId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        const sub = task.subtasks.find(s => s.id === subId);
        if (!sub) return;

        sub.done = !sub.done;
        window.cyberAudio.playClick();

        // If all subtasks done, optionally complete task
        const allDone = task.subtasks.every(s => s.done);
        if (allDone && !task.completed && task.subtasks.length > 0) {
            toggleTask(taskId);
        } else {
            renderTasks();
            saveState();
        }
    }

    // AI / N.E.O. Heuristic Task Decomposer
    function decomposeCurrentInput() {
        const input = document.getElementById('task-input');
        const text = input ? input.value.trim() : '';

        if (!text) {
            showToast('⚠️ Please enter an objective title first!');
            return;
        }

        window.cyberAudio.playClick();
        const lower = text.toLowerCase();
        let subtasks = [];

        if (lower.includes('study') || lower.includes('learn') || lower.includes('read') || lower.includes('exam')) {
            subtasks = [
                'Skim & structure key concepts into summary notes',
                'Deep focus study session with active recall',
                'Solve 5 practice problems / flashcards',
                'Conduct final self-assessment review'
            ];
        } else if (lower.includes('code') || lower.includes('build') || lower.includes('app') || lower.includes('bug') || lower.includes('feature')) {
            subtasks = [
                'Map architecture, data models & endpoints',
                'Implement core logic & components',
                'Write unit tests & debug edge cases',
                'Review code & push commit'
            ];
        } else if (lower.includes('clean') || lower.includes('organize') || lower.includes('workout') || lower.includes('gym')) {
            subtasks = [
                'Prepare tools, environment & setup',
                'Execute high-intensity phase 1',
                'Cool down, sanitize & document progress'
            ];
        } else {
            subtasks = [
                'Deconstruct goal into initial tactical blueprint',
                'Execute core phase without distractions',
                'Review, verify output & log completion'
            ];
        }

        addTask(text, selectedTier, document.getElementById('task-tag-input').value || '#quest', subtasks);
        if (input) input.value = '';
        showToast('⚡ N.E.O. successfully decomposed objective into 3 sub-quests!');
    }

    /* ==========================================================================
       BOSS RAID ARENA
       ========================================================================== */
    function strikeBossSubtask(bossId, subId, btnElement) {
        const boss = state.bosses.find(b => b.id === bossId);
        if (!boss || boss.defeated) return;

        const sub = boss.subtasks.find(s => s.id === subId);
        if (!sub || sub.done) return;

        sub.done = true;
        boss.currentHp = Math.max(0, boss.currentHp - sub.damage);

        // Sound & Screen Shake
        window.cyberAudio.playBossHit();
        const arena = document.getElementById('active-boss-arena');
        if (arena) {
            arena.classList.remove('screen-shake');
            void arena.offsetWidth; // trigger reflow
            arena.classList.add('screen-shake');
        }

        // Particle Burst
        if (btnElement && particles) {
            const rect = btnElement.getBoundingClientRect();
            particles.triggerQuantumBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, { r: 255, g: 0, b: 127 }, 35);
        }

        showToast(`💥 CRITICAL STRIKE! Dealt ${sub.damage} DMG to ${boss.name}!`);

        if (boss.currentHp <= 0) {
            // Boss Defeated!
            boss.defeated = true;
            state.player.bossesSlain++;
            const xpGained = addPlayerXp(300);
            addPlayerCredits(150);

            window.cyberAudio.playBossDefeat();
            if (particles) particles.triggerLevelUpStorm();

            showToast(`🏆 TITAN DEFEATED! Earned ${xpGained} XP and +150 $QC!`);
            checkAchievements();
        }

        renderBossArena();
        renderPlayerStats();
        updateDailyQuests();
        saveState();
    }

    function createBoss(name, avatar, hp, subtasksText) {
        if (!name.trim()) return;

        const subList = subtasksText.split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const subCount = Math.max(1, subList.length);
        const damagePerSub = Math.round(hp / subCount);

        const newBoss = {
            id: 'boss-' + Date.now(),
            name: name.trim(),
            avatar: avatar || '🤖',
            maxHp: hp,
            currentHp: hp,
            subtasks: subList.map((st, i) => ({
                id: `bs-${Date.now()}-${i}`,
                text: st,
                damage: damagePerSub,
                done: false
            })),
            defeated: false
        };

        state.bosses.unshift(newBoss);
        window.cyberAudio.playClick();
        renderBossArena();
        saveState();
        showToast(`👾 RAID BOSS SUMMONED: ${newBoss.name}!`);
    }

    /* ==========================================================================
       QUANTUM POMODORO REACTOR
       ========================================================================== */
    function setTimerMode(mode) {
        timer.mode = mode;
        timer.timeLeft = timer.durations[mode];
        timer.running = false;
        clearInterval(timer.interval);

        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Hide or show Holo-Breather during breaks
        const breather = document.getElementById('holo-breather');
        if (breather) {
            if (mode === 'short' || mode === 'long') {
                breather.classList.add('active');
            } else {
                breather.classList.remove('active');
            }
        }

        renderTimerDisplay();
        window.cyberAudio.playClick();
    }

    function toggleTimer() {
        window.cyberAudio.ensureContext();
        if (timer.running) {
            // Pause
            timer.running = false;
            clearInterval(timer.interval);
            document.getElementById('pomo-btn-main').textContent = 'RESUME FOCUS';
            document.getElementById('mini-btn-timer').textContent = 'RESUME FOCUS';
            document.getElementById('pomo-status-text').textContent = 'REACTOR PAUSED';
        } else {
            // Start
            timer.running = true;
            document.getElementById('pomo-btn-main').textContent = 'PAUSE REACTOR';
            document.getElementById('mini-btn-timer').textContent = 'PAUSE FOCUS';
            document.getElementById('pomo-status-text').textContent = timer.mode === 'focus' ? 'QUANTUM FOCUS ACTIVE' : 'REGENERATION ACTIVE';

            timer.interval = setInterval(() => {
                if (timer.timeLeft > 0) {
                    timer.timeLeft--;
                    renderTimerDisplay();
                } else {
                    onTimerComplete();
                }
            }, 1000);
        }
    }

    function resetTimer() {
        timer.running = false;
        clearInterval(timer.interval);
        timer.timeLeft = timer.durations[timer.mode];
        document.getElementById('pomo-btn-main').textContent = 'INITIALIZE FOCUS';
        document.getElementById('mini-btn-timer').textContent = 'START FOCUS';
        document.getElementById('pomo-status-text').textContent = 'SYSTEM STANDBY';
        renderTimerDisplay();
        window.cyberAudio.playClick();
    }

    function skipTimer() {
        if (timer.mode === 'focus') setTimerMode('short');
        else setTimerMode('focus');
        window.cyberAudio.playClick();
    }

    function onTimerComplete() {
        clearInterval(timer.interval);
        timer.running = false;
        window.cyberAudio.playPomodoroAlarm();

        if (timer.mode === 'focus') {
            timer.cyclesCompleted++;
            state.player.totalFocusMinutes += 25;

            const baseEarnedXp = 60;
            const xpGained = addPlayerXp(baseEarnedXp);
            addPlayerCredits(25);

            showToast(`⚛️ FOCUS CYCLE COMPLETE! +${xpGained} XP, +25 $QC!`);
            if (particles) particles.triggerQuantumBurst(window.innerWidth / 2, window.innerHeight / 2, { r: 0, g: 240, b: 255 }, 40);

            // Auto-switch to Short Break
            setTimerMode('short');
        } else {
            showToast('⚡ REGENERATION PROTOCOL COMPLETE! Ready for Quantum Focus.');
            setTimerMode('focus');
        }

        checkAchievements();
        updateDailyQuests();
        updateAiDebrief();
        saveState();
    }

    function renderTimerDisplay() {
        const mins = Math.floor(timer.timeLeft / 60);
        const secs = timer.timeLeft % 60;
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        const digitsEl = document.getElementById('pomo-digits');
        const miniDigitsEl = document.getElementById('mini-timer-display');
        if (digitsEl) digitsEl.textContent = timeStr;
        if (miniDigitsEl) miniDigitsEl.textContent = timeStr;

        // Radial SVG Stroke offset
        const ring = document.getElementById('timer-progress-ring');
        if (ring) {
            const total = timer.durations[timer.mode];
            const progress = timer.timeLeft / total;
            const circumference = 690; // 2 * pi * 105
            ring.style.strokeDashoffset = (1 - progress) * circumference;
        }
    }

    /* ==========================================================================
       CYBER MARKET / REWARD REDEMPTION
       ========================================================================== */
    function redeemReward(rewardId) {
        const reward = state.rewards.find(r => r.id === rewardId);
        if (!reward) return;

        if (state.player.credits < reward.cost) {
            showToast('⚠️ INSUFFICIENT QUANTUM CREDITS! Complete tasks or focus sessions to earn more.');
            return;
        }

        state.player.credits -= reward.cost;
        state.redemptionHistory.unshift({
            id: 'red-' + Date.now(),
            title: reward.title,
            cost: reward.cost,
            icon: reward.icon,
            timestamp: new Date().toLocaleTimeString()
        });

        window.cyberAudio.playPurchase();
        if (particles) particles.triggerQuantumBurst(window.innerWidth / 2, window.innerHeight / 2, { r: 255, g: 215, b: 0 }, 30);

        showToast(`🎉 REDEEMED: "${reward.title}"! Enjoy your reward!`);

        checkAchievements();
        renderPlayerStats();
        renderRewards();
        saveState();
    }

    function addCustomReward(title, desc, cost, icon) {
        if (!title.trim()) return;

        const newReward = {
            id: 'rew-' + Date.now(),
            title: title.trim(),
            desc: desc.trim() || 'Custom real-world productivity reward',
            cost: Math.max(10, parseInt(cost, 10) || 100),
            icon: icon.trim() || '🎁',
            isCustom: true
        };

        state.rewards.push(newReward);
        window.cyberAudio.playClick();
        renderRewards();
        saveState();
        showToast('💎 Custom Reward added to Cyber Black Market!');
    }

    /* ==========================================================================
       COMMAND PALETTE (CTRL+K)
       ========================================================================== */
    const COMMANDS = [
        { title: 'Start Quantum Focus (25m)', icon: '⚛️', action: () => { switchTab('pomodoro'); toggleTimer(); } },
        { title: 'Summon New Raid Boss', icon: '👾', action: () => { switchTab('bosses'); document.getElementById('boss-name-input').focus(); } },
        { title: 'Decompose Current Task with N.E.O.', icon: '⚡', action: () => decomposeCurrentInput() },
        { title: 'Switch Theme to Neon Cyber', icon: '🎨', action: () => switchTheme('cyber') },
        { title: 'Switch Theme to Synthwave \'84', icon: '🎨', action: () => switchTheme('synthwave') },
        { title: 'Switch Theme to Matrix Terminal', icon: '🎨', action: () => switchTheme('matrix') },
        { title: 'Switch Theme to Solar Flare', icon: '🎨', action: () => switchTheme('solar') },
        { title: 'Switch Theme to Void Nebula', icon: '🎨', action: () => switchTheme('void') },
        { title: 'Toggle Overdrive Blitz Mode', icon: '⚡', action: () => toggleOverdrive() },
        { title: 'Mute / Unmute Cyber SFX', icon: '🔊', action: () => toggleSound() },
        { title: 'Open Cyber Black Market', icon: '🛒', action: () => switchTab('rewards') },
        { title: 'View Tactical Intel & Achievements', icon: '📊', action: () => switchTab('intel') }
    ];

    function setupCommandPalette() {
        const cmdModal = document.getElementById('cmd-modal');
        const cmdInput = document.getElementById('cmd-search-input');
        const cmdResults = document.getElementById('cmd-results-list');

        function renderCmdResults(filter = '') {
            if (!cmdResults) return;
            cmdResults.innerHTML = '';
            const filtered = COMMANDS.filter(c => c.title.toLowerCase().includes(filter.toLowerCase()));

            if (filtered.length === 0) {
                cmdResults.innerHTML = `<div style="padding:16px; color:var(--text-muted); text-align:center;">No matching cyber protocols found.</div>`;
                return;
            }

            filtered.forEach((cmd, idx) => {
                const item = document.createElement('div');
                item.className = `cmd-item ${idx === 0 ? 'selected' : ''}`;
                item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span>${cmd.icon}</span>
                        <span>${cmd.title}</span>
                    </div>
                    <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">EXECUTE</span>
                `;
                item.onclick = () => {
                    cmd.action();
                    closeCommandPalette();
                };
                cmdResults.appendChild(item);
            });
        }

        function openCommandPalette() {
            cmdModal.classList.add('active');
            cmdInput.value = '';
            renderCmdResults('');
            setTimeout(() => cmdInput.focus(), 50);
            window.cyberAudio.playClick();
        }

        function closeCommandPalette() {
            cmdModal.classList.remove('active');
        }

        document.getElementById('btn-cmd-palette').onclick = openCommandPalette;
        cmdModal.onclick = (e) => { if (e.target === cmdModal) closeCommandPalette(); };

        cmdInput.oninput = (e) => renderCmdResults(e.target.value);

        cmdInput.onkeydown = (e) => {
            if (e.key === 'Escape') closeCommandPalette();
            if (e.key === 'Enter') {
                const selected = cmdResults.querySelector('.cmd-item.selected') || cmdResults.querySelector('.cmd-item');
                if (selected) selected.click();
            }
        };

        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (cmdModal.classList.contains('active')) closeCommandPalette();
                else openCommandPalette();
            }
        });
    }

    /* ==========================================================================
       THEMES & UI UTILS
       ========================================================================== */
    function switchTheme(themeName) {
        document.body.setAttribute('data-theme', themeName);
        state.player.theme = themeName;
        const selector = document.getElementById('theme-selector');
        if (selector) selector.value = themeName;
        updateParticleTheme(themeName);
        window.cyberAudio.playClick();
        saveState();
    }

    function updateParticleTheme(theme) {
        if (!particles) return;
        if (theme === 'synthwave') particles.setThemeColor(255, 42, 133);
        else if (theme === 'matrix') particles.setThemeColor(0, 255, 102);
        else if (theme === 'solar') particles.setThemeColor(255, 170, 0);
        else if (theme === 'void') particles.setThemeColor(168, 85, 247);
        else particles.setThemeColor(0, 240, 255);
    }

    function toggleSound() {
        state.player.soundMuted = !state.player.soundMuted;
        window.cyberAudio.setMuted(state.player.soundMuted);
        const icon = document.getElementById('sound-icon');
        if (icon) icon.textContent = state.player.soundMuted ? '🔇' : '🔊';
        showToast(state.player.soundMuted ? '🔇 Audio Systems Muted' : '🔊 Audio Systems Online');
        saveState();
    }

    function toggleOverdrive() {
        state.player.overdrive = !state.player.overdrive;
        const bar = document.getElementById('overdrive-toggle-bar');
        const btn = document.getElementById('btn-toggle-overdrive');
        if (bar) bar.classList.toggle('active', state.player.overdrive);
        if (btn) btn.textContent = state.player.overdrive ? 'ON (1.5x XP)' : 'OFF';

        if (state.player.overdrive) {
            window.cyberAudio.playStreakBonus();
            showToast('⚡ OVERDRIVE BLITZ ACTIVATED: +50% XP Gain on all completions!');
        }
        saveState();
    }

    function switchTab(tabId) {
        document.querySelectorAll('.cyber-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = content.id === `tab-${tabId}` ? 'block' : 'none';
        });
        window.cyberAudio.playClick();
    }

    function showToast(msg) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>⚡</span><span>${msg}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    function updateAiDebrief() {
        const debriefEl = document.getElementById('ai-debrief-text');
        const stampEl = document.getElementById('debrief-timestamp');
        if (stampEl) stampEl.textContent = new Date().toLocaleTimeString();

        const pending = state.tasks.filter(t => !t.completed).length;
        const done = state.player.totalTasksDone;
        const focusMins = state.player.totalFocusMinutes;

        if (debriefEl) {
            if (done === 0 && pending > 0) {
                debriefEl.textContent = `TACTICAL BRIEFING: ${pending} mission targets detected in Task Matrix. Recommend activating a 25m Quantum Focus protocol to establish cognitive momentum.`;
            } else if (done > 0 && pending === 0) {
                debriefEl.textContent = `EXCELLENT WORK: All assigned objectives neutralized! Cognitive productivity operating at 100% capacity. Summon a Raid Boss or recharge via Short Refresh.`;
            } else {
                debriefEl.textContent = `STATUS UPDATE: ${done} objectives completed with ${focusMins} total minutes of deep focus logged. Active streak at ${state.player.streak}x. Maintain cognitive velocity!`;
            }
        }
    }

    function updateDailyQuests() {
        const qTasks = document.getElementById('quest-tasks-progress');
        const qFocus = document.getElementById('quest-focus-progress');
        const qBoss = document.getElementById('quest-boss-progress');

        if (qTasks) qTasks.textContent = `${Math.min(3, state.player.totalTasksDone)}/3`;
        if (qFocus) qFocus.textContent = `${Math.min(2, timer.cyclesCompleted)}/2`;
        if (qBoss) qBoss.textContent = `${Math.min(1, state.player.bossesSlain)}/1`;
    }

    /* ==========================================================================
       RENDERING FUNCTIONS
       ========================================================================== */
    function renderPlayerStats() {
        const lvlEl = document.getElementById('player-level');
        const rankEl = document.getElementById('player-rank');
        const xpBar = document.getElementById('xp-bar-fill');
        const xpText = document.getElementById('xp-text');
        const credsEl = document.getElementById('player-credits');
        const streakEl = document.getElementById('player-streak');
        const multEl = document.getElementById('streak-multiplier');

        const xpNeeded = getXpForLevel(state.player.level);
        const xpPercent = Math.min(100, Math.round((state.player.xp / xpNeeded) * 100));

        if (lvlEl) lvlEl.textContent = `LVL ${state.player.level}`;
        if (rankEl) rankEl.textContent = getRankTitle(state.player.level);
        if (xpBar) xpBar.style.width = `${xpPercent}%`;
        if (xpText) xpText.textContent = `${state.player.xp} / ${xpNeeded} XP`;
        if (credsEl) credsEl.textContent = `${state.player.credits} QC`;
        if (streakEl) streakEl.textContent = `${state.player.streak} STREAK`;
        if (multEl) multEl.textContent = `${state.player.streakMultiplier.toFixed(1)}x`;

        // Analytics Tab
        const statTasks = document.getElementById('stat-total-tasks');
        const statTime = document.getElementById('stat-focus-time');
        const statBosses = document.getElementById('stat-bosses-slain');
        const statStreak = document.getElementById('stat-max-streak');

        if (statTasks) statTasks.textContent = state.player.totalTasksDone;
        if (statTime) statTime.textContent = `${state.player.totalFocusMinutes}m`;
        if (statBosses) statBosses.textContent = state.player.bossesSlain;
        if (statStreak) statStreak.textContent = state.player.maxStreak;
    }

    function renderTasks() {
        const container = document.getElementById('task-list-container');
        if (!container) return;

        let filtered = state.tasks;
        if (currentTaskFilter === 'active') filtered = filtered.filter(t => !t.completed);
        else if (currentTaskFilter === 'completed') filtered = filtered.filter(t => t.completed);
        else if (currentTaskFilter === 'tier-s') filtered = filtered.filter(t => t.tier === 's');
        else if (currentTaskFilter === 'tier-a') filtered = filtered.filter(t => t.tier === 'a');

        const searchVal = (document.getElementById('task-search-input')?.value || '').toLowerCase();
        if (searchVal) {
            filtered = filtered.filter(t => t.title.toLowerCase().includes(searchVal) || t.tag.toLowerCase().includes(searchVal));
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:var(--text-muted); font-family:var(--font-mono);">
                    <div style="font-size:32px; margin-bottom:8px;">📡</div>
                    No tactical objectives found matching filter criteria.
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        filtered.forEach(task => {
            const card = document.createElement('div');
            card.className = `task-card tier-${task.tier} ${task.completed ? 'completed' : ''}`;

            const rewards = TIER_REWARDS[task.tier] || TIER_REWARDS.b;

            let subtasksHtml = '';
            if (task.subtasks && task.subtasks.length > 0) {
                const subItems = task.subtasks.map(sub => `
                    <div class="subtask-item ${sub.done ? 'done' : ''}">
                        <div>
                            <span class="subtask-check" onclick="window.cyberApp.toggleSubtask('${task.id}', '${sub.id}')">
                                ${sub.done ? '✓' : ''}
                            </span>
                            <span>${sub.title}</span>
                        </div>
                    </div>
                `).join('');
                subtasksHtml = `<div class="subtasks-container">${subItems}</div>`;
            }

            card.innerHTML = `
                <div class="task-main-row">
                    <div class="task-left">
                        <div class="cyber-checkbox" onclick="window.cyberApp.toggleTask('${task.id}', this)">
                            ${task.completed ? '✓' : ''}
                        </div>
                        <div class="task-text-content">
                            <div class="task-text">${task.title}</div>
                            <div class="task-tags">
                                <span class="task-tag">${task.tag}</span>
                                <span class="reward-tag xp">+${rewards.xp} XP</span>
                                <span class="reward-tag qc">+${rewards.qc} QC</span>
                            </div>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="action-icon-btn delete" onclick="window.cyberApp.deleteTask('${task.id}')" title="Delete Objective">🗑️</button>
                    </div>
                </div>
                ${subtasksHtml}
            `;
            container.appendChild(card);
        });
    }

    function renderBossArena() {
        const arena = document.getElementById('active-boss-arena');
        const defeatedList = document.getElementById('defeated-bosses-list');
        const activeIndicator = document.getElementById('active-boss-indicator');

        if (!arena) return;

        const activeBoss = state.bosses.find(b => !b.defeated);
        if (activeIndicator) activeIndicator.style.display = activeBoss ? 'inline' : 'none';

        if (activeBoss) {
            const hpPercent = Math.max(0, Math.round((activeBoss.currentHp / activeBoss.maxHp) * 100));

            const subtasksHtml = activeBoss.subtasks.map(st => `
                <button class="boss-hit-btn ${st.done ? 'done' : ''}" 
                        ${st.done ? 'disabled style="opacity:0.4; cursor:default;"' : ''} 
                        onclick="window.cyberApp.strikeBossSubtask('${activeBoss.id}', '${st.id}', this)">
                    <span>${st.done ? '✅' : '⚔️'} ${st.text}</span>
                    <span style="font-family:var(--font-mono); color:var(--secondary); font-weight:700;">-${st.damage} HP</span>
                </button>
            `).join('');

            arena.innerHTML = `
                <div class="cyber-card boss-arena-card">
                    <div class="boss-header-bar">
                        <div class="boss-avatar">${activeBoss.avatar}</div>
                        <div class="boss-info">
                            <div class="boss-name">${activeBoss.name}</div>
                            <div class="boss-title">ACTIVE CYBER RAID TITAN</div>
                        </div>
                    </div>

                    <div class="boss-hp-container">
                        <div class="boss-hp-labels">
                            <span>SHIELD & HEALTH INTEGRITY</span>
                            <span>${activeBoss.currentHp} / ${activeBoss.maxHp} HP (${hpPercent}%)</span>
                        </div>
                        <div class="boss-hp-bar">
                            <div class="boss-hp-fill" style="width: ${hpPercent}%;"></div>
                        </div>
                    </div>

                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px;">
                        Neutralize tactical sub-objectives to deal critical damage:
                    </p>
                    <div class="boss-subtasks-list">
                        ${subtasksHtml}
                    </div>
                </div>
            `;
        } else {
            arena.innerHTML = `
                <div class="cyber-card" style="text-align:center; padding:36px;">
                    <div style="font-size:40px; margin-bottom:10px;">🛡️</div>
                    <h3 style="font-family:var(--font-cyber); color:#fff; font-size:1.2rem;">NO ACTIVE RAID BOSS</h3>
                    <p style="color:var(--text-muted); font-size:0.88rem; margin-top:4px;">
                        Use the Summon Titan console on the right to turn your major goals into an epic battle!
                    </p>
                </div>
            `;
        }

        // Defeated Bosses
        if (defeatedList) {
            const defeated = state.bosses.filter(b => b.defeated);
            if (defeated.length === 0) {
                defeatedList.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted); font-family:var(--font-mono);">No titans slain yet.</div>`;
            } else {
                defeatedList.innerHTML = defeated.map(b => `
                    <div class="cyber-card" style="padding:12px 18px; display:flex; align-items:center; justify-content:space-between;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="font-size:22px;">${b.avatar}</span>
                            <div>
                                <div style="font-weight:700; color:#fff;">${b.name}</div>
                                <div style="font-size:0.75rem; color:var(--success); font-family:var(--font-mono);">STATUS: DEFEATED</div>
                            </div>
                        </div>
                        <span style="color:var(--accent); font-family:var(--font-mono); font-size:0.85rem;">+300 XP / +150 QC</span>
                    </div>
                `).join('');
            }
        }
    }

    function renderRewards() {
        const container = document.getElementById('rewards-container');
        const historyContainer = document.getElementById('redemption-history');
        if (!container) return;

        container.innerHTML = '';
        state.rewards.forEach(rew => {
            const card = document.createElement('div');
            card.className = 'reward-card';
            card.innerHTML = `
                <div style="display:flex; align-items:center; gap:14px;">
                    <div class="reward-icon-wrapper">${rew.icon}</div>
                    <div class="reward-info">
                        <h3>${rew.title}</h3>
                        <p>${rew.desc}</p>
                    </div>
                </div>
                <div class="reward-footer">
                    <span class="reward-cost">💎 ${rew.cost} QC</span>
                    <button class="btn-redeem" onclick="window.cyberApp.redeemReward('${rew.id}')" ${state.player.credits < rew.cost ? 'disabled' : ''}>
                        REDEEM
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        if (historyContainer) {
            if (state.redemptionHistory.length === 0) {
                historyContainer.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; font-family:var(--font-mono);">No rewards redeemed yet. Earn Quantum Credits to unlock treats!</div>`;
            } else {
                historyContainer.innerHTML = state.redemptionHistory.map(h => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:rgba(255,255,255,0.03); border-radius:4px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span>${h.icon}</span>
                            <span style="font-weight:600; color:#fff;">${h.title}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px; font-family:var(--font-mono); font-size:0.8rem;">
                            <span style="color:var(--accent);">- ${h.cost} QC</span>
                            <span style="color:var(--text-muted);">${h.timestamp}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    function renderAchievements() {
        const container = document.getElementById('achievements-container');
        const countEl = document.getElementById('achievements-count');
        if (!container) return;

        const unlockedCount = state.player.unlockedAchievements.length;
        if (countEl) countEl.textContent = `${unlockedCount} / ${ACHIEVEMENTS_DEF.length} UNLOCKED`;

        container.innerHTML = '';
        ACHIEVEMENTS_DEF.forEach(ach => {
            const isUnlocked = state.player.unlockedAchievements.includes(ach.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-details">
                    <h4>${ach.title}</h4>
                    <p>${ach.desc}</p>
                    <span style="font-family:var(--font-mono); font-size:0.72rem; color:var(--primary);">${isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED (+ ' + ach.xp + ' XP)'}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function renderAll() {
        renderPlayerStats();
        renderTasks();
        renderBossArena();
        renderTimerDisplay();
        renderRewards();
        renderAchievements();
        updateDailyQuests();

        // Sync theme selector
        const themeSel = document.getElementById('theme-selector');
        if (themeSel) themeSel.value = state.player.theme;
        document.body.setAttribute('data-theme', state.player.theme);

        // Sound Icon
        const soundIcon = document.getElementById('sound-icon');
        if (soundIcon) soundIcon.textContent = state.player.soundMuted ? '🔇' : '🔊';
    }

    /* ==========================================================================
       DOM EVENT BINDINGS
       ========================================================================== */
    function bindEvents() {
        // Tab switching
        document.querySelectorAll('.cyber-tabs .tab-btn').forEach(btn => {
            btn.onclick = () => switchTab(btn.dataset.tab);
        });

        // Priority Tier selector in task creator
        document.querySelectorAll('.tier-select .tier-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tier-select .tier-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedTier = btn.dataset.tier;
                window.cyberAudio.playClick();
            };
        });

        // Add task button & enter key
        const taskInput = document.getElementById('task-input');
        const tagInput = document.getElementById('task-tag-input');
        const btnAdd = document.getElementById('btn-add-task');

        if (btnAdd && taskInput) {
            btnAdd.onclick = () => {
                addTask(taskInput.value, selectedTier, tagInput.value);
                taskInput.value = '';
            };
            taskInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    addTask(taskInput.value, selectedTier, tagInput.value);
                    taskInput.value = '';
                }
            };
        }

        // AI Decompose button
        const btnAiDecomp = document.getElementById('btn-ai-decompose');
        if (btnAiDecomp) btnAiDecomp.onclick = decomposeCurrentInput;

        // Filter pills
        document.querySelectorAll('.filter-pills .filter-pill').forEach(pill => {
            pill.onclick = () => {
                document.querySelectorAll('.filter-pills .filter-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentTaskFilter = pill.dataset.filter;
                window.cyberAudio.playClick();
                renderTasks();
            };
        });

        // Task search input
        const taskSearch = document.getElementById('task-search-input');
        if (taskSearch) taskSearch.oninput = () => renderTasks();

        // Pomodoro Reactor Controls
        document.querySelectorAll('.reactor-modes .mode-btn').forEach(btn => {
            btn.onclick = () => setTimerMode(btn.dataset.mode);
        });

        const btnMainTimer = document.getElementById('pomo-btn-main');
        const btnResetTimer = document.getElementById('pomo-btn-reset');
        const btnSkipTimer = document.getElementById('pomo-btn-skip');
        const miniBtnTimer = document.getElementById('mini-btn-timer');
        const miniBtnReset = document.getElementById('mini-btn-reset');

        if (btnMainTimer) btnMainTimer.onclick = toggleTimer;
        if (btnResetTimer) btnResetTimer.onclick = resetTimer;
        if (btnSkipTimer) btnSkipTimer.onclick = skipTimer;
        if (miniBtnTimer) miniBtnTimer.onclick = toggleTimer;
        if (miniBtnReset) miniBtnReset.onclick = resetTimer;

        // Overdrive toggle
        const btnOverdrive = document.getElementById('btn-toggle-overdrive');
        if (btnOverdrive) btnOverdrive.onclick = toggleOverdrive;

        // Ambience audio selector
        const ambSelect = document.getElementById('ambience-select');
        if (ambSelect) {
            ambSelect.onchange = (e) => {
                window.cyberAudio.startAmbience(e.target.value);
            };
        }

        // Theme selector
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.onchange = (e) => switchTheme(e.target.value);
        }

        // Sound master toggle
        const btnSound = document.getElementById('btn-sound-toggle');
        if (btnSound) btnSound.onclick = toggleSound;

        // Boss Creator Form
        const btnCreateBoss = document.getElementById('btn-create-boss');
        if (btnCreateBoss) {
            btnCreateBoss.onclick = () => {
                const name = document.getElementById('boss-name-input').value;
                const avatar = document.getElementById('boss-avatar-select').value;
                const hp = parseInt(document.getElementById('boss-hp-input').value, 10) || 300;
                const subtasks = document.getElementById('boss-subtasks-input').value;

                createBoss(name, avatar, hp, subtasks);
                document.getElementById('boss-name-input').value = '';
                document.getElementById('boss-subtasks-input').value = '';
            };
        }

        // Custom Reward Modal
        const btnOpenRewardModal = document.getElementById('btn-open-custom-reward-modal');
        const btnCloseRewardModal = document.getElementById('btn-close-reward-modal');
        const rewardModal = document.getElementById('custom-reward-modal');
        const btnSaveReward = document.getElementById('btn-save-custom-reward');

        if (btnOpenRewardModal && rewardModal) {
            btnOpenRewardModal.onclick = () => {
                rewardModal.classList.add('active');
                window.cyberAudio.playClick();
            };
        }
        if (btnCloseRewardModal && rewardModal) {
            btnCloseRewardModal.onclick = () => rewardModal.classList.remove('active');
        }
        if (btnSaveReward && rewardModal) {
            btnSaveReward.onclick = () => {
                const title = document.getElementById('custom-reward-title').value;
                const desc = document.getElementById('custom-reward-desc').value;
                const cost = document.getElementById('custom-reward-cost').value;
                const icon = document.getElementById('custom-reward-icon').value;

                addCustomReward(title, desc, cost, icon);
                rewardModal.classList.remove('active');
                document.getElementById('custom-reward-title').value = '';
                document.getElementById('custom-reward-desc').value = '';
            };
        }

        // Level Up Modal Close
        const btnCloseLevel = document.getElementById('btn-close-level-modal');
        const levelModal = document.getElementById('level-up-modal');
        if (btnCloseLevel && levelModal) {
            btnCloseLevel.onclick = () => {
                levelModal.classList.remove('active');
                window.cyberAudio.playClick();
            };
        }
    }

    // Export global controller interface
    window.cyberApp = {
        init: initApp,
        toggleTask,
        deleteTask,
        toggleSubtask,
        strikeBossSubtask,
        redeemReward
    };

    // Auto-boot on DOM ready
    window.addEventListener('DOMContentLoaded', initApp);
})();
