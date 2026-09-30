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

    // The hero background lives in js/hero.js
})();
