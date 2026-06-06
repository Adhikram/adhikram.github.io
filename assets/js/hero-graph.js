(function () {
    const hero = document.getElementById('hero');
    const canvas = document.getElementById('hero-graph-canvas');
    const dataEl = document.getElementById('hero-graph-data');

    if (!hero || !canvas || !dataEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobileQuery = window.matchMedia('(max-width: 768px)');

    function isMobileView() {
        return mobileQuery.matches;
    }

    let clusters;
    try {
        clusters = JSON.parse(dataEl.textContent);
    } catch {
        return;
    }

    const ctx = canvas.getContext('2d');
    const COLORS = {
        node: 'rgba(201, 168, 76, 0.55)',
        nodeActive: 'rgba(201, 168, 76, 0.95)',
        line: 'rgba(201, 168, 76, 0.22)',
        lineActive: 'rgba(201, 168, 76, 0.55)',
        outcome: '#C9A84C',
        outcomeGlow: 'rgba(201, 168, 76, 0.35)',
        text: 'rgba(156, 148, 128, 0.65)',
        textActive: 'rgba(232, 228, 218, 0.9)',
    };

    const PHASE = {
        DRIFT: 'drift',
        GATHER: 'gather',
        CONNECT: 'connect',
        SYNTHESIZE: 'synthesize',
        HOLD: 'hold',
    };

    const timings = { drift: 1800, gather: 2000, connect: 1200, synthesize: 2200, hold: 2800 };

    const backdrop = document.getElementById('hero-cluster-backdrop');
    const detailPanel = document.getElementById('hero-cluster-detail');
    const backBtn = document.getElementById('hero-cluster-back');
    const kickerEl = document.getElementById('hero-cluster-kicker');
    const titleEl = document.getElementById('hero-cluster-title');
    const outcomeEl = document.getElementById('hero-cluster-outcome');
    const nodesEl = document.getElementById('hero-cluster-nodes');
    const bodyEl = document.getElementById('hero-cluster-body');

    const clusterStates = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = null;
    let startTime = 0;
    let selectedState = null;
    let animationPaused = false;
    let interactionBound = false;

    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function measureText(text, size, weight, family) {
        ctx.font = `${weight} ${size}px ${family || 'Inter, system-ui, sans-serif'}`;
        return ctx.measureText(text).width;
    }

    const CLUSTER_SLOTS = {
        desktop: {
            'agentic-rag': { x: 0.1, y: 0.2 },
            outreach: { x: 0.9, y: 0.2 },
            'lead-generation': { x: 0.9, y: 0.36 },
            'broker-engine': { x: 0.1, y: 0.56 },
            'data-scale': { x: 0.9, y: 0.56 },
            'saas-growth': { x: 0.14, y: 0.78 },
            'user-scale': { x: 0.86, y: 0.78 },
        },
        mobile: {
            'agentic-rag': { x: 0.14, y: 0.14 },
            outreach: { x: 0.86, y: 0.14 },
            'lead-generation': { x: 0.86, y: 0.3 },
            'broker-engine': { x: 0.14, y: 0.46 },
            'data-scale': { x: 0.86, y: 0.46 },
            'saas-growth': { x: 0.18, y: 0.68 },
            'user-scale': { x: 0.82, y: 0.68 },
        },
    };

    const DEAD_ZONE = { cx: 0.5, cy: 0.46, rx: 0.26, ry: 0.32 };

    function clusterCenters() {
        const slots = CLUSTER_SLOTS.desktop;
        const fallbackX = 0.1;

        return clusters.map((cluster, i) => {
            const slot = slots[cluster.id] || { x: fallbackX, y: 0.2 + i * 0.1 };
            return { x: width * slot.x, y: height * slot.y };
        });
    }

    function repelFromDeadZone(x, y) {
        const cx = width * DEAD_ZONE.cx;
        const cy = height * DEAD_ZONE.cy;
        const rx = width * DEAD_ZONE.rx;
        const ry = height * DEAD_ZONE.ry;
        const dx = x - cx;
        const dy = y - cy;
        const norm = (dx / rx) ** 2 + (dy / ry) ** 2;

        if (norm >= 1) return { x, y };

        const scale = 1.08 / Math.sqrt(norm || 0.001);
        return { x: cx + dx * scale, y: cy + dy * scale };
    }

    function clampNode(node) {
        const pos = repelFromDeadZone(node.x, node.y);
        node.x = Math.min(Math.max(pos.x, 20), width - 20);
        node.y = Math.min(Math.max(pos.y, 20), height - 20);
    }

    function ringFor(cluster) {
        const base = 62;
        return base + Math.min(cluster.nodes.length, 6) * 2;
    }

    function spawnClusterState(cluster, index, center) {
        const spread = 52;
        const nodes = cluster.nodes.map((label) => ({
            label,
            x: center.x + rand(-spread, spread),
            y: center.y + rand(-spread, spread),
            vx: rand(-0.14, 0.14),
            vy: rand(-0.14, 0.14),
            targetX: center.x,
            targetY: center.y,
            pulse: rand(0, Math.PI * 2),
            radius: 3.5,
        }));

        return {
            data: cluster,
            center,
            phase: PHASE.DRIFT,
            phaseStart: startTime + index * 420,
            outcomePulse: 0,
            nodes,
        };
    }

    function layoutRing(state) {
        const ring = ringFor(state.data);
        state.nodes.forEach((node, i) => {
            const angle = (i / state.nodes.length) * Math.PI * 2 - Math.PI / 2;
            node.targetX = state.center.x + Math.cos(angle) * ring;
            node.targetY = state.center.y + Math.sin(angle) * ring;
        });
    }

    function initClusters() {
        clusterStates.length = 0;
        startTime = performance.now();
        const centers = clusterCenters();

        clusters.forEach((cluster, i) => {
            clusterStates.push(spawnClusterState(cluster, i, centers[i]));
        });
    }

    function resize() {
        const rect = hero.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (!clusterStates.length) {
            initClusters();
            return;
        }

        const centers = clusterCenters();
        clusterStates.forEach((state, i) => {
            const old = state.center;
            const next = centers[i];
            const dx = next.x - old.x;
            const dy = next.y - old.y;
            state.center = next;
            state.nodes.forEach((node) => {
                node.x += dx;
                node.y += dy;
                node.targetX += dx;
                node.targetY += dy;
            });
        });
    }

    function advanceCluster(state, now) {
        const elapsed = now - state.phaseStart;
        const order = [PHASE.DRIFT, PHASE.GATHER, PHASE.CONNECT, PHASE.SYNTHESIZE, PHASE.HOLD];

        if (elapsed < timings[state.phase]) return;

        const next = order[(order.indexOf(state.phase) + 1) % order.length];
        state.phase = next;
        state.phaseStart = now;

        if (next === PHASE.GATHER) layoutRing(state);
        if (next === PHASE.SYNTHESIZE) state.outcomePulse = 0;
        if (next === PHASE.DRIFT) {
            state.outcomePulse = 0;
            const spread = 52;
            state.nodes.forEach((node) => {
                node.vx = rand(-0.14, 0.14);
                node.vy = rand(-0.14, 0.14);
                node.targetX = state.center.x + rand(-spread, spread);
                node.targetY = state.center.y + rand(-spread, spread);
            });
        }
    }

    function driftLocal(node, center, speed) {
        node.pulse += 0.025;
        node.x += node.vx * speed;
        node.y += node.vy * speed;

        const dx = node.x - center.x;
        const dy = node.y - center.y;
        const maxR = 78;
        const dist = Math.hypot(dx, dy);
        if (dist > maxR) {
            node.vx -= dx * 0.0008;
            node.vy -= dy * 0.0008;
        }

        node.x = lerp(node.x, center.x + dx * 0.98, 0.02);
        node.y = lerp(node.y, center.y + dy * 0.98, 0.02);
        clampNode(node);
    }

    function updateCluster(state, now) {
        const elapsed = now - state.phaseStart;

        switch (state.phase) {
            case PHASE.DRIFT:
                state.nodes.forEach((node) => {
                    driftLocal(node, state.center, 1);
                    node.x = lerp(node.x, node.targetX, 0.03);
                    node.y = lerp(node.y, node.targetY, 0.03);
                });
                break;

            case PHASE.GATHER: {
                const t = easeOutCubic(Math.min(1, elapsed / timings.gather));
                state.nodes.forEach((node) => {
                    node.x = lerp(node.x, node.targetX, 0.05 + t * 0.07);
                    node.y = lerp(node.y, node.targetY, 0.05 + t * 0.07);
                    node.pulse += 0.04;
                    clampNode(node);
                });
                break;
            }

            case PHASE.CONNECT:
                layoutRing(state);
                state.nodes.forEach((node) => {
                    node.x = lerp(node.x, node.targetX, 0.09);
                    node.y = lerp(node.y, node.targetY, 0.09);
                    node.pulse += 0.05;
                    clampNode(node);
                });
                break;

            case PHASE.SYNTHESIZE: {
                const t = easeInOutQuad(Math.min(1, elapsed / timings.synthesize));
                state.outcomePulse = t;
                const pull = 0.07 + t * 0.16;
                state.nodes.forEach((node) => {
                    node.x = lerp(node.x, state.center.x, pull);
                    node.y = lerp(node.y, state.center.y, pull);
                    node.pulse += 0.06;
                    clampNode(node);
                });
                break;
            }

            case PHASE.HOLD:
                state.outcomePulse = 1;
                state.nodes.forEach((node) => {
                    const breathe = Math.sin(node.pulse) * 3;
                    const dx = node.x - state.center.x;
                    const dy = node.y - state.center.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    const orbit = 14;
                    node.x = state.center.x + (dx / dist) * (orbit + breathe);
                    node.y = state.center.y + (dy / dist) * (orbit + breathe);
                    node.pulse += 0.03;
                    clampNode(node);
                });
                break;

            default:
                break;
        }
    }

    function connectionStrength(state) {
        if (state.phase === PHASE.CONNECT) {
            return easeOutCubic(Math.min(1, (performance.now() - state.phaseStart) / timings.connect));
        }
        if (state.phase === PHASE.SYNTHESIZE || state.phase === PHASE.HOLD) return 1;
        if (state.phase === PHASE.GATHER) {
            return easeOutCubic(Math.min(1, (performance.now() - state.phaseStart) / timings.gather)) * 0.45;
        }
        return 0;
    }

    function drawConnections(state, strength) {
        const members = state.nodes;
        if (members.length < 2 || strength <= 0.05) return;

        ctx.lineWidth = 1;
        for (let i = 0; i < members.length; i += 1) {
            for (let j = i + 1; j < members.length; j += 1) {
                const a = members[i];
                const b = members[j];
                ctx.strokeStyle = strength > 0.5 ? COLORS.lineActive : COLORS.line;
                ctx.globalAlpha = 0.2 + strength * 0.5;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;
    }

    function drawNode(node, active) {
        const glow = active ? 6 + Math.sin(node.pulse) * 2 : 3 + Math.sin(node.pulse) * 1.5;
        const r = active ? node.radius + 1 : node.radius;

        if (active) {
            ctx.beginPath();
            ctx.fillStyle = COLORS.outcomeGlow;
            ctx.arc(node.x, node.y, glow, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = active ? COLORS.nodeActive : COLORS.node;
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();

        const fontSize = active ? 9 : 8;
        const weight = active ? '600' : '500';
        ctx.font = `${weight} ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = active ? COLORS.textActive : COLORS.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y - 12);
    }

    function drawOutcome(state) {
        if (state.outcomePulse <= 0) return;

        const text = state.data.outcome;
        const size = 14;
        const alpha = state.outcomePulse;
        const scale = 0.86 + state.outcomePulse * 0.14;

        ctx.save();
        ctx.translate(state.center.x, state.center.y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;

        const padX = 14;
        const padY = 7;
        const textW = measureText(text, size, '700', '"Playfair Display", Georgia, serif');
        const boxW = textW + padX * 2;
        const boxH = size + padY * 2;

        ctx.fillStyle = COLORS.outcomeGlow;
        ctx.beginPath();
        ctx.roundRect(-boxW / 2 - 4, -boxH / 2 - 4, boxW + 8, boxH + 8, 10);
        ctx.fill();

        ctx.fillStyle = 'rgba(30, 29, 20, 0.86)';
        ctx.strokeStyle = COLORS.outcome;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = `700 ${size}px "Playfair Display", Georgia, serif`;
        ctx.fillStyle = COLORS.outcome;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 1);

        ctx.restore();
        ctx.globalAlpha = 1;
    }

    function updateHitRadius(state) {
        state.hitRadius = ringFor(state.data) + 48;
    }

    function getCanvasPoint(evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
        };
    }

    function hitTestCluster(x, y) {
        let match = null;
        let nearest = Infinity;

        clusterStates.forEach((state) => {
            updateHitRadius(state);
            let dist = Math.hypot(x - state.center.x, y - state.center.y);

            state.nodes.forEach((node) => {
                const nodeDist = Math.hypot(x - node.x, y - node.y);
                if (nodeDist < dist) dist = nodeDist;
            });

            if (dist <= state.hitRadius && dist < nearest) {
                nearest = dist;
                match = state;
            }
        });

        return match;
    }

    function openClusterDetail(state) {
        if (!detailPanel || !state) return;

        selectedState = state;
        animationPaused = true;
        hero.classList.add('cluster-detail-open');

        const data = state.data;
        if (kickerEl) kickerEl.textContent = 'Outcome';
        if (titleEl) titleEl.textContent = data.title || data.id;
        if (outcomeEl) outcomeEl.textContent = data.outcome;
        if (bodyEl) bodyEl.textContent = data.detail || '';

        if (nodesEl) {
            nodesEl.innerHTML = '';
            data.nodes.forEach((label) => {
                const tag = document.createElement('span');
                tag.className = 'hero-cluster-node-tag';
                tag.textContent = label;
                nodesEl.appendChild(tag);
            });
        }

        detailPanel.classList.remove('is-left', 'is-right');
        detailPanel.classList.add(state.center.x < width / 2 ? 'is-left' : 'is-right');
        detailPanel.hidden = false;
        if (backdrop) backdrop.hidden = false;

        state.phase = PHASE.HOLD;
        state.outcomePulse = 1;
        layoutRing(state);
        draw();
    }

    function closeClusterDetail() {
        selectedState = null;
        animationPaused = false;
        hero.classList.remove('cluster-detail-open');
        if (detailPanel) detailPanel.hidden = true;
        if (backdrop) backdrop.hidden = true;
        canvas.classList.remove('is-hover');
        draw();
    }

    function teardownGraph() {
        stop();
        canvas.style.display = 'none';
        closeClusterDetail();
    }

    function bindInteraction() {
        if (interactionBound) return;
        interactionBound = true;

        if (backdrop) {
            backdrop.addEventListener('click', closeClusterDetail);
        }

        canvas.addEventListener('mousemove', (evt) => {
            if (animationPaused) return;
            const { x, y } = getCanvasPoint(evt);
            canvas.classList.toggle('is-hover', Boolean(hitTestCluster(x, y)));
        });

        canvas.addEventListener('click', (evt) => {
            if (animationPaused) return;
            const { x, y } = getCanvasPoint(evt);
            const state = hitTestCluster(x, y);
            if (state) {
                evt.preventDefault();
                openClusterDetail(state);
                evt.stopPropagation();
            }
        });

        if (backBtn) {
            backBtn.addEventListener('click', closeClusterDetail);
        }

        document.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape' && animationPaused) {
                closeClusterDetail();
            }
        });
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        clusterStates.forEach((state) => {
            updateHitRadius(state);
            const dimmed = animationPaused && selectedState && state !== selectedState;
            const active = state.phase !== PHASE.DRIFT || (animationPaused && state === selectedState);

            ctx.save();
            ctx.globalAlpha = dimmed ? 0.18 : 1;

            const strength = connectionStrength(state);
            drawConnections(state, strength);
            state.nodes.forEach((node) => drawNode(node, active));

            if (state.phase === PHASE.SYNTHESIZE || state.phase === PHASE.HOLD) {
                drawOutcome(state);
            }

            if (animationPaused && state === selectedState) {
                ctx.strokeStyle = COLORS.outcome;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(state.center.x, state.center.y, state.hitRadius, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        });
    }

    function tick(now) {
        if (!animationPaused) {
            clusterStates.forEach((state) => {
                advanceCluster(state, now);
                updateCluster(state, now);
            });
        }
        draw();
        frameId = requestAnimationFrame(tick);
    }

    function drawStatic() {
        clusterStates.forEach((state) => {
            state.phase = PHASE.HOLD;
            state.outcomePulse = 0.85;
            layoutRing(state);
            state.nodes.forEach((node, i) => {
                const angle = (i / state.nodes.length) * Math.PI * 2 - Math.PI / 2;
                const orbit = 14;
                node.x = state.center.x + Math.cos(angle) * orbit;
                node.y = state.center.y + Math.sin(angle) * orbit;
            });
        });
        draw();
    }

    function start() {
        if (isMobileView()) {
            teardownGraph();
            return;
        }

        canvas.style.display = '';
        resize();
        initClusters();
        bindInteraction();

        if (prefersReducedMotion) {
            drawStatic();
            return;
        }

        frameId = requestAnimationFrame(tick);
    }

    function stop() {
        if (frameId) cancelAnimationFrame(frameId);
    }

    window.addEventListener('resize', () => {
        closeClusterDetail();
        stop();
        start();
    });

    mobileQuery.addEventListener('change', () => {
        closeClusterDetail();
        stop();
        start();
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(start);
    } else {
        start();
    }
})();
