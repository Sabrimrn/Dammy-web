// ===== Hero word-by-word animation =====
const heroH1 = document.querySelector('.hero-headline');
if (heroH1) {
    const text = heroH1.textContent.trim();
    heroH1.innerHTML = text.split(' ').map((word, i) =>
        `<span class="hw" style="animation-delay:${0.08 + i * 0.07}s">${word}</span>`
    ).join(' ');
}

// ===== Navbar =====
const navbar = document.getElementById('navbar');
const navSections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a:not(.btn-nav)');

function updateActiveNav() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 60);

    let current = '';
    navSections.forEach(section => {
        const top = section.offsetTop - 120;
        if (scrollY >= top) current = section.getAttribute('id');
    });
    navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
}
window.addEventListener('scroll', updateActiveNav);

// ===== Mobile menu =====
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
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

// ===== Reveal on scroll =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Stagger: service cards (150ms each) =====
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

// ===== Stagger: process steps (100ms each) =====
const stepStagger = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const steps = entry.target.querySelectorAll('.process-step');
            steps.forEach((step, i) => {
                setTimeout(() => step.classList.add('visible'), 100 * i);
            });
            entry.target.classList.add('drawn');
            stepStagger.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
const timeline = document.querySelector('.process-timeline');
if (timeline) stepStagger.observe(timeline);

// ===== Smooth scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href === '#hero' || href === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const target = document.querySelector(href);
        if (!target) return;
        const navHeight = navbar.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

// ===== Contact form =====
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
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ===== Scroll progress bar =====
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
    const updateProgress = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
}

// ===== Hero: particle network =====
const heroCanvas = document.getElementById('hero-canvas');
if (heroCanvas && !reduceMotion) {
    const ctx = heroCanvas.getContext('2d');
    const hero = heroCanvas.parentElement;
    const isMobile = window.innerWidth < 768;
    const LINK = isMobile ? 80 : 120;
    const MAX_SPEED = 0.55;
    const mouse = { x: -9999, y: -9999 };
    let w = 0, h = 0, particles = [], running = true, rafId = null;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = hero.clientWidth;
        h = hero.clientHeight;
        heroCanvas.width = w * dpr;
        heroCanvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(Math.round((w * h) / (isMobile ? 45000 : 32000)), 45);
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: 1 + Math.random() * 1.5
        }));
    }

    function frame() {
        if (!running) return;
        ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
            const dx = mouse.x - p.x, dy = mouse.y - p.y;
            if (dx * dx + dy * dy < 180 * 180) {
                p.vx += dx * 0.00005;
                p.vy += dy * 0.00005;
            }
            const speed = Math.hypot(p.vx, p.vy);
            if (speed > MAX_SPEED) { p.vx *= MAX_SPEED / speed; p.vy *= MAX_SPEED / speed; }
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
        }

        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
            const a = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d = Math.hypot(dx, dy);
                if (d < LINK) {
                    ctx.strokeStyle = `rgba(26, 20, 16, ${(1 - d / LINK) * 0.16})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        ctx.fillStyle = 'rgba(26, 20, 16, 0.32)';
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }

        rafId = requestAnimationFrame(frame);
    }

    function start() { if (!rafId) { running = true; rafId = requestAnimationFrame(frame); } }
    function stop() { running = false; if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

    window.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    new IntersectionObserver((entries) => entries[0].isIntersecting ? start() : stop(), { threshold: 0 }).observe(hero);

    resize();
    start();
}

// ===== Hero headline: sheen after intro + subtle 3D tilt =====
if (heroH1 && !reduceMotion) {
    setTimeout(() => {
        // Spans blijven staan (voorkomt afbreken bij "AI-tools"), alleen hun intro-animatie gaat uit
        heroH1.querySelectorAll('.hw').forEach(w => {
            w.style.animation = 'none';
            w.style.opacity = '1';
            w.style.transform = 'none';
        });
        heroH1.classList.add('sheen');
    }, 1800);
}
if (finePointer && !reduceMotion) {
    const heroEl = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroPhoto = document.querySelector('.hero-visual img');
    if (heroEl && heroContent) {
        heroEl.addEventListener('mousemove', (e) => {
            const r = heroEl.getBoundingClientRect();
            const dx = (e.clientX - r.left) / r.width - 0.5;
            const dy = (e.clientY - r.top) / r.height - 0.5;
            heroContent.style.transform = `perspective(1200px) rotateX(${-dy * 2.5}deg) rotateY(${dx * 2.5}deg)`;
            if (heroPhoto) {
                heroPhoto.style.transform = `perspective(1200px) rotateX(${dy * 3}deg) rotateY(${-dx * 3}deg) translate(${dx * -8}px, ${dy * -8}px)`;
            }
        });
        heroEl.addEventListener('mouseleave', () => {
            heroContent.style.transform = '';
            if (heroPhoto) heroPhoto.style.transform = '';
        });
    }
}

// ===== Hero tagline: typing effect =====
const tagline = document.querySelector('.hero-tagline');
if (tagline && !reduceMotion) {
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
    }, 1400);
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
