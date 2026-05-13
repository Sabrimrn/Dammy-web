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
