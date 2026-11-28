// =====================================================================
// Setup
// =====================================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const navbar = document.getElementById('navbar');
const heroEl = document.querySelector('.hero');

// Scrollen is gewoon het scrollen van de browser: direct en zo snel als de bezoeker scrolt (geen smooth-scroll-laag)
const lenis = null;

// ===== Hero headline: woorden komen één voor één op, daarna de glans =====
const heroH1 = document.querySelector('.hero-headline');
if (heroH1) {
    const text = heroH1.textContent.trim();
    heroH1.innerHTML = text.split(/\s+/).map((w, i) => `<span class="hw" style="animation-delay:${0.2 + i * 0.07}s">${w}</span>`).join(' ');
    heroH1.classList.add('decoding');
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

// Logo: geen animatie, gewoon zwart

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

// Tagline typt zichzelf uit met een roze cursor; start pas als de tagline in beeld komt
let taglineStarted = false;
function startTagline() {
    if (taglineStarted) return;
    taglineStarted = true;
    const tagline = document.querySelector('.hero-tagline');
    if (!tagline || reduceMotion) return;
    const full = tagline.textContent.replace(/^\s*\/\//, '');
    tagline.textContent = '';
    const slash = document.createElement('span');
    slash.className = 'slash';
    slash.textContent = '//';
    tagline.appendChild(slash);
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
setTimeout(startTagline, 1600);


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

// ===== Partnerlogo's: kopie van de rij voor de doorlopende band op telefoon =====
(function () {
    const list = document.querySelector('.partners-list');
    if (!list) return;
    [...list.children].forEach(li => {
        const c = li.cloneNode(true);
        c.classList.add('dup');
        c.setAttribute('aria-hidden', 'true');
        const img = c.querySelector('img');
        if (img) { img.alt = ''; img.loading = 'eager'; }
        list.appendChild(c);
    });
})();
