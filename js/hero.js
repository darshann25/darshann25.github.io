/* Hero background scenes.
   Every scene speaks the same visual language: faint ink for normal activity,
   the accent for model structure, and the coral signal only for detections.
   Pick one with <canvas data-scene="..."> or preview with ?hero=<name>:
     rotate    – cycle sequence → graph → segments: the next one on every page
                 load, and a crossfade to the next every 30s while visible
     dots      – quiet field with an occasional flagged anomaly (original)
     sequence  – login sessions streaming through a sequence model (ATO)
     graph     – account network with a phishing ring being detected
     segments  – High Compromise Value Account segmentation across
                 monetary, social and political pillars
   On phones (< 760px) scenes play in a band below the hero buttons instead of
   behind the text; the hero grows to make room (see .hero in styles.css). */
(function () {
    "use strict";

    var canvas = document.querySelector(".hero-field");
    if (!canvas || !canvas.getContext) return;

    var root = document.documentElement;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0;
    var C = {};
    var MONO = "500 11px 'Geist Mono', ui-monospace, monospace";

    /* Helpers ------------------------------------------------------------ */

    function readColors() {
        var s = getComputedStyle(root);
        C.ink = s.getPropertyValue("--field-dot").trim();
        C.accent = s.getPropertyValue("--accent").trim();
        C.signal = s.getPropertyValue("--signal").trim();
        C.muted = s.getPropertyValue("--muted").trim();
    }
    function ink(a) { return "rgba(" + C.ink + "," + a + ")"; }

    function rng(seed) {
        return function () {
            seed = (seed + 0x6D2B79F5) | 0;
            var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    function gauss(rand) {
        return Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
    }
    function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
    function ease(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
    function fadeWindow(t, start, end, edge) {
        return Math.min(ease((t - start) / edge), ease((end - t) / edge));
    }

    function dot(x, y, r, color, alpha) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    function ring(x, y, t, color, alpha) {
        var k = (t % 1.6) / 1.6;
        ctx.globalAlpha = alpha * (1 - k) * 0.7;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 6 + k * 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    function label(text, x, y, color, alpha, align) {
        ctx.font = MONO;
        var w = ctx.measureText(text).width;
        var left = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
        x += Math.max(0, 8 - left) - Math.max(0, left + w - (W - 8));
        ctx.textAlign = align || "left";
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
    }
    function line(x1, y1, x2, y2, color, alpha, width) {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = width || 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    // Where a scene lives: the right half on desktop, a band below the buttons on phones
    var actions = document.querySelector(".hero-actions");
    function region() {
        if (W >= 760) return { x0: W * 0.6, x1: W - 56, y0: 120, y1: H - 80, mobile: false };
        var top = actions
            ? actions.getBoundingClientRect().bottom - canvas.getBoundingClientRect().top + 64
            : H * 0.65;
        return { x0: 16, x1: W - 16, y0: Math.min(top, H - 200), y1: H - 28, mobile: true };
    }

    /* Scene: dots (original) ----------------------------------------------- */

    var dots = (function () {
        var points, R, PERIOD = 5.5, LIFE = 3.2;

        function build() {
            R = region();
            var rand = rng(3), gap = W < 700 ? 30 : 36;
            points = [];
            for (var y = gap / 2; y < H; y += gap) {
                for (var x = gap / 2; x < W; x += gap) {
                    points.push({ x: x, y: y, ph: rand() * Math.PI * 2, r: 1 + rand() * 0.6 });
                }
            }
        }

        function pos(p, t) {
            return [p.x + Math.sin(t * 0.6 + p.ph) * 1.6, p.y + Math.cos(t * 0.5 + p.ph * 1.3) * 1.6];
        }

        function draw(t) {
            for (var i = 0; i < points.length; i++) {
                var p = points[i], q = pos(p, t);
                dot(q[0], q[1], p.r, ink(1), 0.16 + 0.1 * Math.sin(t * 0.8 + p.ph));
            }

            var cycle = Math.floor(t / PERIOD), age = t - cycle * PERIOD - 1.2;
            if (age < 0 || age > LIFE) return;
            var rand = rng(cycle + 1);
            var candidates = points.filter(function (p) {
                return p.x > R.x0 + 20 && p.x < R.x1 - 130 && p.y > R.y0 && p.y < R.y1;
            });
            if (!candidates.length) return;
            var f = candidates[Math.floor(rand() * candidates.length)], q = pos(f, t);
            var a = fadeWindow(age, 0, LIFE, 0.4);
            dot(q[0], q[1], 4, C.signal, a);
            ring(q[0], q[1], age, C.signal, a);
            label("flagged · " + (0.94 + rand() * 0.059).toFixed(3), q[0] + 14, q[1] - 10, C.signal, a);
        }

        return { build: build, draw: draw, still: function () { return PERIOD + 2.4; } };
    })();

    /* Scene: sequence-based ATO detection on login journeys ------------------ */

    var sequence = (function () {
        var R, lanes, win;
        var SPEED = 42, GAP = 66, PERIOD = 5.2, HOLD = 3.4;
        var CHAIN = ["new device", "pwd reset", "email change", "2FA off"];

        function build() {
            R = region();
            var rand = rng(7), step = R.mobile ? 40 : 46;
            GAP = R.mobile ? 52 : 66;
            lanes = [];
            for (var y = R.y0 + 8; y < R.y1; y += step) {
                var span = R.x1 - R.x0 + 260, evs = [], x = rand() * 40;
                while (x < span) {
                    var r = rand();
                    evs.push({ o: x, kind: r < 0.68 ? 0 : r < 0.88 ? 1 : 2 });
                    x += 16 + rand() * 72;
                }
                lanes.push({ y: y, span: span, evs: evs });
            }
            var cx = R.mobile ? W * 0.5 : R.x0 + (R.x1 - R.x0) * 0.64;
            win = { l: cx - (R.mobile ? 96 : 130), r: cx + (R.mobile ? 96 : 130) };
        }

        function chains(t) {
            var travel = (R.x1 + 40 + 3 * GAP - (R.x0 - 160)) / SPEED;
            var out = [];
            if (!lanes.length) return out;
            for (var k = Math.max(0, Math.floor((t - travel) / PERIOD)); k <= Math.floor(t / PERIOD); k++) {
                var spawn = k * PERIOD;
                if (t < spawn) continue;
                var rand = rng(k * 131 + 17);
                var lane = lanes[Math.floor(rand() * lanes.length)];
                var head = R.x1 + 40 - (t - spawn) * SPEED;
                var detectAt = spawn + (R.x1 + 40 + 3 * GAP - win.r) / SPEED;
                out.push({
                    lane: lane, head: head, tail: head + 3 * GAP,
                    a: fadeWindow(t, detectAt, detectAt + HOLD, 0.45),
                    since: t - detectAt,
                    score: (0.95 + rand() * 0.049).toFixed(2)
                });
            }
            return out;
        }

        function draw(t) {
            var left = R.x0 - 160, right = R.x1 + 40;
            var live = chains(t);

            // model window
            ctx.globalAlpha = 0.035;
            ctx.fillStyle = C.accent;
            ctx.fillRect(win.l, R.y0 - 14, win.r - win.l, R.y1 - R.y0 + 6);
            ctx.globalAlpha = 1;
            ctx.setLineDash([3, 5]);
            line(win.l, R.y0 - 14, win.l, R.y1 - 8, C.accent, 0.35);
            line(win.r, R.y0 - 14, win.r, R.y1 - 8, C.accent, 0.35);
            ctx.setLineDash([]);
            label("sequence model · read window", win.l, R.y0 - 24, C.accent, 0.85);

            // login events streaming right → left (right edge is "now")
            for (var i = 0; i < lanes.length; i++) {
                var lane = lanes[i];
                line(left, lane.y, right, lane.y, ink(1), 0.06);

                var busy = live.filter(function (c) { return c.lane === lane; });
                for (var j = 0; j < lane.evs.length; j++) {
                    var e = lane.evs[j];
                    var x = left + (((e.o - t * SPEED) % lane.span) + lane.span) % lane.span;
                    if (x > right) continue;
                    if (busy.some(function (c) { return x > c.head - 16 && x < c.tail + (c.a > 0 ? 120 : 16); })) continue;
                    var inWin = x > win.l && x < win.r ? 0.14 : 0;
                    if (e.kind === 0) {
                        dot(x, lane.y, 1.7, ink(1), 0.3 + inWin);
                    } else if (e.kind === 1) {
                        ctx.globalAlpha = 0.24 + inWin;
                        ctx.fillStyle = ink(1);
                        ctx.fillRect(x - 1.8, lane.y - 1.8, 3.6, 3.6);
                        ctx.globalAlpha = 1;
                    } else {
                        line(x, lane.y - 4, x, lane.y + 4, ink(1), 0.26 + inWin);
                    }
                }
            }

            // account-takeover chains hidden in the stream
            live.forEach(function (c) {
                var y = c.lane.y, k;
                for (k = 0; k < 4; k++) dot(c.head + k * GAP, y, 1.9, ink(1), 0.34 * (1 - c.a));
                if (c.a <= 0) return;

                line(c.head, y, c.tail, y, C.signal, 0.7 * c.a, 1.25);
                for (k = 0; k < 4; k++) {
                    var x = c.head + k * GAP;
                    dot(x, y, 3.4, C.signal, c.a);
                    label(CHAIN[k], x, k % 2 ? y + 19 : y - 11, C.signal, 0.9 * c.a, "center");
                }
                ring(c.tail, y, Math.max(0, c.since), C.signal, c.a);
                if (R.mobile) label("ATO · p " + c.score, (c.head + c.tail) / 2, y + 38, C.signal, c.a, "center");
                else label("ATO · p " + c.score, c.tail + 14, y + 4, C.signal, c.a);
            });
        }

        function still() {
            var detectAt = PERIOD + (R.x1 + 40 + 3 * GAP - win.r) / SPEED;
            return detectAt + 1.2;
        }

        // start just before the first chain reaches the window, so visitors see a detection right away
        return { build: build, draw: draw, still: still, lead: function () { return still() - 2.2; } };
    })();

    /* Scene: graph-based phishing network detection ------------------------- */

    var graph = (function () {
        var R, nodes, edges, rings;
        var PERIOD = 6.6;

        function build() {
            R = region();
            var rand = rng(11);
            var sx = R.x1 - R.x0, sy = R.y1 - R.y0;
            var clusters = [];
            var count = R.mobile ? 4 : 6;
            for (var c = 0; c < count; c++) {
                clusters.push({
                    x: R.x0 + sx * (0.12 + 0.76 * rand()),
                    y: R.y0 + sy * (0.1 + 0.8 * ((c + rand()) / count)),
                    members: []
                });
            }

            nodes = [];
            edges = [];
            clusters.forEach(function (cl, ci) {
                var n = 9 + Math.floor(rand() * 7), sd = Math.min(sx, sy) * 0.085;
                for (var i = 0; i < n; i++) {
                    var node = {
                        x: clamp(cl.x + gauss(rand) * sd * 1.3, R.x0, R.x1),
                        y: clamp(cl.y + gauss(rand) * sd, R.y0, R.y1),
                        ph: rand() * Math.PI * 2, c: ci
                    };
                    cl.members.push(nodes.length);
                    nodes.push(node);
                }
            });

            function link(a, b, ringEdge) {
                if (a === b) return;
                for (var i = 0; i < edges.length; i++) {
                    var e = edges[i];
                    if ((e.a === a && e.b === b) || (e.a === b && e.b === a)) return;
                }
                edges.push({ a: a, b: b, ring: !!ringEdge });
            }

            // each node to its two nearest neighbours in the same community
            clusters.forEach(function (cl) {
                cl.members.forEach(function (i) {
                    cl.members
                        .filter(function (j) { return j !== i; })
                        .sort(function (p, q) {
                            return dist(nodes[i], nodes[p]) - dist(nodes[i], nodes[q]);
                        })
                        .slice(0, 2)
                        .forEach(function (j) { link(i, j); });
                });
            });
            // a few bridges between neighbouring communities only
            for (var k = 0; k < count * 3; k++) {
                var a = Math.floor(rand() * nodes.length), b = Math.floor(rand() * nodes.length);
                if (nodes[a].c !== nodes[b].c && dist(nodes[a], nodes[b]) < Math.min(sx, sy) * 0.3) link(a, b);
            }

            // phishing hubs fanning out to victims across two communities
            rings = [];
            for (var r = 0; r < Math.min(3, count); r++) {
                var home = clusters[(r * 2) % count], other = clusters[(r * 2 + 1) % count];
                var hub = nodes.length;
                nodes.push({
                    x: (home.x * 0.6 + other.x * 0.4), y: (home.y * 0.6 + other.y * 0.4),
                    ph: rand() * Math.PI * 2, hub: true
                });
                var pool = home.members.concat(other.members).sort(function () { return rand() - 0.5; });
                var victims = pool.slice(0, 7 + Math.floor(rand() * 5));
                victims.sort(function (p, q) { return dist(nodes[hub], nodes[p]) - dist(nodes[hub], nodes[q]); });
                victims.forEach(function (v) { link(hub, v, true); });
                rings.push({ hub: hub, victims: victims });
            }
        }

        function dist(p, q) { return Math.hypot(p.x - q.x, p.y - q.y); }

        function pos(n, t) {
            return [n.x + Math.sin(t * 0.45 + n.ph) * 2.2, n.y + Math.cos(t * 0.38 + n.ph * 1.7) * 2.2];
        }

        function draw(t) {
            var cycle = Math.floor(t / PERIOD), tau = t - cycle * PERIOD;
            var active = rings[cycle % rings.length];
            var fade = fadeWindow(tau, 0.3, PERIOD - 0.5, 0.6);
            var P = nodes.map(function (n) { return pos(n, t); });

            edges.forEach(function (e) {
                line(P[e.a][0], P[e.a][1], P[e.b][0], P[e.b][1], ink(1), e.ring ? 0.13 : 0.1);
            });
            nodes.forEach(function (n, i) {
                dot(P[i][0], P[i][1], n.hub ? 2.6 : 2, ink(1), n.hub ? 0.45 : 0.34);
            });

            var h = P[active.hub];
            var reached = 0;
            active.victims.forEach(function (v, i) {
                var p = ease((tau - 0.9 - i * 0.11) / 0.55);
                if (p <= 0) return;
                var x = h[0] + (P[v][0] - h[0]) * p, y = h[1] + (P[v][1] - h[1]) * p;
                line(h[0], h[1], x, y, C.signal, 0.75 * fade, 1.2);
                if (p >= 1) {
                    reached++;
                    dot(P[v][0], P[v][1], 3, C.signal, fade);
                }
            });

            dot(h[0], h[1], 4.2, C.signal, fade);
            ring(h[0], h[1], tau, C.signal, fade);
            if (reached > 0) {
                var text = "phishing ring · " + reached + " accounts";
                if (R.mobile) {
                    // below the whole ring, so it never crosses its own edges
                    var low = Math.max.apply(null, active.victims.map(function (v) { return P[v][1]; }));
                    label(text, h[0], Math.min(Math.max(h[1], low) + 22, R.y1 + 16), C.signal, fade, "center");
                } else {
                    var flip = h[0] > R.x0 + (R.x1 - R.x0) * 0.6;
                    label(text, h[0] + (flip ? -14 : 14), h[1] - 12, C.signal, fade, flip ? "right" : "left");
                }
            }
        }

        return { build: build, draw: draw, still: function () { return 3.6; } };
    })();

    /* Scene: High Compromise Value Account segmentation --------------------- */

    var segments = (function () {
        var R, c, rad, accounts, cutoff1, cutoff5, highlight;
        var PERIOD = 9.5;
        var PILLARS = ["MONETARY", "SOCIAL", "POLITICAL"];
        var ANGLES = [-90, 30, 150].map(function (d) { return d * Math.PI / 180; });

        function build() {
            R = region();
            var rand = rng(23);
            if (R.mobile) {
                c = { x: W / 2, y: (R.y0 + R.y1) / 2 - 10 };
                rad = Math.min((R.y1 - R.y0) / 2 - 42, W * 0.27);
            } else {
                c = { x: R.x0 + (R.x1 - R.x0) * 0.52, y: (R.y0 + R.y1) / 2 };
                rad = Math.min((R.y1 - R.y0) * 0.4, (R.x1 - R.x0) * 0.36);
            }

            accounts = [];
            var n = R.mobile ? 260 : 420;
            for (var i = 0; i < n; i++) {
                var s = [Math.pow(rand(), 3.2), Math.pow(rand(), 3.6), Math.pow(rand(), 4)];
                var order = [0, 1, 2].sort(function (a, b) { return s[b] - s[a]; });
                var dom = order[0], sec = order[1];
                var toward = ((ANGLES[sec] - ANGLES[dom] + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
                var ang = ANGLES[dom] + Math.sign(toward) * (s[sec] / s[dom]) * 0.9 + gauss(rand) * 0.12;
                var r = Math.min(1, s[dom] * 1.02) * rad;
                accounts.push({
                    x: c.x + Math.cos(ang) * r, y: c.y + Math.sin(ang) * r,
                    score: s[dom], multi: s[sec] > 0.6 && s[dom] > 0.6,
                    pillars: [PILLARS[dom], PILLARS[sec]], ph: rand() * Math.PI * 2
                });
            }
            var sorted = accounts.map(function (a) { return a.score; }).sort(function (a, b) { return b - a; });
            cutoff1 = sorted[Math.max(0, Math.round(n * 0.01) - 1)];
            cutoff5 = sorted[Math.round(n * 0.05) - 1];

            highlight = accounts
                .filter(function (a) { return a.multi && a.score >= cutoff5; })
                .sort(function (a, b) { return b.score - a.score; })[0] || null;
        }

        function threshold(tau) {
            if (tau < 2) return cutoff1;
            if (tau < 5) return cutoff1 + (cutoff5 - cutoff1) * ease((tau - 2) / 3);
            if (tau < 8.4) return cutoff5;
            return cutoff5 + (cutoff1 - cutoff5) * ease((tau - 8.4) / 1.1);
        }

        function draw(t) {
            var tau = t % PERIOD, th = threshold(tau);
            var covered = 0, i;

            [0.25, 0.5, 0.75, 1].forEach(function (k) {
                ctx.globalAlpha = 0.08;
                ctx.strokeStyle = ink(1);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(c.x, c.y, rad * k, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            });
            ANGLES.forEach(function (a, k) {
                line(c.x, c.y, c.x + Math.cos(a) * rad, c.y + Math.sin(a) * rad, ink(1), 0.14);
                var lx = c.x + Math.cos(a) * (rad + 20), ly = c.y + Math.sin(a) * (rad + 20) + 4;
                label(PILLARS[k], lx, ly, C.muted, 0.95, k === 0 ? "center" : k === 1 ? "left" : "right");
            });

            for (i = 0; i < accounts.length; i++) {
                var a = accounts[i];
                var x = a.x + Math.sin(t * 0.5 + a.ph) * 1.4, y = a.y + Math.cos(t * 0.4 + a.ph) * 1.4;
                if (a.score >= th) {
                    covered++;
                    var col = a.multi ? C.signal : C.accent;
                    dot(x, y, a.multi ? 3.2 : 2.7, col, 0.95);
                } else {
                    dot(x, y, 1.6, ink(1), 0.3);
                }
            }

            // coverage threshold
            var tr = th * 1.02 * rad;
            ctx.setLineDash([4, 5]);
            ctx.globalAlpha = 0.7;
            ctx.strokeStyle = C.accent;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(c.x, c.y, tr, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;

            var pct = (covered / accounts.length * 100).toFixed(1);
            label("HCVA coverage · " + pct + "% MAU", c.x, c.y + rad + (R.mobile ? 34 : 44), C.accent, 0.95, "center");

            if (highlight && highlight.score >= th) {
                var hx = highlight.x + Math.sin(t * 0.5 + highlight.ph) * 1.4;
                var hy = highlight.y + Math.cos(t * 0.4 + highlight.ph) * 1.4;
                var out = Math.atan2(hy - c.y, hx - c.x), ox = Math.cos(out);
                var text = highlight.pillars[0].toLowerCase() + " × " + highlight.pillars[1].toLowerCase();
                ring(hx, hy, t, C.signal, 1);
                if (Math.sin(out) > 0.5) {
                    // lower half: beside the dot, clear of the coverage label underneath
                    var side = hx >= c.x ? 1 : -1;
                    label(text, hx + side * 16, hy + 4, C.signal, 0.95, side > 0 ? "left" : "right");
                } else {
                    label(text, hx + ox * 18, hy + Math.sin(out) * 18 + 4,
                          C.signal, 0.95, ox > 0.25 ? "left" : ox < -0.25 ? "right" : "center");
                }
            }
        }

        return { build: build, draw: draw, still: function () { return 6.5; } };
    })();

    /* Runner -------------------------------------------------------------- */

    var scenes = { dots: dots, sequence: sequence, graph: graph, segments: segments };
    var ROTATION = ["sequence", "graph", "segments"];
    var ROTATE_EVERY = 30000, FADE = 700, STORE_KEY = "hero-scene";

    var requested = null;
    try { requested = new URLSearchParams(location.search).get("hero"); } catch (e) {}
    var setting = canvas.getAttribute("data-scene");
    var rotating = !scenes[requested] && setting === "rotate";

    // Rotation position is a per-visitor convenience; storage may be unavailable
    function remember(name) {
        try { localStorage.setItem(STORE_KEY, name); } catch (e) {}
    }
    function nextAfter(name) {
        var i = ROTATION.indexOf(name);
        return i < 0 ? ROTATION[Math.floor(Math.random() * ROTATION.length)] : ROTATION[(i + 1) % ROTATION.length];
    }

    var current;
    if (scenes[requested]) {
        current = requested;
    } else if (rotating) {
        var last = null;
        try { last = localStorage.getItem(STORE_KEY); } catch (e) {}
        current = nextAfter(last);
        remember(current);
    } else {
        current = scenes[setting] ? setting : "dots";
    }
    var scene = scenes[current];

    var running = false, t0 = performance.now();

    function restartClock() {
        t0 = performance.now() - (scene.lead ? scene.lead() * 1000 : 0);
    }

    function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = canvas.clientWidth;
        H = canvas.clientHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        scene = scenes[current];
        scene.build();
    }

    // Crossfade to the next scene in the rotation
    function advance() {
        if (!running) return;
        canvas.classList.add("is-swapping");
        setTimeout(function () {
            current = nextAfter(current);
            remember(current);
            scene = scenes[current];
            scene.build();
            restartClock();
            canvas.classList.remove("is-swapping");
        }, FADE);
    }

    function render(t) {
        ctx.clearRect(0, 0, W, H);
        scene.draw(t);
    }

    function loop(now) {
        if (!running) return;
        // rAF timestamps can predate t0 by a frame; scenes assume t >= 0
        render(Math.max(0, (now - t0) / 1000));
        requestAnimationFrame(loop);
    }

    readColors();
    resize();
    restartClock();

    if (reduceMotion) {
        render(scene.still());
    } else {
        new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting && !running) {
                running = true;
                requestAnimationFrame(loop);
            } else if (!entries[0].isIntersecting) {
                running = false;
            }
        }).observe(canvas);
        if (rotating) setInterval(advance, ROTATE_EVERY);
    }

    var resizeTimer;
    function scheduleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resize();
            if (reduceMotion) render(scene.still());
        }, 150);
    }
    if ("ResizeObserver" in window) new ResizeObserver(scheduleResize).observe(canvas);
    else window.addEventListener("resize", scheduleResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleResize);

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        readColors();
        if (reduceMotion) render(scene.still());
    });
})();
