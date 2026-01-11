/* =========================================
   MAIN JAVASCRIPT LOGIC
   ========================================= */

// -----------------------------------------
// 1. Toast & Utility Functions
// -----------------------------------------
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');

    const bgColor = type === 'success' ? 'bg-acid text-black' : 'bg-neon text-white';
    const icon = type === 'success' ? 'check_circle' : 'info';

    toast.className = `${bgColor} px-6 py-3 rounded font-mono text-sm flex items-center gap-3 shadow-lg transform transition-all duration-300 translate-y-[-20px] opacity-0`;
    toast.innerHTML = `
        <span class="material-symbols-outlined text-lg">${icon}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animate In
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-[-20px]', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Dismiss after 3s
    setTimeout(() => {
        toast.classList.add('translate-y-[-20px]', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function copyToClipboard(text, successMessage) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMessage, 'success');
        }).catch(() => {
            fallbackCopy(text, successMessage);
        });
    } else {
        fallbackCopy(text, successMessage);
    }
}

function fallbackCopy(text, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast(successMessage, 'success');
}

// Global scope functions for HTML onclick attributes
window.copyPhone = function () {
    const phone = '17698312678';
    copyToClipboard(phone, '电话号码已复制: ' + phone);
}

window.copyEmail = function () {
    const email = 'czhua110@outlook.com';
    copyToClipboard(email, '邮箱已复制: ' + email);
}

window.copyPhoneAndShowContact = function () {
    const phone = '17698312678';
    copyToClipboard(phone, '手机号已复制，推荐微信联系');
}


// -----------------------------------------
// 2. Chat Logic (Simple Header Ticker)
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const chatSim = document.getElementById('chatSim');
    const msgs = [
        { t: "SYS: USER DETECTED", c: "text-gray-500" },
        { t: "AI: 分析特征: 二次元爱好者", c: "text-neon" },
        { t: "AI: 建议话术: 'EVA是神作吗?'", c: "text-acid font-bold" }
    ];
    if (chatSim) {
        let i = 0;
        setInterval(() => {
            chatSim.innerHTML = '';
            for (let j = 0; j <= i; j++) {
                chatSim.innerHTML += `<div class="${msgs[j].c} animate-pulse">${msgs[j].t}</div>`;
            }
            i = (i + 1) % msgs.length;
        }, 1500);
    }
});


// -----------------------------------------
// 3. Audio & Smoke System
// -----------------------------------------
class SmokeSystem {
    constructor() {
        this.container = document.getElementById('smoke-container');
        this.isActive = false;
        this.currentIntensity = 0; // 0 to 1
        if (this.container) this.loop();
    }

    setMode(active) {
        this.isActive = active;
    }

    spawn(intensity) {
        if (!this.container) return;

        const p = document.createElement('div');
        p.classList.add('smoke-particle');

        // Random Physics
        const size = 15 + Math.random() * 20; // Big puffs
        const duration = 2.5 + Math.random() * 1.5;
        const drift = 30 + Math.random() * 50; // Biased RIGHT for diagonal float

        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.animationDuration = `${duration}s`;
        p.style.setProperty('--drift', `${drift}px`);
        p.style.left = `0px`; // All spawn from center

        this.container.appendChild(p);

        // Cleanup
        setTimeout(() => p.remove(), duration * 1000);
    }

    loop() {
        // BREATHING RHYTHM
        const now = Date.now();
        const breathCycle = (Math.sin(now / 400) + 1) / 2; // 0 to 1 oscillation

        // Target Intensity
        let targetIntensity = 0.1;
        if (this.isActive) {
            targetIntensity = 0.3 + (breathCycle * 0.7);
        }

        // Smooth transition
        this.currentIntensity += (targetIntensity - this.currentIntensity) * 0.05;

        // Spawn Probability
        if (Math.random() < this.currentIntensity * 0.3) {
            this.spawn(this.currentIntensity);
        }

        requestAnimationFrame(() => this.loop());
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const audioBtn = document.getElementById('playAudioBtn');
    const audioComp = document.getElementById('companion-audio');
    const visualizer = document.getElementById('audio-visualizer-stream');
    const playIcon = document.getElementById('playIcon');

    // Init Smoke System
    const smokeSystem = new SmokeSystem();

    // Audio Play Button Logic
    if (audioBtn) {
        audioBtn.addEventListener('click', async function () {
            // Init Tone.js on first click
            if (window.Tone && Tone.context.state !== 'running') {
                await Tone.start();
            }

            // Simple Tone.js Feedback Sound - Tech Ping (Softer & Lower Volume)
            if (window.Tone) {
                // Use a MembraneSynth for a "UI Click/Ping" sound, simpler and less harsh than PolySynth
                const synth = new Tone.MembraneSynth({
                    pitchDecay: 0.05,
                    octaves: 10,
                    oscillator: { type: "sine" },
                    envelope: {
                        attack: 0.001,
                        decay: 0.4,
                        sustain: 0.01,
                        release: 1.4,
                        attackCurve: "exponential"
                    }
                }).toDestination();

                // Lower volume: -15dB
                synth.volume.value = -15;

                // Play a high-tech "blip"
                synth.triggerAttackRelease("C5", "32n");
            }

            // Animation
            const btn = this;
            btn.classList.add('animate-spin');
            setTimeout(() => btn.classList.remove('animate-spin'), 1000);

            // Toggle Audio
            if (audioComp) {
                if (audioComp.paused) {
                    audioComp.play();
                    if (playIcon) playIcon.textContent = 'pause';
                    if (visualizer) visualizer.classList.remove('hidden');
                    smokeSystem.setMode(true); // SMOKE ACTIVE
                } else {
                    audioComp.pause();
                    if (playIcon) playIcon.textContent = 'play_arrow';
                    if (visualizer) visualizer.classList.add('hidden');
                    smokeSystem.setMode(false); // SMOKE IDLE
                }
            }
        });
    }

    if (audioComp) {
        audioComp.addEventListener('ended', () => {
            if (playIcon) playIcon.textContent = 'play_arrow';
            if (visualizer) visualizer.classList.add('hidden');
            smokeSystem.setMode(false); // SMOKE IDLE
        });
    }
});


// -----------------------------------------
// 4. GSAP Animations (ScrollTrigger)
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn("GSAP or ScrollTrigger not loaded");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const containers = document.querySelectorAll("section, .project-block, .acid-card, .stat-item, footer, nav, .hero-text, .expansion-page");

    containers.forEach((container) => {
        // RESPONSIVE CONFIG
        const isMobile = window.innerWidth < 1024;

        // OPTIMIZATION: Disable Tilt on mobile (performance & touch conflict)
        if (isMobile && container.vanillaTilt) {
            container.vanillaTilt.destroy();
        }

        const config = {
            duration: isMobile ? 0.4 : 0.5,
            childDuration: isMobile ? 0.3 : 0.3,
            stagger: isMobile ? 0 : 0.05,         // No wave effect on mobile
            yOffset: isMobile ? 30 : 30,
            triggerStart: isMobile ? "top 95%" : "top bottom" // Trigger almost immediately
        };

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: config.triggerStart,
                end: "bottom top",
                toggleActions: "play none none none",
                fastScrollEnd: true,
                markers: false,
                onRefresh: (self) => {
                    if (self.progress === 1) {
                        self.animation.progress(1);
                    }
                }
            }
        });

        // Update: Allow ALL containers to fade in (since we added opacity-0 in HTML)
        const shouldAnimateContainer = true;

        if (shouldAnimateContainer) {
            tl.fromTo(container,
                { y: config.yOffset, opacity: 0 },
                { y: 0, opacity: 1, duration: config.duration, ease: "power3.out" }
            );
        }

        const allChildren = container.querySelectorAll("h1, h2, h3, h4, p, li, span, .text-acid, .font-mono, .tracking-widest, .material-symbols-outlined, img, .btn, hr");

        const validChildren = Array.from(allChildren).filter(child => {
            if (child === container) return false;
            // Exclusion logic
            if (child.closest('#chat-demo-container')) return false;
            if (child.closest('#bg-slogan')) return false;

            if (container.tagName === 'SECTION' || container.classList.contains('project-block') || container.classList.contains('expansion-page')) {
                if (child.closest('.acid-card') || child.closest('.stat-item')) return false;
                if (container.tagName === 'SECTION') {
                    if (child.closest('.project-block')) return false;
                    if (child.closest('.expansion-page')) return false;
                }
            }
            return true;
        });

        if (validChildren.length > 0) {
            tl.fromTo(validChildren,
                { y: config.yOffset, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: config.childDuration,
                    stagger: config.stagger,
                    ease: "power3.out",
                    clearProps: "transform"
                },
                shouldAnimateContainer ? "<0.1" : 0
            );
        }
    });

    // Breathing / Floating Animation for KEY VISUALS
    gsap.to(".acid-card img", {
        y: -6,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });
});


// -----------------------------------------
// 5. FLUID METAL SPHERE SCRIPT
// -----------------------------------------
(function () {
    // Wait for DOM
    document.addEventListener("DOMContentLoaded", () => {
        const container = document.getElementById('fluid-sphere-container');
        if (!container) return;

        if (typeof THREE === 'undefined') {
            console.warn("Three.js not loaded");
            return;
        }

        // 1. Setup Three.js
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 2. Geometry & Shader
        const geometry = new THREE.PlaneGeometry(2, 2);

        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            precision highp float;
            varying vec2 vUv;
            uniform float uTime;
            uniform vec2 uResolution;

            const float scale = 0.4;
            const float ax = 5.0;
            const float ay = 7.0;
            const float az = 9.0;
            const float aw = 13.0;
            const float bx = 1.0;
            const float by = 1.0;

            const vec3 color1 = vec3(1.0, 1.0, 1.0);
            const vec3 color2 = vec3(0.0, 0.0, 0.0);
            const vec3 color3 = vec3(0.0, 0.0, 0.0);
            const vec3 color4 = vec3(0.0, 0.0, 0.0);

            float cheapNoise(vec3 stp) {
                vec3 p = vec3(stp.xy, stp.z);
                vec4 a = vec4(ax, ay, az, aw);
                return mix(
                    sin(p.z + p.x * a.x + cos(p.x * a.x - p.z)) *
                    cos(p.z + p.y * a.y + cos(p.y * a.x + p.z)),
                    sin(1. + p.x * a.z + p.z + cos(p.y * a.w - p.z)) *
                    cos(1. + p.y * a.w + p.z + cos(p.x * a.x + p.z)),
                    .436
                );
            }

            void main() {
                vec2 aR = vec2(uResolution.x / uResolution.y, 1.);
                vec2 st = vUv * aR * scale;
                
                float S = sin(uTime * 0.005);
                float C = cos(uTime * 0.005);

                vec2 v1 = vec2(cheapNoise(vec3(st, 2.)), cheapNoise(vec3(st, 1.)));
                vec2 v2 = vec2(
                    cheapNoise(vec3(st + bx * v1 + vec2(C * 1.7, S * 9.2), 0.15 * uTime)),
                    cheapNoise(vec3(st + by * v1 + vec2(S * 8.3, C * 2.8), 0.126 * uTime))
                );
                float n = .5 + .5 * cheapNoise(vec3(st + v2, 0.));

                vec3 color = mix(color1, color2, clamp((n * n) * 8., 0.0, 1.0));
                color = mix(color, color3, clamp(length(v1), 0.0, 1.0));
                color = mix(color, color4, clamp(length(v2.x), 0.0, 1.0));

                color /= n * n + n * 7.;

                gl_FragColor = vec4(color, 1.);
            }
        `;

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) }
            },
            transparent: true,
            side: THREE.DoubleSide
        });

        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        camera.position.z = 3.5;

        // 3. Animation Loop
        let time = 0;
        const clock = new THREE.Clock();
        const mouse = new THREE.Vector2(0.5, 0.5);
        const targetMouse = new THREE.Vector2(0.5, 0.5);

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            time += delta * 0.2; // Slow Motion
            material.uniforms.uTime.value = time;

            mouse.x = THREE.MathUtils.lerp(mouse.x, targetMouse.x, 0.1);
            mouse.y = THREE.MathUtils.lerp(mouse.y, targetMouse.y, 0.1);
            material.uniforms.uMouse.value.copy(mouse);

            renderer.render(scene, camera);
        }
        animate();

        // 4. Interaction
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            targetMouse.x = (e.clientX - rect.left) / rect.width;
            targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
        });

        // 5. Responsive
        window.addEventListener('resize', () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            material.uniforms.uResolution.value.set(width, height);
        });
    });
})();


// -----------------------------------------
// 6. CHAT DEMO SCRIPT
// -----------------------------------------
(function () {
    document.addEventListener("DOMContentLoaded", () => {
        const root = document.getElementById('chat-demo-root');
        if (!root) return;

        const SCRIPT = [
            {
                phase: "ROUND_1",
                ai_cards: [
                    { raw_text: "Hi / 很高兴认识你", target_tags: [] },
                    { raw_text: "INTJ 去蹦迪？ / 估计别人在摇，你在分析 DJ 的换班逻辑吧 😏", target_tags: ["tag-intj", "tag-raver"], highlight: true }
                ],
                pick_index: 1
            },
            {
                phase: "PEER_REPLY",
                msgs: ["哈哈哈被你发现了", "我其实是在内心默默吐槽接歌不顺滑"],
                delay: 1500
            },
            {
                phase: "ROUND_2",
                ai_cards: [
                    { raw_text: "太真实了 / 有机会一起蹦迪啊", target_tags: [] },
                    { raw_text: "噫，难怪容易失眠 / 我蹦完了也是脑子嗡嗡的，根本睡不着", target_tags: ["tag-insomniac"], highlight: true }
                ],
                pick_index: 1
            }
        ];

        const stream = document.getElementById('sim-stream');
        const aiPanel = document.getElementById('sim-aiPanel');
        const cursor = document.getElementById('sim-cursor');
        const mask = document.getElementById('sim-mask');
        const tags = document.querySelectorAll('.sim-tag');

        const wait = ms => new Promise(r => setTimeout(r, ms));

        function resetTags() { tags.forEach(t => t.classList.remove('active')); }
        function highlightTags(ids) {
            resetTags();
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('active');
            });
        }

        async function sendBubbles(textRaw, isMe) {
            const parts = textRaw.split(' / ');
            const group = document.createElement('div');
            group.className = `sim-msg-group ${isMe ? 'me' : 'them'}`;
            stream.appendChild(group);

            for (let i = 0; i < parts.length; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'sim-bubble';
                bubble.innerText = parts[i];
                group.appendChild(bubble);

                requestAnimationFrame(() => {
                    bubble.classList.add('visible');
                    stream.scrollTop = stream.scrollHeight;
                });

                if (isMe && i < parts.length - 1) await wait(400);
                else if (!isMe) await wait(800);
            }
        }

        async function runSequence() {
            stream.innerHTML = '';
            aiPanel.innerHTML = '';
            resetTags();
            mask.style.opacity = 1;
            await wait(500);
            mask.style.opacity = 0;
            await wait(800);

            for (const step of SCRIPT) {
                if (!isVisible) throw 'paused';

                if (step.phase.includes("ROUND")) {
                    aiPanel.innerHTML = '';
                    step.ai_cards.forEach((d, i) => {
                        const card = document.createElement('div');
                        card.className = `sim-suggestion ${d.highlight ? 'highlight' : ''}`;
                        card.id = `sim-card-\${i}`;
                        card.innerText = d.raw_text;
                        aiPanel.appendChild(card);
                        setTimeout(() => card.classList.add('show'), i * 100);
                    });

                    await wait(800);
                    const targetData = step.ai_cards[step.pick_index];
                    if (targetData.target_tags) highlightTags(targetData.target_tags);

                    await wait(1000);
                    const targetCard = document.getElementById(`sim-card-\${step.pick_index}`);
                    if (targetCard) {
                        const rect = targetCard.getBoundingClientRect();
                        const rootRect = root.getBoundingClientRect();
                        cursor.style.top = (rect.top - rootRect.top + 20) + 'px';
                        cursor.style.left = (rect.left - rootRect.left + 150) + 'px';

                        await wait(600);
                        cursor.classList.add('click');
                        await wait(200);
                        cursor.classList.remove('click');
                    }

                    Array.from(aiPanel.children).forEach(c => c.classList.add('fade-out'));
                    await wait(300);
                    aiPanel.innerHTML = '';
                    resetTags();
                    cursor.style.top = '110%';

                    await sendBubbles(targetData.raw_text, true);

                } else if (step.phase === "PEER_REPLY") {
                    await wait(step.delay);
                    await sendBubbles(step.msgs.join(' / '), false);
                }
                await wait(800);
            }

            await wait(3000);
            runSequence();
        }

        let isVisible = false;
        let isRunning = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                isVisible = e.isIntersecting;
                if (isVisible && !isRunning) {
                    isRunning = true;
                    runSequence().catch(() => { isRunning = false; });
                }
            });
        }, { threshold: 0.2 });

        observer.observe(root);
    });
})();
