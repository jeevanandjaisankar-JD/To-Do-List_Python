/**
 * CYBERQUEST 2099 - Procedural Web Audio Synthesizer Engine
 * Pure Web Audio API - Zero external audio file dependencies.
 */

class CyberAudioEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.volume = 0.6;
        this.ambientNode = null;
        this.ambientGain = null;
        this.currentAmbience = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    ensureContext() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.muted = muted;
        if (muted && this.ambientGain) {
            this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } else if (!muted && this.ambientGain && this.currentAmbience) {
            this.ambientGain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
        }
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.ambientGain && !this.muted) {
            this.ambientGain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
        }
    }

    // High-tech UI click/hover chirp
    playClick() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

        gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Task Complete Laser Chirp
    playLaserComplete() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        // Lead tone
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12); // C6
        gain1.gain.setValueAtTime(this.volume * 0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.26);

        // Harmonic shimmer
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.5, now + 0.08); // E6
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.setValueAtTime(this.volume * 0.2, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.36);
    }

    // Boss Hit Impact Blast
    playBossHit() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        // Low punch oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
        
        // Filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.2);

        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Boss Defeat Victory Fanfare
    playBossDefeat() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio blast
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + (idx * 0.07);

            osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.55);
        });
    }

    // Level Up Cyber Fanfare
    playLevelUp() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const chord = [
            { f: 440, t: 0 },
            { f: 554.37, t: 0.08 },
            { f: 659.25, t: 0.16 },
            { f: 880, t: 0.24 },
            { f: 1108.73, t: 0.32 },
            { f: 1318.51, t: 0.40 },
            { f: 1760, t: 0.48 }
        ];

        chord.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + item.t;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(item.f, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.25, startTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.65);
        });
    }

    // Pomodoro Session Complete Bell
    playPomodoroAlarm() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const chimeFreqs = [880, 1174.66, 1318.51, 1760];

        chimeFreqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + (idx * 0.15);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(this.volume * 0.35, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 1.3);
        });
    }

    // Streak Multiplier Surge
    playStreakBonus() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(2400, now + 0.3);
        filter.Q.value = 3;

        gain.gain.setValueAtTime(this.volume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
    }

    // Purchase / Credit Spend Chime
    playPurchase() {
        if (this.muted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [987.77, 1318.51].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + (i * 0.09);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(this.volume * 0.25, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.32);
        });
    }

    // Procedural Ambient Focus Soundscape Generator
    startAmbience(type) {
        this.stopAmbience();
        if (!type || type === 'none') {
            this.currentAmbience = null;
            return;
        }

        this.ensureContext();
        if (!this.ctx) return;
        this.currentAmbience = type;

        const now = this.ctx.currentTime;
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.001, now);
        this.ambientGain.gain.linearRampToValueAtTime(this.muted ? 0 : this.volume * 0.35, now + 1.5);
        this.ambientGain.connect(this.ctx.destination);

        if (type === 'rain') {
            // Cyber Rain: Filtered Pink/White Noise
            const bufferSize = this.ctx.sampleRate * 2;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
                b6 = white * 0.115926;
            }

            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1200;

            whiteNoise.connect(filter);
            filter.connect(this.ambientGain);
            whiteNoise.start(now);
            this.ambientNode = whiteNoise;

        } else if (type === 'warp') {
            // Warp Core: Low Frequency FM drone
            const osc = this.ctx.createOscillator();
            const mod = this.ctx.createOscillator();
            const modGain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = 55; // A1

            mod.type = 'sine';
            mod.frequency.value = 2.5; // LFO pulse
            modGain.gain.value = 15;

            mod.connect(osc.frequency);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 260;

            osc.connect(filter);
            filter.connect(this.ambientGain);

            osc.start(now);
            mod.start(now);
            this.ambientNode = osc;

        } else if (type === 'gamma') {
            // 40Hz Gamma Focus Binaural Beats
            const baseFreq = 200;
            const beatFreq = 40;

            const oscLeft = this.ctx.createOscillator();
            const oscRight = this.ctx.createOscillator();
            const merger = this.ctx.createChannelMerger(2);

            oscLeft.type = 'sine';
            oscLeft.frequency.value = baseFreq;

            oscRight.type = 'sine';
            oscRight.frequency.value = baseFreq + beatFreq;

            oscLeft.connect(merger, 0, 0);
            oscRight.connect(merger, 0, 1);

            merger.connect(this.ambientGain);

            oscLeft.start(now);
            oscRight.start(now);
            this.ambientNode = oscLeft;

        } else if (type === 'orbit') {
            // Deep Space Orbit: Ethereal Pad
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();

            osc1.type = 'triangle';
            osc1.frequency.value = 110; // A2
            osc2.type = 'sine';
            osc2.frequency.value = 164.81; // E3

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 400;
            filter.Q.value = 2;

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(this.ambientGain);

            osc1.start(now);
            osc2.start(now);
            this.ambientNode = osc1;
        }
    }

    stopAmbience() {
        if (this.ambientGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
            setTimeout(() => {
                try {
                    if (this.ambientNode) {
                        this.ambientNode.stop();
                        this.ambientNode.disconnect();
                        this.ambientNode = null;
                    }
                } catch (e) {}
            }, 900);
        }
        this.currentAmbience = null;
    }
}

// Global cyber audio instance
window.cyberAudio = new CyberAudioEngine();
