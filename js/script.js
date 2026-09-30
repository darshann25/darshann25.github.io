(function () {
    "use strict";

    var root = document.documentElement;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("js");

    document.getElementById("year").textContent = new Date().getFullYear();

    // Header: solid background once the page scrolls
    var header = document.querySelector(".site-header");
    function onScroll() {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Mobile navigation
    var toggle = document.querySelector(".nav-toggle");
    var links = document.getElementById("nav-links");

    function setMenu(open) {
        toggle.setAttribute("aria-expanded", String(open));
        links.classList.toggle("is-open", open);
    }
    toggle.addEventListener("click", function () {
        setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    links.addEventListener("click", function (e) {
        if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setMenu(false);
    });

    // Reveal on scroll + count-up metrics
    function countUp(el) {
        var end = parseInt(el.getAttribute("data-count"), 10);
        var start = performance.now();
        var duration = 1400;
        function tick(now) {
            var t = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(end * eased).toLocaleString("en-US");
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    var revealEls = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                entry.target.querySelectorAll("[data-count]").forEach(countUp);
                observer.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
        revealEls.forEach(function (el) { observer.observe(el); });
    }

    // Hero field: a quiet grid of "normal" points with an occasional flagged anomaly
    var canvas = document.querySelector(".hero-field");
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var styles = getComputedStyle(root);
    var dotRGB, signal;
    var points = [];
    var flagged = null;
    var width = 0, height = 0, dpr = 1;
    var running = false;
    var nextFlagAt = 0;

    function readColors() {
        dotRGB = styles.getPropertyValue("--field-dot").trim();
        signal = styles.getPropertyValue("--signal").trim();
    }

    function build() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var gap = width < 700 ? 30 : 36;
        points = [];
        for (var y = gap / 2; y < height; y += gap) {
            for (var x = gap / 2; x < width; x += gap) {
                points.push({ x: x, y: y, phase: Math.random() * Math.PI * 2, r: 1 + Math.random() * 0.6 });
            }
        }
        flagged = null;
    }

    function pickAnomaly(now) {
        var candidates = points.filter(function (p) {
            return p.x > width * 0.55 && p.x < width - 130 && p.y > 90 && p.y < height - 60;
        });
        if (!candidates.length) return;
        flagged = { p: candidates[Math.floor(Math.random() * candidates.length)], born: now, score: (0.94 + Math.random() * 0.059).toFixed(3) };
    }

    function draw(now) {
        ctx.clearRect(0, 0, width, height);
        var t = now / 1000;

        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            var dx = Math.sin(t * 0.6 + p.phase) * 1.6;
            var dy = Math.cos(t * 0.5 + p.phase * 1.3) * 1.6;
            var alpha = 0.16 + 0.1 * Math.sin(t * 0.8 + p.phase);
            ctx.fillStyle = "rgba(" + dotRGB + "," + alpha.toFixed(3) + ")";
            ctx.beginPath();
            ctx.arc(p.x + dx, p.y + dy, p.r, 0, Math.PI * 2);
            ctx.fill();
        }

        if (flagged) {
            var age = (now - flagged.born) / 1000;
            var life = 3.2;
            if (age > life) {
                flagged = null;
            } else {
                var fade = age < 0.3 ? age / 0.3 : age > life - 0.6 ? (life - age) / 0.6 : 1;
                var fp = flagged.p;
                var fx = fp.x + Math.sin(t * 0.6 + fp.phase) * 1.6;
                var fy = fp.y + Math.cos(t * 0.5 + fp.phase * 1.3) * 1.6;

                ctx.globalAlpha = fade;
                ctx.fillStyle = signal;
                ctx.beginPath();
                ctx.arc(fx, fy, 4, 0, Math.PI * 2);
                ctx.fill();

                var ring = (age % 1.6) / 1.6;
                ctx.strokeStyle = signal;
                ctx.globalAlpha = fade * (1 - ring) * 0.7;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(fx, fy, 6 + ring * 22, 0, Math.PI * 2);
                ctx.stroke();

                ctx.globalAlpha = fade;
                ctx.font = "500 11px 'Geist Mono', ui-monospace, monospace";
                ctx.fillText("flagged · " + flagged.score, fx + 14, fy - 10);
                ctx.globalAlpha = 1;
            }
        }
    }

    function loop(now) {
        if (!running) return;
        if (!flagged && now > nextFlagAt) {
            pickAnomaly(now);
            nextFlagAt = now + 4200 + Math.random() * 1800;
        }
        draw(now);
        requestAnimationFrame(loop);
    }

    function start() {
        if (running || reduceMotion) return;
        running = true;
        requestAnimationFrame(loop);
    }
    function stop() { running = false; }

    readColors();
    build();

    if (reduceMotion) {
        pickAnomaly(0);
        if (flagged) flagged.born = -1000;
        draw(0);
    } else {
        nextFlagAt = performance.now() + 1200;
        new IntersectionObserver(function (entries) {
            entries[0].isIntersecting ? start() : stop();
        }).observe(canvas);
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            build();
            if (reduceMotion) { pickAnomaly(0); if (flagged) flagged.born = -1000; draw(0); }
        }, 150);
    });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        styles = getComputedStyle(root);
        readColors();
        if (reduceMotion) draw(0);
    });
})();
