/**
 * CYBERQUEST 2099 - Cyber Canvas Background & Quantum Particle Physics
 */

class CyberParticleEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.bursts = [];
        this.nodeCount = 45;
        this.maxDistance = 140;
        this.themeColor = { r: 0, g: 240, b: 255 }; // Default Neon Cyan
        this.mouse = { x: null, y: null, radius: 120 };

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Initialize ambient floating nodes
        for (let i = 0; i < this.nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.2
            });
        }

        this.animate();
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setThemeColor(r, g, b) {
        this.themeColor = { r, g, b };
    }

    // Trigger explosive particle burst at coordinates
    triggerQuantumBurst(x, y, color = null, count = 28) {
        const rgb = color || this.themeColor;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.bursts.push({
                x: x || window.innerWidth / 2,
                y: y || window.innerHeight / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3.5 + 1.5,
                alpha: 1.0,
                decay: Math.random() * 0.02 + 0.015,
                color: rgb,
                shape: Math.random() > 0.5 ? 'circle' : 'spark'
            });
        }
    }

    // Full screen celebration storm
    triggerLevelUpStorm() {
        const colors = [
            { r: 0, g: 240, b: 255 },    // Cyan
            { r: 255, g: 0, b: 128 },    // Magenta
            { r: 255, g: 215, b: 0 },    // Gold
            { r: 120, g: 255, b: 68 }    // Neon Lime
        ];

        for (let i = 0; i < 120; i++) {
            const chosen = colors[Math.floor(Math.random() * colors.length)];
            this.bursts.push({
                x: Math.random() * this.canvas.width,
                y: -10,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 4 + 2,
                radius: Math.random() * 4 + 2,
                alpha: 1.0,
                decay: Math.random() * 0.008 + 0.004,
                color: chosen,
                shape: 'spark'
            });
        }
    }

    animate() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const { r, g, b } = this.themeColor;

        // Draw and update ambient nodes
        for (let i = 0; i < this.nodes.length; i++) {
            const n = this.nodes[i];
            n.x += n.vx;
            n.y += n.vy;

            if (n.x < 0 || n.x > this.canvas.width) n.vx *= -1;
            if (n.y < 0 || n.y > this.canvas.height) n.vy *= -1;

            // Mouse repulsion
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = n.x - this.mouse.x;
                const dy = n.y - this.mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < this.mouse.radius && dist > 0) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    n.x += (dx / dist) * force * 2;
                    n.y += (dy / dist) * force * 2;
                }
            }

            // Draw Node
            this.ctx.beginPath();
            this.ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${n.alpha})`;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // Connect filament lines between close nodes
            for (let j = i + 1; j < this.nodes.length; j++) {
                const n2 = this.nodes[j];
                const dx = n.x - n2.x;
                const dy = n.y - n2.y;
                const dist = Math.hypot(dx, dy);

                if (dist < this.maxDistance) {
                    const lineAlpha = (1 - dist / this.maxDistance) * 0.18;
                    this.ctx.beginPath();
                    this.ctx.moveTo(n.x, n.y);
                    this.ctx.lineTo(n2.x, n2.y);
                    this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.stroke();
                }
            }
        }

        // Draw and update active bursts
        for (let i = this.bursts.length - 1; i >= 0; i--) {
            const p = this.bursts[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.bursts.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            if (p.shape === 'spark') {
                this.ctx.rect(p.x, p.y, p.radius * 1.6, p.radius * 1.6);
            } else {
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            }
            this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 1)`;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }

        requestAnimationFrame(() => this.animate());
    }
}

window.CyberParticleEngine = CyberParticleEngine;
