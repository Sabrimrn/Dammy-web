// =====================================================================
// Setup
// =====================================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const navbar = document.getElementById('navbar');
const heroEl = document.querySelector('.hero');

// ===== Lenis: vloeiend, filmisch scrollen (desktop, gekoppeld aan GSAP) =====
let lenis = null;
if (window.Lenis && window.gsap && !reduceMotion && finePointer) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);
    }
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
}

// ===== Hero headline: woorden komen één voor één op, daarna de glans =====
const heroH1 = document.querySelector('.hero-headline');
if (heroH1) {
    const text = heroH1.textContent.trim();
    heroH1.innerHTML = text.split(/\s+/).map((w, i) => `<span class="hw" style="animation-delay:${0.2 + i * 0.07}s">${w}</span>`).join(' ');
    heroH1.classList.add('decoding', 'sheen');
}

// =====================================================================
// Navbar + mobile menu
// =====================================================================
const navSections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a:not(.btn-nav)');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

// Rol-effect: linktekst twee keer in een venster, bij hover schuift de bovenste weg
navAnchors.forEach(a => {
    const text = a.textContent.trim();
    a.innerHTML = `<span class="nav-roll"><span>${text}</span><span>${text}</span></span>`;
});

// Logo: letters één voor één in, daarna glans bij hover
const logoText = document.querySelector('.logo-text');
if (logoText) {
    const text = logoText.textContent;
    if (reduceMotion) {
        logoText.classList.add('sheen');
    } else {
        logoText.innerHTML = [...text].map((ch, i) => `<span class="lc" style="animation-delay:${0.1 + i * 0.06}s">${ch}</span>`).join('');
        setTimeout(() => { logoText.textContent = text; logoText.classList.add('sheen'); }, 1000);
    }
}

// Glijdende indicator onder de actieve (of gehoverde) link
const navIndicator = document.createElement('span');
navIndicator.className = 'nav-indicator';
navLinks.appendChild(navIndicator);
let activeAnchor = null;
function moveIndicator(a) {
    if (!a || window.innerWidth <= 768) { navIndicator.classList.remove('show'); return; }
    navIndicator.style.transform = `translateX(${a.offsetLeft + 10}px)`;
    navIndicator.style.width = `${Math.max(a.offsetWidth - 20, 0)}px`;
    navIndicator.classList.add('show');
}
navAnchors.forEach(a => a.addEventListener('mouseenter', () => moveIndicator(a)));
navLinks.addEventListener('mouseleave', () => moveIndicator(activeAnchor));

function updateActiveNav() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 60);

    let current = '';
    navSections.forEach(section => {
        const top = section.offsetTop - 120;
        if (scrollY >= top) current = section.getAttribute('id');
    });
    activeAnchor = null;
    navAnchors.forEach(a => {
        const isActive = a.getAttribute('href') === '#' + current;
        a.classList.toggle('active', isActive);
        if (isActive) activeAnchor = a;
    });
    if (!navLinks.matches(':hover')) moveIndicator(activeAnchor);
}
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// =====================================================================
// Reveal on scroll
// =====================================================================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Stagger: service cards (150ms each)
const cardStagger = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.service-card');
            cards.forEach((card, i) => {
                setTimeout(() => card.classList.add('visible'), 150 * i);
            });
            cardStagger.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
const servicesGrid = document.querySelector('.services-grid');
if (servicesGrid) cardStagger.observe(servicesGrid);

// =====================================================================
// Smooth scroll
// =====================================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href === '#hero' || href === '#') {
            if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const target = document.querySelector(href);
        if (!target) return;
        const navHeight = navbar.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        if (lenis) lenis.scrollTo(top, { duration: 1.4 }); else window.scrollTo({ top, behavior: 'smooth' });
    });
});

// =====================================================================
// Contact form
// =====================================================================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const span = btn.querySelector('span');
        const original = span.textContent;
        btn.disabled = true;
        span.textContent = 'Verzenden...';
        try {
            const data = Object.fromEntries(new FormData(contactForm).entries());
            const res = await fetch(contactForm.action, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
            span.textContent = res.ok ? 'Verstuurd!' : 'Er ging iets mis';
            if (res.ok) contactForm.reset();
        } catch {
            span.textContent = 'Geen verbinding';
        }
        setTimeout(() => { span.textContent = original; btn.disabled = false; }, 3500);
    });
}

// =====================================================================
// Motion layer
// =====================================================================

// ===== Scroll progress bar =====
const progressBar = document.getElementById('scroll-progress');
function updateProgress() {
    if (!progressBar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}

// ===== Hero film: full-screen 3D-scène, de camera beweegt op scroll (Three.js + GSAP) =====
let heroPinDistance = 0;
const hero3d = document.getElementById('hero-3d');
if (hero3d) {
    // Altijd bovenaan beginnen zodat de film vanaf het begin speelt, ook na een refresh
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const toTop = () => { window.scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true }); };
    toTop();
    // De browser herstelt de oude positie pas bij 'load', dus daarna nog een keer
    window.addEventListener('load', () => { toTop(); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
}

// Tagline typt zichzelf uit met een roze cursor; start pas als de tagline in beeld komt
let taglineStarted = false;
function startTagline() {
    if (taglineStarted) return;
    taglineStarted = true;
    const tagline = document.querySelector('.hero-tagline');
    if (!tagline || reduceMotion) return;
    const full = tagline.textContent;
    tagline.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    tagline.appendChild(cursor);
    let i = 0;
    setTimeout(function type() {
        if (i < full.length) {
            cursor.before(document.createTextNode(full[i++]));
            setTimeout(type, 16 + Math.random() * 28);
        } else {
            setTimeout(() => cursor.remove(), 3000);
        }
    }, 300);
}
if (!hero3d) startTagline();

function initHeroFilm(THREE) {
    if (!hero3d || !heroEl || !window.gsap) return;
    const LINES = window.THREE_LINES;
    const wrap = hero3d.parentElement;
    const phases = [...heroEl.querySelectorAll('.hero-phase')];
    const finalPhase = heroEl.querySelector('.hero-final');
    const heroLine = heroEl.querySelector('.hero-line');
    const indicator = heroEl.querySelector('.scroll-indicator');
    const isWide = window.innerWidth > 980;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const smooth = (x) => x * x * (3 - 2 * x);
    const lerp = (a, b, t) => a + (b - a) * t;

    // Kleuren uit het merkboek 3.1
    const ZAND = 0xF5F0E8, ROZE = 0xF7B2CF;

    const renderer = new THREE.WebGLRenderer({ canvas: hero3d, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    // Diepte: wat ver weg is lost op in zand
    scene.fog = new THREE.Fog(ZAND, 4, 14);
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);
    const root = new THREE.Group();
    scene.add(root);

    // ----- Voorbeeld-dashboards zonder cijfers, opgebouwd zoals echte software: kopregel, assen, legenda's, tabellen
    const CARD_DEFS = [
        { title: 'Verkoop', type: 'dash' },
        { title: 'Omzet per kanaal', type: 'line' },
        { title: 'Klanten', type: 'table' },
        { title: 'Datakoppelingen', type: 'flow' },
        { title: 'AI-assistent', type: 'chat' },
        { title: 'Bezetting', type: 'heat' },
        { title: 'Projecten', type: 'dash2' },
        { title: 'Verdeling per dienst', type: 'donut' },
        { title: 'Voorraad per locatie', type: 'bars' }
    ];
    const COUNT = isWide ? 9 : 6;
    const defs = CARD_DEFS.slice(0, COUNT);
    const INK = '#1A1410', MOCHA = '#474329', PINK = '#F7B2CF', ZANDC = '#F5F0E8', ZAND2 = '#ECE5D9';
    const inkA = (a) => `rgba(26, 20, 16, ${a})`;
    const mochaA = (a) => `rgba(71, 67, 41, ${a})`;
    const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    const roundRect = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
    const font = (g, w, s, f = 'DM Sans') => { g.font = `${w} ${s}px "${f}", sans-serif`; };
    const mono = (g, s) => { g.font = `500 ${s}px "JetBrains Mono", monospace`; };
    // Lijn door punten (0..1) binnen een kader
    const path = (g, pts, x0, x1, y0, y1) => {
        g.beginPath();
        pts.forEach((p, i) => { const x = x0 + (x1 - x0) * i / (pts.length - 1); const y = y1 - (y1 - y0) * p; i ? g.lineTo(x, y) : g.moveTo(x, y); });
    };
    // Assenstelsel: dunne rasterlijnen, streepjes op de y-as, maandlabels op de x-as
    const axes = (g, x0, x1, y0, y1, labels, rows = 4) => {
        g.lineWidth = 1.5;
        for (let i = 0; i <= rows; i++) {
            const y = y0 + (y1 - y0) * i / rows;
            g.strokeStyle = inkA(i === rows ? 0.18 : 0.07); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
            g.strokeStyle = inkA(0.25); g.beginPath(); g.moveTo(x0 - 8, y); g.lineTo(x0, y); g.stroke();
        }
        if (labels) {
            g.fillStyle = inkA(0.45); font(g, 400, 15); g.textAlign = 'center';
            labels.forEach((l, i) => g.fillText(l, x0 + (x1 - x0) * i / (labels.length - 1), y1 + 24));
            g.textAlign = 'left';
        }
    };
    const series = (g, pts, x0, x1, y0, y1, color, width = 2.5, fill = 0) => {
        if (fill) { path(g, pts, x0, x1, y0, y1); g.lineTo(x1, y1); g.lineTo(x0, y1); g.closePath(); g.fillStyle = fill; g.fill(); }
        g.strokeStyle = color; g.lineWidth = width; g.lineJoin = 'round'; g.lineCap = 'round'; path(g, pts, x0, x1, y0, y1); g.stroke();
    };
    const legend = (g, x, y, items) => {
        font(g, 400, 15); let cx = x;
        items.forEach(([name, color, dot]) => {
            g.fillStyle = color;
            if (dot) { g.beginPath(); g.arc(cx + 5, y - 5, 5, 0, Math.PI * 2); g.fill(); } else { roundRect(g, cx, y - 8, 14, 5, 2.5); g.fill(); }
            g.fillStyle = inkA(0.6); g.fillText(name, cx + 22, y);
            cx += 22 + g.measureText(name).width + 26;
        });
    };
    const pill = (g, x, y, text, dark = false) => {
        font(g, 500, 14); const w = g.measureText(text).width + 26;
        if (dark) { g.fillStyle = MOCHA; roundRect(g, x, y, w, 30, 15); g.fill(); g.fillStyle = ZANDC; }
        else { g.strokeStyle = inkA(0.16); g.lineWidth = 1.5; roundRect(g, x, y, w, 30, 15); g.stroke(); g.fillStyle = inkA(0.7); }
        g.fillText(text, x + 13, y + 20);
        return w;
    };
    // Kopregel van een paneel: titel links, periode-knoppen rechts, dunne lijn eronder
    const header = (g, W, title, pills = ['Laatste 30 dagen']) => {
        g.fillStyle = INK; font(g, 600, 26, 'Fraunces'); g.fillText(title, 56, 78);
        let x = W - 56;
        pills.slice().reverse().forEach((p, i) => { font(g, 500, 14); const w = g.measureText(p).width + 26; x -= w; pill(g, x, 50, p, i === 0 && pills.length > 1); x -= 10; });
        g.strokeStyle = inkA(0.08); g.lineWidth = 1.5; g.beginPath(); g.moveTo(56, 108); g.lineTo(W - 56, 108); g.stroke();
    };
    const sparkline = (g, x, y, w, h, pts, color) => series(g, pts, x, x + w, y, y + h, color, 2);
    const kpiTile = (g, x, y, w, h, label, pts, chip) => {
        g.fillStyle = '#fff'; g.strokeStyle = inkA(0.1); g.lineWidth = 1.5; roundRect(g, x, y, w, h, 14); g.fill(); g.stroke();
        g.fillStyle = MOCHA; mono(g, 12); g.fillText('// ' + label.toUpperCase(), x + 18, y + 28);
        sparkline(g, x + 18, y + 42, w - 36, h - 78, pts, INK);
        g.fillStyle = ZAND2; font(g, 500, 12); const cw = g.measureText(chip).width + 16; roundRect(g, x + 18, y + h - 30, cw, 20, 10); g.fill();
        g.fillStyle = MOCHA; g.fillText(chip, x + 26, y + h - 16);
    };
    const avatar = (g, x, y, r, i) => { g.fillStyle = [ZAND2, mochaA(0.35), inkA(0.18), mochaA(0.6)][i % 4]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
    const statusPill = (g, x, y, text, kind) => {
        font(g, 500, 13); const w = g.measureText(text).width + 34;
        g.fillStyle = kind === 'risk' ? 'rgba(247, 178, 207, 0.12)' : kind === 'ok' ? ZAND2 : inkA(0.05); roundRect(g, x, y - 13, w, 24, 12); g.fill();
        g.fillStyle = kind === 'risk' ? PINK : kind === 'ok' ? MOCHA : inkA(0.3); g.beginPath(); g.arc(x + 13, y - 1, 4, 0, Math.PI * 2); g.fill();
        g.fillStyle = inkA(0.75); g.fillText(text, x + 24, y + 4);
    };

    const texCache = new Map();
    const cardTexture = (def) => {
        if (texCache.has(def.type)) return texCache.get(def.type);
        const tex = drawCardTexture(def);
        texCache.set(def.type, tex);
        return tex;
    };
    const drawCardTexture = (def) => {
        const W = 1360, H = 800;
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        const g = c.getContext('2d');
        g.fillStyle = '#ffffff'; roundRect(g, 0, 0, W, H, 40); g.fill();
        g.save(); roundRect(g, 0, 0, W, H, 40); g.clip();
        const L = 56, R = W - 56;
        if (def.type === 'dash' || def.type === 'dash2') {
            // Volledig scherm: zijbalk, kopregel, KPI-tegels en een grote grafiek
            const SB = 92;
            g.fillStyle = ZANDC; g.fillRect(0, 0, SB, H);
            g.fillStyle = MOCHA; font(g, 400, 22, 'Bebas Neue'); g.fillText('D.', 36, 58);
            for (let i = 0; i < 6; i++) { g.fillStyle = i === (def.type === 'dash' ? 1 : 2) ? MOCHA : inkA(0.14); roundRect(g, 34, 110 + i * 54, 24, 24, 7); g.fill(); }
            g.fillStyle = INK; font(g, 600, 28, 'Fraunces'); g.fillText(def.type === 'dash' ? 'Verkoop' : 'Projecten', SB + 48, 70);
            g.fillStyle = inkA(0.45); font(g, 400, 15); g.fillText(def.type === 'dash' ? 'Overzicht van alle kanalen' : 'Lopende projecten en planning', SB + 48, 96);
            let px = R - 10; ['Export', 'Dit kwartaal', 'Deze maand'].forEach((p, i) => { font(g, 500, 14); const w = g.measureText(p).width + 26; px -= w; pill(g, px, 48, p, i === 1); px -= 10; });
            avatar(g, R - 2, 64, 16, 3);
            const cx0 = SB + 48, cw = (R - cx0 - 40) / 3;
            const K = def.type === 'dash'
                ? [['Omzet', [0.3, 0.42, 0.38, 0.55, 0.5, 0.7, 0.82], 'op schema'], ['Orders', [0.5, 0.46, 0.6, 0.58, 0.7, 0.66, 0.78], 'stijgend'], ['Retouren', [0.6, 0.55, 0.5, 0.52, 0.42, 0.38, 0.3], 'dalend']]
                : [['Op tijd', [0.4, 0.5, 0.48, 0.62, 0.7, 0.68, 0.8], 'op schema'], ['Uren', [0.5, 0.56, 0.5, 0.6, 0.58, 0.66, 0.7], 'binnen budget'], ['Open taken', [0.7, 0.62, 0.66, 0.5, 0.46, 0.4, 0.34], 'dalend']];
            K.forEach((k, i) => kpiTile(g, cx0 + i * (cw + 20), 130, cw, 150, k[0], k[1], k[2]));
            // Grote grafiek
            const gx0 = cx0 + 20, gx1 = R - 24, gy0 = 340, gy1 = H - 110;
            g.fillStyle = INK; font(g, 600, 18); g.fillText(def.type === 'dash' ? 'Omzet per maand' : 'Uren per week', cx0, 318);
            legend(g, gx1 - 260, 318, def.type === 'dash' ? [['Online', INK], ['Winkel', MOCHA]] : [['Gepland', MOCHA], ['Besteed', INK]]);
            axes(g, gx0, gx1, gy0, gy1, MONTHS, 4);
            series(g, [0.3, 0.36, 0.34, 0.45, 0.42, 0.52, 0.5, 0.6, 0.66, 0.62, 0.74, 0.82], gx0, gx1, gy0, gy1, INK, 2.5, inkA(0.05));
            series(g, [0.2, 0.24, 0.3, 0.28, 0.36, 0.34, 0.42, 0.4, 0.46, 0.52, 0.5, 0.58], gx0, gx1, gy0, gy1, MOCHA, 2.5);
            g.fillStyle = PINK; g.beginPath(); g.arc(gx1, gy1 - (gy1 - gy0) * 0.82, 5, 0, Math.PI * 2); g.fill();
        } else if (def.type === 'line') {
            header(g, W, def.title, ['Week', 'Maand', 'Jaar']);
            legend(g, L, 150, [['Online', INK], ['Winkel', MOCHA], ['Partners', inkA(0.3)]]);
            const y0 = 180, y1 = H - 110;
            axes(g, L + 12, R, y0, y1, MONTHS, 5);
            series(g, [0.25, 0.3, 0.28, 0.4, 0.44, 0.42, 0.55, 0.6, 0.58, 0.7, 0.76, 0.84], L + 12, R, y0, y1, INK, 2.5, inkA(0.04));
            series(g, [0.4, 0.38, 0.44, 0.42, 0.5, 0.48, 0.52, 0.5, 0.56, 0.6, 0.58, 0.64], L + 12, R, y0, y1, MOCHA, 2.5);
            series(g, [0.1, 0.14, 0.12, 0.18, 0.2, 0.24, 0.22, 0.28, 0.3, 0.34, 0.32, 0.38], L + 12, R, y0, y1, inkA(0.3), 2);
            // Verticale markering met een puntje
            const mx = L + 12 + (R - L - 12) * 9 / 11;
            g.strokeStyle = PINK; g.lineWidth = 1.5; g.setLineDash([6, 8]); g.beginPath(); g.moveTo(mx, y0); g.lineTo(mx, y1); g.stroke(); g.setLineDash([]);
            g.fillStyle = PINK; g.beginPath(); g.arc(mx, y1 - (y1 - y0) * 0.7, 5, 0, Math.PI * 2); g.fill();
        } else if (def.type === 'bars') {
            header(g, W, def.title, ['Deze maand']);
            legend(g, L, 150, [['Beschikbaar', MOCHA], ['Gereserveerd', inkA(0.18)]]);
            const y0 = 180, y1 = H - 110, labels = ['Amsterdam', 'Utrecht', 'Rotterdam', 'Eindhoven', 'Groningen', 'Zwolle'];
            axes(g, L + 12, R, y0, y1, null, 4);
            const n = labels.length, gap = (R - L - 12) / n;
            labels.forEach((l, i) => {
                const x = L + 12 + i * gap + gap * 0.18, bw = gap * 0.26;
                const a = [0.7, 0.55, 0.82, 0.48, 0.6, 0.4][i], b = [0.4, 0.3, 0.5, 0.36, 0.28, 0.22][i];
                g.fillStyle = MOCHA; roundRect(g, x, y1 - (y1 - y0) * a, bw, (y1 - y0) * a, 4); g.fill();
                g.fillStyle = inkA(0.18); roundRect(g, x + bw + 6, y1 - (y1 - y0) * b, bw, (y1 - y0) * b, 4); g.fill();
                g.fillStyle = inkA(0.5); font(g, 400, 15); g.textAlign = 'center'; g.fillText(l, x + bw + 3, y1 + 26); g.textAlign = 'left';
            });
        } else if (def.type === 'donut') {
            header(g, W, def.title, ['Dit jaar']);
            const cx = 400, cy = 470, r = 170;
            const parts = [[0.46, MOCHA], [0.32, INK], [0.22, inkA(0.18)]];
            let a0 = -Math.PI / 2;
            parts.forEach(([v, col]) => { g.strokeStyle = col; g.lineWidth = 46; g.beginPath(); g.arc(cx, cy, r, a0 + 0.02, a0 + v * Math.PI * 2 - 0.02); g.stroke(); a0 += v * Math.PI * 2; });
            g.strokeStyle = PINK; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r - 40, -Math.PI / 2, -Math.PI / 2 + 0.46 * Math.PI * 2); g.stroke();
            const names = ['Dashboards', 'Data-modellen', 'AI-integraties'];
            names.forEach((nme, i) => {
                const y = 330 + i * 110;
                g.fillStyle = parts[i][1]; roundRect(g, 720, y - 6, 16, 16, 4); g.fill();
                g.fillStyle = INK; font(g, 500, 20); g.fillText(nme, 752, y + 9);
                g.fillStyle = inkA(0.08); roundRect(g, 752, y + 30, R - 752, 8, 4); g.fill();
                g.fillStyle = parts[i][1]; roundRect(g, 752, y + 30, (R - 752) * parts[i][0], 8, 4); g.fill();
                g.fillStyle = inkA(0.45); font(g, 400, 14); g.fillText(['Grootste deel van het werk', 'Groeit dit jaar het hardst', 'Vaak gekoppeld aan een CRM'][i], 752, y + 64);
            });
        } else if (def.type === 'heat') {
            header(g, W, def.title, ['Afgelopen jaar']);
            const days = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
            const cols = 26, cell = 36, gap = 8, gx = L + 60, gy = 170;
            g.fillStyle = inkA(0.45); font(g, 400, 14);
            days.forEach((d, i) => { if (i % 2 === 0) g.fillText(d, L, gy + i * (cell + gap) + 24); });
            for (let m = 0; m < 6; m++) g.fillText(MONTHS[m], gx + m * (cols / 6) * (cell + gap), gy - 16);
            let s = 7;
            for (let cI = 0; cI < cols; cI++) for (let r = 0; r < 7; r++) {
                s = (s * 9301 + 49297) % 233280; const v = s / 233280;
                g.fillStyle = v > 0.94 ? PINK : mochaA(0.06 + Math.pow(v, 1.6) * 0.8);
                roundRect(g, gx + cI * (cell + gap), gy + r * (cell + gap), cell, cell, 6); g.fill();
            }
            g.fillStyle = inkA(0.45); g.fillText('minder', R - 300, H - 60);
            [0.1, 0.3, 0.5, 0.7, 0.9].forEach((v, i) => { g.fillStyle = mochaA(0.06 + v * 0.8); roundRect(g, R - 230 + i * 26, H - 76, 20, 20, 4); g.fill(); });
            g.fillStyle = inkA(0.45); g.fillText('meer', R - 90, H - 60);
        } else if (def.type === 'table') {
            header(g, W, def.title, ['Filter', 'Alle klanten']);
            const cols = [['Klant', L], ['Sector', 480], ['Status', 760], ['Eigenaar', 1010], ['Volgende stap', 1150]];
            g.fillStyle = inkA(0.45); font(g, 500, 13);
            cols.forEach(([nme, x]) => g.fillText(nme.toUpperCase(), x, 150));
            const rows = [['Bakkerij De Molen', 'Retail', 'Actief', 'ok', 'Review'], ['Fysio Noord', 'Zorg', 'In opstart', 'mid', 'Koppeling'], ['Vervoer Jansen', 'Logistiek', 'Risico', 'risk', 'Gesprek'], ['Studio Vorm', 'Creatief', 'Actief', 'ok', 'Oplevering'], ['Groenhof BV', 'Bouw', 'Actief', 'ok', 'Training'], ['Sportclub West', 'Sport', 'In opstart', 'mid', 'Data check']];
            rows.forEach((row, i) => {
                const y = 200 + i * 88;
                g.strokeStyle = inkA(0.07); g.lineWidth = 1.5; g.beginPath(); g.moveTo(L, y + 44); g.lineTo(R, y + 44); g.stroke();
                avatar(g, L + 16, y, 16, i);
                g.fillStyle = INK; font(g, 500, 17); g.fillText(row[0], L + 44, y + 6);
                g.fillStyle = inkA(0.6); font(g, 400, 16); g.fillText(row[1], 480, y + 6);
                statusPill(g, 760, y + 2, row[2], row[3]);
                avatar(g, 1026, y, 14, i + 2);
                g.fillStyle = inkA(0.6); font(g, 400, 16); g.fillText(row[4], 1150, y + 6);
            });
        } else if (def.type === 'flow') {
            header(g, W, def.title, ['Live']);
            const srcs = ['CRM', 'ERP', 'Excel', 'E-mail'], bw = 230, bh = 64;
            const mid = { x: 560, y: 390, w: 240, h: 110 }, outs = [['Dashboard', 1040, 300], ['Weekrapport', 1040, 440]];
            g.strokeStyle = PINK; g.lineWidth = 2;
            srcs.forEach((s, i) => { const y = 170 + i * 118 + bh / 2; g.beginPath(); g.moveTo(L + bw, y); g.bezierCurveTo(L + bw + 120, y, mid.x - 120, mid.y + mid.h / 2, mid.x, mid.y + mid.h / 2); g.stroke(); });
            outs.forEach(([, x, y]) => { g.beginPath(); g.moveTo(mid.x + mid.w, mid.y + mid.h / 2); g.bezierCurveTo(mid.x + mid.w + 100, mid.y + mid.h / 2, x - 100, y + 32, x, y + 32); g.stroke(); });
            srcs.forEach((s, i) => {
                const y = 170 + i * 118;
                g.fillStyle = '#fff'; g.strokeStyle = inkA(0.12); g.lineWidth = 1.5; roundRect(g, L, y, bw, bh, 14); g.fill(); g.stroke();
                g.fillStyle = ZAND2; roundRect(g, L + 14, y + 16, 32, 32, 8); g.fill();
                g.fillStyle = INK; font(g, 500, 17); g.fillText(s, L + 60, y + 30);
                g.fillStyle = inkA(0.45); font(g, 400, 13); g.fillText(['Klanten en offertes', 'Orders en voorraad', 'Handmatige lijsten', 'Aanvragen'][i], L + 60, y + 50);
            });
            g.fillStyle = MOCHA; roundRect(g, mid.x, mid.y, mid.w, mid.h, 18); g.fill();
            g.fillStyle = ZANDC; font(g, 500, 19); g.fillText('AI-model', mid.x + 26, mid.y + 44);
            g.fillStyle = 'rgba(245, 240, 232, 0.7)'; font(g, 400, 13); g.fillText('Koppelt, schoont op, voorspelt', mid.x + 26, mid.y + 72);
            outs.forEach(([nme, x, y], i) => {
                g.fillStyle = '#fff'; g.strokeStyle = inkA(0.12); g.lineWidth = 1.5; roundRect(g, x, y, 264, 64, 14); g.fill(); g.stroke();
                g.fillStyle = INK; font(g, 500, 17); g.fillText(nme, x + 22, y + 30);
                g.fillStyle = inkA(0.45); font(g, 400, 13); g.fillText(i ? 'Elke maandag in de mail' : 'Live voor het hele team', x + 22, y + 50);
            });
        } else if (def.type === 'chat') {
            header(g, W, def.title, ['Verbonden met CRM']);
            g.fillStyle = PINK; g.beginPath(); g.arc(R - 230, 65, 4, 0, Math.PI * 2); g.fill();
            const bubble = (x, y, w, lines, dark) => {
                const h = 40 + lines.length * 30;
                g.fillStyle = dark ? MOCHA : ZAND2; roundRect(g, x, y, w, h, 20); g.fill();
                g.fillStyle = dark ? ZANDC : INK; font(g, 400, 18);
                lines.forEach((l, i) => g.fillText(l, x + 26, y + 36 + i * 30));
                return y + h;
            };
            let y = 150;
            y = bubble(L, y, 640, ['Welke klanten hebben dit kwartaal', 'minder besteld dan vorig kwartaal?'], false) + 26;
            y = bubble(R - 760, y, 760, ['Drie klanten, allemaal in de regio Noord.', 'Bij twee ervan liep het contract af.', 'Wil je ze in een lijst met de eigenaar erbij?'], true) + 26;
            y = bubble(L, y, 420, ['Ja, en zet er een taak bij.'], false) + 26;
            g.fillStyle = MOCHA; roundRect(g, R - 300, y, 300, 56, 20); g.fill();
            [0, 1, 2].forEach(i => { g.fillStyle = i === 1 ? PINK : 'rgba(245, 240, 232, 0.7)'; g.beginPath(); g.arc(R - 260 + i * 22, y + 28, 5, 0, Math.PI * 2); g.fill(); });
            g.strokeStyle = inkA(0.14); g.lineWidth = 1.5; roundRect(g, L, H - 96, R - L, 50, 25); g.stroke();
            g.fillStyle = inkA(0.35); font(g, 400, 16); g.fillText('Stel een vraag over je eigen data', L + 24, H - 64);
            g.fillStyle = MOCHA; g.beginPath(); g.arc(R - 25, H - 71, 17, 0, Math.PI * 2); g.fill();
        }
        g.restore();
        g.lineWidth = 3; g.strokeStyle = inkA(0.1); roundRect(g, 1.5, 1.5, W - 3, H - 3, 39); g.stroke();
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        return tex;
    };
    const shadowTexture = () => {
        const c = document.createElement('canvas'); c.width = c.height = 256;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(128, 128, 30, 128, 128, 128);
        grad.addColorStop(0, 'rgba(26,20,16,0.4)'); grad.addColorStop(1, 'rgba(26,20,16,0)');
        g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
        return new THREE.CanvasTexture(c);
    };

    // ----- Eindopstelling: een dashboard-raster dat licht gekanteld onderin het beeld ligt
    const grid = new THREE.Group();
    const COLS = isWide ? 3 : 2, ROWS = Math.ceil(COUNT / COLS);
    const CW = 1.7, CH = 1.0, GAP = 0.18;
    grid.position.set(0, isWide ? -2.0 : -2.3, -11);
    grid.rotation.x = isWide ? -0.5 : -0.4;
    grid.scale.setScalar(isWide ? 1.04 : 0.64);
    root.add(grid);
    const gridCenter = new THREE.Vector3(0, grid.position.y + 0.3, grid.position.z);

    const cards = [];
    const dummy = new THREE.Object3D();
    const buildCards = () => {
        const shadowTex = shadowTexture();
        const cardGeo = new THREE.PlaneGeometry(CW, CH);
        const shadowGeo = new THREE.PlaneGeometry(CW * 1.5, CH * 1.7);
        const buildOne = (i) => {
            const def = defs[i];
            const mat = new THREE.MeshBasicMaterial({ map: cardTexture(def), transparent: true, side: THREE.DoubleSide });
            const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0, depthWrite: false });
            const group = new THREE.Group();
            const shadow = new THREE.Mesh(shadowGeo, shadowMat); shadow.position.set(0.04, -0.14, -0.08);
            const card = new THREE.Mesh(cardGeo, mat);
            group.add(shadow); group.add(card);
            root.add(group);
            // Startpositie: verspreid in een tunnel waar de camera doorheen vliegt
            const side = i % 2 ? 1 : -1;
            const z0 = 2.6 - i * (7.6 / Math.max(1, COUNT - 1)) + rnd(-0.3, 0.3);
            const start = {
                pos: new THREE.Vector3(side * rnd(isWide ? 1.8 : 1.2, isWide ? 2.8 : 1.7), rnd(-1.0, 1.0), z0),
                quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd(-0.3, 0.3), -side * rnd(0.35, 0.75), rnd(-0.18, 0.18))),
                scale: rnd(0.9, 1.1),
                phase: rnd(0, Math.PI * 2)
            };
            // Eindpositie in het raster (lokaal, wordt elk frame naar wereldcoördinaten omgezet)
            const col = i % COLS, row = Math.floor(i / COLS);
            const local = new THREE.Vector3((col - (COLS - 1) / 2) * (CW + GAP), ((ROWS - 1) / 2 - row) * (CH + GAP), 0);
            cards.push({ group, mat, shadowMat, start, local, delay: 0.4 + i * 0.028, worldPos: new THREE.Vector3(), worldQuat: new THREE.Quaternion(), t: 0 });
        };
        // Eén kaart per frame tekenen zodat de pagina niet hapert bij het openen; daarna zacht infaden
        let i = 0;
        const step = () => {
            if (i < defs.length) { buildOne(i++); setTimeout(step, 24); return; }
            hero3d.classList.add('ready');
            buildPhotos();
            setTimeout(() => { buildLine(); setTimeout(buildFloaters, 24); }, 24);
        };
        setTimeout(step, 0);
    };

    // ----- De roze lijn: verbindt de kaarten terwijl ze samenkomen, met twee lopende puntjes
    let line = null, lineMat = null, lineGeo = null, dots = [];
    const linePts = [];
    const buildLine = () => {
        if (!LINES) return;
        lineGeo = new LINES.LineGeometry();
        lineGeo.setPositions(new Array((COUNT + 1) * 3).fill(0));
        lineMat = new LINES.LineMaterial({ color: ROZE, linewidth: 1.6, transparent: true, opacity: 0, depthWrite: false, worldUnits: false });
        lineMat.resolution.set(wrap.clientWidth, wrap.clientHeight);
        line = new LINES.Line2(lineGeo, lineMat);
        line.frustumCulled = false;
        line.visible = false;
        root.add(line);
        const dotGeo = new THREE.CircleGeometry(0.03, 24);
        for (let i = 0; i < 2; i++) {
            const d = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: ROZE, transparent: true, opacity: 0, depthWrite: false }));
            d.visible = false;
            root.add(d);
            dots.push({ mesh: d, offset: i * 0.5 });
        }
    };
    // ----- Na de hero gaat de 3D-laag door: kaarten, ringen en puntjes zweven op diepte langs de rest van de pagina
    const floaters = [];
    const SCROLL_UNIT = 0.0026; // scène-eenheden per gescrolde pixel
    const buildFloaters = () => {
        const ringGeo = new THREE.RingGeometry(0.42, 0.5, 64);
        const discGeo = new THREE.CircleGeometry(0.5, 48);
        const dotGeo = new THREE.CircleGeometry(0.035, 24);
        const miniGeo = new THREE.PlaneGeometry(CW, CH);
        const pin = Number.isFinite(heroPinDistance) && heroPinDistance > 0 ? heroPinDistance : window.innerHeight * 3.8;
        const pageUnits = Math.max(8, (document.documentElement.scrollHeight - window.innerHeight - pin) * SCROLL_UNIT);
        const n = isWide ? 18 : 10;
        for (let i = 0; i < n; i++) {
            const kind = i % 5 === 0 ? 'ring' : i % 5 === 1 ? 'disc' : i % 5 === 2 ? 'dot' : 'card';
            let mesh;
            if (kind === 'ring') mesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x474329, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }));
            else if (kind === 'disc') mesh = new THREE.Mesh(discGeo, new THREE.MeshBasicMaterial({ color: 0xECE5D9, transparent: true, opacity: 0.9, depthWrite: false }));
            else if (kind === 'dot') mesh = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: ROZE, transparent: true, opacity: 0.9, depthWrite: false }));
            else mesh = new THREE.Mesh(miniGeo, new THREE.MeshBasicMaterial({ map: cardTexture(CARD_DEFS[i % CARD_DEFS.length]), transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
            const side = i % 2 ? 1 : -1;
            const depth = rnd(5, 11); // afstand voor de camera
            const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * depth * camera.aspect;
            const base = new THREE.Vector3(
                side * halfW * rnd(isWide ? 0.82 : 0.6, 1.08),
                grid.position.y - 2.4 - rnd(0.3, 1) - (i / n) * pageUnits,
                -2.0 - depth
            );
            mesh.position.copy(base);
            mesh.scale.setScalar(kind === 'card' ? rnd(0.55, 0.8) : kind === 'dot' ? 1 : rnd(0.7, 1.3));
            mesh.rotation.set(rnd(-0.25, 0.25), side * -rnd(0.2, 0.5), rnd(-0.1, 0.1));
            mesh.visible = false;
            root.add(mesh);
            floaters.push({ mesh, base, phase: rnd(0, Math.PI * 2), spin: rnd(0.05, 0.15), kind });
        }
    };
    // ----- Foto's: komen onder de tweede en derde zin omhoog, warm en met zachte hoeken, vast in beeld bij de camera
    const PHOTOS = [
        { src: 'img/team-1.webp', from: -1, to: 0.22 },   // staat er al bij het laden, onder de eerste kop
        { src: 'img/team-2.webp', from: 0.26, to: 0.5 },
        { src: 'img/team-3.webp', from: 0.56, to: 0.78 }
    ];
    let photoT0 = -1;
    const photos = [];
    const photoTexture = (img) => {
        const W = 1600, H = 1000;
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        const g = c.getContext('2d');
        g.save(); roundRect(g, 0, 0, W, H, 40); g.clip();
        // Vullend bijsnijden
        const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
        g.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        // Warme sepia-toon
        g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(236, 214, 182, 0.35)'; g.fillRect(0, 0, W, H);
        g.globalCompositeOperation = 'source-over';
        g.restore();
        // Rand loopt een beetje over in het zand
        g.globalCompositeOperation = 'destination-in';
        const grad = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
        grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(1, 'rgba(0,0,0,0.65)');
        g.fillStyle = grad; g.fillRect(0, 0, W, H);
        g.globalCompositeOperation = 'source-over';
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        return tex;
    };
    const buildPhotos = () => {
        const geo = new THREE.PlaneGeometry(1.6, 1.0);
        PHOTOS.forEach((P) => {
            const img = new Image();
            img.onload = () => {
                const mat = new THREE.MeshBasicMaterial({ map: photoTexture(img), transparent: true, opacity: 0, depthTest: false, depthWrite: false });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.renderOrder = 5;
                mesh.visible = false;
                root.add(mesh);
                photos.push({ mesh, mat, ...P });
            };
            img.src = P.src;
        });
    };
    const photoOffset = new THREE.Vector3();
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(buildCards);

    const mouse = { x: 0, y: 0 }, ease = { x: 0, y: 0 };
    if (finePointer) {
        window.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });
    }

    const state = { p: 0 };
    const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
    const tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3();
    function update(time) {
        const p = state.p;
        ease.x += (mouse.x - ease.x) * 0.04;
        ease.y += (mouse.y - ease.y) * 0.04;

        // Camera: eerst door de tunnel van kaarten, daarna rustig naar het dashboard kijken
        const fly = smooth(clamp01(p / 0.62));
        const settle = smooth(clamp01((p - 0.55) / 0.4));
        const idleX = Math.sin(time * 0.25) * 0.08, idleY = Math.cos(time * 0.2) * 0.05;
        const tunnelX = Math.sin(fly * Math.PI) * 0.45 + idleX;
        const tunnelY = 0.35 - fly * 0.6 + idleY;
        const tunnelZ = lerp(4.2, -1.6, fly);
        camPos.set(lerp(tunnelX, 0 + ease.x * 0.25, settle), lerp(tunnelY, 0.1 - ease.y * 0.15, settle), lerp(tunnelZ, -2.0, settle));
        camLook.set(lerp(tunnelX * 0.25, gridCenter.x + ease.x * 0.3, settle), lerp(tunnelY * 0.25, gridCenter.y + (isWide ? 1.3 : 1.1) - ease.y * 0.2, settle), lerp(tunnelZ - 7, gridCenter.z, settle));
        // Na de hero schuift de camera mee met de pagina, zodat de scène op diepte blijft meebewegen
        const off = Math.max(0, (window.scrollY || 0) - heroPinDistance) * SCROLL_UNIT;
        camPos.y -= off; camLook.y -= off;
        camera.position.copy(camPos);
        camera.lookAt(camLook);
        scene.fog.near = lerp(4, 11, settle);
        scene.fog.far = lerp(14, 26, settle);

        // Het raster reageert licht op de muis
        grid.rotation.y = ease.x * 0.08;
        grid.rotation.x = (isWide ? -0.5 : -0.4) - ease.y * 0.05;
        grid.updateMatrixWorld(true);

        for (const C of cards) {
            const t = smooth(clamp01((p - C.delay) / 0.3));
            C.t = t;
            // Doelpositie in wereldcoördinaten
            dummy.position.copy(C.local); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1);
            dummy.updateMatrix();
            tmpV.setFromMatrixPosition(dummy.matrix).applyMatrix4(grid.matrixWorld);
            grid.matrixWorld.decompose(tmpS, tmpQ, tmpS);
            // Zweven in de tunnel
            const S = C.start;
            const bobX = Math.sin(time * 0.5 + S.phase) * 0.06, bobY = Math.cos(time * 0.42 + S.phase) * 0.08;
            C.worldPos.set(S.pos.x + bobX * (1 - t), S.pos.y + bobY * (1 - t), S.pos.z).lerp(tmpV, t);
            // Onderweg naar het raster duiken de kaarten onder de tekst door en worden ze even kleiner
            const arc = Math.sin(t * Math.PI);
            C.worldPos.y -= arc * 1.4;
            C.worldQuat.copy(S.quat).slerp(tmpQ, t);
            C.group.position.copy(C.worldPos);
            C.group.quaternion.copy(C.worldQuat);
            const sc = lerp(S.scale, grid.scale.x, t) * (1 - 0.3 * arc);
            C.group.scale.setScalar(sc);
            // Een kaart die vlak langs of achter de camera komt lost op, zodat er nooit een reusachtig vlak in beeld hangt
            const dz = C.worldPos.z - camera.position.z;
            const near = dz > -0.6 ? 0 : clamp01((C.worldPos.distanceTo(camera.position) - 1.0) / 1.4);
            // Zodra de pagina na de hero verder scrolt, lost het dashboard op en nemen de zwevende vormen het over
            const away = 1 - clamp01(off / 1.3);
            C.mat.opacity = near * away;
            C.group.visible = near * away > 0.01;
            C.shadowMat.opacity = 0.5 * t * near * away;
        }

        // De roze lijn groeit langs de kaarten en lost op als het dashboard staat
        if (line && cards.length) {
            const grow = smooth(clamp01((p - 0.5) / 0.28));
            const fade = 1 - smooth(clamp01((p - 0.84) / 0.08));
            const vis = grow > 0 && fade > 0;
            line.visible = vis;
            if (vis) {
                const k = grow * (cards.length - 1);
                const full = Math.floor(k), frac = k - full;
                linePts.length = 0;
                for (let i = 0; i <= full; i++) { const v = cards[i].worldPos; linePts.push(v.x, v.y, v.z + 0.03); }
                if (full < cards.length - 1) {
                    const a = cards[full].worldPos, b = cards[full + 1].worldPos;
                    linePts.push(lerp(a.x, b.x, frac), lerp(a.y, b.y, frac), lerp(a.z, b.z, frac) + 0.03);
                }
                while (linePts.length < (COUNT + 1) * 3) { const n = linePts.length; linePts.push(linePts[n - 3], linePts[n - 2], linePts[n - 1]); }
                lineGeo.setPositions(linePts);
                lineMat.opacity = fade * 0.9;
                // Puntjes lopen over het zichtbare deel van de lijn
                for (const D of dots) {
                    const u = ((time * 0.12 + D.offset) % 1) * k;
                    const i = Math.min(Math.floor(u), cards.length - 2), f = u - i;
                    const a = cards[i].worldPos, b = cards[i + 1].worldPos;
                    D.mesh.visible = k > 0.2;
                    D.mesh.position.set(lerp(a.x, b.x, f), lerp(a.y, b.y, f), lerp(a.z, b.z, f) + 0.05);
                    D.mesh.quaternion.copy(camera.quaternion);
                    D.mesh.material.opacity = fade;
                }
            } else {
                for (const D of dots) D.mesh.visible = false;
            }
        }
        // Foto's hangen voor de camera, komen van onder op en schuiven weer weg
        const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 4.6;
        const photoScale = Math.min(1, (visH * camera.aspect * 0.86) / 2.1) * 1.31;
        if (photoT0 < 0 && photos.length) photoT0 = time;
        const intro = smooth(clamp01((time - photoT0 - 0.4) / 1.2));
        photos.forEach((P, idx) => {
            const tIn = P.from < 0 ? intro : smooth(clamp01((p - P.from) / 0.08));
            const tOut = smooth(clamp01((p - (P.to - 0.07)) / 0.07));
            const a = tIn * (1 - tOut);
            P.mesh.visible = a > 0.01;
            if (!P.mesh.visible) return;
            // Zacht zweven: op en neer, een heel klein beetje kantelen
            const bob = Math.sin(time * 0.55 + idx * 2.1) * 0.045;
            photoOffset.set(ease.x * 0.06 + Math.cos(time * 0.4 + idx) * 0.02, -0.68 + bob - (1 - tIn) * 0.45 + tOut * 0.3 - ease.y * 0.04, -4.6).applyQuaternion(camera.quaternion).add(camera.position);
            P.mesh.position.copy(photoOffset);
            P.mesh.quaternion.copy(camera.quaternion);
            P.mesh.rotateY(Math.sin(time * 0.35 + idx) * 0.04 + ease.x * 0.05);
            P.mesh.rotateX(Math.cos(time * 0.3 + idx) * 0.025 - ease.y * 0.03);
            P.mesh.scale.setScalar(photoScale * (0.94 + tIn * 0.06 + tOut * 0.04));
            P.mat.opacity = a;
        });
        for (const F of floaters) {
            F.mesh.visible = p > 0.95;
            if (!F.mesh.visible) continue;
            F.mesh.position.y = F.base.y + Math.sin(time * 0.35 + F.phase) * 0.12;
            F.mesh.position.x = F.base.x + Math.cos(time * 0.28 + F.phase) * 0.08 + ease.x * 0.15;
            if (F.kind === 'ring') F.mesh.rotation.z = time * F.spin;
            else if (F.kind === 'card') F.mesh.rotation.y = Math.sin(time * F.spin * 2 + F.phase) * 0.25 + ease.x * 0.1;
        }
        if (p > 0.84) startTagline();
    }

    const resize = () => {
        const w = wrap.clientWidth, h = wrap.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (lineMat) lineMat.resolution.set(w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    let running = true;
    gsap.ticker.add((time) => { if (!running) return; update(time); renderer.render(scene, camera); });
    document.addEventListener('visibilitychange', () => { running = !document.hidden; });

    // Tekstfases: statement voor statement, tot slot de subtitel met de knoppen
    const [ph0, ph1, ph2] = phases;
    gsap.set([ph1, ph2, finalPhase], { autoAlpha: 0, y: 28 });
    if (reduceMotion) {
        state.p = 1;
        gsap.set(ph0, { autoAlpha: 0 });
        gsap.set(finalPhase, { autoAlpha: 1, y: 0 });
        if (heroLine) gsap.set(heroLine, { scaleX: 1 });
        startTagline();
        return;
    }
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    tl.to(state, { p: 1, duration: 1 }, 0);
    if (indicator) tl.to(indicator, { autoAlpha: 0, duration: 0.05 }, 0.02);
    tl.to(ph0, { autoAlpha: 0, y: -28, duration: 0.08, ease: 'power2.in' }, 0.15);
    tl.to(ph1, { autoAlpha: 1, y: 0, duration: 0.09, ease: 'power2.out' }, 0.27);
    tl.to(ph1, { autoAlpha: 0, y: -28, duration: 0.08, ease: 'power2.in' }, 0.47);
    tl.to(ph2, { autoAlpha: 1, y: 0, duration: 0.09, ease: 'power2.out' }, 0.55);
    tl.to(ph2, { autoAlpha: 0, y: -28, duration: 0.08, ease: 'power2.in' }, 0.76);
    tl.to(finalPhase, { autoAlpha: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.87);
    if (heroLine) tl.fromTo(heroLine, { scaleX: 0 }, { scaleX: 1, duration: 0.1, ease: 'power2.out' }, 0.9);
    // Het eindbeeld blijft een stuk scroll staan voordat de pagina verder gaat
    tl.to({}, { duration: 0.32 });

    if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });
        const st = ScrollTrigger.create({ trigger: heroEl, start: 'top top', end: '+=380%', pin: true, scrub: 1.1, animation: tl, invalidateOnRefresh: true });
        heroPinDistance = st.end - st.start;
        ScrollTrigger.addEventListener('refresh', () => { heroPinDistance = st.end - st.start; resize(); });
    } else {
        tl.duration(14).delay(0.8).play();
    }
}
if (window.THREE) initHeroFilm(window.THREE);
else window.addEventListener('three-ready', () => initHeroFilm(window.THREE), { once: true });

// ===== Process timeline: linked to scroll position =====
const timeline = document.querySelector('.process-timeline');
const steps = timeline ? [...timeline.querySelectorAll('.process-step')] : [];
function updateProcess() {
    if (!timeline) return;
    if (reduceMotion) {
        timeline.style.setProperty('--draw', '1');
        steps.forEach(s => s.classList.add('lit'));
        return;
    }
    const r = timeline.getBoundingClientRect();
    const p = clamp((window.innerHeight * 0.88 - r.top) / r.height, 0, 1);
    timeline.style.setProperty('--draw', p.toFixed(3));
    steps.forEach((s, i) => s.classList.toggle('lit', p >= (i + 0.55) / steps.length));
}

// ===== Spotlight: section in the middle of the screen is in focus =====
const spotEls = [...document.querySelectorAll('section.section')];
function setupSpot() {
    const on = !reduceMotion && window.innerWidth > 980;
    spotEls.forEach(s => {
        s.classList.toggle('spot', on);
        if (!on) s.style.removeProperty('--focus');
    });
}
function updateSpot() {
    const vh = window.innerHeight;
    spotEls.forEach(s => {
        if (!s.classList.contains('spot')) return;
        const r = s.getBoundingClientRect();
        const center = r.top + r.height / 2;
        // 1 in het midden van het scherm, 0 zodra het midden van de sectie ~55% van de schermhoogte weg is
        const focus = clamp(1 - Math.abs(center - vh / 2) / (vh * 0.55), 0, 1);
        s.style.setProperty('--focus', focus.toFixed(3));
    });
}

// ===== Service cards: 3D tilt + cursor glow =====
if (finePointer && !reduceMotion) {
    document.querySelectorAll('.service-card-inner').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.08s ease-out, box-shadow 0.4s var(--ease), border-color 0.4s var(--ease)';
        });
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const x = e.clientX - r.left, y = e.clientY - r.top;
            card.style.setProperty('--mx', x + 'px');
            card.style.setProperty('--my', y + 'px');
            const rx = (y / r.height - 0.5) * -8;
            const ry = (x / r.width - 0.5) * 8;
            card.style.transform = `perspective(900px) translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = '';
            card.style.transform = '';
        });
    });
}

// ===== Magnetic buttons =====
if (finePointer && !reduceMotion) {
    document.querySelectorAll('.btn-primary, .btn-ghost, .btn-nav').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'transform 0.1s ease-out, background 0.4s var(--ease), color 0.4s var(--ease), border-color 0.4s var(--ease), box-shadow 0.4s var(--ease)';
        });
        btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
            const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
            btn.style.transform = `translate(${dx * 6}px, ${dy * 6 - 2}px) scale(1.02)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = '';
            btn.style.transform = '';
        });
    });
}

// =====================================================================
// One scroll handler for everything scroll-linked
// =====================================================================
let ticking = false;
function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
        updateActiveNav();
        updateProgress();
        updateProcess();
        updateSpot();
        ticking = false;
    });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { setupSpot(); onScroll(); });
window.addEventListener('load', () => { setupSpot(); onScroll(); });
setupSpot();
onScroll();
