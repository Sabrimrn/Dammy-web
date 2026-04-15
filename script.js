// ===== Cursor Glow =====
const cursorGlow = document.getElementById('cursor-glow');

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// ===== Navbar =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===== Mobile Menu =====
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

// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== Section Reveal =====
const sections = document.querySelectorAll('.section');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');

            // Stagger children (cards, steps)
            const children = entry.target.querySelectorAll('.value-card, .service-card, .process-step');
            children.forEach((child, i) => {
                setTimeout(() => {
                    child.classList.add('visible');
                }, 150 * i);
            });
        }
    });
}, {
    threshold: 0.08,
    rootMargin: '0px 0px -80px 0px'
});

sections.forEach(s => sectionObserver.observe(s));

// ===== Counter Animation =====
const statNumbers = document.querySelectorAll('.stat-number[data-count]');

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const count = parseInt(target.getAttribute('data-count'));
            animateCounter(target, count);
            counterObserver.unobserve(target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(el => counterObserver.observe(el));

function animateCounter(element, target) {
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);

    function update() {
        current += step;
        if (current >= target) {
            element.textContent = target;
            return;
        }
        element.textContent = Math.floor(current);
        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ===== Typing Animation =====
const typingText = document.querySelector('.typing-text');
const phrases = [
    'Hoe kan AI ons wervingsproces verbeteren?',
    'We willen een chatbot voor onze klanten.',
    'Waar beginnen we met AI-implementatie?',
    'Kan AI onze data-analyse automatiseren?'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 60;

function typeEffect() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typingText.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 30;
    } else {
        typingText.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 60;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 500; // Pause before new phrase
    }

    setTimeout(typeEffect, typingSpeed);
}

// Start typing after a delay
setTimeout(typeEffect, 1500);

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        if (!target) return;

        // Scroll naar top voor hero
        if (href === '#hero') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const navHeight = document.getElementById('navbar').offsetHeight;
        const viewportHeight = window.innerHeight;
        const rect = target.getBoundingClientRect();
        const sectionHeight = rect.height;
        const sectionTop = rect.top + window.scrollY;

        let scrollTo;
        if (sectionHeight < viewportHeight - navHeight) {
            // Centreer de sectie verticaal in de zichtbare viewport onder de navbar
            const availableSpace = viewportHeight - navHeight;
            const offset = (availableSpace - sectionHeight) / 2;
            scrollTo = sectionTop - navHeight - offset;
        } else {
            // Grotere sectie: gewoon onder navbar plakken met beetje ruimte
            scrollTo = sectionTop - navHeight - 20;
        }

        window.scrollTo({ top: scrollTo, behavior: 'smooth' });
    });
});

// ===== Contact Form =====
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const btnSpan = btn.querySelector('span');
    const originalText = btnSpan.textContent;

    // Animate button
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = '';
        btnSpan.textContent = 'Verstuurd!';
        btn.style.background = 'linear-gradient(135deg, #4A7C59, #3D6B4A)';

        setTimeout(() => {
            btnSpan.textContent = originalText;
            btn.style.background = '';
            contactForm.reset();
        }, 3000);
    }, 200);
});

// ===== Parallax on hero shapes =====
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const shapes = document.querySelectorAll('.shape');

    shapes.forEach((shape, i) => {
        const speed = (i + 1) * 0.03;
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===== Service card tilt effect =====
const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});
